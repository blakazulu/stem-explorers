/**
 * Embed URL validation and utilities for allowed embed sources
 * Supported: Prezi, Google Slides, Canva, Genially, Padlet
 */

export interface EmbedSource {
  name: string;
  nameHe: string;
  pattern: RegExp;
  getEmbedUrl: (url: string) => string | null;
  icon?: string;
}

/**
 * Extract URL from iframe code if user pastes full iframe tag
 */
function extractUrlFromIframe(input: string): string {
  const iframeMatch = input.match(/src=["']([^"']+)["']/);
  if (iframeMatch) {
    return iframeMatch[1];
  }
  return input;
}

const EMBED_SOURCES: EmbedSource[] = [
  {
    name: "prezi",
    nameHe: "Prezi",
    // Matches: prezi.com/v/..., prezi.com/view/..., prezi.com/p/..., prezi.com/p/embed/..., prezi.com/embed/...
    pattern: /^https?:\/\/(www\.)?prezi\.com\/(v|view|p|embed|p\/embed)\/([a-zA-Z0-9_-]+)/,
    getEmbedUrl: (url: string) => {
      // Handle /p/embed/ format: prezi.com/p/embed/ID/
      const pEmbedMatch = url.match(/prezi\.com\/p\/embed\/([a-zA-Z0-9_-]+)/);
      if (pEmbedMatch) {
        return `https://prezi.com/p/embed/${pEmbedMatch[1]}/`;
      }
      // Handle other formats: /v/, /view/, /p/, /embed/
      const match = url.match(/prezi\.com\/(v|view|p|embed)\/([a-zA-Z0-9_-]+)/);
      if (match) {
        const id = match[2];
        return `https://prezi.com/p/embed/${id}/`;
      }
      return null;
    },
  },
  {
    name: "google-slides",
    nameHe: "Google Slides",
    // Matches: docs.google.com/presentation/d/.../edit, .../pub, .../embed
    pattern: /^https?:\/\/docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/,
    getEmbedUrl: (url: string) => {
      const match = url.match(/presentation\/d\/([a-zA-Z0-9_-]+)/);
      if (match) {
        const id = match[1];
        return `https://docs.google.com/presentation/d/${id}/embed?start=false&loop=false&delayms=3000`;
      }
      return null;
    },
  },
  {
    name: "canva",
    nameHe: "Canva",
    // Matches: canva.com/design/.../view, canva.com/design/.../watch
    pattern: /^https?:\/\/(www\.)?canva\.com\/design\/([a-zA-Z0-9_-]+)/,
    getEmbedUrl: (url: string) => {
      // Canva embed URLs need ?embed at the end
      const match = url.match(/canva\.com\/design\/([a-zA-Z0-9_-]+)/);
      if (match) {
        // Return the URL with embed parameter
        const baseUrl = url.split("?")[0];
        return `${baseUrl}?embed`;
      }
      return null;
    },
  },
  {
    name: "genially",
    nameHe: "Genially",
    // Matches: view.genial.ly/..., genial.ly/...
    pattern: /^https?:\/\/(view\.)?genial(\.ly|ly\.com)\/([a-zA-Z0-9_-]+)/,
    getEmbedUrl: (url: string) => {
      const match = url.match(/genial(?:\.ly|ly\.com)\/([a-zA-Z0-9_-]+)/);
      if (match) {
        const id = match[1];
        return `https://view.genial.ly/${id}`;
      }
      return null;
    },
  },
  {
    name: "padlet",
    nameHe: "Padlet",
    // Matches: padlet.com/username/boardname, padlet.com/embed/...
    pattern: /^https?:\/\/(www\.)?padlet\.com\/(embed\/)?([a-zA-Z0-9_-]+)/,
    getEmbedUrl: (url: string) => {
      // Padlet embed format: padlet.com/embed/...
      if (url.includes("/embed/")) {
        return url;
      }
      // Convert regular URL to embed
      const match = url.match(/padlet\.com\/([a-zA-Z0-9_-]+)\/([a-zA-Z0-9_-]+)/);
      if (match) {
        return `https://padlet.com/embed/${match[1]}/${match[2]}`;
      }
      return null;
    },
  },
];

export interface ValidateEmbedResult {
  isValid: boolean;
  source?: EmbedSource;
  embedUrl?: string;
  error?: string;
}

/**
 * Validate an embed URL against allowed sources
 */
export function validateEmbedUrl(input: string): ValidateEmbedResult {
  if (!input || !input.trim()) {
    return { isValid: false, error: "יש להזין קישור" };
  }

  // Extract URL from iframe code if user pasted full iframe tag
  const url = extractUrlFromIframe(input.trim());

  // Check if it's a valid URL
  try {
    new URL(url);
  } catch {
    return { isValid: false, error: "הקישור אינו תקין. יש להדביק קישור URL או קוד iframe" };
  }

  // Find matching source
  for (const source of EMBED_SOURCES) {
    if (source.pattern.test(url)) {
      const embedUrl = source.getEmbedUrl(url);
      if (embedUrl) {
        return {
          isValid: true,
          source,
          embedUrl,
        };
      }
    }
  }

  return {
    isValid: false,
    error: "הקישור אינו נתמך. ניתן להשתמש ב: Prezi, Google Slides, Canva, Genially, Padlet",
  };
}

/**
 * Get the source name for display
 */
export function getEmbedSourceName(url: string): string | null {
  const result = validateEmbedUrl(url);
  return result.source?.nameHe || null;
}

/**
 * Get list of supported sources for display
 */
export function getSupportedEmbedSources(): { name: string; nameHe: string }[] {
  return EMBED_SOURCES.map((s) => ({ name: s.name, nameHe: s.nameHe }));
}
