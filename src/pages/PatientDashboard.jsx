import React, { useState, useEffect } from 'react';
import {
  User,
  HeartPulse,
  AlertOctagon,
  Pill,
  Calendar,
  Download,
  Building2,
  Paperclip,
  ShieldCheck,
  Activity,
  FileText,
  Clock,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { CompletenessScoreGauge } from '../components/CompletenessScoreGauge';
import { VerifiedHospitalBadge } from '../components/VerifiedHospitalBadge';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { exportPatientMedicalSummary } from '../utils/pdfExport';

export const PatientDashboard = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const anvayId = user?.anvayId || 'ANVAY-2026-8F29K4';

  const [snapshot, setSnapshot] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'timeline' | 'documents'

  useEffect(() => {
    const fetchPatientData = async () => {
      setLoading(true);
      try {
        const snapRes = await fetch(`/api/patients/${anvayId}/snapshot`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const snapData = await snapRes.json();
        if (snapData.success) {
          setSnapshot(snapData.snapshot);
        }

        const recRes = await fetch(`/api/records/patient/${anvayId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const recData = await recRes.json();
        if (recData.success) {
          setRecords(recData.records);
        }
      } catch (err) {
        console.error('Error loading patient data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [anvayId, token]);

  if (loading) {
    return <div className="p-12 text-center text-xs text-[#667085]">Loading your ANVAY health profile...</div>;
  }

  const patient = snapshot?.patient;

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#101828]">
      {/* Patient Welcome Header */}
      <div className="bg-white rounded-[22px] border border-[#e7edf4] p-6 sm:p-7 shadow-anvay-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-black text-[#101828]">
              Welcome, {patient?.fullName || user?.name}
            </h1>
            <span className="font-mono text-xs font-bold text-[#0f6d8e] bg-[#e7f7fc] px-2.5 py-1 rounded-[6px]">
              {anvayId}
            </span>
            <span className="text-[10px] font-bold text-[#067647] bg-[#ecfdf3] px-2 py-0.5 rounded-[20px]">
              ✓ Verified Health Identity
            </span>
          </div>
          <p className="text-xs text-[#667085]">
            {patient?.gender}, {patient?.age} yrs • Blood Group: <strong className="text-[#d92d20]">{patient?.bloodGroup || 'O+'}</strong> • Ref: {patient?.govtIdRef || 'ABHA'}
          </p>
        </div>

        <button
          onClick={() => exportPatientMedicalSummary(patient, records)}
          className="px-4 py-2.5 bg-[#0f6d8e] hover:bg-[#0b5874] text-white rounded-[9px] text-xs font-bold shadow-xs transition flex items-center gap-1.5"
        >
          <Download className="w-4 h-4" />
          <span>Download Medical Summary (PDF)</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#e7edf4] gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 transition ${
            activeTab === 'overview'
              ? 'text-[#0f6d8e] border-b-2 border-[#0f6d8e]'
              : 'text-[#667085] hover:text-[#0f6d8e]'
          }`}
        >
          Health Profile & Vitals
        </button>
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 transition ${
            activeTab === 'timeline'
              ? 'text-[#0f6d8e] border-b-2 border-[#0f6d8e]'
              : 'text-[#667085] hover:text-[#0f6d8e]'
          }`}
        >
          Multi-Hospital History ({records.length} Records)
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 transition ${
            activeTab === 'documents'
              ? 'text-[#0f6d8e] border-b-2 border-[#0f6d8e]'
              : 'text-[#667085] hover:text-[#0f6d8e]'
          }`}
        >
          Medical Documents & Prescriptions
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Emergency Summary Card */}
          <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 shadow-anvay-soft space-y-4">
            <div className="flex justify-between items-center border-b border-[#eef2f6] pb-3">
              <h3 className="text-xs font-extrabold text-[#0f6d8e] uppercase tracking-wider flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-[#0f6d8e]" />
                <span>Emergency Health Card</span>
              </h3>
              <span className="text-[10px] text-[#067647] font-bold bg-[#ecfdf3] px-2 py-0.5 rounded-[20px]">
                Accessible During Emergencies
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div className="p-3.5 bg-[#f8fbff] rounded-[12px] border border-[#e7edf4]">
                <span className="text-[#667085] text-[10px] uppercase font-bold block">Blood Group</span>
                <strong className="text-xl font-black text-[#d92d20]">{patient?.bloodGroup}</strong>
              </div>

              <div className="p-3.5 bg-[#f8fbff] rounded-[12px] border border-[#e7edf4]">
                <span className="text-[#667085] text-[10px] uppercase font-bold block">Severe Allergies</span>
                <strong className="text-xs font-bold text-[#101828]">
                  {patient?.allergies?.[0]?.substance || 'None Recorded'}
                </strong>
              </div>

              <div className="p-3.5 bg-[#f8fbff] rounded-[12px] border border-[#e7edf4]">
                <span className="text-[#667085] text-[10px] uppercase font-bold block">Chronic Conditions</span>
                <strong className="text-xs font-bold text-[#101828]">
                  {patient?.chronicConditions?.[0]?.condition || 'None Recorded'}
                </strong>
              </div>

              <div className="p-3.5 bg-[#f8fbff] rounded-[12px] border border-[#e7edf4]">
                <span className="text-[#667085] text-[10px] uppercase font-bold block">Emergency Contact</span>
                <strong className="text-xs font-bold text-[#067647]">
                  {patient?.emergencyContactPhone || patient?.contactPhone}
                </strong>
              </div>
            </div>
          </div>

          {/* Completeness Gauge */}
          {patient?.completeness && (
            <CompletenessScoreGauge completeness={patient.completeness} />
          )}

          {/* Clinical Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Allergies */}
            <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 shadow-anvay-soft space-y-3">
              <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wider flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-[#d92d20]" />
                <span>Allergies & Sensitivities</span>
              </h3>
              {patient?.allergies?.map((alg, i) => (
                <div key={i} className="p-3 bg-[#f8fbff] rounded-[10px] border border-[#e7edf4] text-xs space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>{alg.substance}</span>
                    <span className="text-[10px] text-[#d92d20] bg-rose-50 px-2 py-0.5 rounded">{alg.severity}</span>
                  </div>
                  <p className="text-[11px] text-[#667085]">Reaction: {alg.reaction}</p>
                  <p className="text-[10px] text-[#98a2b3]">Diagnosed by {alg.diagnosedBy} ({alg.hospital})</p>
                </div>
              ))}
            </div>

            {/* Active Medications */}
            <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 shadow-anvay-soft space-y-3">
              <h3 className="text-xs font-extrabold text-[#101828] uppercase tracking-wider flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#0f6d8e]" />
                <span>Active Prescribed Medications</span>
              </h3>
              {patient?.activeMedicines?.map((med, i) => (
                <div key={i} className="p-3 bg-[#f8fbff] rounded-[10px] border border-[#e7edf4] text-xs space-y-0.5">
                  <div className="flex justify-between font-bold">
                    <span>{med.medicineName}</span>
                    <span className="text-[10px] text-[#0f6d8e] bg-[#e7f7fc] px-2 py-0.5 rounded">Active</span>
                  </div>
                  <p className="text-[11px] text-[#667085]">Dosage: {med.dosage}</p>
                  <p className="text-[10px] text-[#98a2b3]">Prescribed by {med.prescribedBy} ({med.hospital})</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Multi-Hospital Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="p-4 bg-[#101828] text-white rounded-[18px] text-xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#20a7ce] shrink-0" />
            <p className="text-white/90">
              Your longitudinal medical record is updated automatically by connected accredited hospitals. Every record permanently shows the source hospital and doctor.
            </p>
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e7edf4]">
            {records.map((rec) => (
              <div key={rec.recordId} className="relative">
                <div className="absolute -left-6 top-3 w-5 h-5 rounded-full bg-[#0f6d8e] text-white flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>

                <div className="bg-white rounded-[18px] border border-[#e7edf4] p-5 shadow-anvay-soft space-y-2">
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#eef2f6] pb-2 text-xs">
                    <div>
                      <h4 className="font-bold text-sm text-[#101828]">{rec.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#667085] mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-[#0f6d8e]" />
                        <span className="font-semibold text-[#101828]">{rec.hospitalName}</span>
                        <span>• Dr. {rec.doctorName}</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#98a2b3]">{new Date(rec.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-xs text-[#344054] leading-relaxed bg-[#f8fbff] p-3 rounded-[9px] border border-[#e7edf4]">
                    {rec.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Documents */}
      {activeTab === 'documents' && (
        <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 shadow-anvay-soft space-y-4">
          <h3 className="text-xs font-extrabold text-[#0f6d8e] uppercase tracking-wider">
            Diagnostic Reports & Laboratory Records
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {records.flatMap(r => r.documents || []).map((doc, i) => (
              <button
                key={i}
                onClick={() => setSelectedDoc(doc)}
                className="p-4 rounded-[14px] bg-[#f8fbff] hover:bg-[#e7f7fc] border border-[#e7edf4] text-left transition flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Paperclip className="w-4 h-4 text-[#0f6d8e]" />
                  <div>
                    <strong className="text-xs font-bold text-[#101828] block">{doc.fileName}</strong>
                    <span className="text-[10px] text-[#667085]">{doc.fileType} • {doc.fileSize}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#0f6d8e]">View →</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <DocumentViewerModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
      />
    </div>
  );
};
