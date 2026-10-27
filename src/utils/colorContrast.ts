/**
 * Color Contrast & QR Scannability Advisory Utility
 *
 * QR code camera scanners rely heavily on high optical contrast.
 * Inverted colors (light modules on dark background) or low contrast (< 4.5:1)
 * can cause scanning failures on various mobile devices.
 */

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16),
      g: parseInt(clean[1] + clean[1], 16),
      b: parseInt(clean[2] + clean[2], 16),
    };
  }
  if (clean.length === 6) {
    return {
      r: parseInt(clean.substring(0, 2), 16),
      g: parseInt(clean.substring(2, 4), 16),
      b: parseInt(clean.substring(4, 6), 16),
    };
  }
  return null;
}

function getRelativeLuminance(r: number, g: number, b: number): number {
  const [sR, sG, sB] = [r / 255, g / 255, b / 255].map((val) => {
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

export function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 21; // Default safe assumption if parsing fails

  const lum1 = getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

export interface ScannabilityCheckResult {
  contrastRatio: number;
  isInverted: boolean;
  warnings: string[];
}

export function evaluateScannability(
  dotsColor: string,
  backgroundColor: string,
  isTransparentBg: boolean,
  logoSize: number,
  hasLogo: boolean
): ScannabilityCheckResult {
  const warnings: string[] = [];

  // If transparent, evaluate against assumed white surface
  const effectiveBg = isTransparentBg ? '#ffffff' : backgroundColor;

  const rgbDots = hexToRgb(dotsColor);
  const rgbBg = hexToRgb(effectiveBg);

  let contrastRatio = 21;
  let isInverted = false;

  if (rgbDots && rgbBg) {
    const lumDots = getRelativeLuminance(rgbDots.r, rgbDots.g, rgbDots.b);
    const lumBg = getRelativeLuminance(rgbBg.r, rgbBg.g, rgbBg.b);

    contrastRatio = (Math.max(lumDots, lumBg) + 0.05) / (Math.min(lumDots, lumBg) + 0.05);

    // Inverted check: dots are significantly lighter than background
    if (lumDots > lumBg && contrastRatio > 2.5) {
      isInverted = true;
      warnings.push(
        'Inverted colors (light QR on dark background). Some phone cameras only recognize dark QR codes on light backgrounds.'
      );
    }

    if (contrastRatio < 3.5) {
      warnings.push(
        `Low color contrast (${contrastRatio.toFixed(1)}:1). Consider using a darker QR color or lighter background for reliable scanning.`
      );
    }
  }

  if (hasLogo && logoSize > 0.32) {
    warnings.push(
      `Center image size is relatively large (${Math.round(logoSize * 100)}%). Error correction level is set to High (H), but please test scan thoroughly.`
    );
  }

  return {
    contrastRatio,
    isInverted,
    warnings,
  };
}
