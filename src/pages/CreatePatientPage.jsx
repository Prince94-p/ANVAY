import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { db, functions, storage } from '../firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const CreatePatientPage = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    dateOfBirth: '',
    aadhaar: '',
    gender: 'Male',
    bloodGroup: 'O+',
    condition: '',
    allergy: '',
    medication: '',
    emergencyName: '',
    emergencyNumber: '',
    district: 'North West Delhi',
    state: 'Delhi',
    password: '',
    confirmPassword: ''
  });

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [idDocument, setIdDocument] = useState(null);

  const [previewId, setPreviewId] = useState(`ANVAY-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  const [isCheckingDuplicate, setIsCheckingDuplicate] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdPatient, setCreatedPatient] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'aadhaar') {
      setDuplicateWarning(null);
    }
  };

  const handleCheckDuplicate = async () => {
    if (!formData.aadhaar || formData.aadhaar.trim().length < 4) return;

    setIsCheckingDuplicate(true);
    setDuplicateWarning(null);

    try {
      const qAadhaar = query(collection(db, 'users'), where('govtIdNumber', '==', formData.aadhaar.trim()));
      const snap = await getDocs(qAadhaar);
      if (!snap.empty) {
        const existing = snap.docs[0].data();
        setDuplicateWarning({
          message: 'National identity already registered in ANVAY system.',
          existingAnvayId: existing.anvayId,
          existingPatientName: existing.name || existing.fullName,
          registeredAtHospital: existing.hospitalName || 'Network Hospital'
        });
      }
    } catch (e) {
      console.error('Error checking duplicate:', e);
    } finally {
      setIsCheckingDuplicate(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (duplicateWarning) {
      setError('Cannot proceed: A verified ANVAY profile already exists for this national identity reference.');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);

    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    const initialAllergies = formData.allergy ? [{
      substance: formData.allergy,
      severity: 'Moderate',
      reaction: 'Allergic sensitivity',
      status: 'Confirmed Positive',
      diagnosedBy: user?.name || 'Attending Clinician',
      hospital: user?.hospitalName || 'Network Hospital',
      date: new Date().toISOString().split('T')[0]
    }] : [];

    const initialConditions = formData.condition ? [{
      condition: formData.condition,
      diagnosedDate: new Date().toISOString().split('T')[0],
      hospital: user?.hospitalName || 'Network Hospital',
      doctor: user?.name || 'Attending Clinician',
      status: 'Active'
    }] : [];

    try {
      const registerPatient = httpsCallable(functions, 'registerPatient');
      const generatedUsername = (formData.email ? formData.email.split('@')[0] : `patient_${Date.now()}`).toLowerCase().replace(/[^a-z0-9_]/g, '');

      const result = await registerPatient({
        email: formData.email || `${generatedUsername}@patient.anvay.health`,
        password: formData.password || 'Patient@1234',
        username: generatedUsername,
        fullName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        mobile: formData.mobile,
        govtIdType: 'Aadhaar',
        govtIdNumber: formData.aadhaar
      });

      if (result.data?.success) {
        const patientUid = result.data.uid;
        const updates = {
          fullName,
          district: formData.district,
          state: formData.state,
          emergencyContactName: formData.emergencyName,
          emergencyContactPhone: formData.emergencyNumber,
          allergies: initialAllergies,
          chronicConditions: initialConditions
        };

        if (user?.hospitalId) {
          updates.registeredAtHospitalId = user.hospitalId;
        }

        // Upload Profile Photo & ID Doc to Storage if selected
        if (profilePhoto) {
          try {
            const photoRef = ref(storage, `users/${patientUid}/profile.jpg`);
            await uploadBytes(photoRef, profilePhoto);
            updates.photoURL = await getDownloadURL(photoRef);
          } catch (storageErr) {
            console.warn('Profile photo upload error:', storageErr);
          }
        }

        await updateDoc(doc(db, 'users', patientUid), updates);

        setCreatedPatient({
          anvayId: result.data.anvayId,
          fullName,
          email: formData.email
        });
      } else {
        setError('Failed to create patient profile');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error occurred during patient creation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-[#101828] pb-16">
      {/* Top Background Hero Banner */}
      <section className="bg-[#eef9fc] py-12 px-[6%] sm:px-[8%] text-center rounded-[25px] anvay-gradient-login">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="anvay-badge mx-auto">
            SECURE HEALTHCARE IDENTITY
          </div>
          <h1 className="text-3xl sm:text-[44px] font-extrabold text-[#101828] leading-tight">
            Create patient ANVAY profile
          </h1>
          <p className="text-[#667085] text-[14px] leading-relaxed">
            One secure identity connecting healthcare information across all authorized network hospitals.
          </p>
        </div>
      </section>

      {/* Main Form Container */}
      <main className="max-w-4xl mx-auto px-4">
        <section className="bg-white border border-[#e7edf4] rounded-[22px] p-6 sm:p-10 shadow-anvay-soft space-y-8">
          {/* Top Card ID Preview */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-[#eef2f6]">
            <div>
              <p className="text-[#0f6d8e] text-[11px] font-extrabold tracking-wider uppercase mb-1">
                PATIENT REGISTRATION
              </p>
              <h2 className="text-2xl font-extrabold text-[#101828]">
                Establish Unified Health Identity
              </h2>
              <p className="text-[#667085] text-[13px]">
                Complete the profile to generate a unique ANVAY Health ID.
              </p>
            </div>

            <div className="flex items-center gap-3 p-3.5 bg-[#f8fbff] border border-[#e7edf4] rounded-[15px]">
              <div className="w-10 h-10 rounded-full bg-[#0f6d8e] text-white flex items-center justify-center font-extrabold text-base">
                A
              </div>
              <div>
                <small className="text-[#0f6d8e] text-[10px] font-bold block">PROJECTED ANVAY ID</small>
                <strong className="text-sm font-mono text-[#101828]">{previewId}</strong>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-[#667085]">
              <span>Registration Progress</span>
              <strong className="text-[#0f6d8e]">All Sections Active</strong>
            </div>
            <div className="h-2 w-full bg-[#eef2f6] rounded-full overflow-hidden">
              <div className="h-full bg-[#0f6d8e] rounded-full w-4/5"></div>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[9px] font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Step 01: Role Confirmation */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-extrabold text-xs">
                  01
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#101828]">Account Type</h3>
                  <p className="text-xs text-[#667085]">Patient Healthcare Identity (Hospital Managed)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-[14px] border-2 border-[#0f6d8e] bg-[#f8fbff] flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-extrabold text-xs">
                    P
                  </div>
                  <div>
                    <strong className="text-xs text-[#101828] block">Patient</strong>
                    <span className="text-[11px] text-[#667085]">Personal health identity</span>
                  </div>
                </div>

                <div className="p-4 rounded-[14px] border border-[#e7edf4] bg-white opacity-60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                    DR
                  </div>
                  <div>
                    <strong className="text-xs text-slate-700 block">Doctor</strong>
                    <span className="text-[11px] text-slate-400">Healthcare practitioner</span>
                  </div>
                </div>

                <div className="p-4 rounded-[14px] border border-[#e7edf4] bg-white opacity-60 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs">
                    H
                  </div>
                  <div>
                    <strong className="text-xs text-slate-700 block">Hospital</strong>
                    <span className="text-[11px] text-slate-400">Healthcare institution</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 02: Basic Information */}
            <div className="space-y-4 pt-4 border-t border-[#eef2f6]">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-extrabold text-xs">
                  02
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#101828]">Basic Information</h3>
                  <p className="text-xs text-[#667085]">Provide demographics and verified national identity details.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344054]">First Name *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs text-[#98a2b3] font-bold">Aa</span>
                    <input
                      type="text"
                      required
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      className="w-full h-[48px] pl-10 pr-3 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344054]">Last Name *</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs text-[#98a2b3] font-bold">Aa</span>
                    <input
                      type="text"
                      required
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className="w-full h-[48px] pl-10 pr-3 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344054]">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs text-[#98a2b3] font-bold">@</span>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full h-[48px] pl-10 pr-3 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344054]">Mobile Number</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs text-[#98a2b3] font-bold">+91</span>
                    <input
                      type="tel"
                      name="mobile"
                      maxLength={10}
                      pattern="[0-9]{10}"
                      onInput={e => e.target.value = e.target.value.replace(/\D/g, '')}
                      value={formData.mobile}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full h-[48px] pl-11 pr-3 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344054]">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344054]">
                    Aadhaar / National Health Reference *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3.5 text-xs text-[#98a2b3] font-bold">ID</span>
                    <input
                      type="text"
                      required
                      name="aadhaar"
                      value={formData.aadhaar}
                      onChange={handleChange}
                      onBlur={handleCheckDuplicate}
                      placeholder="12-digit Aadhaar / ABHA token"
                      className="w-full h-[48px] pl-10 pr-3 bg-white border border-[#d0d5dd] rounded-[9px] text-xs font-mono outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                    />
                  </div>
                </div>
              </div>

              {duplicateWarning && (
                <div className="p-3.5 bg-[#fff7ed] border-l-4 border-[#f79009] rounded-r-[8px] text-[#7a2e0e] text-xs space-y-1">
                  <p className="font-bold">Duplicate Identity Reference Detected!</p>
                  <p>
                    This national identity is already registered with <strong>{duplicateWarning.existingPatientName}</strong> ({duplicateWarning.existingAnvayId}) at {duplicateWarning.registeredAtHospital}.
                  </p>
                </div>
              )}
            </div>

            {/* Step 03: Health Profile */}
            <div className="space-y-4 pt-4 border-t border-[#eef2f6]">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-extrabold text-xs">
                  03
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#101828]">Health Profile Baseline</h3>
                  <p className="text-xs text-[#667085]">Add clinical condition and emergency contact information.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344054]">Blood Group</label>
                  <select
                    name="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={handleChange}
                    className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344054]">Known Medical Condition</label>
                  <input
                    type="text"
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    placeholder="Example: Diabetes or Hypertension"
                    className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344054]">Known Allergy</label>
                  <input
                    type="text"
                    name="allergy"
                    value={formData.allergy}
                    onChange={handleChange}
                    placeholder="Example: Penicillin"
                    className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344054]">Current Medication</label>
                  <input
                    type="text"
                    name="medication"
                    value={formData.medication}
                    onChange={handleChange}
                    placeholder="Example: Metformin"
                    className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344054]">Emergency Contact Name</label>
                  <input
                    type="text"
                    name="emergencyName"
                    value={formData.emergencyName}
                    onChange={handleChange}
                    placeholder="Contact person's name"
                    className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-[#344054]">Emergency Contact Number</label>
                  <input
                    type="tel"
                    name="emergencyNumber"
                    maxLength={10}
                    pattern="[0-9]{10}"
                    onInput={e => e.target.value = e.target.value.replace(/\D/g, '')}
                    value={formData.emergencyNumber}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                  />
                </div>
              </div>
            </div>

            {/* Step 04: Profile Photo, Verification & Security */}
            <div className="space-y-4 pt-4 border-t border-[#eef2f6]">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-extrabold text-xs">
                  04
                </span>
                <div>
                  <h3 className="text-base font-bold text-[#101828]">Profile Media & Security</h3>
                  <p className="text-xs text-[#667085]">Upload verified patient identity credentials and configure account security.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs font-semibold">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">Patient Profile Photo *</label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={e => setProfilePhoto(e.target.files[0])}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f0f6fa] file:text-[#0f6d8e] hover:file:bg-[#e7f7fc] cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">Required Identity Document (Aadhaar/PAN/etc) *</label>
                  <input
                    type="file"
                    required
                    accept="image/*,.pdf"
                    onChange={e => setIdDocument(e.target.files[0])}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f0f6fa] file:text-[#0f6d8e] hover:file:bg-[#e7f7fc] cursor-pointer"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#344054]">Create Portal Password *</label>
                  <input
                    type="password"
                    required
                    name="password"
                    minLength={6}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 characters"
                    className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#344054]">Confirm Portal Password *</label>
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    minLength={6}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Verify password"
                    className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce]"
                  />
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-6 border-t border-[#eef2f6] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-left">
                <small className="text-[#0f6d8e] text-[10px] font-bold block uppercase">ANVAY HEALTH ID</small>
                <strong className="text-sm font-mono text-[#101828] block">{previewId}</strong>
                <span className="text-[11px] text-[#98a2b3]">Generated automatically upon submission</span>
              </div>

              <button
                type="submit"
                disabled={loading || !!duplicateWarning}
                className="w-full sm:w-auto px-8 h-[50px] bg-[#0f6d8e] hover:bg-[#0b5874] text-white font-bold rounded-[9px] text-xs shadow-xs transition flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                <span className="font-bold text-sm">→</span>
              </button>
            </div>
          </form>
        </section>
      </main>

      {/* Success Modal */}
      {createdPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-[22px] p-8 text-center space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 rounded-full bg-[#ecfdf3] text-[#067647] flex items-center justify-center text-2xl font-bold mx-auto">
              ✓
            </div>

            <span className="text-[#0f6d8e] text-[11px] font-extrabold tracking-wider uppercase block">
              ACCOUNT CREATED
            </span>

            <h2 className="text-2xl font-extrabold text-[#101828]">
              Welcome to ANVAY
            </h2>

            <p className="text-xs text-[#667085]">
              Your secure healthcare identity has been created successfully.
            </p>

            <div className="p-4 bg-[#f8fbff] border border-[#e7edf4] rounded-[15px] space-y-1">
              <small className="text-[#0f6d8e] text-[10px] font-bold block">YOUR UNIQUE ANVAY ID</small>
              <strong className="text-lg font-mono text-[#101828] block">{createdPatient.anvayId}</strong>
              <span className="text-[10px] text-[#98a2b3]">Keep this ID safe for hospital identification.</span>
            </div>

            <div className="pt-2">
              <button
                onClick={() => navigate(`/clinical-snapshot?anvayId=${createdPatient.anvayId}`)}
                className="w-full h-[48px] bg-[#0f6d8e] hover:bg-[#0b5874] text-white font-bold rounded-[9px] text-xs transition"
              >
                View Patient Snapshot →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
