import React from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const VerifiedDoctorBadge = ({ regNumber, isVerified = true }) => {
  const { t } = useTranslation();

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200 text-xs font-medium">
      <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
      <span>{t('status.verified')} MD</span>
      {regNumber && <span className="font-mono text-[11px] text-teal-900 border-l border-teal-300 pl-1.5 ml-0.5">{regNumber}</span>}
    </span>
  );
};
