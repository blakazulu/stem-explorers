import { Handler } from "@netlify/functions";

interface LinkPreviewData {
  url: string;
  title: string;
  description: string;
  image: string | null;
  siteName: string | null;
}

// Security constants
const MAX_URL_LENGTH = 2048;
const MAX_HTML_SIZE = 100000; // 100KB - prevents ReDoS on large HTML

// Check if hostname is a private/internal IP (SSRF protection)
function isPrivateOrLocalhost(hostname: string): boolean {
  // Block localhost variations
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost")
  ) {
    return true;
  }

  // Block private IPv4 ranges
  const privateIPv4Patterns = [
    /^10\./, // 10.0.0.0/8
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
    /^192\.168\./, // 192.168.0.0/16
    /^169\.254\./, // Link-local
    /^127\./, // Loopback
    /^0\./, // Current network
  ];

  if (privateIPv4Patterns.some((pattern) => pattern.test(hostname))) {
    return true;
  }

  // Block AWS/cloud metadata endpoints
  if (hostname === "169.254.169.254" || hostname === "metadata.google.internal") {
    return true;
  }

  return false;
}

// Extract content from meta tag
function extractMetaContent(html: string, property: string): string | null {
  // Try og: property first
  const ogRegex = new RegExp(
    `<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`,
    "i"
  );
  let match = html.match(ogRegex);
  if (match) return match[1];

  // Try reverse order (content before property)
  const ogRegexReverse = new RegExp(
    `<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`,
    "i"
  );
  match = html.match(ogRegexReverse);
  if (match) return match[1];

  // Try twitter: property
  const twitterRegex = new RegExp(
    `<meta[^>]*name=["']twitter:${property}["'][^>]*content=["']([^"']+)["']`,
    "i"
  );
  match = html.match(twitterRegex);
  if (match) return match[1];

  // Try name attribute for description
  if (property === "description") {
    const nameRegex =
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i;
    match = html.match(nameRegex);
    if (match) return match[1];
  }

  return null;
}

// Extract page title from <title> tag
function extractTitle(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : "";
}

// Make relative URLs absolute
function makeAbsoluteUrl(url: string, base: string): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) {
    const baseUrl = new URL(base);
    return `${baseUrl.origin}${url}`;
  }
  return `${base.replace(/\/[^/]*$/, "/")}${url}`;
}

export const handler: Handler = async (event) => {
  // Handle CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "Method not allowed" };
  }

  try {
    const { url } = JSON.parse(event.body || "{}");

    if (!url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "URL is required" }),
      };
    }

    // Validate URL length
    if (typeof url !== "string" || url.length > MAX_URL_LENGTH) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid URL" }),
      };
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Invalid protocol");
      }
    } catch {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid URL" }),
      };
    }

    // SSRF protection: block private/internal IPs
    if (isPrivateOrLocalhost(parsedUrl.hostname)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Invalid URL" }),
      };
    }

    // Fetch the URL with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LinkPreviewBot/1.0; +https://stem-explorers.netlify.app)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          url,
          title: parsedUrl.hostname,
          description: "",
          image: null,
          siteName: null,
        } as LinkPreviewData),
      };
    }

    // Only process HTML content
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          url,
          title: parsedUrl.hostname,
          description: "",
          image: null,
          siteName: null,
        } as LinkPreviewData),
      };
    }

    // Limit HTML size to prevent ReDoS attacks
    const html = (await response.text()).slice(0, MAX_HTML_SIZE);

    // Extract metadata
    const ogTitle = extractMetaContent(html, "title");
    const ogDescription = extractMetaContent(html, "description");
    const ogImage = extractMetaContent(html, "image");
    const ogSiteName = extractMetaContent(html, "site_name");

    const title = ogTitle || extractTitle(html) || parsedUrl.hostname;
    const description = ogDescription || "";
    const image = ogImage ? makeAbsoluteUrl(ogImage, url) : null;
    const siteName = ogSiteName || parsedUrl.hostname;

    const preview: LinkPreviewData = {
      url,
      title: title.slice(0, 200), // Limit title length
      description: description.slice(0, 500), // Limit description length
      image,
      siteName,
    };

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(preview),
    };
  } catch (error) {
    console.error("Link preview error:", error);

    // Return minimal data on error
    try {
      const { url } = JSON.parse(event.body || "{}");
      const parsedUrl = new URL(url);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          url,
          title: parsedUrl.hostname,
          description: "",
          image: null,
          siteName: null,
        } as LinkPreviewData),
      };
    } catch {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Failed to fetch link preview" }),
      };
    }
  }
};
