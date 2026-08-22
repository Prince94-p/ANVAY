import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useLocation } from 'react-router-dom';
import { User, Building2, CheckCircle } from 'lucide-react';

export const RegisterPage = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('patient'); // 'patient' or 'hospital'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null); // { anvayId, isHospital }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('tab') === 'hospital') {
      setActiveTab('hospital');
    }
  }, [location]);

  const [patientData, setPatientData] = useState({
    fullName: '', dateOfBirth: '', gender: 'Male', bloodGroup: 'O+',
    mobile: '', email: '', password: '', govtIdType: 'Aadhaar', govtIdNumber: ''
  });
  const [patientFiles, setPatientFiles] = useState({ profilePhoto: null, idDocument: null });

  const [hospitalData, setHospitalData] = useState({
    name: '', type: 'General Hospital', address: '', district: '', state: '',
    phone: '', email: '', password: '', regNumber: '', representative: ''
  });
  const [hospitalFiles, setHospitalFiles] = useState({ hospitalPhoto: null, verificationDoc1: null, verificationDoc2: null });

  const handlePatientSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    Object.keys(patientData).forEach(key => formData.append(key, patientData[key]));
    if (patientFiles.profilePhoto) formData.append('profilePhoto', patientFiles.profilePhoto);
    if (patientFiles.idDocument) formData.append('idDocument', patientFiles.idDocument);

    try {
      const res = await fetch('/api/auth/register-patient', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setSuccessData({ anvayId: data.anvayId, isHospital: false });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHospitalSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    Object.keys(hospitalData).forEach(key => formData.append(key, hospitalData[key]));
    if (hospitalFiles.hospitalPhoto) formData.append('hospitalPhoto', hospitalFiles.hospitalPhoto);
    if (hospitalFiles.verificationDoc1) formData.append('verificationDoc1', hospitalFiles.verificationDoc1);
    if (hospitalFiles.verificationDoc2) formData.append('verificationDoc2', hospitalFiles.verificationDoc2);

    try {
      const res = await fetch('/api/auth/register-hospital', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success) {
        setSuccessData({ anvayId: data.anvayHospitalId, isHospital: true });
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
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
          </div>

          {successData.isHospital && (
            <p className="text-sm text-[#667085] mb-6">{t('registerPage.pendingVerification')}</p>
          )}

          <Link to="/login" className="inline-block w-full py-3 bg-[#0f6d8e] text-white font-bold rounded-lg hover:bg-[#0b5874] transition">
            Proceed to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-76px)] grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] text-[#101828]">
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
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg font-medium">
              {error}
            </div>
          )}

          {activeTab === 'patient' ? (
            <form onSubmit={handlePatientSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.fullName')} *</label>
                  <input type="text" required value={patientData.fullName} onChange={e => setPatientData({...patientData, fullName: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.dateOfBirth')} *</label>
                  <input type="date" required value={patientData.dateOfBirth} onChange={e => setPatientData({...patientData, dateOfBirth: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.gender')} *</label>
                  <select value={patientData.gender} onChange={e => setPatientData({...patientData, gender: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm bg-white">
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.bloodGroup')} *</label>
                  <select value={patientData.bloodGroup} onChange={e => setPatientData({...patientData, bloodGroup: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm bg-white">
                    <option value="A+">A+</option><option value="A-">A-</option><option value="B+">B+</option><option value="B-">B-</option><option value="AB+">AB+</option><option value="AB-">AB-</option><option value="O+">O+</option><option value="O-">O-</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.mobile')}</label>
                  <input type="tel" value={patientData.mobile} onChange={e => setPatientData({...patientData, mobile: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.email')}</label>
                  <input type="email" value={patientData.email} onChange={e => setPatientData({...patientData, email: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.govtIdType')} *</label>
                  <select value={patientData.govtIdType} onChange={e => setPatientData({...patientData, govtIdType: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm bg-white">
                    <option value="Aadhaar">Aadhaar Card</option><option value="PAN">PAN Card</option><option value="Passport">Passport</option><option value="VoterID">Voter ID</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.govtIdNumber')} *</label>
                  <input type="text" required value={patientData.govtIdNumber} onChange={e => setPatientData({...patientData, govtIdNumber: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" />
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.idDocument')} * <span className="text-gray-400 font-normal">({t('registerPage.idDocumentHint')})</span></label>
                  <input type="file" required accept="image/*,.pdf" onChange={e => setPatientFiles({...patientFiles, idDocument: e.target.files[0]})} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f0f6fa] file:text-[#0f6d8e] hover:file:bg-[#e7f7fc] cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.profilePhoto')} *</label>
                  <input type="file" required accept="image/*" onChange={e => setPatientFiles({...patientFiles, profilePhoto: e.target.files[0]})} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f0f6fa] file:text-[#0f6d8e] hover:file:bg-[#e7f7fc] cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.password')} *</label>
                  <input type="password" required minLength={6} value={patientData.password} onChange={e => setPatientData({...patientData, password: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#0f6d8e] text-white font-bold rounded-lg hover:bg-[#0b5874] transition mt-6">
                {loading ? 'Processing...' : t('registerPage.submit')}
              </button>
            </form>
          ) : (
            <form onSubmit={handleHospitalSubmit} className="space-y-5">
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.hospitalName')} *</label>
                  <input type="text" required value={hospitalData.name} onChange={e => setHospitalData({...hospitalData, name: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.hospitalType')} *</label>
                  <select value={hospitalData.type} onChange={e => setHospitalData({...hospitalData, type: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm bg-white">
                    <option value="General Hospital">General Hospital</option><option value="Specialty Clinic">Specialty Clinic</option><option value="Research Institute">Research Institute</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.address')} *</label>
                  <input type="text" required value={hospitalData.address} onChange={e => setHospitalData({...hospitalData, address: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.state')} *</label>
                  <input type="text" required value={hospitalData.state} onChange={e => setHospitalData({...hospitalData, state: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.district')}</label>
                  <input type="text" value={hospitalData.district} onChange={e => setHospitalData({...hospitalData, district: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.email')} *</label>
                  <input type="email" required value={hospitalData.email} onChange={e => setHospitalData({...hospitalData, email: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.phone')}</label>
                  <input type="tel" value={hospitalData.phone} onChange={e => setHospitalData({...hospitalData, phone: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.regNumber')} *</label>
                  <input type="text" required value={hospitalData.regNumber} onChange={e => setHospitalData({...hospitalData, regNumber: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.representative')}</label>
                  <input type="text" value={hospitalData.representative} onChange={e => setHospitalData({...hospitalData, representative: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" />
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-gray-100 mt-4">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.verificationDoc1')} *</label>
                  <input type="file" required accept="image/*,.pdf" onChange={e => setHospitalFiles({...hospitalFiles, verificationDoc1: e.target.files[0]})} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f0f6fa] file:text-[#0f6d8e] hover:file:bg-[#e7f7fc] cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">{t('registerPage.hospitalPhoto')} *</label>
                  <input type="file" required accept="image/*" onChange={e => setHospitalFiles({...hospitalFiles, hospitalPhoto: e.target.files[0]})} className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f0f6fa] file:text-[#0f6d8e] hover:file:bg-[#e7f7fc] cursor-pointer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1.5">Master Authorization Password *</label>
                  <input type="password" required minLength={6} value={hospitalData.password} onChange={e => setHospitalData({...hospitalData, password: e.target.value})} className="w-full h-11 px-3 border border-[#d0d5dd] rounded-lg text-sm" placeholder="Used to protect staff vault" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full py-3.5 bg-[#0f6d8e] text-white font-bold rounded-lg hover:bg-[#0b5874] transition mt-6">
                {loading ? 'Processing...' : t('registerPage.submitHospital')}
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
