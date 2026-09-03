import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, ShieldCheck, Building2, KeyRound, Mail, Lock, Check,
  Phone, Search, Edit, Trash2, TrendingUp, AlertTriangle, Send
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VerifiedDoctorBadge } from '../components/VerifiedDoctorBadge';
import { db, functions, staffCreatorAuth } from '../firebase';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { sendPasswordResetEmail, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export const DoctorsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Add Staff Modal state
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    fullName: '', email: '', password: '', mobile: '', specialization: '', role: 'Doctor'
  });
  const [addStaffLoading, setAddStaffLoading] = useState(false);
  const [addStaffError, setAddStaffError] = useState(null);
  const [createdAnvayId, setCreatedAnvayId] = useState(null);

  // Edit Staff Modal State
  const [editingStaff, setEditingStaff] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Role Change Modal State
  const [roleStaff, setRoleStaff] = useState(null);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [newRoleInput, setNewRoleInput] = useState('Doctor');
  const [roleError, setRoleError] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);

  // Delete Staff Modal State
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Password reset
  const [resetSent, setResetSent] = useState({}); // { [uid]: true }
  const [copiedId, setCopiedId] = useState(null); // clipboard feedback

  const effectiveHospitalId = user?.hospitalId || user?.anvayHospitalId || user?.uid || 'ANVAY-H-0001';

  useEffect(() => {
    const q = query(
      collection(db, 'users'),
      where('role', 'in', ['Doctor', 'Staff'])
    );
    const unsub = onSnapshot(q, (snap) => {
      const allStaff = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(d => !d.isDeleted);
      setDoctorsList(allStaff);
      setLoading(false);
    }, (err) => {
      console.warn('Error loading staff roster:', err);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  // ── Add Staff: create Firebase Auth + Firestore ────────────
  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    setAddStaffLoading(true);
    setAddStaffError(null);
    try {
      if (!newStaff.email.trim() || !newStaff.password || newStaff.password.length < 6) {
        throw new Error('Email and password (min 6 chars) are required.');
      }

      // Step 1: Create Firebase Auth account using secondary app
      // This does NOT sign out the current Hospital Admin
      let newUid;
      try {
        const credential = await createUserWithEmailAndPassword(
          staffCreatorAuth,
          newStaff.email.trim(),
          newStaff.password
        );
        newUid = credential.user.uid;
        // Sign out from secondary app immediately
        await signOut(staffCreatorAuth);
      } catch (authErr) {
        if (authErr.code === 'auth/email-already-in-use') {
          throw new Error('This email is already registered. Use a different email.');
        }
        throw authErr;
      }

      // Step 2: Create Firestore user doc
      const rand = Math.floor(1000 + Math.random() * 9000);
      const generatedAnvayId = `ANVAY-${newStaff.role === 'Doctor' ? 'D' : 'S'}-${new Date().getFullYear()}-${rand}`;

      await setDoc(doc(db, 'users', newUid), {
        uid: newUid,
        email: newStaff.email.trim(),
        name: newStaff.fullName.trim(),
        fullName: newStaff.fullName.trim(),
        role: newStaff.role,
        specialization: newStaff.specialization || (newStaff.role === 'Doctor' ? 'General Medicine' : ''),
        mobile: newStaff.mobile || '',
        anvayId: generatedAnvayId,
        hospitalId: effectiveHospitalId,
        hospitalName: user?.hospitalName || user?.name || 'Hospital Node',
        status: 'Active',
        createdAt: new Date().toISOString(),
        createdBy: user?.uid
      });

      // Step 3: Reserve username/email index
      await setDoc(doc(db, 'usernames', newStaff.email.trim().replace(/[@.]/g, '_')), { uid: newUid });

      setCreatedAnvayId({ anvayId: generatedAnvayId, email: newStaff.email.trim(), password: newStaff.password });
      setNewStaff({ fullName: '', email: '', password: '', mobile: '', specialization: '', role: 'Doctor' });
      setIsAddStaffOpen(false);
    } catch (err) {
      console.error('Error creating staff:', err);
      setAddStaffError(err.message || 'Error creating staff account.');
    } finally {
      setAddStaffLoading(false);
    }
  };

  // ── Edit Staff (safe fields only) ─────────────────────────
  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);
    try {
      await updateDoc(doc(db, 'users', editingStaff.id), {
        name: editingStaff.name,
        fullName: editingStaff.name,
        specialization: editingStaff.specialization || '',
        mobile: editingStaff.mobile || '',
        updatedAt: serverTimestamp(),
      });
      setIsEditOpen(false);
      setEditingStaff(null);
    } catch (err) {
      setEditError(err.message || 'Failed to update staff member.');
    } finally {
      setEditLoading(false);
    }
  };

  // ── Role Change ───────────────────────────────────────────
  const handleRoleChangeSubmit = async (e) => {
    e.preventDefault();
    setRoleLoading(true);
    setRoleError(null);
    try {
      await updateDoc(doc(db, 'users', roleStaff.id), {
        role: newRoleInput,
        updatedAt: serverTimestamp(),
      });
      setIsRoleOpen(false);
      setRoleStaff(null);
    } catch (err) {
      setRoleError(err.message || 'Error changing role.');
    } finally {
      setRoleLoading(false);
    }
  };

  // ── Delete Staff ──────────────────────────────────────────
  const handleDeleteStaffSubmit = async (e) => {
    e.preventDefault();
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await updateDoc(doc(db, 'users', deletingStaff.id), {
        status: 'Deleted',
        isDeleted: true,
        deletedAt: new Date().toISOString()
      });
      setIsDeleteOpen(false);
      setDeletingStaff(null);
    } catch (err) {
      setDeleteError(err.message || 'Error removing staff.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Send Password Reset Email ─────────────────────────────
  const handleSendResetEmail = async (staffDoc) => {
    try {
      await sendPasswordResetEmail(auth, staffDoc.email);
      setResetSent(prev => ({ ...prev, [staffDoc.id]: true }));
      setTimeout(() => setResetSent(prev => ({ ...prev, [staffDoc.id]: false })), 4000);
    } catch (err) {
      console.error('Reset email error:', err);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDoctors = doctorsList.filter(d =>
    (d.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.specialization || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.medicalCouncilRegNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.anvayId || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isHospitalAuthority = user?.role === 'Hospital Admin' || user?.role === 'Super Admin';

  const getInitials = (name) => {
    if (!name) return '?';
    // Ensure name is a string before splitting
    const nameStr = typeof name === 'string' ? name : String(name);
    return nameStr.split(' ').map(n => n[0] || '').join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#101828]">
      {/* Header Banner */}
      <div className="bg-white rounded-[22px] border border-[#e7edf4] p-6 sm:p-7 shadow-anvay-soft flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-[#101828]">Hospital Staff & Clinical Credentials</h1>
            <span className="text-[10px] font-bold text-[#0f6d8e] bg-[#e7f7fc] px-2.5 py-1 rounded-[20px]">
              Internal Staff Vault
            </span>
          </div>
          <p className="text-xs text-[#667085]">
            Doctors and clinical staff are enrolled and managed directly by the hospital. Staff credentials stay protected.
          </p>
        </div>

        {isHospitalAuthority && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="px-4 py-2.5 bg-[#0f6d8e] hover:bg-[#0b5874] text-white rounded-[9px] text-xs font-bold shadow-xs transition flex items-center gap-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Enroll New Doctor / Staff</span>
            </button>
          </div>
        )}
      </div>

      {createdAnvayId && (
        <div className="p-4 bg-[#ecfdf3] border border-[#a6f4c5] rounded-[16px] text-xs text-[#067647] space-y-3 animate-in fade-in">
          <div className="flex justify-between items-center">
            <strong className="text-sm">✅ Staff Account Created Successfully!</strong>
            <button onClick={() => setCreatedAnvayId(null)} className="font-bold text-lg leading-none">✕</button>
          </div>
          <p className="text-[#344054]">Firebase Auth account created. Share these credentials with the new staff member:</p>
          <div className="bg-white rounded-[12px] border border-[#a6f4c5] p-3 space-y-2 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[#667085] font-semibold not-italic font-sans">ANVAY ID:</span>
              <strong className="text-[#0f6d8e]">{typeof createdAnvayId === 'object' ? createdAnvayId.anvayId : createdAnvayId}</strong>
            </div>
            {typeof createdAnvayId === 'object' && createdAnvayId.email && (
              <div className="flex justify-between">
                <span className="text-[#667085] font-semibold not-italic font-sans">Login Email:</span>
                <strong className="text-[#101828]">{createdAnvayId.email}</strong>
              </div>
            )}
            {typeof createdAnvayId === 'object' && createdAnvayId.password && (
              <div className="flex justify-between">
                <span className="text-[#667085] font-semibold not-italic font-sans">Password:</span>
                <strong className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">{createdAnvayId.password}</strong>
              </div>
            )}
          </div>
          <p className="text-[10px] text-[#667085]">⚠️ Share credentials privately. Staff can log in immediately at the login page.</p>
        </div>
      )}


      {/* Search Bar */}
      <div className="bg-white p-4 rounded-[18px] border border-[#e7edf4] shadow-anvay-soft flex items-center text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, specialization, or ANVAY ID..."
            className="w-full h-[42px] pl-9 pr-3 bg-[#f8fbff] border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce]"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-600">Loading staff...</div>
      ) : filteredDoctors.length === 0 ? (
        <div className="text-center py-10 text-gray-600">No staff members found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="bg-white rounded-[20px] border border-[#e7edf4] p-5 shadow-anvay-soft space-y-4 hover:border-[#0f6d8e]/40 transition flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#101828]">{doc.fullName || doc.name}</h3>
                      {doc.role === 'Doctor' && <VerifiedDoctorBadge status="Verified" />}
                    </div>
                    {doc.specialization && <p className="text-xs text-[#0f6d8e] font-semibold">{doc.specialization}</p>}
                    <p className="text-[11px] text-[#667085]">Role: <strong>{doc.role || 'Doctor'}</strong></p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-extrabold text-xs shrink-0">
                    {getInitials(doc.fullName || doc.name)}
                  </div>
                </div>

                <div className="text-[11px] text-[#344054] space-y-1">
                  <p>ANVAY ID: <strong className="font-mono text-[#0f6d8e]">{doc.anvayId || doc.username}</strong></p>
                  <p>Email: {doc.email}</p>
                  {doc.mobile && <p>Mobile: {doc.mobile}</p>}
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleSendResetEmail(doc)}
                    disabled={resetSent[doc.id]}
                    className="w-full py-2 bg-[#f8fbff] hover:bg-[#eaf8fc] text-[#0f6d8e] border border-[#bfe7f6] rounded-[9px] text-[11px] font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {resetSent[doc.id] ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Mail className="w-3.5 h-3.5" />}
                    {resetSent[doc.id] ? 'Reset Email Sent!' : 'Send Password Reset Email'}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              {isHospitalAuthority && (
                <div className="flex gap-2 pt-3 border-t border-[#eef2f6]">
                  <button
                    onClick={() => { setEditingStaff(doc); setIsEditOpen(true); }}
                    className="flex-1 py-1.5 border border-[#d0d5dd] rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1"
                  >
                    <Edit className="w-3 h-3" /> Edit
                  </button>
                  <button
                    onClick={() => { setRoleStaff(doc); setNewRoleInput(doc.role || 'Doctor'); setIsRoleOpen(true); }}
                    className="flex-1 py-1.5 border border-[#d0d5dd] rounded-lg text-[11px] font-bold text-slate-700 hover:bg-slate-50 transition flex items-center justify-center gap-1"
                  >
                    <TrendingUp className="w-3 h-3" /> Role
                  </button>
                  <button
                    onClick={() => { setDeletingStaff(doc); setIsDeleteOpen(true); }}
                    className="flex-1 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Doctor / Staff */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-[22px] p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-[#eef2f6]">
              <div>
                <h2 className="text-lg font-extrabold text-[#101828]">Create Staff Account</h2>
              </div>
              <button onClick={() => setIsAddStaffOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {addStaffError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[9px]">
                {addStaffError}
              </div>
            )}

            <form onSubmit={handleAddStaffSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStaff.fullName}
                  onChange={(e) => setNewStaff({ ...newStaff, fullName: e.target.value })}
                  className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Email *</label>
                <input
                  type="email"
                  required
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Mobile <span className="text-gray-400">(10 digits)</span></label>
                <input
                  type="tel"
                  value={newStaff.mobile}
                  maxLength={10}
                  pattern="[0-9]{10}"
                  onInput={e => e.target.value = e.target.value.replace(/\D/g, '')}
                  onChange={(e) => setNewStaff({ ...newStaff, mobile: e.target.value })}
                  className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Initial Password * <span className="text-gray-400">(min 6 chars)</span></label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Role *</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                  className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              {newStaff.role === 'Doctor' && (
                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Specialization</label>
                  <input
                    type="text"
                    value={newStaff.specialization}
                    onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value })}
                    className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-[9px] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addStaffLoading}
                  className="flex-1 py-2 bg-[#0f6d8e] text-white rounded-[9px] font-bold disabled:opacity-50"
                >
                  {addStaffLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Staff */}
      {isEditOpen && editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-[22px] p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-[#eef2f6]">
              <h2 className="text-lg font-extrabold text-[#101828]">Edit Staff Profile</h2>
              <button onClick={() => { setIsEditOpen(false); setEditingStaff(null); }} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[9px]">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditStaffSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingStaff.fullName || editingStaff.name || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Mobile Phone</label>
                <input
                  type="tel"
                  maxLength={10}
                  pattern="[0-9]{10}"
                  onInput={e => e.target.value = e.target.value.replace(/\D/g, '')}
                  value={editingStaff.mobile || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, mobile: e.target.value })}
                  className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px]"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Specialization</label>
                <input
                  type="text"
                  value={editingStaff.specialization || ''}
                  onChange={(e) => setEditingStaff({ ...editingStaff, specialization: e.target.value })}
                  className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setEditingStaff(null); }}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-[9px] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-2 bg-[#0f6d8e] text-white rounded-[9px] font-bold disabled:opacity-50"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Change Role */}
      {isRoleOpen && roleStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-[22px] p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-[#eef2f6]">
              <h2 className="text-lg font-extrabold text-[#101828]">Change Staff Role</h2>
              <button onClick={() => { setIsRoleOpen(false); setRoleStaff(null); }} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {roleError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[9px]">
                {roleError}
              </div>
            )}

            <form onSubmit={handleRoleChangeSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Select New Role</label>
                <select
                  value={newRoleInput}
                  onChange={(e) => setNewRoleInput(e.target.value)}
                  className="w-full h-[40px] px-3 bg-white border border-[#d0d5dd] rounded-[9px]"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsRoleOpen(false); setRoleStaff(null); }}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-[9px] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={roleLoading}
                  className="flex-1 py-2 bg-[#0f6d8e] text-white rounded-[9px] font-bold disabled:opacity-50"
                >
                  {roleLoading ? 'Updating...' : 'Confirm Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Staff */}
      {isDeleteOpen && deletingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-[22px] p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-[#eef2f6]">
              <h2 className="text-lg font-extrabold text-red-700 flex items-center gap-1">
                <AlertTriangle className="w-5 h-5 text-red-600" /> Remove Staff Member
              </h2>
              <button onClick={() => { setIsDeleteOpen(false); setDeletingStaff(null); }} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[9px]">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteStaffSubmit} className="space-y-4 text-xs">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove <strong>{deletingStaff.fullName || deletingStaff.name}</strong>? This action will revoke their login credentials and portal access immediately.
              </p>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsDeleteOpen(false); setDeletingStaff(null); }}
                  className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-[9px] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="flex-1 py-2 bg-red-700 text-white rounded-[9px] font-bold disabled:opacity-50"
                >
                  {deleteLoading ? 'Removing...' : 'Confirm Removal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
