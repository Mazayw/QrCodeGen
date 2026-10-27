import React, { useState } from 'react';
import {
  Download,
  FileCode,
  FileText,
  Image as ImageIcon,
  Loader2,
  Check,
} from 'lucide-react';
import { ExportConfig, StyleConfig } from '../types/qr.ts';
import { downloadPng, downloadSvg, downloadPdf } from '../utils/qrExport.ts';

interface ExportSectionProps {
  encodedData: string;
  styleConfig: StyleConfig;
  centerImageUrl: string | null;
  exportConfig: ExportConfig;
  onChangeExportConfig: (patch: Partial<ExportConfig>) => void;
  isRendering: boolean;
}

export const ExportSection: React.FC<ExportSectionProps> = ({
  encodedData,
  styleConfig,
  centerImageUrl,
  exportConfig,
  onChangeExportConfig,
  isRendering,
}) => {
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isExportDisabled = !encodedData.trim() || isRendering;

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const handleDownloadPng = async () => {
    if (isExportDisabled) return;
    try {
      setDownloadingType('png');
      setErrorMessage(null);
      await downloadPng(
        encodedData,
        styleConfig,
        centerImageUrl,
        exportConfig.pngSize,
        exportConfig.fileName
      );
      showSuccess(`Downloaded PNG (${exportConfig.pngSize}×${exportConfig.pngSize}px)`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate PNG.');
    } finally {
      setDownloadingType(null);
    }
  };

  const handleDownloadSvg = async () => {
    if (isExportDisabled) return;
    try {
      setDownloadingType('svg');
      setErrorMessage(null);
      await downloadSvg(
        encodedData,
        styleConfig,
        centerImageUrl,
        exportConfig.fileName
      );
      showSuccess('Downloaded vector SVG (offline-ready)');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate SVG.');
    } finally {
      setDownloadingType(null);
    }
  };

  const handleDownloadPdf = async () => {
    if (isExportDisabled) return;
    try {
      setDownloadingType('pdf');
      setErrorMessage(null);
      const sizeMm =
        exportConfig.pdfSizeMm === 'custom'
          ? exportConfig.pdfCustomMm
          : exportConfig.pdfSizeMm;
      await downloadPdf(
        encodedData,
        styleConfig,
        centerImageUrl,
        sizeMm,
        exportConfig.fileName
      );
      showSuccess(`Downloaded vector PDF (${sizeMm}×${sizeMm} mm)`);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to generate PDF.');
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <section className="bg-white rounded-2xl border border-neutral-200 p-5 md:p-6 shadow-xs space-y-6">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">5. Export</h2>
        <p className="text-xs text-neutral-500">
          Download high-resolution raster or vector print files
        </p>
      </div>

      {/* File Name */}
      <div>
        <label
          htmlFor="file-name"
          className="block text-xs font-medium text-neutral-700 mb-1.5"
        >
          File Name
        </label>
        <div className="flex items-center gap-2">
          <input
            id="file-name"
            type="text"
            value={exportConfig.fileName}
            onChange={(e) =>
              onChangeExportConfig({ fileName: e.target.value })
            }
            placeholder="qr-code"
            className="w-full max-w-sm px-3.5 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-neutral-900 font-mono transition-colors"
          />
        </div>
      </div>

      {/* Options Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* PNG Size Options */}
        <div>
          <span className="text-xs font-semibold text-neutral-700 block mb-1.5">
            PNG Resolution
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {([512, 1024, 2048] as const).map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => onChangeExportConfig({ pngSize: size })}
                className={`py-1.5 px-2 text-xs font-mono rounded-lg border transition-all ${
                  exportConfig.pngSize === size
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {size}px
              </button>
            ))}
          </div>
        </div>

        {/* PDF Physical Size Options */}
        <div>
          <span className="text-xs font-semibold text-neutral-700 block mb-1.5">
            PDF Page Size (Physical mm)
          </span>
          <div className="grid grid-cols-4 gap-1.5">
            {([30, 50, 100, 'custom'] as const).map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => onChangeExportConfig({ pdfSizeMm: sz })}
                className={`py-1.5 px-2 text-xs font-mono rounded-lg border capitalize transition-all ${
                  exportConfig.pdfSizeMm === sz
                    ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                    : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                }`}
              >
                {sz === 'custom' ? 'Custom' : `${sz}mm`}
              </button>
            ))}
          </div>

          {exportConfig.pdfSizeMm === 'custom' && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-neutral-500">Size:</span>
              <input
                type="number"
                min="10"
                max="500"
                value={exportConfig.pdfCustomMm}
                onChange={(e) =>
                  onChangeExportConfig({
                    pdfCustomMm: Math.max(10, parseInt(e.target.value || '10', 10)),
                  })
                }
                className="w-20 px-2 py-1 text-xs font-mono bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900"
              />
              <span className="text-xs text-neutral-500">mm (square)</span>
            </div>
          )}
        </div>
      </div>

      {/* Download Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-neutral-100">
        {/* PNG */}
        <button
          type="button"
          onClick={handleDownloadPng}
          disabled={isExportDisabled || downloadingType !== null}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-neutral-900 text-white hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
        >
          {downloadingType === 'png' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
          <span>Download PNG</span>
        </button>

        {/* SVG */}
        <button
          type="button"
          onClick={handleDownloadSvg}
          disabled={isExportDisabled || downloadingType !== null}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 hover:text-neutral-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
          title="Pure vector SVG file without internet dependencies"
        >
          {downloadingType === 'svg' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileCode className="w-4 h-4 text-neutral-600" />
          )}
          <span>Download SVG</span>
        </button>

        {/* PDF */}
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={isExportDisabled || downloadingType !== null}
          className="flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-neutral-50 border border-neutral-200 text-neutral-800 hover:text-neutral-950 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-2xs cursor-pointer"
          title="Vector PDF generated with svg2pdf and jsPDF"
        >
          {downloadingType === 'pdf' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <FileText className="w-4 h-4 text-neutral-600" />
          )}
          <span>Download PDF</span>
        </button>
      </div>

      {/* Feedback alerts */}
      {successMessage && (
        <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 p-3 rounded-xl animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-center gap-2 text-xs text-rose-800 bg-rose-50 border border-rose-200 p-3 rounded-xl">
          <span>{errorMessage}</span>
        </div>
      )}
    </section>
  );
};
