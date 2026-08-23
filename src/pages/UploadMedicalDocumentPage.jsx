import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Paperclip,
  User,
  ArrowRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const UploadMedicalDocumentPage = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [anvayId, setAnvayId] = useState(searchParams.get('anvayId') || '');
  const [patient, setPatient] = useState(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState(null);

  const [documentTitle, setDocumentTitle] = useState('');
  const [category, setCategory] = useState('Lab Report');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [successResult, setSuccessResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Auto-fetch patient info when anvayId changes
  useEffect(() => {
    if (!anvayId || anvayId.trim().length < 5) {
      setPatient(null);
      return;
    }

    const fetchPatient = async () => {
      setPatientLoading(true);
      setPatientError(null);
      try {
        const q = query(collection(db, 'users'), where('anvayId', '==', anvayId.trim().toUpperCase()));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setPatient(snap.docs[0].data());
        } else {
          setPatient(null);
          setPatientError('Patient not found');
        }
      } catch (err) {
        console.error('Error fetching patient:', err);
        setPatientError('Network error checking patient ID.');
      } finally {
        setPatientLoading(false);
      }
    };

    fetchPatient();
  }, [anvayId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!patient) {
      setUploadError('Please select a valid patient profile first.');
      return;
    }
    if (!selectedFile) {
      setUploadError('Please select a document file to upload (PDF, JPG, PNG, TXT).');
      return;
    }

    setUploading(true);
    setUploadError(null);

    try {
      // 1. Upload to Firebase Storage
      const storagePath = `records/${patient.anvayId}/${Date.now()}_${selectedFile.name}`;
      const storageRef = ref(storage, storagePath);
      await uploadBytes(storageRef, selectedFile);
      const fileUrl = await getDownloadURL(storageRef);

      const newDoc = {
        fileName: selectedFile.name,
        fileType: selectedFile.type || 'application/pdf',
        fileSize: `${(selectedFile.size / 1024).toFixed(1)} KB`,
        url: fileUrl,
        uploadedAt: new Date().toISOString()
      };

      // 2. Create Firestore Record
      const newRecordRef = doc(collection(db, 'records'));
      const recordData = {
        recordId: newRecordRef.id,
        patientId: patient.anvayId,
        recordType: category,
        title: documentTitle || `${category} - ${selectedFile.name}`,
        department: 'Diagnostics',
        description: clinicalNotes || `Diagnostic ${category} uploaded by ${user?.name} at ${user?.hospitalName || 'Hospital'}`,
        doctorId: user?.uid || '',
        doctorName: user?.name || 'Dr. Attending Clinician',
        hospitalId: user?.hospitalId || '',
        hospitalName: user?.hospitalName || 'Network Hospital',
        documents: [newDoc],
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp()
      };

      await setDoc(newRecordRef, recordData);
      setSuccessResult(recordData);
    } catch (err) {
      console.error(err);
      setUploadError(err.message || 'Network error during file upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto text-[#101828]">
      {/* Header Banner */}
      <div className="bg-white rounded-[22px] border border-[#e7edf4] p-6 sm:p-7 shadow-anvay-soft flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-[#101828]">Upload Medical Document</h1>
          <p className="text-xs text-[#667085]">
            Upload lab reports, discharge summaries, prescriptions, or imaging scans to the patient’s unified history.
          </p>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[10px] font-bold text-[#0f6d8e] bg-[#e7f7fc] px-2.5 py-1 rounded-[20px] block mb-1">
            Active Hospital Origin
          </span>
          <span className="text-xs font-bold text-[#101828]">{user?.hospitalName}</span>
        </div>
      </div>

      {successResult ? (
        <div className="bg-white rounded-[22px] border border-[#e7edf4] p-8 text-center space-y-4 shadow-anvay-soft animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-[#ecfdf3] text-[#067647] flex items-center justify-center text-2xl font-bold mx-auto">
            ✓
          </div>
          <h2 className="text-xl font-black text-[#101828]">Document Uploaded & Provenance Sealed</h2>
          <p className="text-xs text-[#667085] max-w-md mx-auto">
            The diagnostic file was linked to <strong>{patient?.fullName}</strong> ({patient?.anvayId}) and is now accessible to authorized network institutions.
          </p>
          <div className="p-3 bg-[#f8fbff] rounded-[10px] border border-[#e7edf4] font-mono text-xs max-w-xs mx-auto">
            Record ID: <strong>{successResult.recordId}</strong>
          </div>
          <div className="pt-3 flex justify-center gap-3">
            <button
              onClick={() => {
                setSuccessResult(null);
                setSelectedFile(null);
                setDocumentTitle('');
                setClinicalNotes('');
              }}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-[9px]"
            >
              Upload Another Document
            </button>
            <button
              onClick={() => navigate(`/medical-history?anvayId=${patient?.anvayId}`)}
              className="px-5 py-2 bg-[#0f6d8e] text-white text-xs font-bold rounded-[9px] flex items-center gap-1.5"
            >
              <span>View in Longitudinal Timeline</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[22px] border border-[#e7edf4] p-6 sm:p-8 shadow-anvay-soft space-y-6">
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[9px]">
              {uploadError}
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-6">
            {/* Patient Target Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#344054]">
                Target Patient ANVAY Health ID *
              </label>
              <input
                type="text"
                required
                value={anvayId}
                onChange={(e) => setAnvayId(e.target.value)}
                placeholder="e.g. ANVAY-2026-8F29K4"
                className="w-full h-[46px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs font-mono outline-none focus:border-[#20a7ce]"
              />

              {patientLoading && <p className="text-[11px] text-[#0f6d8e]">Validating patient identity...</p>}
              {patientError && <p className="text-[11px] text-red-600">{patientError}</p>}

              {patient && (
                <div className="p-3.5 bg-[#f8fbff] rounded-[12px] border border-[#bfe7f6] flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2.5">
                    <User className="w-4 h-4 text-[#0f6d8e]" />
                    <div>
                      <strong className="text-[#101828] block">{patient.fullName}</strong>
                      <span className="text-[11px] text-[#667085]">
                        {patient.gender}, {patient.age} yrs • Blood Group: {patient.bloodGroup}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-[#067647] bg-[#ecfdf3] px-2 py-0.5 rounded-[20px]">
                    ✓ Linked Profile
                  </span>
                </div>
              )}
            </div>

            {/* Document Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#344054]">Document Title *</label>
                <input
                  type="text"
                  required
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  placeholder="e.g. Resting ECG Baseline Report"
                  className="w-full h-[46px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#344054]">Document Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-[46px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce]"
                >
                  <option value="Lab Report">Lab Report</option>
                  <option value="Imaging Report">Imaging Report (X-Ray / MRI / CT)</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                  <option value="General Check-up">General Check-up Document</option>
                </select>
              </div>
            </div>

            {/* Clinical Observations / Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#344054]">Clinical Interpretation & Notes</label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Diagnostic findings, lab values, physician impressions..."
                className="w-full p-3 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce]"
              ></textarea>
            </div>

            {/* File Upload Box */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#344054]">Select File (PDF, TXT, JPG, PNG) *</label>
              <div className="border-2 border-dashed border-[#d0d5dd] hover:border-[#0f6d8e] rounded-[16px] p-6 text-center bg-[#f8fbff] transition">
                <input
                  type="file"
                  id="docFile"
                  onChange={handleFileChange}
                  accept=".pdf,.txt,.jpg,.jpeg,.png"
                  className="hidden"
                />
                <label htmlFor="docFile" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  {selectedFile ? (
                    <div className="space-y-0.5">
                      <strong className="text-xs text-[#0f6d8e] block">{selectedFile.name}</strong>
                      <span className="text-[11px] text-[#667085]">({Math.round(selectedFile.size / 1024)} KB) - Click to change</span>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <strong className="text-xs text-[#101828] block">Click to select diagnostic file</strong>
                      <span className="text-[11px] text-[#98a2b3]">Supports PDF, JPG, PNG, TXT up to 10MB</span>
                    </div>
                  )}
                </label>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={uploading || !patient || !selectedFile}
                className="px-8 h-[48px] bg-[#0f6d8e] hover:bg-[#0b5874] text-white font-bold rounded-[9px] text-xs shadow-xs transition flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? 'Sealing & Uploading...' : 'Upload & Seal to Patient Record'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
