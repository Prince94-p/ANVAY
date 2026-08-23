import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Building2, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, functions, storage, db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { signInWithCustomToken, signInWithEmailAndPassword } from 'firebase/auth';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

function validateImage(file) {
  if (!file) return null;
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) return 'Only JPG, PNG, or WebP images are allowed.';
  if (file.size > MAX_IMAGE_SIZE) return 'Image must be smaller than 5 MB.';
  return null;
}

export const RegisterPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('patient');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'hospital') setActiveTab('hospital');
  }, [location]);

  const [patientData, setPatientData] = useState({
    fullName: '', dateOfBirth: '', gender: 'Male', bloodGroup: 'O+',
    mobile: '', email: '', password: '', username: '',
    govtIdType: 'Aadhaar', govtIdNumber: ''
  });
  const [patientPhoto, setPatientPhoto] = useState(null);
  const [patientPhotoError, setPatientPhotoError] = useState(null);

  const [hospitalData, setHospitalData] = useState({
    hospitalName: '', type: 'General Hospital', address: '', district: '', state: '',
    phone: '', email: '', password: '', username: '', regNumber: '', representative: ''
  });
  const [hospitalPhoto, setHospitalPhoto] = useState(null);
  const [hospitalPhotoError, setHospitalPhotoError] = useState(null);

  const handlePatientPhotoChange = (e) => {
    const file = e.target.files[0];
    const err = validateImage(file);
    setPatientPhotoError(err);
    if (!err) setPatientPhoto(file);
  };

  const handleHospitalPhotoChange = (e) => {
    const file = e.target.files[0];
    const err = validateImage(file);
    setHospitalPhotoError(err);
    if (!err) setHospitalPhoto(file);
  };

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    if (patientPhotoError) return;
    setLoading(true);
    setError(null);

    try {
      // Call Cloud Function — atomically creates user with unique username + ANVAY ID
      const registerPatient = httpsCallable(functions, 'registerPatient');
      const result = await registerPatient({
        email: patientData.email,
        password: patientData.password,
        username: patientData.username,
        fullName: patientData.fullName,
        dateOfBirth: patientData.dateOfBirth,
        gender: patientData.gender,
        bloodGroup: patientData.bloodGroup,
        mobile: patientData.mobile,
        govtIdType: patientData.govtIdType,
        govtIdNumber: patientData.govtIdNumber,
      });

      const { uid, anvayId } = result.data;

      // Upload profile photo if provided (after account created)
      if (patientPhoto && uid) {
        try {
          const photoRef = ref(storage, `users/${uid}/profile.jpg`);
          await uploadBytes(photoRef, patientPhoto);
          const photoURL = await getDownloadURL(photoRef);
          await updateDoc(doc(db, 'users', uid), { photoURL });
        } catch (photoErr) {
          console.warn('Photo upload failed (account still created):', photoErr);
        }
      }

      setSuccessData({ anvayId, isHospital: false });
    } catch (err) {
      console.error(err);
      const code = err.code || '';
      if (code.includes('already-exists')) {
        setError('That username is already taken. Please choose a different one.');
      } else {
        setError(err.message || 'Registration failed. Please check your details and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    if (hospitalPhotoError) return;
    setLoading(true);
    setError(null);

    try {
      const registerHospital = httpsCallable(functions, 'registerHospital');
      const result = await registerHospital({
        email: hospitalData.email,
        password: hospitalData.password,
        username: hospitalData.username,
        hospitalName: hospitalData.hospitalName,
        type: hospitalData.type,
        address: hospitalData.address,
        district: hospitalData.district,
        state: hospitalData.state,
        phone: hospitalData.phone,
        regNumber: hospitalData.regNumber,
        representative: hospitalData.representative,
      });

      const { uid, anvayId, hospitalId } = result.data;

      // Upload hospital photo if provided
      if (hospitalPhoto && uid) {
        try {
          const photoRef = ref(storage, `users/${uid}/profile.jpg`);
          await uploadBytes(photoRef, hospitalPhoto);
          const photoURL = await getDownloadURL(photoRef);
          await updateDoc(doc(db, 'users', uid), { photoURL });
        } catch (photoErr) {
          console.warn('Photo upload failed (account still created):', photoErr);
        }
      }

      setSuccessData({ anvayId, isHospital: true });
    } catch (err) {
      console.error(err);
      const code = err.code || '';
      if (code.includes('already-exists')) {
        setError('That username is already taken. Please choose a different username.');
      } else if (code.includes('email-already-exists') || err.message?.includes('email-already-exists')) {
        setError('An account with that email already exists.');
      } else {
        setError(err.message || 'Hospital registration failed. Please check your details.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="min-h-[calc(100vh-76px)] flex justify-center items-center p-6 bg-[#f8fbff]">
        <div className="bg-white p-8 rounded-[20px] shadow-anvay-soft text-center max-w-md w-full border border-[#e7edf4]">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#101828] mb-2">
            {successData.isHospital ? t('registerPage.hospitalSuccess') : t('registerPage.patientSuccess')}
          </h2>

          <div className="bg-[#f0f6fa] p-4 rounded-lg my-6">
            <p className="text-xs font-bold text-[#667085] uppercase tracking-wider mb-1">
              {successData.isHospital ? t('registerPage.yourHospitalId') : t('registerPage.yourAnvayId')}
            </p>
            <p className="text-2xl font-mono font-bold text-[#0f6d8e]">{successData.anvayId}</p>
            <p className="text-xs text-[#667085] mt-2">Save this ID — you can use it to log in.</p>
          </div>

          {successData.isHospital && (
            <p className="text-sm text-[#667085] mb-6">{t('registerPage.pendingVerification')}</p>
          )}

          <div className="space-y-3">
            {!successData.isHospital && (
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 bg-[#0f6d8e] text-white font-bold rounded-lg hover:bg-[#0b5874] transition flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-4 h-4" />
                Proceed to Login
              </button>
            )}
            <Link
              to="/login"
              className="block w-full py-3 border border-[#0f6d8e] text-[#0f6d8e] font-bold rounded-lg hover:bg-[#f0f6fa] transition text-center"
            >
              {successData.isHospital ? 'Proceed to Login' : 'Sign in with your new account'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputClass = "w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm focus:outline-none focus:border-[#20a7ce] focus:ring-2 focus:ring-[#20a7ce]/10 transition";

  return (
    <div className="min-h-[calc(100vh-76px)] grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] text-[#101828] relative">
      <Link to="/" className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-xs font-bold transition backdrop-blur-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Back to Home
      </Link>

      {/* Left Info Panel */}
      <section className="hidden lg:flex p-12 flex-col justify-center text-white anvay-gradient-brand">
        <span className="inline-block px-3.5 py-2 bg-white/15 rounded-[25px] text-xs font-semibold w-max mb-6">
          {t('registerPage.badge')}
        </span>
        <h1 className="text-[42px] font-extrabold leading-tight mb-4">
          {t('registerPage.title')}
        </h1>
        <p className="text-white/85 text-[15px] leading-relaxed max-w-md">
          {t('registerPage.subtitle')}
        </p>
      </section>

      {/* Right Form Section */}
      <section className="p-6 sm:p-10 lg:p-12 flex justify-center bg-white overflow-y-auto">
        <div className="w-full max-w-2xl">
          <div className="flex justify-between items-center mb-6">
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0f6d8e] hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Back to Home / Dashboard
            </Link>
            <Link to="/login" className="text-xs font-bold text-slate-600 hover:text-[#0f6d8e]">
              Already registered? <span className="text-[#0f6d8e] underline">Login</span>
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex bg-[#f0f6fa] p-1 rounded-xl mb-8">
            <button
              type="button"
              onClick={() => { setActiveTab('patient'); setError(null); }}
              className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition ${
                activeTab === 'patient' ? 'bg-white text-[#0f6d8e] shadow-sm' : 'text-[#667085] hover:text-[#0f6d8e]'
              }`}
            >
              <User className="w-4 h-4" /> {t('registerPage.tabPatient')}
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('hospital'); setError(null); }}
              className={`flex-1 py-3 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition ${
                activeTab === 'hospital' ? 'bg-white text-[#0f6d8e] shadow-sm' : 'text-[#667085] hover:text-[#0f6d8e]'
              }`}
            >
              <Building2 className="w-4 h-4" /> {t('registerPage.tabHospital')}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {activeTab === 'patient' ? (
            <form onSubmit={handlePatientSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.fullName')} *</label>
                  <input type="text" required value={patientData.fullName} onChange={e => setPatientData({...patientData, fullName: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">Username * <span className="text-gray-400 font-normal">(used to log in)</span></label>
                  <input type="text" required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" title="Letters, numbers and underscores only" value={patientData.username} onChange={e => setPatientData({...patientData, username: e.target.value})} placeholder="e.g. john_doe" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.dateOfBirth')} *</label>
                  <input type="date" required value={patientData.dateOfBirth} onChange={e => setPatientData({...patientData, dateOfBirth: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.gender')} *</label>
                  <select value={patientData.gender} onChange={e => setPatientData({...patientData, gender: e.target.value})} className={`${inputClass} bg-white`}>
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.bloodGroup')} *</label>
                  <select value={patientData.bloodGroup} onChange={e => setPatientData({...patientData, bloodGroup: e.target.value})} className={`${inputClass} bg-white`}>
                    <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option><option>O+</option><option>O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.mobile')}</label>
                  <input type="tel" value={patientData.mobile} maxLength={10} pattern="[0-9]{10}" onInput={e => e.target.value = e.target.value.replace(/\D/g, '')} onChange={e => setPatientData({...patientData, mobile: e.target.value})} placeholder="10-digit mobile number" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.email')}</label>
                  <input type="email" required value={patientData.email} onChange={e => setPatientData({...patientData, email: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.govtIdType')} *</label>
                  <select value={patientData.govtIdType} onChange={e => setPatientData({...patientData, govtIdType: e.target.value})} className={`${inputClass} bg-white`}>
                    <option value="Aadhaar">Aadhaar Card</option><option value="PAN">PAN Card</option><option value="Passport">Passport</option><option value="VoterID">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.govtIdNumber')} *</label>
                  <input type="text" required value={patientData.govtIdNumber} onChange={e => setPatientData({...patientData, govtIdNumber: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.password')} * <span className="text-gray-400 font-normal">(min 6 chars)</span></label>
                  <input type="password" required minLength={6} value={patientData.password} onChange={e => setPatientData({...patientData, password: e.target.value})} className={inputClass} />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.profilePhoto')} <span className="text-gray-400 font-normal">(JPG/PNG/WebP, max 5MB)</span></label>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePatientPhotoChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f0f6fa] file:text-[#0f6d8e] hover:file:bg-[#e7f7fc] cursor-pointer" />
                  {patientPhotoError && <p className="text-red-600 text-xs mt-1">{patientPhotoError}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.idDocument')} * <span className="text-gray-400 font-normal">(JPG/PNG/WebP or PDF)</span></label>
                  <input type="file" required accept="image/*,.pdf" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f0f6fa] file:text-[#0f6d8e] hover:file:bg-[#e7f7fc] cursor-pointer" />
                </div>
              </div>

              <button type="submit" disabled={loading || !!patientPhotoError} className="w-full py-3.5 bg-[#0f6d8e] text-white font-bold rounded-lg hover:bg-[#0b5874] transition mt-6 disabled:opacity-50">
                {loading ? 'Creating your account...' : t('registerPage.submit')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleHospitalSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.hospitalName')} *</label>
                  <input type="text" required value={hospitalData.hospitalName} onChange={e => setHospitalData({...hospitalData, hospitalName: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">Admin Username * <span className="text-gray-400 font-normal">(used to log in)</span></label>
                  <input type="text" required minLength={3} maxLength={30} pattern="[a-zA-Z0-9_]+" title="Letters, numbers and underscores only" value={hospitalData.username} onChange={e => setHospitalData({...hospitalData, username: e.target.value})} placeholder="e.g. cityhospital_admin" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.hospitalType')} *</label>
                  <select value={hospitalData.type} onChange={e => setHospitalData({...hospitalData, type: e.target.value})} className={`${inputClass} bg-white`}>
                    <option value="General Hospital">General Hospital</option><option value="Specialty Clinic">Specialty Clinic</option><option value="Research Institute">Research Institute</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.regNumber')} *</label>
                  <input type="text" required value={hospitalData.regNumber} onChange={e => setHospitalData({...hospitalData, regNumber: e.target.value})} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.address')} *</label>
                  <input type="text" required value={hospitalData.address} onChange={e => setHospitalData({...hospitalData, address: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.state')} *</label>
                  <input type="text" required value={hospitalData.state} onChange={e => setHospitalData({...hospitalData, state: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.district')}</label>
                  <input type="text" value={hospitalData.district} onChange={e => setHospitalData({...hospitalData, district: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.email')} *</label>
                  <input type="email" required value={hospitalData.email} onChange={e => setHospitalData({...hospitalData, email: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.phone')}</label>
                  <input type="tel" value={hospitalData.phone} maxLength={10} pattern="[0-9]{10}" onInput={e => e.target.value = e.target.value.replace(/\D/g, '')} onChange={e => setHospitalData({...hospitalData, phone: e.target.value})} placeholder="10-digit phone number" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.representative')}</label>
                  <input type="text" value={hospitalData.representative} onChange={e => setHospitalData({...hospitalData, representative: e.target.value})} className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">Account Password * <span className="text-gray-400 font-normal">(min 6 chars)</span></label>
                  <input type="password" required minLength={6} value={hospitalData.password} onChange={e => setHospitalData({...hospitalData, password: e.target.value})} className={inputClass} />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-gray-100 mt-4">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.hospitalPhoto')} <span className="text-gray-400 font-normal">(JPG/PNG/WebP, max 5MB)</span></label>
                  <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleHospitalPhotoChange} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f0f6fa] file:text-[#0f6d8e] hover:file:bg-[#e7f7fc] cursor-pointer" />
                  {hospitalPhotoError && <p className="text-red-600 text-xs mt-1">{hospitalPhotoError}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.verificationDoc1')} * <span className="text-gray-400 font-normal">(Hospital Registration Certificate)</span></label>
                  <input type="file" required accept="image/*,.pdf" className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f0f6fa] file:text-[#0f6d8e] hover:file:bg-[#e7f7fc] cursor-pointer" />
                </div>
              </div>

              <button type="submit" disabled={loading || !!hospitalPhotoError} className="w-full py-3.5 bg-[#0f6d8e] text-white font-bold rounded-lg hover:bg-[#0b5874] transition mt-6 disabled:opacity-50">
                {loading ? 'Registering Hospital...' : t('registerPage.submitHospital')}
              </button>
            </form>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm font-bold text-[#0f6d8e] hover:underline">
              {t('registerPage.loginNow')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
