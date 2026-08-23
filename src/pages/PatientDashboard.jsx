import React, { useState, useEffect, useRef } from 'react';
import {
  User, HeartPulse, AlertOctagon, Pill, Calendar, Download, Building2,
  Paperclip, ShieldCheck, Activity, FileText, Clock, ChevronRight, Edit3, X,
  CheckCircle2, Camera, CreditCard, Plus, Phone
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { CompletenessScoreGauge } from '../components/CompletenessScoreGauge';
import { VerifiedHospitalBadge } from '../components/VerifiedHospitalBadge';
import { DocumentViewerModal } from '../components/DocumentViewerModal';
import { AccountDeletionModal } from '../components/AccountDeletionModal';
import { exportPatientMedicalSummary } from '../utils/pdfExport';

import { collection, query, where, onSnapshot, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const PatientDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const anvayId = user?.anvayId;

  const [snapshot, setSnapshot] = useState(null);
  const [patientDocId, setPatientDocId] = useState(null);
  const [records, setRecords] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'timeline' | 'documents'

  // Edit Profile State
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    fullName: '', mobile: '', bloodGroup: 'O+', age: '', gender: 'Male',
    address: '', district: '', state: '', emergencyContact: '', allergies: ''
  });
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccess, setEditSuccess] = useState(false);

  // Emergency Contact Photo
  const [ecPhotoUploading, setEcPhotoUploading] = useState(false);
  const ecPhotoRef = useRef(null);

  // Aadhaar card upload
  const [aadhaarUploading, setAadhaarUploading] = useState(false);
  const aadhaarRef = useRef(null);

  // Self-add health record
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [recordForm, setRecordForm] = useState({
    title: '', description: '', symptoms: '', temperature: '',
    bloodPressure: '', weight: '', notes: '', recordType: 'Self-Reported'
  });
  const [recordSaving, setRecordSaving] = useState(false);
  const [recordSuccess, setRecordSuccess] = useState(false);

  useEffect(() => {
    if (!anvayId && !user?.uid) return;

    // Listen to patient profile
    const qPatient = anvayId 
      ? query(collection(db, 'users'), where('anvayId', '==', anvayId))
      : query(collection(db, 'users'), where('uid', '==', user.uid));

    const unsubPatient = onSnapshot(qPatient, (querySnapshot) => {
      if (!querySnapshot.empty) {
        const pDoc = querySnapshot.docs[0];
        const pData = pDoc.data();
        setPatientDocId(pDoc.id);
        setSnapshot({ patient: pData });
        setEditFormData({
          fullName: pData.fullName || pData.name || '',
          mobile: pData.mobile || '',
          bloodGroup: pData.bloodGroup || 'O+',
          age: pData.age || pData.dateOfBirth || '',
          gender: pData.gender || 'Male',
          address: pData.address || '',
          district: pData.district || '',
          state: pData.state || '',
          emergencyContact: pData.emergencyContact || '',
          allergies: Array.isArray(pData.allergies) ? pData.allergies.map(a => typeof a === 'string' ? a : a.substance || '').join(', ') : (pData.allergies || '')
        });
      }
    });

    // Listen to patient records
    const searchId = anvayId || user?.uid;
    const qRecords = query(collection(db, 'records'), where('patientId', '==', searchId));
    const unsubRecords = onSnapshot(qRecords, (querySnapshot) => {
      setRecords(querySnapshot.docs.map(doc => doc.data()));
    });
    
    setLoading(false);

    return () => {
      unsubPatient();
      unsubRecords();
    };
  }, [anvayId, user]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      const targetId = patientDocId || user?.uid;
      const parsedAllergies = editFormData.allergies
        ? editFormData.allergies.split(',').map(s => ({ substance: s.trim(), severity: 'Moderate', reaction: 'Reported allergy' })).filter(a => a.substance)
        : [];

      await updateDoc(doc(db, 'users', targetId), {
        fullName: editFormData.fullName.trim(),
        name: editFormData.fullName.trim(),
        mobile: editFormData.mobile.trim(),
        bloodGroup: editFormData.bloodGroup,
        age: editFormData.age,
        gender: editFormData.gender,
        address: editFormData.address.trim(),
        district: editFormData.district.trim(),
        state: editFormData.state.trim(),
        emergencyContact: editFormData.emergencyContact.trim(),
        allergies: parsedAllergies,
        updatedAt: serverTimestamp()
      });

      setEditSuccess(true);
      setTimeout(() => {
        setEditSuccess(false);
        setIsEditProfileOpen(false);
      }, 1200);
    } catch (err) {
      console.error('Error updating patient profile:', err);
      alert('Failed to update profile: ' + err.message);
    } finally {
      setEditSaving(false);
    }
  };

  // Upload emergency contact photo to Firebase Storage
  const handleEcPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPEG, PNG or WebP images allowed.'); return;
    }
    if (file.size > 3 * 1024 * 1024) { alert('Photo must be under 3MB.'); return; }
    setEcPhotoUploading(true);
    try {
      const targetId = patientDocId || user?.uid;
      const storageRef = ref(storage, `patients/${targetId}/emergency-contact-photo`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', targetId), { emergencyContactPhotoUrl: url, updatedAt: serverTimestamp() });
    } catch (err) {
      console.error('EC photo upload error:', err);
      alert('Upload failed: ' + err.message);
    } finally { setEcPhotoUploading(false); }
  };

  // Upload Aadhaar card to Firebase Storage
  const handleAadhaarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) {
      alert('Only JPEG, PNG, WebP or PDF allowed.'); return;
    }
    if (file.size > 5 * 1024 * 1024) { alert('File must be under 5MB.'); return; }
    setAadhaarUploading(true);
    try {
      const targetId = patientDocId || user?.uid;
      const storageRef = ref(storage, `patients/${targetId}/aadhaar-card`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', targetId), {
        aadhaarCardUrl: url,
        aadhaarUploadedAt: new Date().toISOString(),
        updatedAt: serverTimestamp()
      });
    } catch (err) {
      console.error('Aadhaar upload error:', err);
      alert('Upload failed: ' + err.message);
    } finally { setAadhaarUploading(false); }
  };

  // Patient self-submit health record
  const handleAddRecord = async (e) => {
    e.preventDefault();
    setRecordSaving(true);
    try {
      const searchId = anvayId || user?.uid;
      await addDoc(collection(db, 'records'), {
        patientId: searchId,
        patientAnvayId: anvayId || '',
        title: recordForm.title.trim(),
        description: recordForm.description.trim(),
        symptoms: recordForm.symptoms.trim(),
        vitals: {
          temperature: recordForm.temperature,
          bloodPressure: recordForm.bloodPressure,
          weight: recordForm.weight
        },
        notes: recordForm.notes.trim(),
        recordType: recordForm.recordType,
        source: 'Patient Self-Reported',
        doctorName: 'Self',
        hospitalName: 'Self-Reported',
        createdAt: new Date().toISOString(),
        createdBy: user?.uid,
        documents: []
      });
      setRecordSuccess(true);
      setRecordForm({ title: '', description: '', symptoms: '', temperature: '', bloodPressure: '', weight: '', notes: '', recordType: 'Self-Reported' });
      setTimeout(() => { setRecordSuccess(false); setShowAddRecord(false); }, 1500);
    } catch (err) {
      console.error('Error adding self record:', err);
      alert('Failed to add health record: ' + err.message);
    } finally { setRecordSaving(false); }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-[#667085]">Loading your ANVAY health profile...</div>;
  }

  const patient = snapshot?.patient;

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#101828]">
      {/* Patient Welcome Header */}
      <div className="bg-white rounded-[22px] border border-[#e7edf4] p-6 sm:p-7 shadow-anvay-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Profile avatar */}
          <div className="w-14 h-14 shrink-0 rounded-full bg-[#e7f7fc] border-2 border-[#20a7ce] flex items-center justify-center text-[#0f6d8e] font-black text-xl overflow-hidden">
            {patient?.photoUrl
              ? <img src={patient.photoUrl} alt="Profile" className="w-full h-full object-cover" />
              : (patient?.fullName || user?.name || 'P')[0].toUpperCase()
            }
          </div>
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl font-black text-[#101828]">
                Welcome, {patient?.fullName || user?.name}
              </h1>
              <span className="font-mono text-xs font-bold text-[#0f6d8e] bg-[#e7f7fc] px-2.5 py-1 rounded-[6px]">
                {anvayId || patient?.anvayId}
              </span>
              <span className="text-[10px] font-bold text-[#067647] bg-[#ecfdf3] px-2 py-0.5 rounded-[20px]">
                ✓ Verified Health Identity
              </span>
            </div>
            <p className="text-xs text-[#667085]">
              {patient?.gender}, {patient?.age} yrs • Blood Group: <strong className="text-[#d92d20]">{patient?.bloodGroup || 'O+'}</strong> • Ref: {patient?.govtIdRef || 'ABHA'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditProfileOpen(true)}
            className="px-3.5 py-2.5 bg-[#f8fbff] hover:bg-[#e7f7fc] text-[#0f6d8e] border border-[#d0d5dd] rounded-[9px] text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
          <button
            onClick={() => exportPatientMedicalSummary(patient, records)}
            className="px-4 py-2.5 bg-[#0f6d8e] hover:bg-[#0b5874] text-white rounded-[9px] text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-[9px] text-xs font-bold transition"
          >
            Delete Account
          </button>
        </div>
      </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-[#e7edf4] gap-6 text-xs font-bold">
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
          Medical History ({records.length} Records)
        </button>
        <button
          onClick={() => setActiveTab('documents')}
          className={`pb-3 transition ${
            activeTab === 'documents'
              ? 'text-[#0f6d8e] border-b-2 border-[#0f6d8e]'
              : 'text-[#667085] hover:text-[#0f6d8e]'
          }`}
        >
          Documents & IDs
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
                <span className="text-[#667085] text-[10px] uppercase font-bold block mb-1.5">Emergency Contact</span>
                <div className="flex items-center gap-2">
                  {/* EC Photo with upload button */}
                  <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-full bg-[#e7f7fc] overflow-hidden flex items-center justify-center border border-[#20a7ce]">
                      {patient?.emergencyContactPhotoUrl
                        ? <img src={patient.emergencyContactPhotoUrl} alt="EC" className="w-full h-full object-cover" />
                        : <Phone className="w-4 h-4 text-[#0f6d8e]" />
                      }
                    </div>
                    <button
                      onClick={() => ecPhotoRef.current?.click()}
                      disabled={ecPhotoUploading}
                      title="Upload contact photo"
                      className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#0f6d8e] hover:bg-[#0b5874] rounded-full flex items-center justify-center shadow transition"
                    >
                      {ecPhotoUploading
                        ? <span className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin" />
                        : <Camera className="w-2.5 h-2.5 text-white" />
                      }
                    </button>
                    <input ref={ecPhotoRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleEcPhotoUpload} />
                  </div>
                  <div className="min-w-0">
                    <strong className="text-[11px] font-bold text-[#067647] block truncate">
                      {patient?.emergencyContact || 'Not Set'}
                    </strong>
                    <span className="text-[10px] text-[#98a2b3]">{patient?.emergencyContactPhone || ''}</span>
                  </div>
                </div>
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

      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowAddRecord(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[10px] text-xs font-bold flex items-center gap-2 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              Add Self Health Record
            </button>
          </div>

          <div className="p-4 bg-[#101828] text-white rounded-[18px] text-xs flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#20a7ce] shrink-0" />
            <p className="text-white/90">
              Your longitudinal medical record is updated by connected hospitals and your own self-reported entries.
            </p>
          </div>

          <div className="relative pl-6 space-y-5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#e7edf4]">
            {records.length === 0 && (
              <p className="text-xs text-[#98a2b3] italic pl-2">No health records found. Add your first self-reported entry above.</p>
            )}
            {records.map((rec) => (
              <div key={rec.id || rec.recordId} className="relative">
                <div className={`absolute -left-6 top-3 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                  rec.source === 'Patient Self-Reported' ? 'bg-emerald-600 text-white' : 'bg-[#0f6d8e] text-white'
                }`}>
                  {rec.source === 'Patient Self-Reported' ? '★' : '✓'}
                </div>

                <div className="bg-white rounded-[18px] border border-[#e7edf4] p-5 shadow-anvay-soft space-y-2">
                  <div className="flex flex-wrap justify-between items-center gap-2 border-b border-[#eef2f6] pb-2 text-xs">
                    <div>
                      <h4 className="font-bold text-sm text-[#101828]">{rec.title}</h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#667085] mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-[#0f6d8e]" />
                        <span className="font-semibold text-[#101828]">{rec.hospitalName}</span>
                        <span>• {rec.doctorName}</span>
                        {rec.source === 'Patient Self-Reported' && (
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">Self-Reported</span>
                        )}
                      </div>
                    </div>
                    <span className="text-[11px] text-[#98a2b3]">{new Date(rec.createdAt).toLocaleDateString()}</span>
                  </div>

                  <p className="text-xs text-[#344054] leading-relaxed bg-[#f8fbff] p-3 rounded-[9px] border border-[#e7edf4]">
                    {rec.description}
                  </p>
                  {(rec.vitals?.temperature || rec.vitals?.bloodPressure || rec.vitals?.weight) && (
                    <div className="flex flex-wrap gap-3 text-[11px] text-[#667085]">
                      {rec.vitals.temperature && <span>🌡 <strong>{rec.vitals.temperature}</strong>°F</span>}
                      {rec.vitals.bloodPressure && <span>💓 BP: <strong>{rec.vitals.bloodPressure}</strong></span>}
                      {rec.vitals.weight && <span>⚖ <strong>{rec.vitals.weight}</strong> kg</span>}
                    </div>
                  )}
                  {rec.symptoms && (
                    <p className="text-[11px] text-[#667085]">🤒 Symptoms: {rec.symptoms}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'documents' && (
        <div className="space-y-5">
          {/* Aadhaar Card Section */}
          <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 shadow-anvay-soft space-y-4">
            <div className="flex justify-between items-center border-b border-[#eef2f6] pb-3">
              <h3 className="text-xs font-extrabold text-[#0f6d8e] uppercase tracking-wider flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Aadhaar Card
              </h3>
              {patient?.aadhaarCardUrl && (
                <span className="text-[10px] font-bold text-[#067647] bg-[#ecfdf3] px-2 py-0.5 rounded-full">✓ Uploaded</span>
              )}
            </div>
            {patient?.aadhaarCardUrl ? (
              <div className="space-y-3">
                <div className="rounded-[12px] overflow-hidden border border-[#e7edf4] max-h-60">
                  {patient.aadhaarCardUrl.includes('pdf') ? (
                    <a href={patient.aadhaarCardUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 p-4 text-xs font-bold text-[#0f6d8e] hover:underline">
                      <FileText className="w-4 h-4" /> View Aadhaar PDF
                    </a>
                  ) : (
                    <img src={patient.aadhaarCardUrl} alt="Aadhaar Card" className="w-full object-contain max-h-56" />
                  )}
                </div>
                <p className="text-[11px] text-[#98a2b3]">
                  Uploaded {patient.aadhaarUploadedAt ? new Date(patient.aadhaarUploadedAt).toLocaleDateString() : ''} •{' '}
                  <button onClick={() => aadhaarRef.current?.click()} className="text-[#0f6d8e] underline">Replace</button>
                </p>
              </div>
            ) : (
              <div
                onClick={() => aadhaarRef.current?.click()}
                className="border-2 border-dashed border-[#d0d5dd] hover:border-[#20a7ce] rounded-[14px] p-8 text-center cursor-pointer transition group"
              >
                <CreditCard className="w-8 h-8 text-[#98a2b3] group-hover:text-[#0f6d8e] mx-auto mb-2 transition" />
                <p className="text-sm font-bold text-[#344054]">Upload your Aadhaar Card</p>
                <p className="text-[11px] text-[#667085] mt-1">JPEG, PNG, WebP or PDF • Max 5MB</p>
                {aadhaarUploading && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#0f6d8e]">
                    <span className="w-4 h-4 border-2 border-[#0f6d8e] border-t-transparent rounded-full animate-spin" />
                    Uploading...
                  </div>
                )}
              </div>
            )}
            <input ref={aadhaarRef} type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" onChange={handleAadhaarUpload} />
          </div>

          {/* Medical Documents */}
          <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 shadow-anvay-soft space-y-4">
            <h3 className="text-xs font-extrabold text-[#0f6d8e] uppercase tracking-wider">
              Diagnostic Reports &amp; Lab Records
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {records.flatMap(r => r.documents || []).length === 0 && (
                <p className="text-xs text-[#98a2b3] italic col-span-2">No documents attached to records yet.</p>
              )}
              {records.flatMap(r => r.documents || []).map((document, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedDoc(document)}
                  className="p-4 rounded-[14px] bg-[#f8fbff] hover:bg-[#e7f7fc] border border-[#e7edf4] text-left transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Paperclip className="w-4 h-4 text-[#0f6d8e]" />
                    <div>
                      <strong className="text-xs font-bold text-[#101828] block">{document.fileName}</strong>
                      <span className="text-[10px] text-[#667085]">{document.fileType} • {document.fileSize}</span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#0f6d8e]">View →</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <DocumentViewerModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
      />

      <AccountDeletionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      {/* Self-Add Health Record Modal */}
      {showAddRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-[22px] p-7 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-[#eef2f6]">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-600" />
                <h2 className="text-lg font-extrabold text-[#101828]">Add Health Record</h2>
              </div>
              <button onClick={() => setShowAddRecord(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
            </div>

            {recordSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-[9px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Health record added successfully!
              </div>
            )}

            <form onSubmit={handleAddRecord} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Record Title *</label>
                <input
                  type="text" required
                  placeholder="e.g. Fever Episode, Routine Check-up"
                  value={recordForm.title}
                  onChange={e => setRecordForm({ ...recordForm, title: e.target.value })}
                  className="w-full h-10 px-3 border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Record Type</label>
                <select
                  value={recordForm.recordType}
                  onChange={e => setRecordForm({ ...recordForm, recordType: e.target.value })}
                  className="w-full h-10 px-3 border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce] bg-white"
                >
                  <option value="Self-Reported">Self-Reported</option>
                  <option value="Home Monitoring">Home Monitoring</option>
                  <option value="Chronic Condition Update">Chronic Condition Update</option>
                  <option value="Post-Hospital Note">Post-Hospital Note</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Symptoms / Complaints</label>
                <input
                  type="text"
                  placeholder="e.g. Headache, mild fever, fatigue"
                  value={recordForm.symptoms}
                  onChange={e => setRecordForm({ ...recordForm, symptoms: e.target.value })}
                  className="w-full h-10 px-3 border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Description / Observations *</label>
                <textarea
                  required rows={3}
                  placeholder="Describe what happened, treatment taken, observations..."
                  value={recordForm.description}
                  onChange={e => setRecordForm({ ...recordForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce] resize-none"
                />
              </div>

              {/* Vitals row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Temp (°F)</label>
                  <input type="text" placeholder="98.6" value={recordForm.temperature}
                    onChange={e => setRecordForm({ ...recordForm, temperature: e.target.value })}
                    className="w-full h-10 px-3 border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]" />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Blood Pressure</label>
                  <input type="text" placeholder="120/80" value={recordForm.bloodPressure}
                    onChange={e => setRecordForm({ ...recordForm, bloodPressure: e.target.value })}
                    className="w-full h-10 px-3 border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]" />
                </div>
                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Weight (kg)</label>
                  <input type="text" placeholder="70" value={recordForm.weight}
                    onChange={e => setRecordForm({ ...recordForm, weight: e.target.value })}
                    className="w-full h-10 px-3 border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Additional Notes</label>
                <textarea rows={2} placeholder="Medications taken, doctor visited, next steps..."
                  value={recordForm.notes}
                  onChange={e => setRecordForm({ ...recordForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce] resize-none" />
              </div>

              <div className="flex gap-2.5 pt-3 border-t border-[#eef2f6]">
                <button type="button" onClick={() => setShowAddRecord(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-[9px] font-bold hover:bg-slate-200 transition">
                  Cancel
                </button>
                <button type="submit" disabled={recordSaving}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-[9px] font-bold disabled:opacity-50 transition">
                  {recordSaving ? 'Saving...' : 'Save Health Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-[22px] p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200 my-8">
            <div className="flex justify-between items-center pb-3 border-b border-[#eef2f6]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#0f6d8e]" />
                <h2 className="text-lg font-extrabold text-[#101828]">Edit Health Profile</h2>
              </div>
              <button
                onClick={() => setIsEditProfileOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {editSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-[9px] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Profile updated successfully!</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData({ ...editFormData, fullName: e.target.value })}
                  className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Mobile Phone</label>
                  <input
                    type="tel"
                    value={editFormData.mobile}
                    onChange={(e) => setEditFormData({ ...editFormData, mobile: e.target.value })}
                    className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Blood Group</label>
                  <select
                    value={editFormData.bloodGroup}
                    onChange={(e) => setEditFormData({ ...editFormData, bloodGroup: e.target.value })}
                    className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                  >
                    {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Age / DOB</label>
                  <input
                    type="text"
                    value={editFormData.age}
                    onChange={(e) => setEditFormData({ ...editFormData, age: e.target.value })}
                    className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Gender</label>
                  <select
                    value={editFormData.gender}
                    onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })}
                    className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Residential Address</label>
                <input
                  type="text"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                  placeholder="Street / Colony / Village"
                  className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">District</label>
                  <input
                    type="text"
                    value={editFormData.district}
                    onChange={(e) => setEditFormData({ ...editFormData, district: e.target.value })}
                    className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">State</label>
                  <input
                    type="text"
                    value={editFormData.state}
                    onChange={(e) => setEditFormData({ ...editFormData, state: e.target.value })}
                    className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Emergency Contact (Name & Phone)</label>
                <input
                  type="text"
                  value={editFormData.emergencyContact}
                  onChange={(e) => setEditFormData({ ...editFormData, emergencyContact: e.target.value })}
                  placeholder="e.g. Ramesh Patel (Brother) - 9876543210"
                  className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Diagnosed Drug / Food Allergies <span className="text-gray-400 font-normal">(comma separated)</span></label>
                <input
                  type="text"
                  value={editFormData.allergies}
                  onChange={(e) => setEditFormData({ ...editFormData, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Sulfa drugs, Peanuts"
                  className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#eef2f6]">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-[9px] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="flex-1 py-2 bg-[#0f6d8e] text-white rounded-[9px] font-bold disabled:opacity-50"
                >
                  {editSaving ? 'Saving Changes...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
