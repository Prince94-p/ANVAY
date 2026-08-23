import React, { useState } from 'react';
import { ShieldAlert, AlertOctagon, HeartPulse, AlertTriangle, Pill, X, CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export const EmergencyBreakGlassModal = ({ isOpen, onClose, initialAnvayId = '' }) => {
  const { t } = useTranslation();
  const { token, user } = useAuth();

  const [anvayId, setAnvayId] = useState(initialAnvayId || 'ANVAY-2026-8F29K4');
  const [emergencyReason, setEmergencyReason] = useState('Unconscious patient admitted in emergency resuscitation room; rapid allergy and medication screening required.');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [emergencyPayload, setEmergencyPayload] = useState(null);

  if (!isOpen) return null;

  const handleBreakGlass = async (e) => {
    e.preventDefault();
    if (!emergencyReason || emergencyReason.trim().length < 8) {
      setError('Please provide an explicit clinical justification (at least 8 characters).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const qPatient = query(collection(db, 'users'), where('anvayId', '==', anvayId.trim().toUpperCase()));
      const snap = await getDocs(qPatient);
      if (snap.empty) {
        setError('Patient record not found for this ANVAY ID.');
        return;
      }
      const pData = snap.docs[0].data();

      // Log into immutable auditLogs collection
      await addDoc(collection(db, 'auditLogs'), {
        action: 'EMERGENCY_BREAK_GLASS',
        actorId: user?.uid || 'anonymous',
        actorName: user?.name || 'Emergency Attending Physician',
        actorRole: user?.role || 'Doctor',
        patientAnvayId: anvayId.trim().toUpperCase(),
        hospitalId: user?.hospitalId || '',
        hospitalName: user?.hospitalName || 'Emergency Center',
        severity: 'HIGH_ALERT',
        details: `Emergency Break-Glass access triggered: "${emergencyReason.trim()}"`,
        timestamp: new Date().toISOString()
      });

      setEmergencyPayload({
        anvayId: pData.anvayId,
        fullName: pData.fullName || pData.name,
        gender: pData.gender || 'Unknown',
        age: pData.age || pData.dateOfBirth || 'N/A',
        bloodGroup: pData.bloodGroup || 'O+',
        criticalAllergies: pData.allergies || [],
        activeMedications: pData.activeMedicines || pData.medications || [],
        attendingPhysician: user?.name || 'Emergency Attending Physician'
      });
    } catch (err) {
      console.error('Error during break glass access:', err);
      setError('Network or permission error during break-glass authorization.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmergencyPayload(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-2xl border-2 border-rose-500 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="bg-rose-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-700/80 rounded-lg">
              <AlertOctagon className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight">
                {t('emergency.breakGlassTitle')}
              </h3>
              <p className="text-xs text-rose-100 font-medium">
                Mandatory Clinical Justification • Tamper-Evident High Severity Audit
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="text-rose-200 hover:text-white p-1 rounded-lg hover:bg-rose-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {!emergencyPayload ? (
            <form onSubmit={handleBreakGlass} className="space-y-4">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {t('emergency.warning')}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-100 border border-red-300 text-red-700 text-xs rounded-lg font-medium">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Patient ANVAY Health ID / Verified Reference
                </label>
                <input
                  type="text"
                  required
                  value={anvayId}
                  onChange={(e) => setAnvayId(e.target.value)}
                  placeholder="e.g. ANVAY-2026-8F29K4"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  {t('emergency.reasonLabel')} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={emergencyReason}
                  onChange={(e) => setEmergencyReason(e.target.value)}
                  placeholder={t('emergency.reasonPlaceholder')}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-lg transition flex items-center gap-2"
                >
                  {loading ? 'Authorizing Protocol...' : t('emergency.submit')}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Patient Core Emergency Info */}
              <div className="bg-slate-900 text-white rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] font-mono text-teal-400 font-bold uppercase tracking-wider">
                    BREAK-GLASS AUTHORIZED FOR:
                  </span>
                  <h4 className="text-lg font-bold">
                    {emergencyPayload.fullName} ({emergencyPayload.gender}, {emergencyPayload.age} yrs)
                  </h4>
                  <p className="text-xs text-slate-300 font-mono">
                    {emergencyPayload.anvayId}
                  </p>
                </div>

                <div className="text-center bg-rose-950 border border-rose-700 px-4 py-2 rounded-lg">
                  <span className="text-[10px] text-rose-300 font-bold uppercase block">
                    {t('emergency.bloodGroup')}
                  </span>
                  <span className="text-2xl font-black text-rose-400">
                    {emergencyPayload.bloodGroup || 'UNKNOWN'}
                  </span>
                </div>
              </div>

              {/* Critical Allergies */}
              <div className="border border-rose-200 bg-rose-50/50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase tracking-wider mb-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <span>{t('emergency.criticalAllergies')}</span>
                </div>
                {emergencyPayload.criticalAllergies?.length > 0 ? (
                  <div className="space-y-1.5">
                    {emergencyPayload.criticalAllergies.map((alg, i) => (
                      <div key={i} className="bg-white border border-rose-300 rounded-lg p-2 text-xs flex justify-between items-center">
                        <span className="font-bold text-rose-950">{alg.substance}</span>
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                          {alg.severity} Severity • {alg.reaction}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 italic">No critical high-risk allergies diagnosed in connected record.</p>
                )}
              </div>

              {/* Active Medications */}
              <div className="border border-teal-200 bg-teal-50/40 rounded-xl p-4">
                <div className="flex items-center gap-2 text-teal-900 font-bold text-xs uppercase tracking-wider mb-2">
                  <Pill className="w-4 h-4 text-teal-700" />
                  <span>{t('emergency.activeMeds')}</span>
                </div>
                {emergencyPayload.activeMedications?.length > 0 ? (
                  <div className="space-y-1.5">
                    {emergencyPayload.activeMedications.map((med, i) => (
                      <div key={i} className="bg-white border border-teal-200 rounded-lg p-2 text-xs flex justify-between items-center">
                        <span className="font-semibold text-slate-800">{med.medicineName}</span>
                        <span className="text-[11px] text-teal-800">{med.dosage}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-600 italic">No active maintenance medications on record.</p>
                )}
              </div>

              {/* Audit Stamp */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 flex items-center justify-between">
                <span>Access logged to Super Admin audit trail. Attending: <strong>{emergencyPayload.attendingPhysician}</strong></span>
                <button
                  onClick={handleReset}
                  className="px-3 py-1 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-900"
                >
                  Close Snapshot
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
