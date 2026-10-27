/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { ContentSection } from './components/ContentSection.tsx';
import { PresetsBar, PRESETS } from './components/PresetsBar.tsx';
import { StyleSection } from './components/StyleSection.tsx';
import { ColorSection } from './components/ColorSection.tsx';
import { LogoSection } from './components/LogoSection.tsx';
import { ExportSection } from './components/ExportSection.tsx';
import { PreviewPanel } from './components/PreviewPanel.tsx';
import { TestModal } from './components/TestModal.tsx';

import {
  ContentType,
  ExportConfig,
  PresetName,
  StyleConfig,
} from './types/qr.ts';
import {
  loadSavedStyleConfig,
  saveStyleConfig,
  loadSavedExportConfig,
  saveExportConfig,
  DEFAULT_STYLE_CONFIG,
} from './utils/storage.ts';
import { ICON_LIBRARY, getIconSvgDataUrl } from './data/icons.ts';

export default function App() {
  // Content state (never stored automatically in localStorage per privacy requirements)
  const [contentType, setContentType] = useState<ContentType>('url');
  const [urlValue, setUrlValue] = useState<string>('https://example.com');
  const [textValue, setTextValue] = useState<string>(
    'Привіт! Це мій кастомізований QR-код.'
  );

  // Style state (persisted in localStorage)
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(() =>
    loadSavedStyleConfig()
  );

  // Export settings (persisted in localStorage)
  const [exportConfig, setExportConfig] = useState<ExportConfig>(() =>
    loadSavedExportConfig()
  );

  // Uploaded user image (session only, never stored in localStorage)
  const [uploadedLogoDataUrl, setUploadedLogoDataUrl] = useState<string | null>(
    null
  );

  // Rendering and Verification modal states
  const [isRendering, setIsRendering] = useState(false);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  // Persist style on changes
  useEffect(() => {
    saveStyleConfig(styleConfig);
  }, [styleConfig]);

  // Persist export options on changes
  useEffect(() => {
    saveExportConfig(exportConfig);
  }, [exportConfig]);

  const handleUpdateStyle = (patch: Partial<StyleConfig>) => {
    setStyleConfig((prev) => ({ ...prev, ...patch }));
  };

  const handleUpdateExport = (patch: Partial<ExportConfig>) => {
    setExportConfig((prev) => ({ ...prev, ...patch }));
  };

  const handleApplyPreset = (presetName: PresetName) => {
    const found = PRESETS.find((p) => p.id === presetName);
    if (found) {
      handleUpdateStyle(found.config);
    }
  };

  const handleResetStyle = () => {
    setStyleConfig({ ...DEFAULT_STYLE_CONFIG });
    saveStyleConfig(DEFAULT_STYLE_CONFIG);
  };

  const handleClearContent = () => {
    setUrlValue('');
    setTextValue('');
  };

  // Determine current active encoded content
  const encodedContent = useMemo(() => {
    return contentType === 'url' ? urlValue.trim() : textValue.trim();
  }, [contentType, urlValue, textValue]);

  // Compute center image (uploaded raster or library vector SVG Data URL)
  const centerImageUrl = useMemo(() => {
    if (styleConfig.logoMode === 'upload' && uploadedLogoDataUrl) {
      return uploadedLogoDataUrl;
    }
    if (styleConfig.logoMode === 'library' && styleConfig.selectedIconId) {
      const icon = ICON_LIBRARY.find((i) => i.id === styleConfig.selectedIconId);
      if (icon) {
        return getIconSvgDataUrl(
          icon,
          styleConfig.iconColorMode,
          styleConfig.iconMonochromeColor,
          styleConfig.logoBgType,
          styleConfig.logoBgColor,
          styleConfig.logoBgShape
        );
      }
    }
    return null;
  }, [styleConfig, uploadedLogoDataUrl]);

  const hasLogo = styleConfig.logoMode !== 'none' && !!centerImageUrl;

  return (
    <div className="min-h-screen bg-neutral-50/70 text-neutral-900 flex flex-col font-sans">
      <Navbar
        onResetStyle={handleResetStyle}
        onClearContent={handleClearContent}
        onOpenTests={() => setIsTestModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Configuration Controls (Content, Presets, Style, Colors, Logo, Export) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-6">
            <ContentSection
              contentType={contentType}
              setContentType={setContentType}
              urlValue={urlValue}
              setUrlValue={setUrlValue}
              textValue={textValue}
              setTextValue={setTextValue}
              encodedContent={encodedContent}
            />

            <PresetsBar
              onApplyPreset={handleApplyPreset}
              currentDotsType={styleConfig.dotsType}
            />

            <StyleSection
              styleConfig={styleConfig}
              onChangeStyle={handleUpdateStyle}
            />

            <ColorSection
              styleConfig={styleConfig}
              onChangeStyle={handleUpdateStyle}
              hasLogo={hasLogo}
            />

            <LogoSection
              styleConfig={styleConfig}
              onChangeStyle={handleUpdateStyle}
              uploadedLogoDataUrl={uploadedLogoDataUrl}
              onUploadLogo={setUploadedLogoDataUrl}
              urlValue={urlValue}
            />

            <ExportSection
              encodedData={encodedContent}
              styleConfig={styleConfig}
              centerImageUrl={centerImageUrl}
              exportConfig={exportConfig}
              onChangeExportConfig={handleUpdateExport}
              isRendering={isRendering}
            />
          </div>

          {/* Right Column: Sticky Live Preview */}
          <div className="lg:col-span-5 xl:col-span-4">
            <PreviewPanel
              encodedData={encodedContent}
              styleConfig={styleConfig}
              centerImageUrl={centerImageUrl}
              isRendering={isRendering}
              setIsRendering={setIsRendering}
              renderError={renderError}
              setRenderError={setRenderError}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white py-6 mt-12 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            QR Studio — 100% Client-Side. No telemetry, tracking, or remote image processing.
          </p>
          <div className="flex items-center gap-4 text-neutral-600">
            <button
              type="button"
              onClick={() => setIsTestModalOpen(true)}
              className="hover:text-neutral-900 underline underline-offset-2"
            >
              Test Rules Verification
            </button>
            <span>·</span>
            <span>Vector SVG & PDF Ready</span>
          </div>
        </div>
      </footer>

      {/* Test Suite Modal */}
      <TestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
}
