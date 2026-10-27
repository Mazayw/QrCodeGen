import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Play, ShieldCheck } from 'lucide-react';
import { runTrackingCleanerTests, TestCaseResult } from '../utils/trackingCleaner.test.ts';

interface TestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TestModal: React.FC<TestModalProps> = ({ isOpen, onClose }) => {
  const [testResults, setTestResults] = useState<TestCaseResult[]>([]);
  const [allPassed, setAllPassed] = useState<boolean | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleRun();
    }
  }, [isOpen]);

  const handleRun = () => {
    const res = runTrackingCleanerTests();
    setTestResults(res.results);
    setAllPassed(res.allPassed);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-2xs animate-in fade-in">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900">
                URL Tracking Cleaner Test Suite
              </h3>
              <p className="text-xs text-neutral-500">
                Automated tests verifying PRD criteria, Instagram rules, and signed links
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
            <div>
              <span className="text-xs font-semibold text-neutral-800">
                Overall Status:
              </span>
              <span
                className={`ml-2 text-xs font-bold ${
                  allPassed ? 'text-emerald-700' : 'text-rose-700'
                }`}
              >
                {allPassed ? 'All 9 Tests Passed' : 'Failures Detected'}
              </span>
            </div>
            <button
              type="button"
              onClick={handleRun}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-neutral-900 hover:bg-neutral-800 text-white rounded-lg transition-colors"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Rerun Tests</span>
            </button>
          </div>

          <div className="space-y-2">
            {testResults.map((t, idx) => (
              <div
                key={idx}
                className="p-3 bg-white border border-neutral-200/80 rounded-xl text-xs space-y-1 hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-medium text-neutral-900">
                    {t.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{t.name}</span>
                  </div>
                  <span
                    className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded ${
                      t.passed
                        ? 'bg-emerald-50 text-emerald-800'
                        : 'bg-rose-50 text-rose-800'
                    }`}
                  >
                    {t.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <div className="pl-6 text-[11px] text-neutral-500 font-mono space-y-0.5 break-all">
                  <div>
                    <span className="text-neutral-400">Expected: </span>
                    {t.expected}
                  </div>
                  <div>
                    <span className="text-neutral-400">Actual: </span>
                    {t.actual}
                  </div>
                  {t.details && (
                    <div className="text-neutral-600 font-sans mt-0.5">
                      {t.details}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
