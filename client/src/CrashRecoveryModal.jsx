import React, { useEffect, useState } from 'react';
import { AlertTriangle, RotateCcw, Trash2, X } from 'lucide-react';

export default function CrashRecoveryModal({ crashData, onRestore, onDiscard }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const crashTime = crashData?.createdAt
    ? new Date(crashData.createdAt).toLocaleString()
    : 'Unknown';

  const noteCount = crashData?.snapshot?.notes?.length || 0;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' }}
    >
      <div
        className="absolute inset-0 bg-slate-900/60"
        onClick={onDiscard}
      />
      <div
        className={`relative w-full max-w-md mx-4 transition-all duration-500 ${visible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'}`}
      >
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="relative px-6 pt-6 pb-4">
            <button
              onClick={onDiscard}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>

            <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center mb-4">
              <AlertTriangle size={22} className="text-amber-500" />
            </div>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              Session Recovery Available
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              We detected your previous session wasn't closed properly. Would you like to restore your unsaved work?
            </p>
          </div>

          <div className="px-6 pb-4">
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Session Details</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Last active</span>
                <span className="text-sm font-medium text-slate-800">{crashTime}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Unsaved notes</span>
                <span className="text-sm font-medium text-slate-800">{noteCount} notes</span>
              </div>
              {crashData?.version && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Snapshot version</span>
                  <span className="text-sm font-medium text-slate-800">v{crashData.version}</span>
                </div>
              )}
            </div>
          </div>

          <div className="px-6 pb-6 flex gap-3">
            <button
              onClick={onDiscard}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all"
            >
              <Trash2 size={15} />
              Discard
            </button>
            <button
              onClick={onRestore}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white transition-all shadow-lg shadow-indigo-500/20"
            >
              <RotateCcw size={15} />
              Restore Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
