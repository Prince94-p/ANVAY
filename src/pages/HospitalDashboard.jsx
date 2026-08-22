import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  FileText,
  Activity,
  UserPlus,
  Search,
  Upload,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  FileCheck2,
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  Stethoscope
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VerifiedHospitalBadge } from '../components/VerifiedHospitalBadge';

const illnessDistribution = [
  { name: 'Cardiovascular / HTN', count: 42, color: '#0f6d8e' },
  { name: 'Respiratory / Asthma', count: 28, color: '#20a7ce' },
  { name: 'Diabetes / Metabolic', count: 35, color: '#7dd3ed' },
  { name: 'Gastroenterology', count: 18, color: '#f79009' },
  { name: 'Infectious / Fevers', count: 24, color: '#d92d20' }
];

const weeklyAdmissions = [
  { day: 'Mon', count: 14 },
  { day: 'Tue', count: 22 },
  { day: 'Wed', count: 19 },
  { day: 'Thu', count: 27 },
  { day: 'Fri', count: 31 },
  { day: 'Sat', count: 25 },
  { day: 'Sun', count: 12 }
];

export const HospitalDashboard = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const pRes = await fetch('/api/patients/search?query=', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const pData = await pRes.json();
        if (pData.success) {
          setPatients(pData.patients);
        }

        const dRes = await fetch('/api/doctors', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dData = await dRes.json();
        if (dData.success) {
          setDoctorsCount(dData.doctors.length);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  return (
    <div className="space-y-6 text-[#101828]">
      {/* Top Welcome & Hospital Header */}
      <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 sm:p-7 shadow-anvay-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#101828]">
              {user?.hospitalName || 'ANVAY Hospital Interoperability Hub'}
            </h1>
            <VerifiedHospitalBadge status="Approved" />
          </div>
          <p className="text-xs text-[#667085] font-medium">
            Active Clinical Node • User: <strong>{user?.name}</strong> ({user?.role})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/patient-search"
            className="px-4 py-2.5 bg-[#0f6d8e] hover:bg-[#0b5874] text-white rounded-[9px] text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Search Patient</span>
          </Link>
          <Link
            to="/create-patient"
            className="px-4 py-2.5 bg-[#101828] hover:bg-[#1d2939] text-white rounded-[9px] text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Register New Patient</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[18px] border border-[#e7edf4] shadow-anvay-soft space-y-2">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold">
            <span>Total Network Patients</span>
            <Users className="w-4 h-4 text-[#0f6d8e]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#101828]">{patients.length || 3}</span>
            <span className="text-[10px] text-[#0f6d8e] font-bold bg-[#e7f7fc] px-2 py-0.5 rounded-[20px]">
              Live ANVAY Registry
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-[#e7edf4] shadow-anvay-soft space-y-2">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold">
            <span>Enrolled Doctors / Staff</span>
            <Stethoscope className="w-4 h-4 text-[#20a7ce]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#101828]">{doctorsCount || 4}</span>
            <span className="text-[10px] text-[#0f6d8e] font-bold bg-[#e7f7fc] px-2 py-0.5 rounded-[20px]">
              MCI Licensed
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-[#e7edf4] shadow-anvay-soft space-y-2">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold">
            <span>Multi-Hospital Records</span>
            <FileText className="w-4 h-4 text-[#0f6d8e]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#101828]">8</span>
            <span className="text-[10px] text-[#0f6d8e] font-bold bg-[#e7f7fc] px-2 py-0.5 rounded-[20px]">
              Interoperable Feed
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-[#e7edf4] shadow-anvay-soft space-y-2">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold">
            <span>Clinical Completeness</span>
            <Activity className="w-4 h-4 text-[#067647]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#067647]">84%</span>
            <span className="text-[10px] text-[#067647] font-bold bg-[#ecfdf3] px-2 py-0.5 rounded-[20px]">
              Network Avg
            </span>
          </div>
        </div>
      </div>

      {/* Hospital Analytics Charts: Illness Distribution & Patient Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Illness Breakdown Chart */}
        <div className="bg-white rounded-[20px] border border-[#e7edf4] p-5 shadow-anvay-soft space-y-3">
          <div className="flex justify-between items-center border-b border-[#eef2f6] pb-2.5">
            <div>
              <h3 className="text-xs font-extrabold text-[#0f6d8e] uppercase tracking-wider flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-[#0f6d8e]" />
                <span>Hospital Illness & Diagnosis Distribution</span>
              </h3>
              <p className="text-[11px] text-[#667085]">Active treated clinical conditions across departments</p>
            </div>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={illnessDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {illnessDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] pt-1">
            {illnessDistribution.map((item, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-[#344054] truncate">{item.name}: <strong>{item.count}</strong></span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Encounter Volume Bar Chart */}
        <div className="bg-white rounded-[20px] border border-[#e7edf4] p-5 shadow-anvay-soft space-y-3">
          <div className="flex justify-between items-center border-b border-[#eef2f6] pb-2.5">
            <div>
              <h3 className="text-xs font-extrabold text-[#0f6d8e] uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-[#0f6d8e]" />
                <span>Weekly Patient Visit Volume</span>
              </h3>
              <p className="text-[11px] text-[#667085]">Cross-hospital encounters and check-ups this week</p>
            </div>
            <span className="text-[10px] text-[#067647] font-bold bg-[#ecfdf3] px-2 py-0.5 rounded-[20px]">
              ↑ 12% vs last week
            </span>
          </div>

          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyAdmissions}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f6" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#667085" />
                <YAxis tick={{ fontSize: 11 }} stroke="#667085" />
                <Tooltip />
                <Bar dataKey="count" fill="#0f6d8e" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-[#667085] flex justify-between pt-1">
            <span>Peak Consultation Day: <strong>Friday (31 visits)</strong></span>
            <span>Total Encounters: <strong>150</strong></span>
          </div>
        </div>
      </div>

      {/* Patient Directory & Direct Action Stream */}
      <div className="bg-white rounded-[20px] border border-[#e7edf4] overflow-hidden shadow-anvay-soft">
        <div className="p-4 sm:p-5 border-b border-[#e7edf4] flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[#101828]">
              Connected Network Patients (Click Profile to Upload Documents / Add Records)
            </h3>
            <p className="text-[11px] text-[#667085]">
              Select patient profile to inspect records or upload new diagnostic files
            </p>
          </div>
          <Link
            to="/patient-search"
            className="text-xs font-bold text-[#0f6d8e] hover:text-[#0b5874] flex items-center gap-1"
          >
            <span>View All Patients</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-[#eef2f6]">
          {patients.map((p) => (
            <div key={p.anvayId} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8fbff] transition">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-[#101828] text-sm">{p.fullName}</h4>
                  <span className="text-xs font-mono font-bold text-[#0f6d8e] bg-[#e7f7fc] px-2.5 py-0.5 rounded-[6px]">
                    {p.anvayId}
                  </span>
                </div>
                <p className="text-xs text-[#667085]">
                  {p.gender}, {p.age} yrs • Blood Group: <strong className="text-[#101828]">{p.bloodGroup || 'N/A'}</strong> • Registered by: {p.registeredByHospitalName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/clinical-snapshot?anvayId=${p.anvayId}`}
                  className="px-3.5 py-1.5 bg-[#f8fbff] hover:bg-[#e7f7fc] text-[#0f6d8e] border border-[#d0d5dd] rounded-[9px] text-xs font-bold transition"
                >
                  Clinical Snapshot
                </Link>
                <Link
                  to={`/upload-document?anvayId=${p.anvayId}`}
                  className="px-3.5 py-1.5 bg-[#f8fbff] hover:bg-[#e7f7fc] text-[#0f6d8e] border border-[#0f6d8e] rounded-[9px] text-xs font-bold transition flex items-center gap-1"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Doc</span>
                </Link>
                <Link
                  to={`/medical-history?anvayId=${p.anvayId}`}
                  className="px-3.5 py-1.5 bg-[#0f6d8e] hover:bg-[#0b5874] text-white rounded-[9px] text-xs font-bold transition"
                >
                  Timeline
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
