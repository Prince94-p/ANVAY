import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Activity,
  Building2,
  Calendar,
  AlertOctagon,
  Pill,
  HeartPulse,
  Syringe,
  FileText,
  FilePlus,
  Download,
  AlertTriangle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { CompletenessScoreGauge } from '../components/CompletenessScoreGauge';
import { VerifiedDoctorBadge } from '../components/VerifiedDoctorBadge';
import { exportPatientMedicalSummary } from '../utils/pdfExport';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const ClinicalSnapshotPage = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();
  const anvayId = searchParams.get('anvayId') || 'ANVAY-2026-8F29K4';

  const [snapshotData, setSnapshotData] = useState(null);
  const [patientRecords, setPatientRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSnapshot = async () => {
      setLoading(true);
      setError(null);
      try {
        const idUpper = anvayId.trim().toUpperCase();
        const qPatient = query(collection(db, 'users'), where('anvayId', '==', idUpper));
        const pSnap = await getDocs(qPatient);

        if (!pSnap.empty) {
          const pData = pSnap.docs[0].data();
          const qRecs = query(collection(db, 'records'), where('patientId', '==', idUpper));
          const recSnap = await getDocs(qRecs);
          const recs = recSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setPatientRecords(recs);
          setSnapshotData({
            patient: pData,
            lastVisit: recs.length > 0 ? recs[0] : null
          });
        } else {
          setError('Patient snapshot unavailable for ANVAY ID: ' + anvayId);
        }
      } catch (err) {
        console.error('Error fetching snapshot:', err);
        setError('Network error fetching snapshot.');
      } finally {
        setLoading(false);
      }
    };

    fetchSnapshot();
  }, [anvayId]);

  if (loading) {
    return <div className="p-12 text-center text-[#667085] text-xs">Loading patient clinical snapshot...</div>;
  }

  if (error || !snapshotData) {
    return (
      <div className="bg-white rounded-[20px] border border-rose-200 p-8 text-center max-w-lg mx-auto space-y-3 shadow-anvay-soft">
        <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-bold text-[#101828]">Unable to load snapshot</h3>
        <p className="text-xs text-[#667085]">{error}</p>
        <Link to="/patient-search" className="inline-block px-4 py-2 bg-[#0f6d8e] text-white text-xs font-bold rounded-[9px]">
          Back to Patient Search
        </Link>
      </div>
    );
  }

  const { patient, lastVisit } = snapshotData;

  const handleExportPDF = () => {
    exportPatientMedicalSummary(patient, patientRecords);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#101828]">
      {/* Patient Header Banner */}
      <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 shadow-anvay-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#101828]">{patient.fullName}</h1>
            <span className="font-mono text-xs font-bold text-[#0f6d8e] bg-[#e7f7fc] px-2.5 py-1 rounded-[6px]">
              {patient.anvayId}
            </span>
            <span className="text-xs font-medium text-[#667085] bg-[#f8fbff] border border-[#e7edf4] px-2 py-0.5 rounded">
              Ref: {patient.govtIdRef}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#667085] pt-1">
            <span>{patient.gender}, {patient.age} years (DOB: {patient.dateOfBirth})</span>
            <span>Originating: <strong className="text-[#101828]">{patient.registeredByHospitalName}</strong></span>
            <span>Emergency Phone: <strong>{patient.emergencyContactPhone || 'N/A'}</strong></span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3.5 py-2 bg-[#f8fbff] hover:bg-[#e7f7fc] text-[#0f6d8e] rounded-[9px] text-xs font-bold transition flex items-center gap-1.5 border border-[#d0d5dd] shadow-xs"
            title="Download Standardized PDF Summary"
          >
            <Download className="w-4 h-4 text-[#0f6d8e]" />
            <span>Export PDF Summary</span>
          </button>

          <Link
            to={`/add-record?anvayId=${patient.anvayId}`}
            className="px-3.5 py-2 bg-[#0f6d8e] hover:bg-[#0b5874] text-white rounded-[9px] text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <FilePlus className="w-4 h-4" />
            <span>Add Record</span>
          </Link>

          <Link
            to={`/medical-history?anvayId=${patient.anvayId}`}
            className="px-3.5 py-2 bg-[#101828] hover:bg-[#1d2939] text-white rounded-[9px] text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <FileText className="w-4 h-4" />
            <span>Full History</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Grid: Last Visit & Blood Group */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Blood Group Badge */}
        <div className="bg-white p-5 rounded-[18px] border border-[#e7edf4] shadow-anvay-soft flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider block">
              Blood Group
            </span>
            <span className="text-2xl font-black text-[#d92d20]">
              {patient.bloodGroup || 'UNKNOWN'}
            </span>
          </div>
          <div className="w-10 h-10 rounded-[12px] bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            🩸
          </div>
        </div>

        {/* Last Hospital Visit */}
        <div className="md:col-span-2 bg-white p-5 rounded-[18px] border border-[#e7edf4] shadow-anvay-soft space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-[#0f6d8e] uppercase tracking-wider">
              Last Treated At (Multi-Hospital Record)
            </span>
            {lastVisit && (
              <span className="text-[11px] text-[#667085] font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(lastVisit.date).toLocaleDateString()}
              </span>
            )}
          </div>

          {lastVisit ? (
            <div>
              <h4 className="text-sm font-bold text-[#101828]">{lastVisit.hospitalName}</h4>
              <p className="text-xs text-[#667085]">
                Attending: <strong>{lastVisit.doctorName}</strong> ({lastVisit.department || 'General Medicine'}) • Reason: <span className="italic">{lastVisit.diagnosisOrReason}</span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-[#667085] italic">No previous encounters on record.</p>
          )}
        </div>
      </div>

      {/* Completeness Score Gauge */}
      <CompletenessScoreGauge completeness={patient.completeness} />

      {/* Clinical Details Split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Allergies Card */}
        <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 shadow-anvay-soft space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#eef2f6] pb-2.5">
            <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wider flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-[#d92d20]" />
              <span>Allergies & Sensitivities</span>
            </h3>
            <span className="text-[10px] text-[#98a2b3]">Provenance Sealed</span>
          </div>

          {patient.allergies?.length > 0 ? (
            <div className="space-y-2">
              {patient.allergies.map((alg, i) => (
                <div key={i} className="p-3 bg-[#f8fbff] border border-[#e7edf4] rounded-[12px] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#101828]">{alg.substance}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[20px] ${
                      alg.status === 'Confirmed None'
                        ? 'bg-[#ecfdf3] text-[#067647]'
                        : 'bg-[#fef3f2] text-[#d92d20]'
                    }`}>
                      {alg.status || 'Confirmed Positive'}
                    </span>
                  </div>
                  <p className="text-[#667085] text-[11px]">
                    Reaction: {alg.reaction || 'None'} • Severity: {alg.severity}
                  </p>
                  <p className="text-[10px] text-[#98a2b3] pt-1 border-t border-[#eef2f6]">
                    Diagnosed by {alg.diagnosedBy} ({alg.hospital}, {alg.date})
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-[#fff7ed] border-l-4 border-[#f79009] rounded-r-[8px] text-xs text-[#7a2e0e]">
              No Known Record for allergies. Explicit clinical verification required.
            </div>
          )}
        </div>

        {/* Chronic Conditions Card */}
        <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 shadow-anvay-soft space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#eef2f6] pb-2.5">
            <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wider flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-[#0f6d8e]" />
              <span>Chronic Medical Conditions</span>
            </h3>
            <span className="text-[10px] text-[#98a2b3]">Multi-Hospital Sync</span>
          </div>

          {patient.chronicConditions?.length > 0 ? (
            <div className="space-y-2">
              {patient.chronicConditions.map((cond, i) => (
                <div key={i} className="p-3 bg-[#f8fbff] border border-[#e7edf4] rounded-[12px] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#101828]">{cond.condition}</span>
                    <span className="text-[10px] font-bold bg-[#e7f7fc] text-[#0f6d8e] px-2 py-0.5 rounded-[20px]">
                      {cond.status}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#98a2b3] pt-1">
                    First recorded by {cond.doctor} ({cond.hospital}, {cond.diagnosedDate})
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#667085] italic p-3">No chronic conditions diagnosed.</p>
          )}
        </div>

        {/* Active Medications */}
        <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 shadow-anvay-soft space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#eef2f6] pb-2.5">
            <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wider flex items-center gap-2">
              <Pill className="w-4 h-4 text-[#0f6d8e]" />
              <span>Current Active Medications</span>
            </h3>
            <span className="text-[10px] text-[#98a2b3]">Active Regimen</span>
          </div>

          {patient.activeMedicines?.length > 0 ? (
            <div className="space-y-2">
              {patient.activeMedicines.map((med, i) => (
                <div key={i} className="p-3 bg-[#f8fbff] border border-[#e7edf4] rounded-[12px] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#101828]">{med.medicineName}</span>
                    <span className="text-[10px] font-bold text-[#0f6d8e] bg-[#e7f7fc] px-2 py-0.5 rounded-[20px]">
                      {med.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-[#667085] text-[11px]">Dosage: {med.dosage}</p>
                  <p className="text-[10px] text-[#98a2b3] pt-1">
                    Prescribed by {med.prescribedBy} ({med.hospital})
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#667085] italic p-3">No active maintenance medications on record.</p>
          )}
        </div>

        {/* Vaccination Status */}
        <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 shadow-anvay-soft space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#eef2f6] pb-2.5">
            <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wider flex items-center gap-2">
              <Syringe className="w-4 h-4 text-[#20a7ce]" />
              <span>Vaccination History</span>
            </h3>
            <span className="text-[10px] text-[#98a2b3]">Immunization Registry</span>
          </div>

          {patient.vaccinations?.length > 0 ? (
            <div className="space-y-2">
              {patient.vaccinations.map((vac, i) => (
                <div key={i} className="p-3 bg-[#f8fbff] border border-[#e7edf4] rounded-[12px] text-xs flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#101828] block">{vac.vaccineName}</span>
                    <span className="text-[11px] text-[#667085]">{vac.dose}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-[20px] ${
                    vac.status === 'Confirmed'
                      ? 'bg-[#ecfdf3] text-[#067647]'
                      : 'bg-[#fff7ed] text-[#7a2e0e]'
                  }`}>
                    {vac.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#667085] italic p-3">No vaccination records submitted.</p>
          )}
        </div>
      </div>
    </div>
  );
};
