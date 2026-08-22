import React from 'react';
import { History, GitCommit, ArrowRight, ShieldCheck, X, FileText, Calendar, Building2, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const VersionDiffModal = ({ isOpen, onClose, record }) => {
  const { t } = useTranslation();

  if (!isOpen || !record) return null;

  const versionHistory = record.versionHistory || [];
  const latestVersion = record.version || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-3xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-800 rounded-lg">
              <History className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                Immutable Medical Record Version History
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                Record ID: {record.recordId} • Current Version: v{latestVersion}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              <strong>Immutability Guarantee:</strong> Original clinical entries are permanently preserved. Amendments are cryptographically versioned with full clinician audit reason.
            </span>
          </div>

          {/* Timeline of Revisions */}
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {versionHistory.map((rev, idx) => (
              <div key={idx} className="relative group">
                {/* Timeline node */}
                <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 bg-white flex items-center justify-center ${
                  rev.version === latestVersion ? 'border-teal-600 ring-4 ring-teal-50' : 'border-slate-400'
                }`}>
                  <GitCommit className={`w-3 h-3 ${rev.version === latestVersion ? 'text-teal-600' : 'text-slate-400'}`} />
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-800 text-white rounded text-xs font-bold font-mono">
                        v{rev.version}.0
                      </span>
                      {rev.version === latestVersion && (
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          Active Version
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(rev.updatedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>Hospital: <strong>{rev.hospital || record.hospitalName}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-700">
                      <User className="w-4 h-4 text-slate-400" />
                      <span>Clinician: <strong>{rev.changedBy}</strong></span>
                    </div>
                  </div>

                  {/* Amendment Reason */}
                  <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-900">
                    <span className="font-semibold block text-[11px] uppercase tracking-wider text-amber-800">
                      Reason for Revision / Entry:
                    </span>
                    <p className="mt-0.5 italic">{rev.reason}</p>
                  </div>

                  {/* Snapshot Data */}
                  {rev.snapshot && (
                    <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1.5 font-sans">
                      <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider">
                        Clinical Snapshot Content:
                      </span>
                      <p className="text-slate-800 font-medium">{rev.snapshot.title}</p>
                      {rev.snapshot.description && (
                        <p className="text-slate-600 text-xs">{rev.snapshot.description}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold"
          >
            Close Version Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
