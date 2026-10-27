import React from 'react';
import { AlertTriangle, EyeOff, ShieldAlert } from 'lucide-react';
import { StyleConfig } from '../types/qr.ts';
import { evaluateScannability } from '../utils/colorContrast.ts';

interface ColorSectionProps {
  styleConfig: StyleConfig;
  onChangeStyle: (patch: Partial<StyleConfig>) => void;
  hasLogo: boolean;
}

const COLOR_SWATCHES = [
  '#000000',
  '#1E293B',
  '#1E40AF',
  '#065F46',
  '#991B1B',
  '#581C87',
  '#7C2D12',
  '#0F766E',
];

interface ColorInputProps {
  label: string;
  color: string;
  onChange: (hex: string) => void;
  disabled?: boolean;
}

const ColorField: React.FC<ColorInputProps> = ({
  label,
  color,
  onChange,
  disabled = false,
}) => {
  return (
    <div className={`space-y-1.5 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <label className="block text-xs font-medium text-neutral-700 truncate">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {/* Native color picker button */}
        <div className="relative w-9 h-9 rounded-xl border border-neutral-200 overflow-hidden shrink-0 shadow-2xs hover:border-neutral-400 transition-colors">
          <input
            type="color"
            value={color.startsWith('#') && color.length === 7 ? color : '#000000'}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer border-0"
          />
        </div>

        {/* HEX input */}
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="#000000"
          className="w-full px-2.5 py-2 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-neutral-900 uppercase transition-colors"
        />
      </div>
    </div>
  );
};

export const ColorSection: React.FC<ColorSectionProps> = ({
  styleConfig,
  onChangeStyle,
  hasLogo,
}) => {
  const scannability = evaluateScannability(
    styleConfig.dotsColor,
    styleConfig.backgroundColor,
    styleConfig.isTransparentBg,
    styleConfig.logoSize,
    hasLogo
  );

  return (
    <section className="bg-white rounded-2xl border border-neutral-200 p-5 md:p-6 shadow-xs space-y-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">3. Colors & Background</h2>
        <p className="text-xs text-neutral-500">
          Choose high-contrast palettes for reliable scanning
        </p>
      </div>

      {/* Quick Swatches */}
      <div>
        <label className="block text-xs font-medium text-neutral-600 mb-2">
          Quick QR Color Presets
        </label>
        <div className="flex flex-wrap gap-2">
          {COLOR_SWATCHES.map((hex) => (
            <button
              key={hex}
              type="button"
              onClick={() => {
                onChangeStyle({
                  dotsColor: hex,
                  cornersSquareColor: hex,
                  cornersDotColor: hex,
                });
              }}
              style={{ backgroundColor: hex }}
              className={`w-7 h-7 rounded-lg border-2 transition-transform hover:scale-110 cursor-pointer ${
                styleConfig.dotsColor.toLowerCase() === hex.toLowerCase()
                  ? 'border-neutral-900 ring-2 ring-neutral-900/20 scale-105'
                  : 'border-white/80 shadow-2xs'
              }`}
              title={`Set QR color to ${hex}`}
            />
          ))}
        </div>
      </div>

      {/* Color pickers 2x2 grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        <ColorField
          label="QR Pattern Color"
          color={styleConfig.dotsColor}
          onChange={(hex) => onChangeStyle({ dotsColor: hex })}
        />

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-neutral-700">
              Background Color
            </span>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-neutral-600 font-medium">
              <input
                type="checkbox"
                checked={styleConfig.isTransparentBg}
                onChange={(e) =>
                  onChangeStyle({ isTransparentBg: e.target.checked })
                }
                className="rounded text-neutral-900 focus:ring-neutral-900/10 cursor-pointer"
              />
              <span>Transparent</span>
            </label>
          </div>
          <ColorField
            label=""
            color={styleConfig.backgroundColor}
            onChange={(hex) => onChangeStyle({ backgroundColor: hex })}
            disabled={styleConfig.isTransparentBg}
          />
        </div>

        <ColorField
          label="Corner Frame Color"
          color={styleConfig.cornersSquareColor}
          onChange={(hex) => onChangeStyle({ cornersSquareColor: hex })}
        />

        <ColorField
          label="Corner Dot Color"
          color={styleConfig.cornersDotColor}
          onChange={(hex) => onChangeStyle({ cornersDotColor: hex })}
        />
      </div>

      {/* Scannability Warning Box */}
      {scannability.warnings.length > 0 && (
        <div className="p-3.5 bg-amber-50 border border-amber-200/90 rounded-xl space-y-1.5">
          <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Scannability Notice</span>
          </div>
          <ul className="space-y-1 pl-6 list-disc text-xs text-amber-800">
            {scannability.warnings.map((warn, i) => (
              <li key={i}>{warn}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};
