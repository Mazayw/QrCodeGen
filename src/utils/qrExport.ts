import QRCodeStyling, {
  Options as QROptions,
  DotType as LibDotType,
  CornerSquareType as LibCornerSquareType,
  CornerDotType as LibCornerDotType,
} from 'qr-code-styling';
import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import { StyleConfig } from '../types/qr.ts';

export function getQrOptions(
  data: string,
  style: StyleConfig,
  centerImageUrl: string | null,
  width = 320,
  height = 320
): QROptions {
  // If a center image exists, enforce High (H) error correction as required
  const errorCorrectionLevel =
    style.logoMode !== 'none' && centerImageUrl
      ? 'H'
      : style.errorCorrectionLevel || 'M';

  const hasImage = style.logoMode !== 'none' && !!centerImageUrl;

  return {
    width,
    height,
    type: 'svg',
    data: data || ' ',
    margin: 12,
    qrOptions: {
      typeNumber: 0,
      mode: 'Byte',
      errorCorrectionLevel,
    },
    imageOptions: {
      hideBackgroundDots: style.hideDotsBehindLogo,
      imageSize: hasImage ? style.logoSize : 0.2,
      margin: hasImage ? style.logoMargin : 0,
      crossOrigin: 'anonymous',
    },
    dotsOptions: {
      type: style.dotsType as LibDotType,
      color: style.dotsColor,
    },
    backgroundOptions: {
      color: style.isTransparentBg ? 'transparent' : style.backgroundColor,
    },
    cornersSquareOptions: {
      type: style.cornersSquareType as LibCornerSquareType,
      color: style.cornersSquareColor || style.dotsColor,
    },
    cornersDotOptions: {
      type: style.cornersDotType as LibCornerDotType,
      color: style.cornersDotColor || style.dotsColor,
    },
    image: hasImage ? centerImageUrl : undefined,
  };
}

/**
 * Download a Blob or File directly in the browser
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

/**
 * Export high-resolution PNG (512, 1024, 2048 px)
 */
export async function downloadPng(
  data: string,
  style: StyleConfig,
  centerImageUrl: string | null,
  size: 512 | 1024 | 2048,
  fileName: string
): Promise<void> {
  const safeName = (fileName.trim() || 'qr-code').replace(/\.png$/i, '');
  const options = getQrOptions(data, style, centerImageUrl, size, size);

  // Use canvas mode for clean PNG export
  const qr = new QRCodeStyling({
    ...options,
    type: 'canvas',
  });

  const rawData = await qr.getRawData('png');
  if (rawData) {
    const blob = rawData instanceof Blob ? rawData : new Blob([rawData as any], { type: 'image/png' });
    triggerDownload(blob, `${safeName}.png`);
  }
}

/**
 * Export true vector SVG
 */
export async function downloadSvg(
  data: string,
  style: StyleConfig,
  centerImageUrl: string | null,
  fileName: string
): Promise<void> {
  const safeName = (fileName.trim() || 'qr-code').replace(/\.svg$/i, '');
  const options = getQrOptions(data, style, centerImageUrl, 600, 600);

  const qr = new QRCodeStyling({
    ...options,
    type: 'svg',
  });

  const rawData = await qr.getRawData('svg');
  if (rawData) {
    const blob = rawData instanceof Blob ? rawData : new Blob([rawData as any], { type: 'image/svg+xml' });
    triggerDownload(blob, `${safeName}.svg`);
  }
}

/**
 * Export vector PDF using jsPDF + svg2pdf.js
 */
export async function downloadPdf(
  data: string,
  style: StyleConfig,
  centerImageUrl: string | null,
  sizeMm: number,
  fileName: string
): Promise<void> {
  const safeName = (fileName.trim() || 'qr-code').replace(/\.pdf$/i, '');
  const safeSize = Math.max(10, Math.min(sizeMm, 500));

  // Generate SVG with sufficient resolution for vector rendering
  const options = getQrOptions(data, style, centerImageUrl, 1000, 1000);
  const qr = new QRCodeStyling({
    ...options,
    type: 'svg',
  });

  const rawData = await qr.getRawData('svg');
  if (!rawData) {
    throw new Error('Failed to generate vector SVG data for PDF.');
  }

  const svgText = await (rawData instanceof Blob ? rawData.text() : new Response(rawData as any).text());

  const parser = new DOMParser();
  const docParsed = parser.parseFromString(svgText, 'image/svg+xml');
  const svgElement = docParsed.documentElement;

  if (!svgElement || svgElement.nodeName !== 'svg') {
    throw new Error('Invalid SVG markup produced by QR generator.');
  }

  // Create single page PDF matching exact square physical size
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [safeSize, safeSize],
  });

  // If background is not transparent, draw background fill first
  if (!style.isTransparentBg) {
    const bg = style.backgroundColor || '#ffffff';
    pdf.setFillColor(bg);
    pdf.rect(0, 0, safeSize, safeSize, 'F');
  }

  // Render SVG elements into the PDF as native vector primitives
  await svg2pdf(svgElement, pdf, {
    x: 0,
    y: 0,
    width: safeSize,
    height: safeSize,
  });

  pdf.save(`${safeName}.pdf`);
}
