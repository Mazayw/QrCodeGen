import React from 'react';
import { QrCode, RotateCcw, Trash2, CheckCircle2 } from 'lucide-react';

interface NavbarProps {
  onResetStyle: () => void;
  onClearContent: () => void;
  onOpenTests: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onResetStyle,
  onClearContent,
  onOpenTests,
}) => {
  return (
    <header className="border-b border-neutral-200 bg-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
            <QrCode className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-base tracking-tight text-neutral-900 block leading-tight">
              QR Studio
            </span>
            <span className="text-xs text-neutral-500 font-normal">
              Clean URL & Vector QR Generator
            </span>
          </div>
        </div>

        {/* Actions Zone */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenTests}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors whitespace-nowrap"
            title="Run automated test suite for URL tracking rules"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-neutral-700" />
            <span>Verify Rules</span>
          </button>

          <button
            type="button"
            onClick={onResetStyle}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-lg transition-colors whitespace-nowrap"
            title="Reset styling options to defaults"
          >
            <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
            <span>Reset Style</span>
          </button>

          <button
            type="button"
            onClick={onClearContent}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 hover:text-rose-700 bg-white hover:bg-rose-50 border border-neutral-200 rounded-lg transition-colors whitespace-nowrap"
            title="Clear entered text or URL"
          >
            <Trash2 className="w-3.5 h-3.5 text-neutral-500" />
            <span className="hidden xs:inline">Clear Content</span>
            <span className="xs:hidden">Clear</span>
          </button>
        </div>
      </div>
    </header>
  );
};
