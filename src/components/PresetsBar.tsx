import React from 'react';
import { PresetName, StyleConfig } from '../types/qr.ts';

interface PresetsBarProps {
  onApplyPreset: (name: PresetName) => void;
  currentDotsType: string;
}

export const PRESETS: {
  id: PresetName;
  name: string;
  description: string;
  previewClass: string;
  config: Partial<StyleConfig>;
}[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'Crisp square blocks with classic corner squares',
    previewClass: 'rounded-none',
    config: {
      dotsType: 'square',
      cornersSquareType: 'square',
      cornersDotType: 'square',
    },
  },
  {
    id: 'rounded',
    name: 'Rounded',
    description: 'Smooth soft rounded modules with curved corners',
    previewClass: 'rounded-md',
    config: {
      dotsType: 'rounded',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
    },
  },
  {
    id: 'dots',
    name: 'Dots',
    description: 'Modern circular matrix with rounded corner frames',
    previewClass: 'rounded-full',
    config: {
      dotsType: 'dots',
      cornersSquareType: 'extra-rounded',
      cornersDotType: 'dot',
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Refined classy dots with clean circular eyes',
    previewClass: 'rounded-lg',
    config: {
      dotsType: 'classy-rounded',
      cornersSquareType: 'dot',
      cornersDotType: 'dot',
    },
  },
];

export const PresetsBar: React.FC<PresetsBarProps> = ({ onApplyPreset }) => {
  return (
    <div className="bg-white rounded-2xl border border-neutral-200 p-5 md:p-6 shadow-xs">
      <div className="mb-3">
        <h2 className="text-base font-semibold text-neutral-900">Style Presets</h2>
        <p className="text-xs text-neutral-500">
          Quickly switch styles without affecting your content or logo
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onApplyPreset(p.id)}
            className="group flex flex-col items-center justify-center p-3 text-center border border-neutral-200 hover:border-neutral-900 bg-neutral-50/60 hover:bg-neutral-50 rounded-xl transition-all cursor-pointer"
          >
            <div className="w-8 h-8 flex items-center justify-center mb-1.5">
              <div
                className={`w-6 h-6 bg-neutral-900 transition-transform group-hover:scale-105 ${p.previewClass}`}
              />
            </div>
            <span className="text-xs font-semibold text-neutral-900 group-hover:text-neutral-950">
              {p.name}
            </span>
            <span className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1">
              {p.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
