import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertTriangle,
  User,
  ArrowRight,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const ACCEPTED_TYPES = {
  'application/pdf': 'PDF',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
  'application/msword': 'DOC',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/webp': 'WebP',
  'text/plain': 'TXT',
};

const MAX_SIZE_MB = 15;

export const UploadMedicalDocumentPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [anvayId, setAnvayId] = useState(searchParams.get('anvayId') || '');
  const [patient, setPatient] = useState(null);
  const [patientDocId, setPatientDocId] = useState(null);
  const [patientLoading, setPatientLoading] = useState(false);
  const [patientError, setPatientError] = useState(null);

  const [documentTitle, setDocumentTitle] = useState('');
  const [category, setCategory] = useState('Lab Report');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successResult, setSuccessResult] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  // Auto-fetch patient info when anvayId changes
  useEffect(() => {
    if (!anvayId || anvayId.trim().length < 5) {
      setPatient(null);
      setPatientDocId(null);
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
          setPatientDocId(snap.docs[0].id);
        } else {
          setPatient(null);
          setPatientDocId(null);
          setPatientError('Patient not found for this ANVAY ID.');
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
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES[file.type]) {
      setFileError('Unsupported file type. Allowed: PDF, DOCX, DOC, JPG, PNG, TXT.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setFileError(`File too large. Maximum size is ${MAX_SIZE_MB}MB.`);
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange({ target: { files: [file] } });
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!patient) {
      setUploadError('Please select a valid patient profile first.');
      return;
    }
    if (!selectedFile) {
      setUploadError('Please select a document file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);
    setUploadProgress(10);

    try {
      const patientAnvayId = patient.anvayId || anvayId.trim().toUpperCase();

      // 1. Upload to Firebase Storage
      const timestamp = Date.now();
      const safeFileName = selectedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const storagePath = `documents/${patientAnvayId}/${timestamp}_${safeFileName}`;
      const storageRef = ref(storage, storagePath);

      setUploadProgress(30);
      await uploadBytes(storageRef, selectedFile);
      setUploadProgress(70);
      const fileUrl = await getDownloadURL(storageRef);
      setUploadProgress(85);

      const newDocObj = {
        fileName: selectedFile.name,
        fileType: ACCEPTED_TYPES[selectedFile.type] || selectedFile.type,
        fileMimeType: selectedFile.type,
        fileSize: `${(selectedFile.size / 1024).toFixed(1)} KB`,
        url: fileUrl,
        storagePath,
        uploadedAt: new Date().toISOString(),
        uploadedBy: user?.name || user?.uid || 'Staff',
        uploadedByRole: user?.role || '',
        hospitalName: user?.hospitalName || '',
      };

      // 2. Create Firestore Record in 'records' collection
      const newRecordRef = doc(collection(db, 'records'));
      const recordData = {
        recordId: newRecordRef.id,
        patientId: patientAnvayId,         // Always store the ANVAY ID
        patientDocId: patientDocId || '',  // Also store Firestore doc ID for quick lookup
        recordType: category,
        title: documentTitle.trim() || `${category} – ${selectedFile.name}`,
        department: 'Diagnostics',
        description: clinicalNotes.trim() || `${category} uploaded by ${user?.name || 'Clinician'} at ${user?.hospitalName || 'Hospital'}`,
        doctorId: user?.uid || '',
        doctorName: user?.name || 'Attending Clinician',
        hospitalId: user?.hospitalId || user?.anvayId || '',
        hospitalName: user?.hospitalName || 'Network Hospital',
        documents: [newDocObj],
        source: 'Hospital Upload',
        createdAt: new Date().toISOString(),
        timestamp: serverTimestamp(),
      };

      await setDoc(newRecordRef, recordData);
      setUploadProgress(100);
      setSuccessResult(recordData);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.message || 'Upload failed. Check Firebase Storage rules and try again.');
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
          <p className="text-xs text-[#667085] mt-1">
            Upload lab reports, discharge summaries, prescriptions, imaging scans, or DOCX files to the patient's unified history.
          </p>
        </div>
        <div className="text-right hidden sm:block">
          <span className="text-[10px] font-bold text-[#0f6d8e] bg-[#e7f7fc] px-2.5 py-1 rounded-[20px] block mb-1">
            Active Hospital Origin
          </span>
          <span className="text-xs font-bold text-[#101828]">{user?.hospitalName || user?.name}</span>
        </div>
      </div>

      {successResult ? (
        <div className="bg-white rounded-[22px] border border-[#e7edf4] p-8 text-center space-y-4 shadow-anvay-soft animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-[#ecfdf3] text-[#067647] flex items-center justify-center text-2xl font-bold mx-auto">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-black text-[#101828]">Document Uploaded & Provenance Sealed</h2>
          <p className="text-xs text-[#667085] max-w-md mx-auto">
            The file was linked to <strong>{patient?.fullName || patient?.name}</strong> ({patient?.anvayId}) and is now visible in their Medical History tab.
          </p>
          <div className="p-3 bg-[#f8fbff] rounded-[10px] border border-[#e7edf4] font-mono text-xs max-w-xs mx-auto text-left space-y-1">
            <div><span className="text-[#667085]">Record ID:</span> <strong>{successResult.recordId}</strong></div>
            <div><span className="text-[#667085]">File:</span> <strong>{successResult.documents?.[0]?.fileName}</strong></div>
            <div><span className="text-[#667085]">Type:</span> <strong>{successResult.documents?.[0]?.fileType}</strong></div>
          </div>
          <div className="pt-3 flex justify-center gap-3">
            <button
              onClick={() => {
                setSuccessResult(null);
                setSelectedFile(null);
                setDocumentTitle('');
                setClinicalNotes('');
                setUploadProgress(0);
              }}
              className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-[9px] hover:bg-slate-200 transition"
            >
              Upload Another Document
            </button>
            <button
              onClick={() => navigate(`/medical-history?anvayId=${patient?.anvayId}`)}
              className="px-5 py-2 bg-[#0f6d8e] text-white text-xs font-bold rounded-[9px] flex items-center gap-1.5 hover:bg-[#0b5874] transition"
            >
              <span>View Patient History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[22px] border border-[#e7edf4] p-6 sm:p-8 shadow-anvay-soft space-y-6">
          {uploadError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[9px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{uploadError}</span>
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
                onChange={(e) => setAnvayId(e.target.value.toUpperCase())}
                placeholder="e.g. ANVAY-P-2026-1234"
                className="w-full h-[46px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs font-mono outline-none focus:border-[#20a7ce]"
              />

              {patientLoading && <p className="text-[11px] text-[#0f6d8e]">Validating patient identity...</p>}
              {patientError && <p className="text-[11px] text-red-600">{patientError}</p>}

              {patient && (
                <div className="p-3.5 bg-[#f8fbff] rounded-[12px] border border-[#bfe7f6] flex justify-between items-center text-xs">
                  <div className="flex items-center gap-3">
                    {patient.photoUrl ? (
                      <img src={patient.photoUrl} alt="Patient" className="w-9 h-9 rounded-full object-cover border-2 border-[#20a7ce]" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#eaf8fc] flex items-center justify-center text-[#0f6d8e] font-bold text-sm">
                        {(patient.fullName || patient.name || 'P')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <strong className="text-[#101828] block">{patient.fullName || patient.name}</strong>
                      <span className="text-[11px] text-[#667085]">
                        {patient.gender}{patient.age ? `, ${patient.age} yrs` : ''} • Blood: {patient.bloodGroup || '?'}
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
                  <option value="Clinical Notes">Clinical Notes (DOCX)</option>
                  <option value="General Check-up">General Check-up Document</option>
                  <option value="Insurance Document">Insurance Document</option>
                </select>
              </div>
            </div>

            {/* Clinical Notes */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-[#344054]">Clinical Interpretation & Notes</label>
              <textarea
                rows={3}
                value={clinicalNotes}
                onChange={(e) => setClinicalNotes(e.target.value)}
                placeholder="Diagnostic findings, lab values, physician impressions..."
                className="w-full p-3 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce]"
              />
            </div>

            {/* File Upload Box */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#344054]">
                Select File * <span className="text-[#98a2b3] font-normal">(PDF, DOCX, DOC, JPG, PNG up to {MAX_SIZE_MB}MB)</span>
              </label>
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-[#d0d5dd] hover:border-[#0f6d8e] rounded-[16px] p-6 text-center bg-[#f8fbff] transition"
              >
                <input
                  type="file"
                  id="docFile"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                />
                <label htmlFor="docFile" className="cursor-pointer space-y-2 block">
                  <div className="w-12 h-12 rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center mx-auto">
                    <Upload className="w-6 h-6" />
                  </div>
                  {selectedFile ? (
                    <div className="space-y-0.5">
                      <strong className="text-xs text-[#0f6d8e] block">{selectedFile.name}</strong>
                      <span className="text-[11px] text-[#667085]">
                        {ACCEPTED_TYPES[selectedFile.type] || 'File'} • {(selectedFile.size / 1024).toFixed(1)} KB — Click to change
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-0.5">
                      <strong className="text-xs text-[#101828] block">Click to select or drag & drop</strong>
                      <span className="text-[11px] text-[#98a2b3]">PDF, DOCX, DOC, JPG, PNG up to {MAX_SIZE_MB}MB</span>
                    </div>
                  )}
                </label>
              </div>
              {fileError && (
                <p className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {fileError}
                </p>
              )}
            </div>

            {/* Upload progress */}
            {uploading && (
              <div className="space-y-1">
                <div className="w-full h-2 bg-[#e7edf4] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0f6d8e] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#667085] text-center">Uploading... {uploadProgress}%</p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={uploading || !patient || !selectedFile || !!fileError}
                className="px-8 h-[48px] bg-[#0f6d8e] hover:bg-[#0b5874] text-white font-bold rounded-[9px] text-xs shadow-xs transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-4 h-4" />
                <span>{uploading ? `Uploading ${uploadProgress}%...` : 'Upload & Seal to Patient Record'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
