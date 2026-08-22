import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export const LandingPage = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="space-y-0 text-[#101828]">
      {/* Hero Section */}
      <section className="min-h-[calc(100vh-76px)] px-[6%] sm:px-[8%] py-[70px] grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] items-center gap-[60px] lg:gap-[70px] anvay-gradient-hero">
        <div className="space-y-6">
          <div className="anvay-badge">
            {t('heroBadge')}
          </div>

          <h1 className="text-4xl sm:text-[56px] font-extrabold text-[#101828] leading-[1.08] tracking-tight">
            {t('tagline')}
          </h1>

          <p className="max-w-[670px] text-[#667085] text-[16px] sm:text-[17px] leading-[1.8]">
            {t('heroDescription')}
          </p>

          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            {isAuthenticated ? (
              <Link to="/dashboard" className="anvay-primary-btn">
                {t('enterPortal')} ({user?.role})
              </Link>
            ) : (
              <>
                <Link to="/register-hospital" className="anvay-primary-btn">
                  {t('createAccount')}
                </Link>
                <a href="#workflow" className="anvay-secondary-btn">
                  {t('howItWorks')}
                </a>
              </>
            )}
          </div>
        </div>

        {/* Interactive Live Demo Health Card */}
        <div className="bg-white border border-[#e7edf4] rounded-[22px] p-[27px] shadow-anvay-card">
          <div className="flex justify-between items-start gap-5 mb-5">
            <div>
              <small className="text-[#0f6d8e] text-[10px] font-bold tracking-wider block">
                {t('demoHealthProfile.tag')}
              </small>
              <h3 className="text-[17px] font-bold text-[#101828] mt-1">
                {t('demoHealthProfile.title')}
              </h3>
            </div>
            <span className="h-fit px-2.5 py-1 bg-[#ecfdf3] text-[#067647] rounded-[20px] text-[10px] font-bold flex items-center gap-1">
              ✓ {t('demoHealthProfile.secure')}
            </span>
          </div>

          <div className="flex items-center gap-3.5 py-4 border-t border-b border-[#eef2f6]">
            <div className="w-[46px] h-[46px] rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-extrabold text-[15px]">
              RS
            </div>
            <div>
              <h4 className="text-[15px] font-bold text-[#101828]">
                {t('demoHealthProfile.name')}
              </h4>
              <p className="text-[11px] text-[#667085] font-mono mt-0.5">
                {t('demoHealthProfile.id')}
              </p>
            </div>
            <span className="ml-auto px-2.5 py-1 bg-[#ecfdf3] text-[#067647] rounded-[20px] text-[10px] font-bold">
              {t('demoHealthProfile.verified')}
            </span>
          </div>

          <div className="divide-y divide-[#eef2f6] text-[13px]">
            <div className="py-3 flex justify-between">
              <span className="text-[#667085]">{t('demoHealthProfile.bloodGroup')}</span>
              <strong className="text-[#101828] font-bold">B+</strong>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-[#667085]">{t('demoHealthProfile.condition')}</span>
              <strong className="text-[#101828] font-bold">Diabetes Type II</strong>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-[#667085]">{t('demoHealthProfile.allergy')}</span>
              <strong className="text-[#d92d20] font-bold">Penicillin</strong>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-[#667085]">{t('demoHealthProfile.medication')}</span>
              <strong className="text-[#101828] font-bold">Metformin 500mg</strong>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-[#667085]">{t('demoHealthProfile.emergencyContact')}</span>
              <strong className="text-[#067647] font-bold">{t('demoHealthProfile.available')}</strong>
            </div>
          </div>

          <div className="mt-4 p-3 bg-[#fff7ed] border-l-4 border-[#f79009] rounded-r-[8px] text-[#7a2e0e] text-[11px] leading-[1.6]">
            {t('demoHealthProfile.warning')}
          </div>
        </div>
      </section>

      {/* Problem & Approach Section */}
      <section className="px-[6%] sm:px-[8%] py-[85px] bg-white">
        <div className="max-w-[750px] mx-auto mb-[50px] text-center space-y-2">
          <p className="anvay-section-tag">{t('problemSection.tag')}</p>
          <h2 className="text-3xl sm:text-[38px] font-extrabold text-[#101828]">
            {t('problemSection.heading')}
          </h2>
          <p className="text-[#667085] text-[14px] leading-[1.7]">
            {t('problemSection.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-[25px]">
          <div className="p-7 bg-[#fbfdff] border border-[#e7edf4] rounded-[16px] space-y-3">
            <span className="text-[#20a7ce] font-extrabold text-sm">01</span>
            <h3 className="text-lg font-bold text-[#101828]">{t('problemSection.problem01Title')}</h3>
            <p className="text-[#667085] text-[13px] leading-[1.7]">
              {t('problemSection.problem01Text')}
            </p>
          </div>

          <div className="p-7 bg-[#fbfdff] border border-[#e7edf4] rounded-[16px] space-y-3">
            <span className="text-[#20a7ce] font-extrabold text-sm">02</span>
            <h3 className="text-lg font-bold text-[#101828]">{t('problemSection.approach02Title')}</h3>
            <p className="text-[#667085] text-[13px] leading-[1.7]">
              {t('problemSection.approach02Text')}
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="px-[6%] sm:px-[8%] py-[85px] bg-[#f8fbff]">
        <div className="max-w-[750px] mx-auto mb-[50px] text-center space-y-2">
          <p className="anvay-section-tag">{t('featuresSection.tag')}</p>
          <h2 className="text-3xl sm:text-[38px] font-extrabold text-[#101828]">
            {t('featuresSection.heading')}
          </h2>
          <p className="text-[#667085] text-[14px] leading-[1.7]">
            {t('featuresSection.description')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[22px]">
          <div className="p-7 bg-white border border-[#e7edf4] rounded-[16px] hover:-translate-y-1 hover:shadow-anvay-hover transition-all duration-200">
            <div className="w-fit min-w-[48px] h-[48px] px-3 bg-[#eaf8fc] text-[#0f6d8e] rounded-[11px] font-extrabold text-xs flex items-center justify-center mb-4">
              ID
            </div>
            <h3 className="text-base font-bold text-[#101828] mb-2">{t('featuresSection.card1Title')}</h3>
            <p className="text-[#667085] text-[13px] leading-[1.7]">
              {t('featuresSection.card1Desc')}
            </p>
          </div>

          <div className="p-7 bg-white border border-[#e7edf4] rounded-[16px] hover:-translate-y-1 hover:shadow-anvay-hover transition-all duration-200">
            <div className="w-fit min-w-[48px] h-[48px] px-3 bg-[#eaf8fc] text-[#0f6d8e] rounded-[11px] font-extrabold text-xs flex items-center justify-center mb-4">
              +
            </div>
            <h3 className="text-base font-bold text-[#101828] mb-2">{t('featuresSection.card2Title')}</h3>
            <p className="text-[#667085] text-[13px] leading-[1.7]">
              {t('featuresSection.card2Desc')}
            </p>
          </div>

          <div className="p-7 bg-white border border-[#e7edf4] rounded-[16px] hover:-translate-y-1 hover:shadow-anvay-hover transition-all duration-200">
            <div className="w-fit min-w-[48px] h-[48px] px-3 bg-[#eaf8fc] text-[#0f6d8e] rounded-[11px] font-extrabold text-xs flex items-center justify-center mb-4">
              DR
            </div>
            <h3 className="text-base font-bold text-[#101828] mb-2">{t('featuresSection.card3Title')}</h3>
            <p className="text-[#667085] text-[13px] leading-[1.7]">
              {t('featuresSection.card3Desc')}
            </p>
          </div>

          <div className="p-7 bg-white border border-[#e7edf4] rounded-[16px] hover:-translate-y-1 hover:shadow-anvay-hover transition-all duration-200">
            <div className="w-fit min-w-[48px] h-[48px] px-3 bg-[#eaf8fc] text-[#0f6d8e] rounded-[11px] font-extrabold text-xs flex items-center justify-center mb-4">
              H
            </div>
            <h3 className="text-base font-bold text-[#101828] mb-2">{t('featuresSection.card4Title')}</h3>
            <p className="text-[#667085] text-[13px] leading-[1.7]">
              {t('featuresSection.card4Desc')}
            </p>
          </div>

          <div className="p-7 bg-white border border-[#e7edf4] rounded-[16px] hover:-translate-y-1 hover:shadow-anvay-hover transition-all duration-200">
            <div className="w-fit min-w-[48px] h-[48px] px-3 bg-[#eaf8fc] text-[#0f6d8e] rounded-[11px] font-extrabold text-xs flex items-center justify-center mb-4">
              E
            </div>
            <h3 className="text-base font-bold text-[#101828] mb-2">{t('featuresSection.card5Title')}</h3>
            <p className="text-[#667085] text-[13px] leading-[1.7]">
              {t('featuresSection.card5Desc')}
            </p>
          </div>

          <div className="p-7 bg-white border border-[#e7edf4] rounded-[16px] hover:-translate-y-1 hover:shadow-anvay-hover transition-all duration-200">
            <div className="w-fit min-w-[48px] h-[48px] px-3 bg-[#eaf8fc] text-[#0f6d8e] rounded-[11px] font-extrabold text-xs flex items-center justify-center mb-4">
              LOG
            </div>
            <h3 className="text-base font-bold text-[#101828] mb-2">{t('featuresSection.card6Title')}</h3>
            <p className="text-[#667085] text-[13px] leading-[1.7]">
              {t('featuresSection.card6Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* How It Works (Workflow Section) */}
      <section id="workflow" className="px-[6%] sm:px-[8%] py-[85px] bg-[#eef9fc]">
        <div className="max-w-[750px] mx-auto mb-[50px] text-center space-y-2">
          <p className="anvay-section-tag">{t('workflowSection.tag')}</p>
          <h2 className="text-3xl sm:text-[38px] font-extrabold text-[#101828]">
            {t('workflowSection.heading')}
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-3 max-w-5xl mx-auto">
          <div className="w-full md:w-[210px] p-6 bg-white rounded-[15px] text-center shadow-xs space-y-2">
            <span className="w-[38px] h-[38px] mx-auto bg-[#0f6d8e] text-white rounded-full flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h3 className="text-sm font-bold text-[#101828]">{t('workflowSection.step1Title')}</h3>
            <p className="text-[#667085] text-[11px] leading-[1.6]">
              {t('workflowSection.step1Desc')}
            </p>
          </div>

          <div className="text-[#20a7ce] font-bold text-2xl hidden md:block">→</div>

          <div className="w-full md:w-[210px] p-6 bg-white rounded-[15px] text-center shadow-xs space-y-2">
            <span className="w-[38px] h-[38px] mx-auto bg-[#0f6d8e] text-white rounded-full flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h3 className="text-sm font-bold text-[#101828]">{t('workflowSection.step2Title')}</h3>
            <p className="text-[#667085] text-[11px] leading-[1.6]">
              {t('workflowSection.step2Desc')}
            </p>
          </div>

          <div className="text-[#20a7ce] font-bold text-2xl hidden md:block">→</div>

          <div className="w-full md:w-[210px] p-6 bg-white rounded-[15px] text-center shadow-xs space-y-2">
            <span className="w-[38px] h-[38px] mx-auto bg-[#0f6d8e] text-white rounded-full flex items-center justify-center font-bold text-xs">
              3
            </span>
            <h3 className="text-sm font-bold text-[#101828]">{t('workflowSection.step3Title')}</h3>
            <p className="text-[#667085] text-[11px] leading-[1.6]">
              {t('workflowSection.step3Desc')}
            </p>
          </div>

          <div className="text-[#20a7ce] font-bold text-2xl hidden md:block">→</div>

          <div className="w-full md:w-[210px] p-6 bg-white rounded-[15px] text-center shadow-xs space-y-2">
            <span className="w-[38px] h-[38px] mx-auto bg-[#0f6d8e] text-white rounded-full flex items-center justify-center font-bold text-xs">
              4
            </span>
            <h3 className="text-sm font-bold text-[#101828]">{t('workflowSection.step4Title')}</h3>
            <p className="text-[#667085] text-[11px] leading-[1.6]">
              {t('workflowSection.step4Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="px-[6%] sm:px-[8%] py-[85px] bg-white">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-[60px] items-center max-w-6xl mx-auto">
          <div className="space-y-4">
            <p className="anvay-section-tag">{t('securitySection.tag')}</p>
            <h2 className="text-3xl sm:text-[40px] font-extrabold text-[#101828] leading-[1.15]">
              {t('securitySection.heading')}
            </h2>
            <p className="text-[#667085] leading-[1.8] text-[14px]">
              {t('securitySection.description')}
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-[#475467] text-[13px]">
                <span className="w-[25px] h-[25px] rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-bold text-xs">✓</span>
                <span>{t('securitySection.item1')}</span>
              </div>
              <div className="flex items-center gap-3 text-[#475467] text-[13px]">
                <span className="w-[25px] h-[25px] rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-bold text-xs">✓</span>
                <span>{t('securitySection.item2')}</span>
              </div>
              <div className="flex items-center gap-3 text-[#475467] text-[13px]">
                <span className="w-[25px] h-[25px] rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-bold text-xs">✓</span>
                <span>{t('securitySection.item3')}</span>
              </div>
              <div className="flex items-center gap-3 text-[#475467] text-[13px]">
                <span className="w-[25px] h-[25px] rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-bold text-xs">✓</span>
                <span>{t('securitySection.item4')}</span>
              </div>
            </div>
          </div>

          <div className="p-8 bg-[#101828] text-white rounded-[20px] shadow-anvay-card space-y-4">
            <p className="text-[#7dd3ed] text-[11px] font-bold tracking-wider">
              {t('securitySection.overviewTag')}
            </p>

            <div className="divide-y divide-[#344054] text-xs">
              <div className="py-3 flex justify-between text-[#98a2b3]">
                <span>{t('securitySection.auth')}</span>
                <strong className="text-white font-bold">{t('securitySection.authRequired')}</strong>
              </div>
              <div className="py-3 flex justify-between text-[#98a2b3]">
                <span>{t('securitySection.access')}</span>
                <strong className="text-white font-bold">{t('securitySection.accessRole')}</strong>
              </div>
              <div className="py-3 flex justify-between text-[#98a2b3]">
                <span>{t('securitySection.inst')}</span>
                <strong className="text-white font-bold">{t('securitySection.instVer')}</strong>
              </div>
              <div className="py-3 flex justify-between text-[#98a2b3]">
                <span>{t('securitySection.emgData')}</span>
                <strong className="text-white font-bold">{t('securitySection.emgLimit')}</strong>
              </div>
              <div className="py-3 flex justify-between text-[#98a2b3]">
                <span>{t('securitySection.audit')}</span>
                <strong className="text-white font-bold">{t('securitySection.auditEnabled')}</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Join CTA Section */}
      <section className="px-[6%] sm:px-[8%] py-[40px]">
        <div className="p-[55px_30px] anvay-gradient-brand text-white rounded-[25px] text-center max-w-5xl mx-auto space-y-4 shadow-anvay-card">
          <h2 className="text-3xl sm:text-[34px] font-extrabold leading-tight">
            {t('joinSection.heading')}
          </h2>
          <p className="text-white/90 text-sm max-w-md mx-auto">
            {t('joinSection.subheading')}
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <Link
              to="/register-hospital"
              className="px-6 py-3 bg-white text-[#0f6d8e] rounded-[9px] font-bold text-sm hover:bg-slate-50 transition"
            >
              {t('joinSection.registerBtn')}
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 bg-transparent text-white border border-white/70 rounded-[9px] font-bold text-sm hover:bg-white/10 transition"
            >
              {t('joinSection.loginBtn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 px-[6%] sm:px-[8%] py-8 bg-[#101828] text-[#98a2b3] flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
        <strong className="text-white tracking-[2px] text-sm">{t('footer.brand')}</strong>
        <p>{t('footer.team')}</p>
      </footer>
    </div>
  );
};
