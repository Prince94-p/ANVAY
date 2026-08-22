import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  History,
  Building2,
  Calendar,
  User,
  ShieldCheck,
  FileText,
  Filter,
  Download,
  FilePlus,
  Upload,
  AlertCircle,
  GitCommit,
  Edit3,
  Lock,
  Paperclip
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VerifiedHospitalBadge } from '../components/VerifiedHospitalBadge';
import { VersionDiffModal } from '../components/VersionDiffModal';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { exportPatientMedicalSummary } from '../utils/pdfExport';

export const CompleteMedicalHistoryPage = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();
  const anvayId = searchParams.get('anvayId') || 'ANVAY-2026-8F29K4';

  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [contributingHospitals, setContributingHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedHospital, setSelectedHospital] = useState('All');

  const [selectedRecordForVersion, setSelectedRecordForVersion] = useState(null);
  const [selectedDocForViewer, setSelectedDocForViewer] = useState(null);
  const [amendModalRecord, setAmendModalRecord] = useState(null);
  const [amendReason, setAmendReason] = useState('');
  const [amendDescription, setAmendDescription] = useState('');
  const [amendLoading, setAmendLoading] = useState(false);
  const [amendError, setAmendError] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `/api/records/patient/${anvayId}?`;
      if (selectedCategory !== 'All') url += `category=${encodeURIComponent(selectedCategory)}&`;
      if (selectedHospital !== 'All') url += `hospitalId=${encodeURIComponent(selectedHospital)}&`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPatient(data.patient);
        setRecords(data.records);
        setContributingHospitals(data.contributingHospitals || []);
      } else {
        setError(data.message || 'Medical history not found');
      }
    } catch (e) {
      setError('Network error loading longitudinal history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [anvayId, selectedCategory, selectedHospital, token]);

  const handleAmendSubmit = async (e) => {
    e.preventDefault();
    if (!amendReason || amendReason.trim().length < 5) {
      setAmendError('A valid clinical reason for correction is required.');
      return;
    }

    setAmendLoading(true);
    setAmendError(null);

    try {
      const res = await fetch(`/api/records/${amendModalRecord.recordId}/amend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reasonForChange: amendReason,
          description: amendDescription || amendModalRecord.description
        })
      });

      const data = await res.json();
      if (data.success) {
        setAmendModalRecord(null);
        setAmendReason('');
        setAmendDescription('');
        fetchHistory();
      } else {
        setAmendError(data.message || 'Failed to amend record');
      }
    } catch (err) {
      setAmendError('Network error submitting amendment.');
    } finally {
      setAmendLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#101828]">
      {/* Patient Header Card */}
      {patient && (
        <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 shadow-anvay-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-[#101828]">{patient.fullName}</h1>
              <span className="font-mono text-xs font-bold text-[#0f6d8e] bg-[#e7f7fc] px-2.5 py-1 rounded-[6px]">
                {patient.anvayId}
              </span>
            </div>
            <p className="text-xs text-[#667085]">
              {patient.gender}, {patient.age} yrs • Blood Group: <strong className="text-[#101828]">{patient.bloodGroup}</strong> • Registered by: {patient.registeredByHospitalName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportPatientMedicalSummary(patient, records)}
              className="px-3.5 py-2 bg-[#f8fbff] hover:bg-[#e7f7fc] text-[#0f6d8e] rounded-[9px] text-xs font-bold transition flex items-center gap-1.5 border border-[#d0d5dd] shadow-xs"
            >
              <Download className="w-4 h-4 text-[#0f6d8e]" />
              <span>Export PDF Summary</span>
            </button>

            <Link
              to={`/add-record?anvayId=${patient.anvayId}`}
              className="px-3.5 py-2 bg-[#0f6d8e] hover:bg-[#0b5874] text-white rounded-[9px] text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <FilePlus className="w-4 h-4" />
              <span>Add Encounter</span>
            </Link>

            <Link
              to={`/upload-document?anvayId=${patient.anvayId}`}
              className="px-3.5 py-2 bg-[#101828] hover:bg-[#1d2939] text-white rounded-[9px] text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </Link>
          </div>
        </div>
      )}

      {/* Network Provenance Architecture Notice */}
      <div className="p-4 bg-[#101828] text-white rounded-[20px] shadow-anvay-soft text-xs flex items-start gap-3.5">
        <Lock className="w-5 h-5 text-[#20a7ce] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold text-[#7dd3ed]">
            Immutable Multi-Hospital Record Interoperability Layer
          </p>
          <p className="text-white/80 leading-relaxed">
            Entries originate from multiple accredited hospitals. Only the authoring hospital may submit a cryptographic amendment (which preserves the original version). Other connected hospitals have authorized read access.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-[18px] border border-[#e7edf4] shadow-anvay-soft flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-[#0f6d8e]">
            <Filter className="w-4 h-4 text-[#0f6d8e]" />
            <span>Filter Records:</span>
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1.5 bg-[#f8fbff] border border-[#d0d5dd] rounded-[9px] text-xs font-semibold focus:border-[#20a7ce] outline-none"
          >
            <option value="All">{t('categories.all')}</option>
            <option value="Diagnosis">{t('categories.diagnosis')}</option>
            <option value="Prescription">{t('categories.prescription')}</option>
            <option value="Lab Report">{t('categories.labReport')}</option>
            <option value="Imaging Report">{t('categories.imagingReport')}</option>
            <option value="General Check-up">{t('categories.generalCheckup')}</option>
            <option value="Discharge Summary">{t('categories.dischargeSummary')}</option>
            <option value="Doctor Notes">{t('categories.doctorNotes')}</option>
            <option value="Allergy">{t('categories.allergy')}</option>
          </select>

          <select
            value={selectedHospital}
            onChange={(e) => setSelectedHospital(e.target.value)}
            className="px-3 py-1.5 bg-[#f8fbff] border border-[#d0d5dd] rounded-[9px] text-xs font-semibold focus:border-[#20a7ce] outline-none"
          >
            <option value="All">All Contributing Hospitals</option>
            {contributingHospitals.map(h => (
              <option key={h.id} value={h.id}>{h.name}</option>
            ))}
          </select>
        </div>

        <span className="text-[#667085] font-medium">
          Showing <strong>{records.length}</strong> Chronological Encounters
        </span>
      </div>

      {/* Longitudinal Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#e7edf4]">
        {records.length === 0 ? (
          <div className="bg-white p-8 rounded-[20px] border border-[#e7edf4] text-center text-xs text-[#667085]">
            No clinical entries match the selected filters.
          </div>
        ) : (
          records.map((rec) => {
            const isAuthorHospital = user?.hospitalId === rec.hospitalId || user?.role === 'Super Admin';

            return (
              <div key={rec.recordId} className="relative group">
                <div className="absolute -left-6 sm:-left-8 top-4 w-6 h-6 rounded-full bg-[#0f6d8e] text-white border-2 border-white shadow-xs flex items-center justify-center text-[10px] font-bold">
                  ✓
                </div>

                <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 shadow-anvay-soft space-y-3.5 hover:border-[#0f6d8e]/40 transition">
                  {/* Provenance Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eef2f6] pb-3">
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[#101828] text-base">{rec.title}</span>
                        <span className="text-[10px] font-bold text-[#0f6d8e] bg-[#e7f7fc] px-2 py-0.5 rounded-[20px]">
                          {rec.recordType}
                        </span>
                        <span className="text-[10px] font-mono text-[#667085] bg-[#f8fbff] px-2 py-0.5 rounded">
                          {rec.recordId}
                        </span>
                        {rec.version > 1 && (
                          <span className="text-[10px] font-bold text-[#6941c6] bg-[#f9f5ff] px-2 py-0.5 rounded-[20px] border border-[#d6bbfb]">
                            v{rec.version}.0 (Amended)
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#667085]">
                        <span className="flex items-center gap-1 font-semibold text-[#344054]">
                          <Building2 className="w-3.5 h-3.5 text-[#0f6d8e]" />
                          {rec.hospitalName}
                        </span>
                        <VerifiedHospitalBadge status="Approved" size="sm" />
                      </div>
                    </div>

                    <div className="text-right text-xs text-[#667085] space-y-0.5">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Calendar className="w-3.5 h-3.5 text-[#98a2b3]" />
                        <span>{new Date(rec.createdAt).toLocaleString()}</span>
                      </div>
                      <p className="text-[11px]">
                        Added by: <strong className="text-[#101828]">{rec.doctorName}</strong> ({rec.department || 'Clinical Staff'})
                      </p>
                    </div>
                  </div>

                  {/* Clinical Description */}
                  <p className="text-xs text-[#344054] leading-relaxed bg-[#f8fbff] p-3.5 rounded-[12px] border border-[#e7edf4]">
                    {rec.description}
                  </p>

                  {/* Attached Diagnostic Documents */}
                  {rec.documents && rec.documents.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-extrabold text-[#0f6d8e] uppercase tracking-wider block mb-2">
                        Attached Diagnostic Reports:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {rec.documents.map((doc, dIdx) => (
                          <button
                            key={dIdx}
                            onClick={() => setSelectedDocForViewer({ ...doc, hospitalName: rec.hospitalName, doctorName: rec.doctorName })}
                            className="flex items-center gap-2 px-3.5 py-2 bg-[#f8fbff] hover:bg-[#e7f7fc] border border-[#d0d5dd] rounded-[9px] text-xs font-semibold text-[#101828] transition"
                          >
                            <Paperclip className="w-3.5 h-3.5 text-[#0f6d8e]" />
                            <span>{doc.fileName}</span>
                            <span className="text-[10px] text-[#98a2b3]">({doc.fileType || 'Doc'})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-[#eef2f6] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <button
                      onClick={() => setSelectedRecordForVersion(rec)}
                      className="flex items-center gap-1.5 text-[#0f6d8e] hover:text-[#0b5874] font-bold"
                    >
                      <GitCommit className="w-4 h-4 text-[#0f6d8e]" />
                      <span>Inspect Version History ({rec.versionHistory?.length || 1} Revisions)</span>
                    </button>

                    {isAuthorHospital ? (
                      <button
                        onClick={() => {
                          setAmendModalRecord(rec);
                          setAmendDescription(rec.description);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fbff] hover:bg-[#e7f7fc] text-[#0f6d8e] rounded-[9px] text-xs font-bold border border-[#d0d5dd] transition"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#0f6d8e]" />
                        <span>Submit Version Correction</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-[#98a2b3] italic">
                        Record owned by {rec.hospitalName} (Read-only for other hospitals)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <VersionDiffModal
        isOpen={!!selectedRecordForVersion}
        onClose={() => setSelectedRecordForVersion(null)}
        record={selectedRecordForVersion}
      />

      <DocumentViewerModal
        isOpen={!!selectedDocForViewer}
        onClose={() => setSelectedDocForViewer(null)}
        document={selectedDocForViewer}
      />
    </div>
  );
};
