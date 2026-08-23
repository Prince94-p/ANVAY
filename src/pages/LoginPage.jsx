import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock } from 'lucide-react';

export const LoginPage = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(null); // { name, role, dashboardRoute }

  const getDashboardRoute = (role) => {
    if (role === 'Patient') return '/patient-dashboard';
    if (role === 'Government Admin') return '/government-dashboard';
    if (role === 'Super Admin') return '/super-admin';
    if (role === 'Hospital Admin') return '/dashboard';
    return '/doctor-dashboard'; // Doctor default
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await login(identifier, password);
    setLoading(false);

    if (res.success) {
      const route = getDashboardRoute(res.user.role);
      setLoginSuccess({ name: res.user.name, role: res.user.role, dashboardRoute: route });
      // Auto-navigate after short delay
      setTimeout(() => navigate(route), 1800);
    } else {
      setError(res.message || 'Invalid credentials. Please verify your account identifier.');
    }
  };

  return (
    <div className="min-h-[calc(100vh-76px)] grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] text-[#101828] relative">
      <Link to="/" className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full text-xs font-bold transition backdrop-blur-md">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Back to Home
      </Link>
      
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

          {loginSuccess ? (
            <div className="p-5 bg-green-50 border border-green-200 rounded-[14px] text-center space-y-3">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-extrabold text-[#101828] text-lg">Welcome back, {loginSuccess.name}!</h3>
              <p className="text-[#667085] text-xs">Signed in as <strong>{loginSuccess.role}</strong>. Redirecting...</p>
              <button
                onClick={() => navigate(loginSuccess.dashboardRoute)}
                className="w-full h-[46px] bg-[#0f6d8e] hover:bg-[#0b5874] text-white font-bold rounded-[9px] text-sm transition"
              >
                Go to Dashboard →
              </button>
            </div>
          ) : (
            <>
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

          {/* Quick Role Fill Pills */}
          <div className="pt-2 border-t border-[#eef2f6] space-y-2">
            <p className="text-[11px] font-semibold text-[#667085] text-center">Quick Role Login Fill:</p>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => { setIdentifier('superadmin@anvay.health'); setPassword('AnvaySuper@2024!'); }}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium truncate"
              >
                🛡️ Super Admin
              </button>
              <button
                type="button"
                onClick={() => { setIdentifier('govadmin@anvay.health'); setPassword('AnvayGov@2024!'); }}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium truncate"
              >
                🏛️ Gov Admin
              </button>
              <button
                type="button"
                onClick={() => { setIdentifier('hospitaladmin@anvay.health'); setPassword('AnvayHospital@2024!'); }}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium truncate"
              >
                🏥 Hospital Admin
              </button>
              <button
                type="button"
                onClick={() => { setIdentifier('doctor@anvay.health'); setPassword('AnvayDoctor@2024!'); }}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium truncate"
              >
                🩺 Doctor
              </button>
            </div>
          </div>

          <div className="text-center text-[11px] text-[#667085] space-y-2 pt-2">
            <Link to="/" className="inline-flex items-center gap-1.5 text-[#0f6d8e] font-bold hover:underline">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
              Back to Home / Dashboard
            </Link>
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
            </>
          )}
        </div>
      </section>

      {/* Temporary Password Modal Removed */}
    </div>
  );
};
