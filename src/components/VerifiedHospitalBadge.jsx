import React from 'react';
import { ShieldCheck, Clock, AlertTriangle, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const VerifiedHospitalBadge = ({ status = 'Approved', size = 'sm' }) => {
  const { t } = useTranslation();

  const isSmall = size === 'sm';

  if (status === 'Approved') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
        <ShieldCheck className={isSmall ? 'w-3.5 h-3.5 text-emerald-600' : 'w-4 h-4 text-emerald-600'} />
        <span>{t('provenance.verifiedHospital')}</span>
      </span>
    );
  }

  if (status === 'Pending Verification') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200 ${isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
        <Clock className={isSmall ? 'w-3.5 h-3.5 text-amber-600' : 'w-4 h-4 text-amber-600'} />
        <span>{t('status.pending')}</span>
      </span>
    );
  }

  if (status === 'Suspended') {
    return (
      <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
        <AlertTriangle className={isSmall ? 'w-3.5 h-3.5 text-rose-600' : 'w-4 h-4 text-rose-600'} />
        <span>{t('status.suspended')}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${isSmall ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'}`}>
      <XCircle className={isSmall ? 'w-3.5 h-3.5 text-slate-500' : 'w-4 h-4 text-slate-500'} />
      <span>{status}</span>
    </span>
  );
};
