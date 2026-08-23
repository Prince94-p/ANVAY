import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertOctagon, LogOut, Menu, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VerifiedHospitalBadge } from './VerifiedHospitalBadge';
import { EmergencyBreakGlassModal } from './EmergencyBreakGlassModal';

export const Navbar = ({ onToggleSidebar, isPublicPage }) => {
  const { t } = useTranslation();
  const { user, logout, language, changeLanguage, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isHome = location.pathname === '/';

  return (
    <>
      <header className="h-[76px] px-[6%] sm:px-[8%] bg-white/95 backdrop-blur-md border-b border-[#e7edf4] sticky top-0 z-40 flex items-center justify-between">
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-4">
          {!isPublicPage && isAuthenticated && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-lg text-[#344054] hover:bg-[#f8fbff] transition"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="text-[27px] font-extrabold tracking-[2px] text-[#0f5f7d] flex items-center">
            ANV<span className="text-[#20a7ce]">AY</span>
          </Link>
        </div>

        {/* Center / Right: Navigation & Controls */}
        <nav className="flex items-center gap-4 sm:gap-6">
          {/* Public Nav Links (On Home / Landing) */}
          {isHome && (
            <div className="hidden md:flex items-center gap-6 text-[14px] font-medium text-[#344054]">
              <a href="#about" className="hover:text-[#0f6d8e] transition">About</a>
              <a href="#features" className="hover:text-[#0f6d8e] transition">Features</a>
              <a href="#workflow" className="hover:text-[#0f6d8e] transition">How It Works</a>
              <a href="#security" className="hover:text-[#0f6d8e] transition">Security</a>
            </div>
          )}

          {/* Multilingual Selector: EN | हिंदी | മലയാളം */}
          <div className="flex items-center bg-[#f0f6fa] p-1 rounded-xl border border-[#e2eaf1] text-xs font-semibold">
            <button
              onClick={() => changeLanguage('en')}
              className={`px-2.5 py-1 rounded-lg transition ${
                language === 'en'
                  ? 'bg-white text-[#0f5f7d] shadow-xs font-bold'
                  : 'text-[#667085] hover:text-[#0f5f7d]'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => changeLanguage('hi')}
              className={`px-2.5 py-1 rounded-lg transition ${
                language === 'hi'
                  ? 'bg-white text-[#0f5f7d] shadow-xs font-bold'
                  : 'text-[#667085] hover:text-[#0f5f7d]'
              }`}
            >
              हिंदी
            </button>
            <button
              onClick={() => changeLanguage('ml')}
              className={`px-2.5 py-1 rounded-lg transition ${
                language === 'ml'
                  ? 'bg-white text-[#0f5f7d] shadow-xs font-bold'
                  : 'text-[#667085] hover:text-[#0f5f7d]'
              }`}
            >
              മലയാളം
            </button>
          </div>

          {/* Authenticated Dashboard Header Controls */}
          {!isPublicPage && isAuthenticated ? (
            <div className="flex items-center gap-3.5">
              {user?.role !== 'Government Admin' && (
                <button
                  onClick={() => setIsEmergencyModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-[#d92d20] hover:bg-[#b42318] text-white rounded-[9px] text-xs font-bold shadow-xs transition"
                  title="Break-Glass Emergency Patient Lookup"
                >
                  <AlertOctagon className="w-4 h-4 animate-pulse" />
                  <span className="hidden sm:inline">{t('nav.emergencyAccess')}</span>
                  <span className="sm:hidden">Emergency</span>
                </button>
              )}

              <div className="flex items-center gap-3 pl-3 border-l border-[#e7edf4]">
                <div className="text-right hidden sm:block">
                  <div className="flex items-center justify-end gap-1.5">
                    <span className="text-xs font-bold text-[#101828]">{user?.fullName || user?.name}</span>
                    {user?.hospitalId && <VerifiedHospitalBadge status="Approved" size="sm" />}
                  </div>
                  <span className="text-[11px] text-[#667085] font-medium">
                    {user?.hospitalName || user?.role}
                  </span>
                </div>

                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full object-cover border border-[#e2eaf1]" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#0f6d8e] text-white flex items-center justify-center text-xs font-bold border border-[#0b5874]">
                    {(user?.fullName || user?.name || 'U').charAt(0).toUpperCase()}
                  </div>
                )}

                <button
                  onClick={handleLogout}
                  className="p-2 text-[#667085] hover:text-[#d92d20] hover:bg-rose-50 rounded-[9px] transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            /* Public Page Controls */
            <div className="flex items-center gap-2.5">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-[19px] py-[10px] text-[14px] font-bold text-white bg-[#0f6d8e] hover:bg-[#0b5874] rounded-[9px] shadow-xs transition flex items-center gap-1.5"
                >
                  <span>Enter Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="px-[18px] py-[9px] text-[14px] font-bold text-[#0f6d8e] border border-[#0f6d8e] rounded-[9px] hover:bg-[#e7f7fc] transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register-hospital"
                    className="px-[19px] py-[10px] text-[14px] font-bold text-white bg-[#0f6d8e] hover:bg-[#0b5874] rounded-[9px] shadow-xs transition"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          )}
        </nav>
      </header>

      {/* Emergency Modal */}
      <EmergencyBreakGlassModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
      />
    </>
  );
};
