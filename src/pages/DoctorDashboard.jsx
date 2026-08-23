import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Users, FileText, Activity, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { AccountDeletionModal } from '../components/AccountDeletionModal';

export const DoctorDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [assignedPatients, setAssignedPatients] = useState([]);
  const [myRecordsAdded, setMyRecordsAdded] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    // Real-time listener for assigned patients
    const qPatients = query(collection(db, 'users'), where('role', '==', 'Patient'), where('assignedDoctorIds', 'array-contains', user.uid));
    const unsubscribePatients = onSnapshot(qPatients, (snapshot) => {
      setAssignedPatients(snapshot.docs.map(doc => doc.data()));
    });

    // Real-time listener for doctor's records
    const qRecords = query(collection(db, 'records'), where('doctorId', '==', user.uid));
    const unsubscribeRecords = onSnapshot(qRecords, (snapshot) => {
      setMyRecordsAdded(snapshot.size);
    });

    setLoading(false);

    return () => {
      unsubscribePatients();
      unsubscribeRecords();
    };
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading doctor dashboard data...</div>;
  }

  const totalPatientsSeen = assignedPatients.length;

  const departmentData = [
    { name: 'Cardiology', value: 45 },
    { name: 'General Medicine', value: 30 },
    { name: 'Neurology', value: 15 },
    { name: 'Orthopedics', value: 10 }
  ];
  const COLORS = ['#0f6d8e', '#20a7ce', '#4ab9d8', '#8cd2e7'];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#101828] tracking-tight">
            {t('doctorDashboard.title')} - {user?.name}
          </h1>
          <p className="text-[#667085] text-[13px] font-medium mt-1">
            {t('doctorDashboard.subtitle')}
          </p>
        </div>
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="self-start sm:self-auto px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-[9px] text-xs font-bold transition flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Account</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-[12px] border border-[#e7edf4] shadow-anvay-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#0f6d8e]/10 flex items-center justify-center text-[#0f6d8e]">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-[#667085] text-xs font-bold uppercase tracking-wider">{t('doctorDashboard.totalSeen')}</h3>
          </div>
          <p className="text-3xl font-extrabold text-[#101828]">{totalPatientsSeen}</p>
        </div>

        <div className="bg-white p-5 rounded-[12px] border border-[#e7edf4] shadow-anvay-soft">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#20a7ce]/10 flex items-center justify-center text-[#20a7ce]">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-[#667085] text-xs font-bold uppercase tracking-wider">{t('doctorDashboard.myRecords')}</h3>
          </div>
          <p className="text-3xl font-extrabold text-[#101828]">{myRecordsAdded}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Assigned Patients List */}
        <div className="lg:col-span-2 bg-white rounded-[12px] border border-[#e7edf4] shadow-anvay-soft overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#eef2f6] bg-[#f8fbff] flex items-center justify-between">
            <h3 className="text-[14px] font-extrabold text-[#101828] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0f6d8e]" />
              {t('doctorDashboard.assignedPatients')}
            </h3>
            <Link to="/patient-search" className="text-[#0f6d8e] text-xs font-bold hover:underline">
              {t('dashboard.viewAll')}
            </Link>
          </div>
          <div className="p-0 overflow-auto max-h-[400px]">
            {assignedPatients.length === 0 ? (
              <div className="p-8 text-center text-[#667085] text-sm">
                {t('doctorDashboard.noPatients')}
              </div>
            ) : (
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#fcfdfd] text-[#667085] text-[11px] uppercase tracking-wider font-bold">
                  <tr>
                    <th className="px-5 py-3 border-b border-[#e7edf4]">Patient</th>
                    <th className="px-5 py-3 border-b border-[#e7edf4]">ANVAY ID</th>
                    <th className="px-5 py-3 border-b border-[#e7edf4]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e7edf4]">
                  {assignedPatients.map(p => (
                    <tr key={p.anvayId} className="hover:bg-[#f8fbff] transition-colors">
                      <td className="px-5 py-3">
                        <div className="font-bold text-[#101828]">{p.name || p.fullName}</div>
                        <div className="text-[11px] text-[#667085]">DOB: {p.dateOfBirth} • {p.gender}</div>
                      </td>
                      <td className="px-5 py-3 font-mono text-[#0f6d8e] text-xs font-semibold">
                        {p.anvayId}
                      </td>
                      <td className="px-5 py-3 space-x-2">
                        <Link to={`/clinical-snapshot?id=${p.anvayId}`} className="text-[#0f6d8e] font-bold hover:underline text-xs">
                          {t('dashboard.clinicalSnapshot')}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Analytics & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-[12px] border border-[#e7edf4] shadow-anvay-soft p-5">
            <h3 className="text-[14px] font-extrabold text-[#101828] flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-[#0f6d8e]" />
              {t('dashboard.illnessDistribution')}
            </h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={departmentData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {departmentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-[12px] border border-[#e7edf4] shadow-anvay-soft p-5">
            <h3 className="text-[14px] font-extrabold text-[#101828] mb-4">
              {t('doctorDashboard.quickActions')}
            </h3>
            <div className="space-y-2">
              <Link to="/patient-search" className="flex items-center gap-3 p-3 rounded-[8px] bg-[#f8fbff] hover:bg-[#e7f7fc] text-[#0f6d8e] font-bold text-xs transition">
                <Users className="w-4 h-4" /> {t('nav.searchPatient')}
              </Link>
              <Link to="/add-record" className="flex items-center gap-3 p-3 rounded-[8px] bg-[#f8fbff] hover:bg-[#e7f7fc] text-[#0f6d8e] font-bold text-xs transition">
                <FileText className="w-4 h-4" /> {t('nav.addRecord')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      <AccountDeletionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
