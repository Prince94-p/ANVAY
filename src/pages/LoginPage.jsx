import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock } from 'lucide-react';

export const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('dr_priya');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showTempPassModal, setShowTempPassModal] = useState(false);
  const [newTempPassword, setNewTempPassword] = useState('');
  const [confirmTempPassword, setConfirmTempPassword] = useState('');
  const [tempPassUsername, setTempPassUsername] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      if (res.user.tempPassword) {
        setTempPassUsername(res.user.username);
        setShowTempPassModal(true);
        return;
      }
      if (res.user.role === 'Patient') {
        navigate('/patient-dashboard');
      } else if (res.user.role === 'Government Admin') {
        navigate('/government-dashboard');
      } else if (res.user.role === 'Super Admin') {
        navigate('/super-admin');
      } else if (res.user.role === 'Hospital Admin') {
        navigate('/dashboard');
      } else {
        navigate('/doctor-dashboard');
      }
    } else {
      setError(res.message || 'Invalid credentials. Please verify your account identifier.');
    }
  };

  const handleChangeTempPassword = async (e) => {
    e.preventDefault();
    if (newTempPassword !== confirmTempPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-temp-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: tempPassUsername, newPassword: newTempPassword })
      });
      const data = await res.json();
      if (data.success) {
        setShowTempPassModal(false);
        setError(null);
        alert('Password changed successfully! Please log in with your new password.');
        setIdentifier(tempPassUsername);
        setPassword('');
      } else {
        setError(data.message || 'Error changing password');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] text-[#101828]">
      {/* Left Info Panel */}
      <section className="p-12 lg:p-[75px_10%] flex items-center text-white anvay-gradient-brand">
        <div className="space-y-6">
          <span className="inline-block px-3.5 py-2 bg-white/15 rounded-[25px] text-xs font-semibold">
            {t('loginPage.badge')}
          </span>

          <h1 className="text-3xl sm:text-[48px] font-extrabold leading-tight max-w-[520px]">
            {t('loginPage.title')}
          </h1>

          <p className="max-w-[550px] text-white/85 text-[14px] leading-[1.8]">
            {t('loginPage.subtitle')}
          </p>

          <div className="pt-4 space-y-3.5">
            <div className="flex items-center gap-3 text-[13px]">
              <span className="w-[26px] h-[26px] rounded-full bg-white/15 flex items-center justify-center font-bold text-xs">✓</span>
              <span>{t('loginPage.benefit1')}</span>
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              <span className="w-[26px] h-[26px] rounded-full bg-white/15 flex items-center justify-center font-bold text-xs">✓</span>
              <span>{t('loginPage.benefit2')}</span>
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              <span className="w-[26px] h-[26px] rounded-full bg-white/15 flex items-center justify-center font-bold text-xs">✓</span>
              <span>{t('loginPage.benefit3')}</span>
            </div>
            <div className="flex items-center gap-3 text-[13px]">
              <span className="w-[26px] h-[26px] rounded-full bg-white/15 flex items-center justify-center font-bold text-xs">✓</span>
              <span>{t('loginPage.benefit4')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Right Login Form Section */}
      <section className="p-8 sm:p-12 lg:p-[60px_8%] flex justify-center items-center anvay-gradient-login">
        <div className="w-full max-w-[490px] p-7 sm:p-9 bg-white border border-[#e7edf4] rounded-[20px] shadow-anvay-soft space-y-5">
          <div>
            <p className="text-[#0f6d8e] text-[11px] font-extrabold tracking-[1px] uppercase mb-1">
              {t('loginPage.cardTag')}
            </p>
            <h2 className="text-[28px] sm:text-[31px] font-extrabold text-[#101828]">
              {t('loginPage.cardTitle')}
            </h2>
            <p className="text-[#667085] text-[13px] mt-1">
              {t('loginPage.cardSub')}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[9px] font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[#344054] text-[12px] font-semibold">
                {t('loginPage.identifierLabel')}
              </label>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t('loginPage.identifierPlaceholder')}
                className="w-full h-[50px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-[13px] outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10 transition"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[#344054] text-[12px] font-semibold">
                {t('loginPage.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[50px] pl-3.5 pr-16 bg-white border border-[#d0d5dd] rounded-[9px] text-[13px] outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#0f6d8e] text-[11px] font-bold"
                >
                  {showPassword ? t('loginPage.hide') : t('loginPage.show')}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[50px] bg-[#0f6d8e] hover:bg-[#0b5874] text-white font-bold rounded-[9px] text-[13px] shadow-xs transition"
            >
              {loading ? t('loginPage.loggingIn') : t('loginPage.submitBtn')}
            </button>
          </form>

          {/* Quick Demo Shortcuts */}
          <div className="pt-3 border-t border-[#eef2f6] space-y-2">
            <span className="text-[10px] font-bold text-[#98a2b3] uppercase tracking-wider block text-center">
              {t('loginPage.quickLogins')}
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setIdentifier('aarav_patient');
                  setPassword('password123');
                }}
                className="p-2 rounded-[8px] bg-[#f8fbff] hover:bg-[#e7f7fc] border border-[#e7edf4] text-left transition"
              >
                <span className="font-bold text-[#101828] block">Aarav Kumar (Patient)</span>
                <span className="text-[#667085] text-[10px]">ANVAY-2026-8F29K4</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier('hospadmin_metro');
                  setPassword('password123');
                }}
                className="p-2 rounded-[8px] bg-[#f8fbff] hover:bg-[#e7f7fc] border border-[#e7edf4] text-left transition"
              >
                <span className="font-bold text-[#101828] block">Metro Hospital Admin</span>
                <span className="text-[#667085] text-[10px]">Hospital Staff Vault</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier('dr_priya');
                  setPassword('password123');
                }}
                className="p-2 rounded-[8px] bg-[#f8fbff] hover:bg-[#e7f7fc] border border-[#e7edf4] text-left transition"
              >
                <span className="font-bold text-[#101828] block">Dr. Priya Sharma</span>
                <span className="text-[#667085] text-[10px]">Cardiology (Hospital A)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIdentifier('govtadmin');
                  setPassword('password123');
                }}
                className="p-2 rounded-[8px] bg-[#f8fbff] hover:bg-[#e7f7fc] border border-[#e7edf4] text-left transition"
              >
                <span className="font-bold text-[#101828] block">Health Authority</span>
                <span className="text-[#667085] text-[10px]">Surveillance Analytics</span>
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] text-[#667085] space-y-1">
            <p>
              {t('loginPage.noAccount')}{' '}
              <Link to="/register?tab=patient" className="text-[#0f6d8e] font-bold hover:underline">
                {t('loginPage.registerPatient')}
              </Link>{' '}
              •{' '}
              <Link to="/register?tab=hospital" className="text-[#0f6d8e] font-bold hover:underline">
                {t('loginPage.registerHospital')}
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Temporary Password Change Modal */}
      {showTempPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs text-xs font-semibold">
          <div className="bg-white max-w-md w-full rounded-[22px] p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-[#101828]">
                First-time Password Reset
              </h2>
              <p className="text-xs text-[#667085]">
                You are logging in with a temporary or default password. Please create a new secure password.
              </p>
            </div>

            <form onSubmit={handleChangeTempPassword} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[#344054]">New Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newTempPassword}
                  onChange={(e) => setNewTempPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[#344054]">Confirm New Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmTempPassword}
                  onChange={(e) => setConfirmTempPassword(e.target.value)}
                  placeholder="Verify new password"
                  className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-[48px] bg-[#0f6d8e] hover:bg-[#0b5874] text-white font-bold rounded-[9px] text-xs transition"
              >
                {loading ? 'Updating Password...' : 'Reset Password & Log In'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
