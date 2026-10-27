import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Camera, AlertCircle, Loader2 } from 'lucide-react';
import { StyleConfig } from '../types/qr.ts';
import { getQrOptions } from '../utils/qrExport.ts';

interface PreviewPanelProps {
  encodedData: string;
  styleConfig: StyleConfig;
  centerImageUrl: string | null;
  isRendering: boolean;
  setIsRendering: (state: boolean) => void;
  renderError: string | null;
  setRenderError: (err: string | null) => void;
}

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  encodedData,
  styleConfig,
  centerImageUrl,
  isRendering,
  setIsRendering,
  renderError,
  setRenderError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const qrInstanceRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    setIsRendering(true);
    setRenderError(null);

    const timer = setTimeout(() => {
      const container = containerRef.current;
      if (!container) return;

      try {
        const options = getQrOptions(
          encodedData,
          styleConfig,
          centerImageUrl,
          280,
          280
        );

        if (!qrInstanceRef.current) {
          qrInstanceRef.current = new QRCodeStyling(options);
          container.innerHTML = '';
          qrInstanceRef.current.append(container);
        } else {
          qrInstanceRef.current.update(options);
        }
      } catch (err: any) {
        setRenderError(err?.message || 'Failed to render QR code.');
      } finally {
        setIsRendering(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [encodedData, styleConfig, centerImageUrl, setIsRendering, setRenderError]);

  return (
    <div
      id="preview-section"
      className="bg-white rounded-2xl border border-neutral-200 p-5 md:p-6 shadow-xs flex flex-col items-center"
    >
      <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
        <h2 className="text-sm font-semibold text-neutral-900">Live Preview</h2>
        {isRendering ? (
          <span className="flex items-center gap-1.5 text-xs text-neutral-400 font-mono">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Updating...</span>
          </span>
        ) : (
          <span className="text-[11px] font-mono text-neutral-400">Real-time</span>
        )}
      </div>

      {/* QR Canvas Container with Checkerboard when transparent */}
      <div className="relative w-full aspect-square max-w-[300px] flex items-center justify-center rounded-2xl border border-neutral-200/80 overflow-hidden shadow-2xs">
        {/* Background plate */}
        <div
          className={`absolute inset-0 ${
            styleConfig.isTransparentBg ? 'bg-checkerboard' : ''
          }`}
          style={{
            backgroundColor: styleConfig.isTransparentBg
              ? undefined
              : styleConfig.backgroundColor,
          }}
        />

        {/* QR DOM Target */}
        <div
          ref={containerRef}
          className="relative z-10 w-[280px] h-[280px] flex items-center justify-center [&_svg]:max-w-full [&_svg]:max-h-full"
        />

        {/* Empty state overlay */}
        {!encodedData && (
          <div className="absolute inset-0 z-20 bg-white/90 backdrop-blur-2xs flex flex-col items-center justify-center p-4 text-center">
            <span className="text-xs font-semibold text-neutral-800">
              No Content Yet
            </span>
            <span className="text-[11px] text-neutral-500 mt-1 max-w-[200px]">
              Type a URL or text in the content section to generate your QR code.
            </span>
          </div>
        )}

        {/* Error overlay */}
        {renderError && (
          <div className="absolute inset-0 z-20 bg-rose-50/95 flex flex-col items-center justify-center p-4 text-center">
            <AlertCircle className="w-6 h-6 text-rose-600 mb-1.5" />
            <span className="text-xs font-semibold text-rose-900">
              Render Error
            </span>
            <span className="text-[11px] text-rose-700 mt-1">{renderError}</span>
          </div>
        )}
      </div>

      {/* Important Advisory Prompt required by spec */}
      <div className="mt-4 flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 border border-neutral-200/70 rounded-xl px-3 py-2 text-center w-full justify-center">
        <Camera className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
        <span className="font-medium text-neutral-700 text-[11px] sm:text-xs">
          Test your QR code with a phone camera before printing.
        </span>
      </div>

      {/* Encoded Content Info */}
      <div className="w-full mt-3 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500 flex items-center justify-between">
        <span className="truncate max-w-[200px]">
          {encodedData ? `Encoded: ${encodedData}` : 'Awaiting input'}
        </span>
        <span className="font-mono text-neutral-400 shrink-0">
          ECC: {styleConfig.logoMode !== 'none' && centerImageUrl ? 'H' : 'M'}
        </span>
      </div>
    </div>
  );
};
