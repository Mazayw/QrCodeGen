import React from 'react';
import {
  DotType,
  CornerSquareType,
  CornerDotType,
  StyleConfig,
} from '../types/qr.ts';

interface StyleSectionProps {
  styleConfig: StyleConfig;
  onChangeStyle: (patch: Partial<StyleConfig>) => void;
}

const DOT_TYPES: { id: DotType; label: string; preview: React.ReactNode }[] = [
  {
    id: 'square',
    label: 'Square',
    preview: (
      <div className="grid grid-cols-2 gap-1 w-5 h-5">
        <div className="bg-neutral-900 w-full h-full" />
        <div className="bg-neutral-900 w-full h-full" />
        <div className="bg-neutral-900 w-full h-full" />
        <div className="bg-neutral-900 w-full h-full" />
      </div>
    ),
  },
  {
    id: 'dots',
    label: 'Dots',
    preview: (
      <div className="grid grid-cols-2 gap-1 w-5 h-5">
        <div className="bg-neutral-900 rounded-full w-full h-full" />
        <div className="bg-neutral-900 rounded-full w-full h-full" />
        <div className="bg-neutral-900 rounded-full w-full h-full" />
        <div className="bg-neutral-900 rounded-full w-full h-full" />
      </div>
    ),
  },
  {
    id: 'rounded',
    label: 'Rounded',
    preview: (
      <div className="grid grid-cols-2 gap-1 w-5 h-5">
        <div className="bg-neutral-900 rounded-xs w-full h-full" />
        <div className="bg-neutral-900 rounded-xs w-full h-full" />
        <div className="bg-neutral-900 rounded-xs w-full h-full" />
        <div className="bg-neutral-900 rounded-xs w-full h-full" />
      </div>
    ),
  },
  {
    id: 'extra-rounded',
    label: 'Extra rounded',
    preview: (
      <div className="grid grid-cols-2 gap-1 w-5 h-5">
        <div className="bg-neutral-900 rounded-sm w-full h-full" />
        <div className="bg-neutral-900 rounded-sm w-full h-full" />
        <div className="bg-neutral-900 rounded-sm w-full h-full" />
        <div className="bg-neutral-900 rounded-sm w-full h-full" />
      </div>
    ),
  },
  {
    id: 'classy',
    label: 'Classy',
    preview: (
      <div className="grid grid-cols-2 gap-1 w-5 h-5">
        <div className="bg-neutral-900 rounded-tl-sm rounded-br-sm w-full h-full" />
        <div className="bg-neutral-900 rounded-tr-sm rounded-bl-sm w-full h-full" />
        <div className="bg-neutral-900 rounded-tr-sm rounded-bl-sm w-full h-full" />
        <div className="bg-neutral-900 rounded-tl-sm rounded-br-sm w-full h-full" />
      </div>
    ),
  },
  {
    id: 'classy-rounded',
    label: 'Classy rounded',
    preview: (
      <div className="grid grid-cols-2 gap-1 w-5 h-5">
        <div className="bg-neutral-900 rounded-tl-full rounded-br-full w-full h-full" />
        <div className="bg-neutral-900 rounded-tr-full rounded-bl-full w-full h-full" />
        <div className="bg-neutral-900 rounded-tr-full rounded-bl-full w-full h-full" />
        <div className="bg-neutral-900 rounded-tl-full rounded-br-full w-full h-full" />
      </div>
    ),
  },
];

const CORNER_SQUARE_TYPES: {
  id: CornerSquareType;
  label: string;
  preview: React.ReactNode;
}[] = [
  {
    id: 'square',
    label: 'Square',
    preview: (
      <div className="w-6 h-6 border-2 border-neutral-900 flex items-center justify-center p-0.5" />
    ),
  },
  {
    id: 'extra-rounded',
    label: 'Extra rounded',
    preview: (
      <div className="w-6 h-6 border-2 border-neutral-900 rounded-lg flex items-center justify-center p-0.5" />
    ),
  },
  {
    id: 'dot',
    label: 'Dot / Circle',
    preview: (
      <div className="w-6 h-6 border-2 border-neutral-900 rounded-full flex items-center justify-center p-0.5" />
    ),
  },
];

const CORNER_DOT_TYPES: {
  id: CornerDotType;
  label: string;
  preview: React.ReactNode;
}[] = [
  {
    id: 'square',
    label: 'Square',
    preview: <div className="w-3.5 h-3.5 bg-neutral-900" />,
  },
  {
    id: 'dot',
    label: 'Dot / Circle',
    preview: <div className="w-3.5 h-3.5 bg-neutral-900 rounded-full" />,
  },
];

export const StyleSection: React.FC<StyleSectionProps> = ({
  styleConfig,
  onChangeStyle,
}) => {
  return (
    <section className="bg-white rounded-2xl border border-neutral-200 p-5 md:p-6 shadow-xs space-y-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">2. Style & Shapes</h2>
        <p className="text-xs text-neutral-500">
          Customize the matrix patterns and corner finder markers
        </p>
      </div>

      {/* Body Shape */}
      <div>
        <label className="block text-xs font-semibold text-neutral-700 mb-2">
          QR Pattern Shape
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {DOT_TYPES.map((t) => {
            const isSelected = styleConfig.dotsType === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => onChangeStyle({ dotsType: t.id })}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                    : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 text-neutral-800'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? 'bg-white/20' : 'bg-white border border-neutral-200'
                  }`}
                >
                  <div className={isSelected ? 'text-white' : 'text-neutral-900'}>
                    {t.preview}
                  </div>
                </div>
                <span className="text-xs font-medium truncate">{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Corner Markers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-neutral-100">
        {/* Corner Frame */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">
            Corner Frame (Outer)
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CORNER_SQUARE_TYPES.map((t) => {
              const isSelected = styleConfig.cornersSquareType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChangeStyle({ cornersSquareType: t.id })}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div
                    className={`w-7 h-7 flex items-center justify-center mb-1 ${
                      isSelected ? '[&_*]:border-white' : '[&_*]:border-neutral-900'
                    }`}
                  >
                    {t.preview}
                  </div>
                  <span className="text-[11px] font-medium truncate w-full">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Corner Dot */}
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-2">
            Corner Dot (Inner)
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CORNER_DOT_TYPES.map((t) => {
              const isSelected = styleConfig.cornersDotType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onChangeStyle({ cornersDotType: t.id })}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                      : 'border-neutral-200 bg-neutral-50/50 hover:bg-neutral-100 text-neutral-800'
                  }`}
                >
                  <div
                    className={`w-7 h-7 flex items-center justify-center mb-1 ${
                      isSelected ? '[&_*]:bg-white' : '[&_*]:bg-neutral-900'
                    }`}
                  >
                    {t.preview}
                  </div>
                  <span className="text-[11px] font-medium truncate w-full">
                    {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
