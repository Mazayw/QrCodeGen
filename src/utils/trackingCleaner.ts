/**
 * URL Tracking Parameter Cleaning Utility
 *
 * Configurable, domain-aware, and safe URL cleaning that preserves:
 * - URL path and scheme
 * - Non-tracking query parameters
 * - Repeated query parameters
 * - Hash fragment (#)
 * - Signed URLs detection and user confirmation prompt
 */

export interface TrackingRuleConfig {
  prefixRules: string[];
  exactKeys: string[];
  domainRules: {
    domainMatches: (hostname: string) => boolean;
    keys: string[];
  }[];
  signedParamKeys: string[];
}

export const DEFAULT_TRACKING_CONFIG: TrackingRuleConfig = {
  // Prefix matching (case-insensitive)
  prefixRules: ['utm_'],

  // Exact parameter keys (case-insensitive)
  exactKeys: [
    'fbclid',
    'gclid',
    'dclid',
    'msclkid',
    'ttclid',
    'twclid',
    'mc_cid',
    'mc_eid',
  ],

  // Domain-specific rules
  domainRules: [
    {
      // Match instagram.com and any legitimate subdomain (www.instagram.com, m.instagram.com, etc.)
      // Excludes spoofed domains like instagram.com.example.org
      domainMatches: (hostname: string) => {
        const lower = hostname.toLowerCase();
        return lower === 'instagram.com' || lower.endsWith('.instagram.com');
      },
      keys: ['igsh', 'igshid', 'srtk'],
    },
    {
      // Match tiktok.com and any legitimate subdomain (www.tiktok.com, m.tiktok.com, vm.tiktok.com, etc.)
      // Excludes spoofed domains like tiktok.com.example.org
      domainMatches: (hostname: string) => {
        const lower = hostname.toLowerCase();
        return lower === 'tiktok.com' || lower.endsWith('.tiktok.com');
      },
      keys: ['_r', '_t'],
    },
  ],

  // Parameters that indicate a cryptographically signed URL
  signedParamKeys: [
    'x-amz-signature',
    'x-goog-signature',
    'signature',
    'sig',
  ],
};

export interface CleanTrackingResult {
  success: boolean;
  originalUrl: string;
  cleanedUrl: string;
  removedParams: string[];
  isSigned: boolean;
  signedParam: string | null;
  changed: boolean;
  message?: string;
  error?: string;
}

/**
 * Checks whether a given parameter key is considered a signed URL parameter.
 */
export function checkIsSignedUrl(
  urlStr: string,
  config: TrackingRuleConfig = DEFAULT_TRACKING_CONFIG
): { isSigned: boolean; signedParam: string | null } {
  try {
    const parsed = new URL(urlStr);
    for (const [key] of parsed.searchParams.entries()) {
      const lowerKey = key.toLowerCase();
      if (config.signedParamKeys.includes(lowerKey)) {
        return { isSigned: true, signedParam: key };
      }
    }
  } catch {
    // If not a valid URL yet, skip check
  }
  return { isSigned: false, signedParam: null };
}

/**
 * Validates if string looks like a domain without protocol (e.g. "instagram.com/user" or "www.youtube.com")
 */
export function isMissingProtocol(input: string): boolean {
  const trimmed = input.trim();
  if (!trimmed || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return false;
  }
  // Check if it starts with something like "example.com" or "www.example.com/path"
  const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}(?::\d+)?(?:\/.*)?$/;
  return domainPattern.test(trimmed);
}

/**
 * Clean tracking parameters from a URL based on configured rules.
 *
 * @param urlInput The input URL string
 * @param forceCleanSigned If true, clean even if it contains signatures
 * @param config Optional custom configuration for rules
 */
export function cleanTrackingParams(
  urlInput: string,
  forceCleanSigned = false,
  config: TrackingRuleConfig = DEFAULT_TRACKING_CONFIG
): CleanTrackingResult {
  const trimmed = urlInput.trim();

  if (!trimmed) {
    return {
      success: false,
      originalUrl: urlInput,
      cleanedUrl: urlInput,
      removedParams: [],
      isSigned: false,
      signedParam: null,
      changed: false,
      error: 'URL cannot be empty.',
    };
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      success: false,
      originalUrl: urlInput,
      cleanedUrl: urlInput,
      removedParams: [],
      isSigned: false,
      signedParam: null,
      changed: false,
      error: 'Invalid URL format. Please include http:// or https:// (e.g., https://example.com).',
    };
  }

  // Detect signed URL
  const { isSigned, signedParam } = checkIsSignedUrl(trimmed, config);
  if (isSigned && !forceCleanSigned) {
    return {
      success: false,
      originalUrl: trimmed,
      cleanedUrl: trimmed,
      removedParams: [],
      isSigned: true,
      signedParam,
      changed: false,
      message: 'This URL may be signed. Modifying it could break the link.',
    };
  }

  const hostname = parsed.hostname;
  const removedParamsList: string[] = [];
  const entries = Array.from(parsed.searchParams.entries());

  if (entries.length === 0) {
    return {
      success: true,
      originalUrl: trimmed,
      cleanedUrl: trimmed,
      removedParams: [],
      isSigned,
      signedParam,
      changed: false,
      message: 'No known tracking parameters found.',
    };
  }

  // Build a set of domain-specific keys that apply to this hostname
  const domainSpecificKeys: string[] = [];
  for (const rule of config.domainRules) {
    if (rule.domainMatches(hostname)) {
      domainSpecificKeys.push(...rule.keys.map((k) => k.toLowerCase()));
    }
  }

  // Helper to determine if a key is a tracking parameter
  const isTrackingParam = (key: string): boolean => {
    const lowerKey = key.toLowerCase();

    // 1. Prefix rules (e.g., utm_*)
    for (const prefix of config.prefixRules) {
      if (lowerKey.startsWith(prefix.toLowerCase())) {
        return true;
      }
    }

    // 2. Exact global keys
    if (config.exactKeys.map((k) => k.toLowerCase()).includes(lowerKey)) {
      return true;
    }

    // 3. Domain-specific keys
    if (domainSpecificKeys.includes(lowerKey)) {
      return true;
    }

    return false;
  };

  // Filter query parameters while preserving order and duplicates of non-tracking params
  const remainingEntries: [string, string][] = [];
  for (const [key, value] of entries) {
    if (isTrackingParam(key)) {
      if (!removedParamsList.includes(key)) {
        removedParamsList.push(key);
      }
    } else {
      remainingEntries.push([key, value]);
    }
  }

  // Construct new query string
  const newParams = new URLSearchParams();
  for (const [key, value] of remainingEntries) {
    newParams.append(key, value);
  }

  const newSearch = newParams.toString() ? `?${newParams.toString()}` : '';

  // Construct cleaned URL preserving origin, pathname, fragment, and credentials
  const cleanedUrl = `${parsed.origin}${parsed.pathname}${newSearch}${parsed.hash}`;
  const changed = cleanedUrl !== trimmed;

  return {
    success: true,
    originalUrl: trimmed,
    cleanedUrl,
    removedParams: removedParamsList,
    isSigned,
    signedParam,
    changed,
    message: changed
      ? `Removed tracking parameters: ${removedParamsList.join(', ')}`
      : 'No known tracking parameters found.',
  };
}
