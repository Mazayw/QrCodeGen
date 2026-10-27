import { ContentType } from '../types/qr.ts';

/**
 * Generates a clean, filesystem-safe filename slug based on the encoded content.
 * If the content is a URL, it extracts the domain and key path/query identifiers.
 * If the content is text, it derives a readable slug from the first words.
 */
export function generateSuggestedFilename(
  contentType: ContentType,
  content: string
): string {
  const trimmed = content.trim();
  if (!trimmed) {
    return 'qr-code';
  }

  if (contentType === 'url') {
    try {
      const urlStr = trimmed.startsWith('http://') || trimmed.startsWith('https://')
        ? trimmed
        : `https://${trimmed}`;
      const parsed = new URL(urlStr);

      // Clean hostname (remove www., m., etc.)
      let host = parsed.hostname.toLowerCase().replace(/^(www\.|m\.)/, '');
      // Strip common TLDs like .com, .org, .net, .ua, etc. to make it concise
      host = host.replace(/\.(com|org|net|io|co|ua|app|dev|me|ai|tv|gg)$/, '');

      // Path parts
      const pathParts = parsed.pathname
        .split('/')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      const segments: string[] = [host];

      for (const p of pathParts) {
        if (segments.length >= 3) break;
        // Clean special characters
        const cleanPart = decodeURIComponent(p)
          .replace(/[^a-zA-Z0-9_-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        if (cleanPart) {
          segments.push(cleanPart);
        }
      }

      // If YouTube or watch URL with 'v' parameter
      const vParam = parsed.searchParams.get('v');
      if (vParam) {
        segments.push(vParam.substring(0, 12));
      }

      const slug = segments
        .join('-')
        .replace(/[^a-zA-Z0-9_-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 48);

      return slug ? `qr-${slug}` : 'qr-code';
    } catch {
      // Fallback if URL parsing fails
    }
  }

  // Text mode or fallback
  const cleanText = trimmed
    .substring(0, 40)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return cleanText ? `qr-${cleanText}` : 'qr-code';
}
