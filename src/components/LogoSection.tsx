import React, { useState, useRef } from 'react';
import {
  Upload,
  Search,
  Trash2,
  AlertTriangle,
  Sparkles,
  Check,
  Image as ImageIcon,
  Layers,
} from 'lucide-react';
import {
  LogoMode,
  StyleConfig,
  LogoBackgroundType,
  LogoBackgroundShape,
  IconColorMode,
} from '../types/qr.ts';
import {
  ICON_LIBRARY,
  IconDefinition,
  getSuggestedIcon,
} from '../data/icons.ts';

interface LogoSectionProps {
  styleConfig: StyleConfig;
  onChangeStyle: (patch: Partial<StyleConfig>) => void;
  uploadedLogoDataUrl: string | null;
  onUploadLogo: (dataUrl: string | null) => void;
  urlValue: string;
}

export const LogoSection: React.FC<LogoSectionProps> = ({
  styleConfig,
  onChangeStyle,
  uploadedLogoDataUrl,
  onUploadLogo,
  urlValue,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggested icon based on current URL domain
  const suggestedIcon = getSuggestedIcon(urlValue);

  // Filter icons
  const categories = [
    'All',
    'Social',
    'Messaging',
    'Video & Music',
    'Services',
    'General',
  ];

  const filteredIcons = ICON_LIBRARY.filter((icon) => {
    const matchesCategory =
      activeCategory === 'All' || icon.category === activeCategory;
    const matchesQuery =
      icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      icon.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  const handleFile = (file: File) => {
    setUploadError(null);

    // Validate size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setUploadError('Image size exceeds 5 MB limit.');
      return;
    }

    // Validate type (PNG, JPEG, WebP)
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      setUploadError('Only PNG, JPEG, or WebP images are supported in v1.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        // Validate image load
        const img = new Image();
        img.onload = () => {
          onUploadLogo(result);
          onChangeStyle({
            logoMode: 'upload',
            selectedIconId: null,
          });
        };
        img.onerror = () => {
          setUploadError('Corrupted or unreadable image file.');
        };
        img.src = result;
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveLogo = () => {
    onUploadLogo(null);
    onChangeStyle({ logoMode: 'none', selectedIconId: null });
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSelectIcon = (icon: IconDefinition) => {
    onChangeStyle({
      logoMode: 'library',
      selectedIconId: icon.id,
    });
  };

  const isCenterActive =
    (styleConfig.logoMode === 'upload' && !!uploadedLogoDataUrl) ||
    (styleConfig.logoMode === 'library' && !!styleConfig.selectedIconId);

  return (
    <section className="bg-white rounded-2xl border border-neutral-200 p-5 md:p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">
            4. Logo & Icons
          </h2>
          <p className="text-xs text-neutral-500">
            Add a brand logo or select a ready vector service icon
          </p>
        </div>

        {/* 3 Modes: None, Upload, Icon library */}
        <div className="flex items-center p-1 bg-neutral-100 rounded-xl shrink-0">
          <button
            type="button"
            onClick={() => {
              onChangeStyle({ logoMode: 'none', selectedIconId: null });
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              styleConfig.logoMode === 'none'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            None
          </button>
          <button
            type="button"
            onClick={() => {
              onChangeStyle({ logoMode: 'upload' });
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              styleConfig.logoMode === 'upload'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => {
              onChangeStyle({
                logoMode: 'library',
                selectedIconId:
                  styleConfig.selectedIconId || ICON_LIBRARY[0].id,
              });
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              styleConfig.logoMode === 'library'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Icon Library
          </button>
        </div>
      </div>

      {/* Mode 1: Upload */}
      {styleConfig.logoMode === 'upload' && (
        <div className="space-y-4">
          {uploadedLogoDataUrl ? (
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white border border-neutral-200 p-1 flex items-center justify-center overflow-hidden">
                  <img
                    src={uploadedLogoDataUrl}
                    alt="Uploaded logo"
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div>
                  <span className="text-xs font-semibold text-neutral-900 block">
                    Custom Logo Active
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Proportions preserved
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove logo</span>
              </button>
            </div>
          ) : (
            <div>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-2xl p-6 text-center transition-colors cursor-pointer ${
                  isDragging
                    ? 'border-neutral-900 bg-neutral-50'
                    : 'border-neutral-200 hover:border-neutral-400 bg-neutral-50/50'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFile(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-10 h-10 mx-auto rounded-full bg-neutral-100 flex items-center justify-center mb-2 text-neutral-600">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-semibold text-neutral-900">
                  Click to upload or drag & drop
                </p>
                <p className="text-[11px] text-neutral-500 mt-1">
                  PNG, JPEG, or WebP (max 5 MB)
                </p>
              </div>

              {uploadError && (
                <p className="text-xs text-rose-600 mt-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{uploadError}</span>
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Icon Library */}
      {styleConfig.logoMode === 'library' && (
        <div className="space-y-4">
          {/* Suggested Icon based on URL */}
          {suggestedIcon && (
            <div className="flex items-center justify-between p-3 bg-neutral-50 border border-neutral-200 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-neutral-700 shrink-0" />
                <span className="text-neutral-700">
                  Detected {suggestedIcon.name} URL. Would you like to use the{' '}
                  <strong>{suggestedIcon.name}</strong> icon?
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleSelectIcon(suggestedIcon)}
                className="px-2.5 py-1 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors shrink-0"
              >
                Apply
              </button>
            </div>
          )}

          {/* Search icons & Category Tabs */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search icons (e.g. YouTube, Instagram, Phone)..."
                className="w-full pl-9 pr-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-neutral-900 transition-colors"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Icon Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto p-1 border border-neutral-100 rounded-xl">
            {filteredIcons.map((icon) => {
              const isSelected = styleConfig.selectedIconId === icon.id;
              return (
                <button
                  key={icon.id}
                  type="button"
                  onClick={() => handleSelectIcon(icon)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 hover:border-neutral-400 bg-white text-neutral-800'
                  }`}
                >
                  <div className="w-7 h-7 flex items-center justify-center mb-1.5">
                    <svg
                      viewBox={icon.viewBox}
                      className="w-6 h-6"
                      dangerouslySetInnerHTML={{
                        __html:
                          isSelected && styleConfig.iconColorMode === 'monochrome'
                            ? `<g style="color: ${styleConfig.iconMonochromeColor}">${icon.monochromePaths}</g>`
                            : icon.originalSvg,
                      }}
                    />
                  </div>
                  <span className="text-[11px] font-medium truncate w-full">
                    {icon.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Icon Color Mode: Original vs Single Color */}
          <div className="pt-3 border-t border-neutral-100 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-800">
                Icon Color Styling
              </span>
              <div className="flex items-center p-0.5 bg-neutral-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => onChangeStyle({ iconColorMode: 'original' })}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    styleConfig.iconColorMode === 'original'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600'
                  }`}
                >
                  Original colors
                </button>
                <button
                  type="button"
                  onClick={() => onChangeStyle({ iconColorMode: 'monochrome' })}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    styleConfig.iconColorMode === 'monochrome'
                      ? 'bg-white text-neutral-900 shadow-xs'
                      : 'text-neutral-600'
                  }`}
                >
                  Single color
                </button>
              </div>
            </div>

            {styleConfig.iconColorMode === 'monochrome' && (
              <div className="flex items-center gap-2 pt-1">
                <span className="text-xs text-neutral-600">Monochrome color:</span>
                <input
                  type="color"
                  value={styleConfig.iconMonochromeColor}
                  onChange={(e) =>
                    onChangeStyle({ iconMonochromeColor: e.target.value })
                  }
                  className="w-8 h-8 rounded-lg cursor-pointer border border-neutral-200"
                />
                <input
                  type="text"
                  value={styleConfig.iconMonochromeColor}
                  onChange={(e) =>
                    onChangeStyle({ iconMonochromeColor: e.target.value })
                  }
                  className="w-24 px-2 py-1 text-xs font-mono uppercase bg-neutral-50 border border-neutral-200 rounded-lg"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Central Image Adjustments (Size, Padding, Plate, Background) */}
      {isCenterActive && (
        <div className="pt-4 border-t border-neutral-100 space-y-4">
          <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wide">
            Center Image Adjustments
          </h3>

          {/* Size slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-700 font-medium">Size</span>
              <span className="font-mono text-neutral-500">
                {Math.round(styleConfig.logoSize * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.15"
              max="0.36"
              step="0.01"
              value={styleConfig.logoSize}
              onChange={(e) =>
                onChangeStyle({ logoSize: parseFloat(e.target.value) })
              }
              className="w-full accent-neutral-900 cursor-pointer"
            />
            {styleConfig.logoSize > 0.32 && (
              <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 shrink-0" />
                <span>
                  Large center image sizes might reduce scanner readability. Test
                  scan with phone camera.
                </span>
              </p>
            )}
          </div>

          {/* Padding / Margin slider */}
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-neutral-700 font-medium">Margin / Padding</span>
              <span className="font-mono text-neutral-500">
                {styleConfig.logoMargin}px
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="16"
              step="1"
              value={styleConfig.logoMargin}
              onChange={(e) =>
                onChangeStyle({ logoMargin: parseInt(e.target.value, 10) })
              }
              className="w-full accent-neutral-900 cursor-pointer"
            />
          </div>

          {/* Hide dots behind logo */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-neutral-700 font-medium">
              Hide QR dots behind logo
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={styleConfig.hideDotsBehindLogo}
                onChange={(e) =>
                  onChangeStyle({ hideDotsBehindLogo: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-neutral-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neutral-900"></div>
            </label>
          </div>

          {/* Background Plate */}
          <div className="space-y-2">
            <span className="text-xs text-neutral-700 font-medium block">
              Logo Background Plate
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['none', 'white', 'custom'] as LogoBackgroundType[]).map(
                (type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => onChangeStyle({ logoBgType: type })}
                    className={`py-1.5 px-3 text-xs font-medium rounded-lg border capitalize transition-all ${
                      styleConfig.logoBgType === type
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                    }`}
                  >
                    {type}
                  </button>
                )
              )}
            </div>

            {styleConfig.logoBgType !== 'none' && (
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {/* Plate Shape */}
                <div className="flex-1">
                  <span className="text-[11px] text-neutral-500 mb-1 block">
                    Plate Shape
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['square', 'rounded', 'circle'] as LogoBackgroundShape[]).map(
                      (shape) => (
                        <button
                          key={shape}
                          type="button"
                          onClick={() => onChangeStyle({ logoBgShape: shape })}
                          className={`py-1 px-2 text-xs rounded-md border capitalize ${
                            styleConfig.logoBgShape === shape
                              ? 'bg-neutral-900 text-white border-neutral-900'
                              : 'bg-white text-neutral-700 border-neutral-200'
                          }`}
                        >
                          {shape}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Custom plate color */}
                {styleConfig.logoBgType === 'custom' && (
                  <div>
                    <span className="text-[11px] text-neutral-500 mb-1 block">
                      Plate Color
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={styleConfig.logoBgColor}
                        onChange={(e) =>
                          onChangeStyle({ logoBgColor: e.target.value })
                        }
                        className="w-8 h-8 rounded-lg cursor-pointer border border-neutral-200"
                      />
                      <input
                        type="text"
                        value={styleConfig.logoBgColor}
                        onChange={(e) =>
                          onChangeStyle({ logoBgColor: e.target.value })
                        }
                        className="w-20 px-2 py-1 text-xs font-mono uppercase bg-neutral-50 border border-neutral-200 rounded-lg"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
