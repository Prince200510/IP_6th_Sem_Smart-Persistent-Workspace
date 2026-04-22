import React, { useEffect, useState } from 'react';
import { X, Clock, RotateCcw, Check, History, Loader2 } from 'lucide-react';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function VersionHistoryPanel({ versions, currentVersion, onRestore, onClose, loading }) {
  const [visible, setVisible] = useState(false);
  const [restoringVersion, setRestoringVersion] = useState(null);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleRestore = async (version) => {
    setRestoringVersion(version);
    await onRestore(version);
    setRestoringVersion(null);
  };

  return (
    <>
      <div
        className={`fixed inset-0 z-[9998] bg-slate-900/30 transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={handleClose}
        style={{ backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}
      />

      <div
        className={`fixed top-0 right-0 bottom-0 z-[9999] w-full max-w-sm bg-white border-l border-slate-200 shadow-2xl flex flex-col transition-transform duration-300 ease-out ${visible ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <History size={16} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Version History</h2>
              <p className="text-[10px] text-slate-400 font-medium">{versions.length} snapshots</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Loader2 size={24} className="animate-spin mb-3" />
              <p className="text-sm">Loading history...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400">
              <Clock size={28} className="mb-3 opacity-30" />
              <p className="text-sm font-medium text-slate-500">No snapshots yet</p>
              <p className="text-xs mt-1">Auto-save creates snapshots every 5 seconds</p>
            </div>
          ) : (
            <div className="relative">
              <div className="absolute left-[15px] top-4 bottom-4 w-px bg-slate-200" />
              <div className="space-y-1">
                {versions.map((v, idx) => {
                  const isCurrent = v.version === currentVersion;
                  const isRestoring = restoringVersion === v.version;
                  return (
                    <div
                      key={v.version || idx}
                      className={`relative pl-9 pr-3 py-3 rounded-xl transition-all group ${isCurrent ? 'bg-indigo-50 border border-indigo-100' : 'hover:bg-slate-50'}`}
                    >
                      <div
                        className={`absolute left-[11px] top-[18px] w-[9px] h-[9px] rounded-full border-2 ${isCurrent ? 'bg-indigo-600 border-indigo-600' : 'bg-white border-slate-300 group-hover:border-indigo-400'}`}
                      />

                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-bold text-slate-800">v{v.version}</span>
                            {isCurrent && (
                              <span className="flex items-center gap-0.5 text-[9px] font-semibold text-indigo-600 bg-indigo-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                <Check size={8} /> Current
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">{v.label || 'Auto-save'}</span>
                            <span className="text-[10px] text-slate-300">·</span>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1">
                              <Clock size={10} />
                              {timeAgo(v.createdAt)}
                            </span>
                          </div>
                        </div>

                        {!isCurrent && (
                          <button
                            onClick={() => handleRestore(v.version)}
                            disabled={isRestoring}
                            className="shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-indigo-600 bg-white border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          >
                            {isRestoring ? (
                              <Loader2 size={11} className="animate-spin" />
                            ) : (
                              <RotateCcw size={11} />
                            )}
                            Restore
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
          <p className="text-[10px] text-slate-400 text-center">
            Snapshots are automatically created every 5 seconds
          </p>
        </div>
      </div>
    </>
  );
}
