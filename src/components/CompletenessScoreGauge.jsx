import React from 'react';
import { AlertCircle, CheckCircle2, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const CompletenessScoreGauge = ({ completeness, showDetails = true }) => {
  const { t } = useTranslation();
  const score = completeness?.score || 80;
  const missingFields = completeness?.missingFields || [];

  // Color mapping based on score
  let strokeColor = '#0d9488'; // teal-600
  let textColor = 'text-teal-700';
  let badgeBg = 'bg-teal-50 border-teal-200';

  if (score < 60) {
    strokeColor = '#e11d48'; // rose-600
    textColor = 'text-rose-700';
    badgeBg = 'bg-rose-50 border-rose-200';
  } else if (score < 80) {
    strokeColor = '#d97706'; // amber-600
    textColor = 'text-amber-700';
    badgeBg = 'bg-amber-50 border-amber-200';
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wide">
            {t('completeness.scoreLabel')}
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Automated multi-hospital longitudinal clinical gap analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg className="w-14 h-14 transform -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke="#e2e8f0"
                strokeWidth="4.5"
                fill="transparent"
              />
              <circle
                cx="28"
                cy="28"
                r="22"
                stroke={strokeColor}
                strokeWidth="4.5"
                strokeDasharray={138.2}
                strokeDashoffset={138.2 - (138.2 * score) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <span className={`absolute text-sm font-bold ${textColor}`}>
              {score}%
            </span>
          </div>
        </div>
      </div>

      {showDetails && missingFields.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-700">
              {t('completeness.missingItems')} ({missingFields.length})
            </span>
            <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Actionable Gaps
            </span>
          </div>

          <div className="space-y-2">
            {missingFields.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{item.field}</span>
                    <span className="text-[10px] font-medium bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                      {item.status || 'No Known Record'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">{item.message}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded text-[11px] text-blue-800 flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>{t('completeness.distinctionNote')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
