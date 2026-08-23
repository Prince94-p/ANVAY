import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, Check, User, Building2, Stethoscope, Landmark, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const FloatingDemoSwitcher = () => {
  const { user, switchDemoPersona } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [switching, setSwitching] = useState(null);
  const [switchError, setSwitchError] = useState(null);
  const navigate = useNavigate();

  const personas = [
    {
      username: 'aarav_patient',
      name: 'Aarav Kumar (Patient)',
      role: 'Patient',
      institution: 'ANVAY-2026-8F29K4',
      icon: User,
      targetRoute: '/patient-dashboard',
      color: 'bg-emerald-50 text-emerald-700'
    },
    {
      username: 'dr_priya',
      name: 'Dr. Priya Sharma',
      role: 'Doctor',
      institution: 'Metro Super Specialty (Delhi)',
      icon: Stethoscope,
      targetRoute: '/doctor-dashboard',
      color: 'bg-teal-50 text-[#0f6d8e]'
    },
    {
      username: 'dr_anita',
      name: 'Dr. Anita Varma',
      role: 'Doctor',
      institution: 'Apex Care Institute (Mumbai)',
      icon: Stethoscope,
      targetRoute: '/doctor-dashboard',
      color: 'bg-cyan-50 text-[#20a7ce]'
    },
    {
      username: 'dr_rajesh',
      name: 'Dr. Rajesh Nair',
      role: 'Doctor',
      institution: 'Kerala Medical Trust (Kochi)',
      icon: Stethoscope,
      targetRoute: '/doctor-dashboard',
      color: 'bg-sky-50 text-[#0b5874]'
    },
    {
      username: 'hospadmin_metro',
      name: 'Metro Hospital Admin',
      role: 'Hospital Admin',
      institution: 'Staff Vault & Master Password',
      icon: Building2,
      targetRoute: '/doctors',
      color: 'bg-amber-50 text-amber-700'
    },
    {
      username: 'govtadmin',
      name: 'Govt Health Authority',
      role: 'Government Admin',
      institution: 'IDSP Surveillance Network',
      icon: Landmark,
      targetRoute: '/government-dashboard',
      color: 'bg-indigo-50 text-indigo-700'
    },
    {
      username: 'superadmin',
      name: 'Super Admin',
      role: 'Super Admin',
      institution: 'National Interoperability Directorate',
      icon: Shield,
      targetRoute: '/super-admin',
      color: 'bg-rose-50 text-rose-700'
    }
  ];

  const getDashboardRoute = (role) => {
    if (role === 'Patient') return '/patient-dashboard';
    if (role === 'Doctor') return '/doctor-dashboard';
    if (role === 'Hospital Admin') return '/dashboard';
    if (role === 'Government Admin') return '/government-dashboard';
    if (role === 'Super Admin') return '/super-admin';
    return '/';
  };

  const handleSwitch = async (p) => {
    setSwitching(p.username);
    setSwitchError(null);
    const res = await switchDemoPersona(p.username);
    setSwitching(null);
    if (res.success) {
      const route = getDashboardRoute(res.user?.role || p.role);
      navigate(route);
      setIsOpen(false);
    } else {
      setSwitchError(res.message || 'Switch failed');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-[#101828] text-white rounded-[16px] shadow-2xl border border-slate-700 overflow-hidden w-80">
        {/* Switcher Toggle Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition text-xs font-semibold"
        >
          <div className="flex items-center gap-2">
            <span className="px-1.5 py-0.5 rounded bg-[#20a7ce] text-black font-extrabold text-[10px]">
              DEMO
            </span>
            <span>Evaluation Role Switcher</span>
          </div>
          {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </button>

        {/* Current Active Persona Header */}
        <div className="px-4 py-2 bg-slate-900/90 border-t border-slate-800 text-[11px] flex justify-between items-center text-slate-400">
          <span>Active User:</span>
          <strong className="text-white truncate max-w-[170px]">{user ? `${user.name} (${user.role})` : 'Guest / Logged Out'}</strong>
        </div>

        {/* Expanded Persona List */}
        {isOpen && (
          <div className="p-2 space-y-1 max-h-72 overflow-y-auto border-t border-slate-800">
            {switchError && (
              <div className="px-2 py-1 text-[10px] text-red-400 bg-red-900/30 rounded">{switchError}</div>
            )}
            {personas.map((p) => {
              const Icon = p.icon;
              const isActive = user?.username === p.username;
              const isSwitching = switching === p.username;

              return (
                <button
                  key={p.username}
                  onClick={() => handleSwitch(p)}
                  disabled={!!switching}
                  className={`w-full p-2 rounded-[10px] text-left transition flex items-center justify-between text-xs ${
                    isActive ? 'bg-[#0f6d8e] text-white' : 'hover:bg-slate-800 text-slate-200'
                  } ${switching && !isSwitching ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] ${p.color}`}>
                      {isSwitching
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Icon className="w-3.5 h-3.5" />}
                    </div>
                    <div>
                      <strong className="block text-[11px]">{p.name}</strong>
                      <span className="text-[10px] text-slate-400 block">{p.institution}</span>
                    </div>
                  </div>

                  {isActive && !isSwitching && <Check className="w-4 h-4 text-emerald-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
