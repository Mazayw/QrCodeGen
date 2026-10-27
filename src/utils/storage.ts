import { ExportConfig, StyleConfig } from '../types/qr.ts';

const STYLE_STORAGE_KEY = 'qr_studio_style_config_v1';
const EXPORT_STORAGE_KEY = 'qr_studio_export_config_v1';

export const DEFAULT_STYLE_CONFIG: StyleConfig = {
  dotsType: 'square',
  dotsColor: '#000000',
  cornersSquareType: 'square',
  cornersSquareColor: '#000000',
  cornersDotType: 'square',
  cornersDotColor: '#000000',
  backgroundColor: '#ffffff',
  isTransparentBg: false,
  errorCorrectionLevel: 'M',

  logoMode: 'none',
  selectedIconId: null,
  iconColorMode: 'original',
  iconMonochromeColor: '#000000',
  logoSize: 0.24,
  logoMargin: 6,
  hideDotsBehindLogo: true,
  logoBgType: 'white',
  logoBgColor: '#ffffff',
  logoBgShape: 'circle',
};

export const DEFAULT_EXPORT_CONFIG: ExportConfig = {
  fileName: 'qr-code',
  pngSize: 1024,
  pdfSizeMm: 50,
  pdfCustomMm: 50,
};

export function loadSavedStyleConfig(): StyleConfig {
  try {
    const raw = localStorage.getItem(STYLE_STORAGE_KEY);
    if (!raw) return DEFAULT_STYLE_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STYLE_CONFIG,
      ...parsed,
      // Security/Privacy rule: Never restore user-uploaded files or raw blob data
      logoMode: parsed.logoMode === 'upload' ? 'none' : parsed.logoMode,
    };
  } catch {
    return DEFAULT_STYLE_CONFIG;
  }
}

export function saveStyleConfig(config: StyleConfig): void {
  try {
    // Only persist styling attributes and selected library icon. Never user uploads.
    const toSave: Partial<StyleConfig> = {
      ...config,
      logoMode: config.logoMode === 'upload' ? 'none' : config.logoMode,
    };
    localStorage.setItem(STYLE_STORAGE_KEY, JSON.stringify(toSave));
  } catch {
    // Graceful fallback for private browsing or quota limits
  }
}

export function loadSavedExportConfig(): ExportConfig {
  try {
    const raw = localStorage.getItem(EXPORT_STORAGE_KEY);
    if (!raw) return DEFAULT_EXPORT_CONFIG;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_EXPORT_CONFIG,
      ...parsed,
    };
  } catch {
    return DEFAULT_EXPORT_CONFIG;
  }
}

export function saveExportConfig(config: ExportConfig): void {
  try {
    localStorage.setItem(EXPORT_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage errors
  }
}
