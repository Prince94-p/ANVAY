import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, FileText, Activity, UserPlus, Search, Upload, ArrowRight,
  ShieldCheck, Building2, Calendar, FileCheck2, BarChart3, PieChart as PieIcon,
  TrendingUp, Stethoscope
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VerifiedHospitalBadge } from '../components/VerifiedHospitalBadge';
import { db, staffCreatorAuth } from '../firebase';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';

export const HospitalDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [patients, setPatients] = useState([]);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [recordsCount, setRecordsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showAddStaffModal, setShowAddStaffModal] = useState(false);
  const [staffData, setStaffData] = useState({ fullName: '', email: '', password: '', mobile: '', role: 'Doctor', specialization: '' });
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState(null);
  const [staffSuccess, setStaffSuccess] = useState(null); // { anvayId }

  const effectiveHospitalId = user?.hospitalId || user?.anvayHospitalId || user?.uid || 'ANVAY-H-0001';

  useEffect(() => {
    const qPatients = query(collection(db, 'users'), where('role', '==', 'Patient'));
    const unsubscribePatients = onSnapshot(qPatients, (snapshot) => {
      setPatients(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => console.warn('Patients query error:', err));

    const qDoctors = query(collection(db, 'users'), where('role', 'in', ['Doctor', 'Staff']));
    const unsubscribeDoctors = onSnapshot(qDoctors, (snapshot) => {
      setDoctorsCount(snapshot.size);
    }, (err) => console.warn('Doctors query error:', err));

    const qRecords = query(collection(db, 'records'));
    const unsubscribeRecords = onSnapshot(qRecords, (snapshot) => {
      setRecordsCount(snapshot.size);
    }, (err) => console.warn('Records query error:', err));

    setLoading(false);

    return () => {
      unsubscribePatients();
      unsubscribeDoctors();
      unsubscribeRecords();
    };
  }, [user]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setStaffLoading(true);
    setStaffError(null);
    setStaffSuccess(null);
    try {
      if (!staffData.email.trim() || !staffData.password || staffData.password.length < 6) {
        throw new Error('Email and password (min 6 chars) are required.');
      }

      // Create Firebase Auth using secondary app (doesn't sign out current user)
      let newUid;
      try {
        const credential = await createUserWithEmailAndPassword(
          staffCreatorAuth,
          staffData.email.trim(),
          staffData.password
        );
        newUid = credential.user.uid;
        await signOut(staffCreatorAuth);
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          throw new Error('This email is already registered in Firebase Auth.');
        }
        throw authErr;
      }

      const rand = Math.floor(1000 + Math.random() * 9000);
      const generatedAnvayId = `ANVAY-${staffData.role === 'Doctor' ? 'D' : 'S'}-${new Date().getFullYear()}-${rand}`;

      await setDoc(doc(db, 'users', newUid), {
        uid: newUid,
        email: staffData.email.trim(),
        name: staffData.fullName.trim(),
        fullName: staffData.fullName.trim(),
        role: staffData.role,
        specialization: staffData.specialization || '',
        mobile: staffData.mobile || '',
        anvayId: generatedAnvayId,
        hospitalId: effectiveHospitalId,
        hospitalName: user?.hospitalName || user?.name || 'Hospital Medical Center',
        createdAt: new Date().toISOString(),
        status: 'Active',
        createdBy: user?.uid
      });

      setStaffSuccess({ anvayId: generatedAnvayId, email: staffData.email.trim(), password: staffData.password });
      setStaffData({ fullName: '', email: '', password: '', mobile: '', role: 'Doctor', specialization: '' });
    } catch (err) {
      console.error('Error creating staff member:', err);
      setStaffError(err.message || 'Error creating staff account.');
    } finally {
      setStaffLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-[#101828]">
      {/* Top Welcome & Hospital Header */}
      <div className="bg-white rounded-[20px] border border-[#e7edf4] p-6 sm:p-7 shadow-anvay-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#101828]">
              {user?.name || 'ANVAY Hospital Interoperability Hub'}
            </h1>
            <VerifiedHospitalBadge status="Approved" />
          </div>
          <p className="text-xs text-[#667085] font-medium">
            Active Clinical Node • User: <strong>{user?.email}</strong> ({user?.role})
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowAddStaffModal(true)}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-[9px] text-xs font-bold shadow-xs transition flex items-center gap-1.5"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Staff</span>
          </button>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-[18px] border border-[#e7edf4] shadow-anvay-soft space-y-2">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold">
            <span>Total Network Patients</span>
            <Users className="w-4 h-4 text-[#0f6d8e]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#101828]">{patients.length}</span>
            <span className="text-[10px] text-[#0f6d8e] font-bold bg-[#e7f7fc] px-2 py-0.5 rounded-[20px]">
              Live Registry
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-[#e7edf4] shadow-anvay-soft space-y-2">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold">
            <span>Enrolled Doctors</span>
            <Stethoscope className="w-4 h-4 text-[#20a7ce]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#101828]">{doctorsCount}</span>
            <span className="text-[10px] text-[#0f6d8e] font-bold bg-[#e7f7fc] px-2 py-0.5 rounded-[20px]">
              Active Staff
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-[18px] border border-[#e7edf4] shadow-anvay-soft space-y-2">
          <div className="flex items-center justify-between text-[#667085] text-xs font-semibold">
            <span>Medical Records</span>
            <FileText className="w-4 h-4 text-[#0f6d8e]" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-[#101828]">{recordsCount}</span>
            <span className="text-[10px] text-[#0f6d8e] font-bold bg-[#e7f7fc] px-2 py-0.5 rounded-[20px]">
              Hospital DB
            </span>
          </div>
        </div>
      </div>

      {/* Patient Directory */}
      <div className="bg-white rounded-[20px] border border-[#e7edf4] overflow-hidden shadow-anvay-soft">
        <div className="p-4 sm:p-5 border-b border-[#e7edf4] flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm text-[#101828]">
              Connected Network Patients
            </h3>
            <p className="text-[11px] text-[#667085]">
              Select patient profile to inspect records or upload new diagnostic files
            </p>
          </div>
        </div>

        <div className="divide-y divide-[#eef2f6]">
          {patients.length === 0 ? (
            <div className="p-5 text-center text-sm text-[#667085]">No patients found for this hospital.</div>
          ) : (
            patients.map((p) => (
              <div key={p.anvayId} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#f8fbff] transition">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-[#101828] text-sm">{p.name}</h4>
                    <span className="text-xs font-mono font-bold text-[#0f6d8e] bg-[#e7f7fc] px-2.5 py-0.5 rounded-[6px]">
                      {p.anvayId}
                    </span>
                  </div>
                  <p className="text-xs text-[#667085]">
                    {p.gender}, DOB: {p.dateOfBirth} • Blood Group: <strong className="text-[#101828]">{p.bloodGroup || 'N/A'}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/medical-history?anvayId=${p.anvayId}`}
                    className="px-3.5 py-1.5 bg-[#0f6d8e] hover:bg-[#0b5874] text-white rounded-[9px] text-xs font-bold transition"
                  >
                    View Timeline
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Staff Modal */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs text-xs font-semibold">
          <div className="bg-white max-w-md w-full rounded-[22px] p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200">
            {staffSuccess ? (
              <>
                <div className="text-center space-y-3">
                  <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-extrabold text-[#101828]">✅ Staff Account Created!</h2>
                  <p className="text-[#667085] text-xs">Firebase Auth + Firestore profile created. Share these login credentials securely.</p>
                  <div className="bg-[#f0f6fa] border border-[#d0e8f5] rounded-[12px] p-4 text-left space-y-2.5 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-[#667085] font-semibold">ANVAY ID:</span>
                      <strong className="font-mono text-[#0f6d8e]">{staffSuccess.anvayId}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#667085] font-semibold">Login Email:</span>
                      <strong className="font-mono text-[#101828]">{staffSuccess.email}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#667085] font-semibold">Password:</span>
                      <strong className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{staffSuccess.password}</strong>
                    </div>
                  </div>
                  <p className="text-[10px] text-[#98a2b3]">⚠️ Share these credentials privately. Staff can reset their password via login page.</p>
                </div>
                <button
                  onClick={() => { setStaffSuccess(null); setShowAddStaffModal(false); }}
                  className="w-full py-2.5 bg-[#0f6d8e] text-white rounded-[9px] font-bold hover:bg-[#0b5874] transition"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <h2 className="text-xl font-extrabold text-[#101828]">Create Staff Account</h2>
                {staffError && <div className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-200">{staffError}</div>}

                <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="block text-[#344054]">Full Name *</label>
                    <input type="text" required value={staffData.fullName} onChange={(e) => setStaffData({...staffData, fullName: e.target.value})} className="w-full h-10 px-3 border border-[#d0d5dd] rounded-[9px]" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[#344054]">Email *</label>
                    <input type="email" required value={staffData.email} onChange={(e) => setStaffData({...staffData, email: e.target.value})} className="w-full h-10 px-3 border border-[#d0d5dd] rounded-[9px]" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[#344054]">Mobile <span className="text-gray-400">(10 digits)</span></label>
                    <input type="tel" value={staffData.mobile} maxLength={10} pattern="[0-9]{10}" onInput={e => e.target.value = e.target.value.replace(/\D/g, '')} onChange={(e) => setStaffData({...staffData, mobile: e.target.value})} className="w-full h-10 px-3 border border-[#d0d5dd] rounded-[9px]" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[#344054]">Password * <span className="text-gray-400">(min 6 chars)</span></label>
                    <input type="password" required minLength={6} value={staffData.password} onChange={(e) => setStaffData({...staffData, password: e.target.value})} className="w-full h-10 px-3 border border-[#d0d5dd] rounded-[9px]" />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-[#344054]">Role *</label>
                    <select value={staffData.role} onChange={(e) => setStaffData({...staffData, role: e.target.value})} className="w-full h-10 px-3 border border-[#d0d5dd] rounded-[9px] bg-white">
                      <option value="Doctor">Doctor</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>
                  {staffData.role === 'Doctor' && (
                    <div className="space-y-1">
                      <label className="block text-[#344054]">Specialization</label>
                      <input type="text" value={staffData.specialization} onChange={(e) => setStaffData({...staffData, specialization: e.target.value})} className="w-full h-10 px-3 border border-[#d0d5dd] rounded-[9px]" />
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button type="button" onClick={() => { setShowAddStaffModal(false); setStaffError(null); }} className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-[9px] font-bold">Cancel</button>
                    <button type="submit" disabled={staffLoading} className="flex-1 py-2.5 bg-[#0f6d8e] hover:bg-[#0b5874] text-white rounded-[9px] font-bold disabled:opacity-50">
                      {staffLoading ? 'Creating...' : 'Create Account'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
