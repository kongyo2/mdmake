import { readable } from "@mizchi/readability";

export interface ConversionResult {
  markdown: string;
  title: string;
  url: string;
}

export interface ConversionOptions {
  charThreshold?: number;
  includeMetadata?: boolean;
}

export function convertHtmlToMarkdown(
  html: string,
  url: string,
  options: ConversionOptions = {}
): ConversionResult {
  const { charThreshold = 100, includeMetadata = true } = options;

  const result = readable(html, {
    charThreshold,
    url,
  });

  const markdown = result.toMarkdown();
  const title = result.snapshot.metadata.title || "Untitled";

  let output = "";

  if (includeMetadata) {
    output += `# ${title}\n\n`;
    output += `> Source: ${url}\n\n`;
    output += "---\n\n";
  }

  output += markdown;

  return {
    markdown: output,
    title,
    url,
  };
}

export function estimateTokenCount(text: string): number {
  // Rough estimation: ~4 characters per token for English, ~2 for Japanese
  const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
  const charPerToken = hasJapanese ? 2 : 4;
  return Math.ceil(text.length / charPerToken);
}
