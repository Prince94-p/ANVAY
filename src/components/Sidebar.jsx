import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  UserPlus,
  Activity,
  History,
  FilePlus,
  Upload,
  CheckCircle2,
  Users,
  Building2,
  Landmark,
  Shield,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const role = user?.role || 'Doctor';

  let navItems = [];

  if (role === 'Doctor') {
    navItems = [
      { to: '/doctor-dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
      { to: '/patient-search', label: t('nav.searchPatient'), icon: Search },
      { to: '/create-patient', label: t('nav.createPatient'), icon: UserPlus },
      { to: '/clinical-snapshot', label: t('nav.clinicalSnapshot'), icon: Activity },
      { to: '/medical-history', label: t('nav.medicalHistory'), icon: History },
      { to: '/add-record', label: t('nav.addRecord'), icon: FilePlus },
      { to: '/upload-document', label: t('nav.uploadDocument'), icon: Upload },
      { to: '/missing-records', label: t('nav.missingRecords'), icon: CheckCircle2 },
      { to: '/doctors', label: t('nav.doctors'), icon: Users },
      { to: '/hospital-profile', label: t('nav.hospitalProfile'), icon: Building2 }
    ];
  } else if (role === 'Hospital Admin') {
    navItems = [
      { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
      { to: '/patient-search', label: t('nav.searchPatient'), icon: Search },
      { to: '/create-patient', label: t('nav.createPatient'), icon: UserPlus },
      { to: '/missing-records', label: t('nav.missingRecords'), icon: CheckCircle2 },
      { to: '/doctors', label: t('nav.doctors'), icon: Users },
      { to: '/verification-status', label: t('nav.hospitalVerification'), icon: ShieldCheck },
      { to: '/hospital-profile', label: t('nav.hospitalProfile'), icon: Building2 },
      { to: '/audit-logs', label: t('nav.auditLogs'), icon: FileCheck }
    ];
  } else if (role === 'Government Admin') {
    navItems = [
      { to: '/government-dashboard', label: t('nav.governmentDashboard'), icon: Landmark },
      { to: '/disease-analytics', label: t('nav.diseaseAnalytics'), icon: Activity },
      { to: '/hospital-profile', label: 'Surveillance Network', icon: Building2 }
    ];
  } else if (role === 'Super Admin') {
    navItems = [
      { to: '/super-admin', label: t('nav.superAdminDashboard'), icon: Shield },
      { to: '/hospital-verifications', label: t('nav.hospitalVerification'), icon: ShieldCheck },
      { to: '/doctors', label: t('nav.doctorVerification'), icon: Users },
      { to: '/government-dashboard', label: t('nav.governmentDashboard'), icon: Landmark },
      { to: '/patient-search', label: t('nav.searchPatient'), icon: Search },
      { to: '/audit-logs', label: t('nav.auditLogs'), icon: FileCheck }
    ];
  }

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-[#101828]/50 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-[76px] bottom-0 left-0 z-30 w-64 bg-white border-r border-[#e7edf4] transition-transform duration-200 ease-in-out lg:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          {/* User Role Card */}
          <div className="p-3.5 bg-[#f8fbff] border border-[#e7edf4] rounded-[15px]">
            <span className="text-[10px] font-extrabold text-[#0f6d8e] uppercase tracking-wider block">
              {t('nav.portalAccess') || 'PORTAL ACCESS'}
            </span>
            <p className="text-xs font-bold text-[#101828] mt-0.5">{role}</p>
            {user?.hospitalName && (
              <p className="text-[11px] text-[#20a7ce] font-semibold truncate mt-0.5">
                {user.hospitalName}
              </p>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-xs font-semibold transition ${
                      isActive
                        ? 'bg-[#0f6d8e] text-white shadow-xs'
                        : 'text-[#475467] hover:bg-[#f8fbff] hover:text-[#0f6d8e]'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};
