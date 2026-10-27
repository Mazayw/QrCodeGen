import {
  cleanTrackingParams,
  checkIsSignedUrl,
  isMissingProtocol,
  DEFAULT_TRACKING_CONFIG,
} from './trackingCleaner.ts';

export interface TestCaseResult {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  details?: string;
}

export function runTrackingCleanerTests(): {
  allPassed: boolean;
  results: TestCaseResult[];
} {
  const results: TestCaseResult[] = [];

  // Test 1: Instagram tracking parameters removal (srtk + utm_source)
  {
    const input =
      'https://www.instagram.com/__crystal_el__?srtk=MTV4czhoaDQyaTJtNg%3D%3D&utm_source=qr';
    const res = cleanTrackingParams(input);
    const expected = 'https://www.instagram.com/__crystal_el__';
    const passed =
      res.cleanedUrl === expected &&
      res.removedParams.includes('srtk') &&
      res.removedParams.includes('utm_source');
    results.push({
      name: 'Instagram tracking removal (srtk + utm_source)',
      passed,
      expected,
      actual: res.cleanedUrl,
      details: `Removed: ${res.removedParams.join(', ')}`,
    });
  }

  // Test 2: YouTube parameter `v` preserved while utm_source removed
  {
    const input = 'https://www.youtube.com/watch?v=abc123&utm_source=qr';
    const res = cleanTrackingParams(input);
    const expected = 'https://www.youtube.com/watch?v=abc123';
    const passed =
      res.cleanedUrl === expected &&
      res.removedParams.length === 1 &&
      res.removedParams[0] === 'utm_source';
    results.push({
      name: 'YouTube watch URL parameter v preserved',
      passed,
      expected,
      actual: res.cleanedUrl,
    });
  }

  // Test 3: Non-tracking query params & hash fragment preserved
  {
    const input =
      'https://example.com/article?id=99&category=tech&fbclid=12345#user-comments';
    const res = cleanTrackingParams(input);
    const expected =
      'https://example.com/article?id=99&category=tech#user-comments';
    const passed = res.cleanedUrl === expected;
    results.push({
      name: 'Keep non-tracking params and URL fragment',
      passed,
      expected,
      actual: res.cleanedUrl,
    });
  }

  // Test 4: Repeated non-tracking parameters preserved
  {
    const input =
      'https://example.com/items?filter=alpha&filter=beta&gclid=test123';
    const res = cleanTrackingParams(input);
    const expected = 'https://example.com/items?filter=alpha&filter=beta';
    const passed = res.cleanedUrl === expected;
    results.push({
      name: 'Preserve repeated query parameters (multi-value)',
      passed,
      expected,
      actual: res.cleanedUrl,
    });
  }

  // Test 5: Case-insensitive utm_* parameters
  {
    const input =
      'https://example.com/promo?UTM_CAMPAIGN=summer&Utm_Medium=social&UTM_SOURCE=app';
    const res = cleanTrackingParams(input);
    const expected = 'https://example.com/promo';
    const passed = res.cleanedUrl === expected && res.removedParams.length === 3;
    results.push({
      name: 'Case-insensitive utm_* parameters removal',
      passed,
      expected,
      actual: res.cleanedUrl,
    });
  }

  // Test 6: Instagram domain protection - spoofed domain must NOT strip igsh
  {
    const input = 'https://instagram.com.example.org/profile?igsh=xyz987';
    const res = cleanTrackingParams(input);
    const expected = 'https://instagram.com.example.org/profile?igsh=xyz987';
    const passed = res.cleanedUrl === expected && res.removedParams.length === 0;
    results.push({
      name: 'Do NOT apply Instagram rules to spoofed domain (instagram.com.example.org)',
      passed,
      expected,
      actual: res.cleanedUrl,
    });
  }

  // Test 7: Signed URL detection (X-Amz-Signature)
  {
    const input =
      'https://s3.amazonaws.com/bucket/doc.pdf?X-Amz-Signature=abc12345&utm_source=email';
    const res = cleanTrackingParams(input, false);
    const passed = res.isSigned === true && res.changed === false;
    results.push({
      name: 'Signed URL warning detection (X-Amz-Signature stops initial cleaning)',
      passed,
      expected: 'isSigned = true, URL untouched without override',
      actual: `isSigned = ${res.isSigned}, changed = ${res.changed}`,
    });

    // Forced override cleans tracking but keeps signature
    const forced = cleanTrackingParams(input, true);
    const forcedPassed =
      forced.cleanedUrl ===
      'https://s3.amazonaws.com/bucket/doc.pdf?X-Amz-Signature=abc12345';
    results.push({
      name: 'Signed URL force clean keeps signature param and strips tracking',
      passed: forcedPassed,
      expected:
        'https://s3.amazonaws.com/bucket/doc.pdf?X-Amz-Signature=abc12345',
      actual: forced.cleanedUrl,
    });
  }

  // Test 8: Protocol missing detection helper
  {
    const missing = isMissingProtocol('www.instagram.com/user');
    const valid = isMissingProtocol('https://www.instagram.com/user');
    const empty = isMissingProtocol('');
    const passed = missing === true && valid === false && empty === false;
    results.push({
      name: 'Detect missing protocol without silent mutation',
      passed,
      expected: 'missing=true, valid=false',
      actual: `missing=${missing}, valid=${valid}`,
    });
  }

  // Test 9: No tracking params present
  {
    const input = 'https://example.com/path?foo=bar';
    const res = cleanTrackingParams(input);
    const passed = res.cleanedUrl === input && res.changed === false;
    results.push({
      name: 'No tracking parameters found returns unchanged',
      passed,
      expected: input,
      actual: res.cleanedUrl,
    });
  }

  // Test 10: TikTok tracking parameters removal (_r + _t) preserving username handle
  {
    const input =
      'https://www.tiktok.com/@__crystal_el__?_r=1&_t=ZS-9AuGSOU1rl7';
    const res = cleanTrackingParams(input);
    const expected = 'https://www.tiktok.com/@__crystal_el__';
    const passed =
      res.cleanedUrl === expected &&
      res.removedParams.includes('_r') &&
      res.removedParams.includes('_t') &&
      !res.cleanedUrl.includes('?');
    results.push({
      name: 'TikTok tracking removal (_r + _t) preserving @__crystal_el__',
      passed,
      expected,
      actual: res.cleanedUrl,
      details: `Removed: ${res.removedParams.join(', ')}`,
    });
  }

  const allPassed = results.every((r) => r.passed);
  return { allPassed, results };
}
