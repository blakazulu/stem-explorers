"use client";

import { useMemo } from "react";

interface LinkifiedTextProps {
  text: string;
  className?: string;
}

// Regex for markdown-style links: [title](url)
const MARKDOWN_LINK_REGEX = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;

// Regex for plain URLs (not already in markdown format)
const URL_REGEX = /(?<!\]\()https?:\/\/[^\s<>"\]]+/g;

// Trailing punctuation that should not be part of URLs
const TRAILING_PUNCTUATION = /[.,;:!?)]+$/;

// Strip trailing punctuation from URL
function cleanUrl(url: string): { url: string; trailing: string } {
  const match = url.match(TRAILING_PUNCTUATION);
  if (match) {
    return {
      url: url.slice(0, -match[0].length),
      trailing: match[0],
    };
  }
  return { url, trailing: "" };
}

type TextPart =
  | { type: "text"; content: string }
  | { type: "link"; title: string; url: string };

function parseText(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let lastIndex = 0;

  // First, find all markdown links and plain URLs with their positions
  const allMatches: Array<{ start: number; end: number; part: TextPart }> = [];

  // Find markdown links
  let match: RegExpExecArray | null;
  const mdRegex = new RegExp(MARKDOWN_LINK_REGEX.source, "g");
  while ((match = mdRegex.exec(text)) !== null) {
    allMatches.push({
      start: match.index,
      end: match.index + match[0].length,
      part: { type: "link", title: match[1], url: match[2] },
    });
  }

  // Find plain URLs (that aren't inside markdown links)
  const urlRegex = new RegExp(URL_REGEX.source, "g");
  while ((match = urlRegex.exec(text)) !== null) {
    const matchIndex = match.index;
    const matchText = match[0];
    // Check if this URL is inside a markdown link
    const isInsideMarkdown = allMatches.some(
      (m) => matchIndex >= m.start && matchIndex < m.end
    );
    if (!isInsideMarkdown) {
      // Clean trailing punctuation from URL
      const { url: cleanedUrl } = cleanUrl(matchText);
      allMatches.push({
        start: matchIndex,
        end: matchIndex + cleanedUrl.length,
        part: { type: "link", title: cleanedUrl, url: cleanedUrl },
      });
      // The trailing punctuation will be included in the next text segment
    }
  }

  // Sort by position
  allMatches.sort((a, b) => a.start - b.start);

  // Build parts array
  for (const m of allMatches) {
    // Add text before this match
    if (m.start > lastIndex) {
      parts.push({ type: "text", content: text.slice(lastIndex, m.start) });
    }
    parts.push(m.part);
    lastIndex = m.end;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text }];
}

export function LinkifiedText({ text, className = "" }: LinkifiedTextProps) {
  const parts = useMemo(() => parseText(text), [text]);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.type === "text") {
          return <span key={index}>{part.content}</span>;
        }
        return (
          <a
            key={index}
            href={part.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {part.title}
          </a>
        );
      })}
    </span>
  );
}
