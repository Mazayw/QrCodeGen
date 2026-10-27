export type ContentType = 'url' | 'text';

export type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H';

export type DotType =
  | 'square'
  | 'dots'
  | 'rounded'
  | 'extra-rounded'
  | 'classy'
  | 'classy-rounded';

export type CornerSquareType = 'square' | 'dot' | 'extra-rounded';

export type CornerDotType = 'square' | 'dot';

export type LogoMode = 'none' | 'upload' | 'library';

export type LogoBackgroundType = 'none' | 'white' | 'custom';

export type LogoBackgroundShape = 'square' | 'rounded' | 'circle';

export type IconColorMode = 'original' | 'monochrome';

export interface StyleConfig {
  dotsType: DotType;
  dotsColor: string;
  cornersSquareType: CornerSquareType;
  cornersSquareColor: string;
  cornersDotType: CornerDotType;
  cornersDotColor: string;
  backgroundColor: string;
  isTransparentBg: boolean;
  errorCorrectionLevel: ErrorCorrectionLevel;
  
  // Center logo & icons
  logoMode: LogoMode;
  selectedIconId: string | null;
  iconColorMode: IconColorMode;
  iconMonochromeColor: string;
  logoSize: number; // 0.15 to 0.38
  logoMargin: number; // 0 to 24
  hideDotsBehindLogo: boolean;
  logoBgType: LogoBackgroundType;
  logoBgColor: string;
  logoBgShape: LogoBackgroundShape;
}

export interface ExportConfig {
  fileName: string;
  pngSize: 512 | 1024 | 2048;
  pdfSizeMm: 30 | 50 | 100 | 'custom';
  pdfCustomMm: number;
}

export type PresetName = 'classic' | 'rounded' | 'dots' | 'minimal';
