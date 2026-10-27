import React, { useState } from 'react';
import {
  Link,
  FileText,
  Sparkles,
  Undo2,
  AlertTriangle,
  Check,
  Plus,
} from 'lucide-react';
import { ContentType } from '../types/qr.ts';
import {
  cleanTrackingParams,
  isMissingProtocol,
  CleanTrackingResult,
} from '../utils/trackingCleaner.ts';

interface ContentSectionProps {
  contentType: ContentType;
  setContentType: (type: ContentType) => void;
  urlValue: string;
  setUrlValue: (val: string) => void;
  textValue: string;
  setTextValue: (val: string) => void;
  encodedContent: string;
}

export const ContentSection: React.FC<ContentSectionProps> = ({
  contentType,
  setContentType,
  urlValue,
  setUrlValue,
  textValue,
  setTextValue,
  encodedContent,
}) => {
  // Undo tracking cleaner state
  const [undoHistory, setUndoHistory] = useState<string | null>(null);
  const [removedParams, setRemovedParams] = useState<string[]>([]);
  const [cleanFeedback, setCleanFeedback] = useState<string | null>(null);
  const [signedPendingResult, setSignedPendingResult] =
    useState<CleanTrackingResult | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleCleanTracking = (forceOverride = false) => {
    setUrlError(null);
    setCleanFeedback(null);

    const result = cleanTrackingParams(urlValue, forceOverride);

    if (result.isSigned && !forceOverride) {
      setSignedPendingResult(result);
      return;
    }

    setSignedPendingResult(null);

    if (result.error) {
      setUrlError(result.error);
      return;
    }

    if (result.changed) {
      setUndoHistory(result.originalUrl);
      setUrlValue(result.cleanedUrl);
      setRemovedParams(result.removedParams);
      setCleanFeedback(
        `Removed tracking parameters: ${result.removedParams.join(', ')}`
      );
    } else {
      setCleanFeedback(result.message || 'No known tracking parameters found.');
    }
  };

  const handleUndo = () => {
    if (undoHistory !== null) {
      setUrlValue(undoHistory);
      setUndoHistory(null);
      setRemovedParams([]);
      setCleanFeedback('Restored original URL.');
      setUrlError(null);
      setSignedPendingResult(null);
    }
  };

  const handleAddHttps = () => {
    const trimmed = urlValue.trim();
    if (trimmed && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setUrlValue(`https://${trimmed}`);
      setUrlError(null);
    }
  };

  const hasMissingProtocol = contentType === 'url' && isMissingProtocol(urlValue);

  return (
    <section className="bg-white rounded-2xl border border-neutral-200 p-5 md:p-6 shadow-xs">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">1. Content</h2>
          <p className="text-xs text-neutral-500">
            Choose what you want to encode into the QR code
          </p>
        </div>

        <div className="flex items-center p-1 bg-neutral-100 rounded-xl shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setContentType('url')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              contentType === 'url'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <Link className="w-3.5 h-3.5" />
            <span>URL</span>
          </button>
          <button
            type="button"
            onClick={() => setContentType('text')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              contentType === 'text'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Text</span>
          </button>
        </div>
      </div>

      {/* URL Mode */}
      {contentType === 'url' ? (
        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="url-input"
              className="block text-xs font-medium text-neutral-700 mb-1.5"
            >
              Enter URL
            </label>
            <div className="relative flex flex-col sm:flex-row gap-2">
              <input
                id="url-input"
                type="url"
                value={urlValue}
                onChange={(e) => {
                  setUrlValue(e.target.value);
                  setUrlError(null);
                  setCleanFeedback(null);
                  setSignedPendingResult(null);
                }}
                placeholder="https://example.com/page?utm_source=qr&utm_medium=poster"
                className="flex-1 w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-neutral-900 placeholder:text-neutral-400 font-mono text-xs transition-colors"
              />

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleCleanTracking(false)}
                  disabled={!urlValue.trim()}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-medium text-neutral-800 bg-neutral-100 hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors whitespace-nowrap"
                  title="Remove known tracking query parameters like utm_*, fbclid, igsh, srtk"
                >
                  <Sparkles className="w-3.5 h-3.5 text-neutral-700" />
                  <span>Clean tracking</span>
                </button>

                {undoHistory !== null && (
                  <button
                    type="button"
                    onClick={handleUndo}
                    className="inline-flex items-center gap-1 px-3 py-2.5 text-xs font-medium text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-200 rounded-xl transition-colors whitespace-nowrap"
                    title="Undo tracking cleaning and restore original URL"
                  >
                    <Undo2 className="w-3.5 h-3.5" />
                    <span>Undo</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Missing protocol prompt */}
          {hasMissingProtocol && (
            <div className="flex items-center justify-between gap-3 p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-xs">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  The address is missing a protocol. Would you like to add{' '}
                  <code className="font-mono font-semibold">https://</code>?
                </span>
              </div>
              <button
                type="button"
                onClick={handleAddHttps}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-600 text-white hover:bg-amber-700 rounded-lg shrink-0 transition-colors"
              >
                <Plus className="w-3 h-3" />
                <span>Add https://</span>
              </button>
            </div>
          )}

          {/* Signed URL warning prompt */}
          {signedPendingResult && (
            <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs space-y-2.5">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Signed URL detected</p>
                  <p className="mt-0.5 text-amber-800">
                    This URL appears to be cryptographically signed (contains{' '}
                    <code className="font-mono bg-amber-100 px-1 py-0.5 rounded text-amber-900">
                      {signedPendingResult.signedParam}
                    </code>
                    ). Modifying it could break the link.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-6">
                <button
                  type="button"
                  onClick={() => setSignedPendingResult(null)}
                  className="px-3 py-1.5 text-xs font-medium bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleCleanTracking(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-amber-700 hover:bg-amber-800 text-white rounded-lg transition-colors"
                >
                  Clean anyway
                </button>
              </div>
            </div>
          )}

          {/* URL Error */}
          {urlError && (
            <p className="text-xs text-rose-600 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>{urlError}</span>
            </p>
          )}

          {/* Removed parameters feedback */}
          {cleanFeedback && !signedPendingResult && (
            <div className="flex items-center gap-2 text-xs text-neutral-700 bg-neutral-100/80 border border-neutral-200 px-3 py-2 rounded-xl">
              {removedParams.length > 0 ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              ) : (
                <span className="text-neutral-400">ℹ</span>
              )}
              <span>{cleanFeedback}</span>
            </div>
          )}

          {/* Encoded URL display */}
          <div className="pt-2">
            <span className="text-xs font-medium text-neutral-500 block mb-1">
              Encoded URL:
            </span>
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60 font-mono text-xs text-neutral-800 break-all select-all">
              {encodedContent ? (
                encodedContent
              ) : (
                <span className="text-neutral-400 italic">No URL entered yet</span>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Text Mode */
        <div className="mt-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="text-input"
                className="block text-xs font-medium text-neutral-700"
              >
                Enter text
              </label>
              <span className="text-xs font-mono text-neutral-400">
                {textValue.length} chars
              </span>
            </div>
            <textarea
              id="text-input"
              rows={4}
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              placeholder="Enter any text, notes, or Unicode characters (e.g., Привіт! Це мій кастомізований QR-код)..."
              className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-neutral-900/10 focus:border-neutral-900 text-neutral-900 placeholder:text-neutral-400 transition-colors"
            />
          </div>

          <div>
            <span className="text-xs font-medium text-neutral-500 block mb-1">
              Encoded Text:
            </span>
            <div className="p-2.5 bg-neutral-50 rounded-xl border border-neutral-200/60 font-mono text-xs text-neutral-800 break-all select-all whitespace-pre-wrap max-h-32 overflow-y-auto">
              {encodedContent ? (
                encodedContent
              ) : (
                <span className="text-neutral-400 italic">No text entered yet</span>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
