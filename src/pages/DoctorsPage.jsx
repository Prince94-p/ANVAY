import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  ShieldCheck,
  Building2,
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Mail,
  Phone,
  Search,
  Edit,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VerifiedDoctorBadge } from '../components/VerifiedDoctorBadge';

export const DoctorsPage = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();

  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Master Authorization Password Modal state
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [masterPasswordInput, setMasterPasswordInput] = useState('');
  const [masterAuthLoading, setMasterAuthLoading] = useState(false);
  const [masterAuthError, setMasterAuthError] = useState(null);
  const [revealedCredentials, setRevealedCredentials] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Add Staff Modal state
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: '',
    medicalCouncilRegNo: '',
    specialization: 'Cardiology',
    department: 'Cardiology',
    email: '',
    phone: '',
    isEmailVerified: true,
    isMobileVerified: true
  });
  const [addStaffLoading, setAddStaffLoading] = useState(false);
  const [addStaffError, setAddStaffError] = useState(null);
  const [createdCredentialsAlert, setCreatedCredentialsAlert] = useState(null);

  // Edit Staff Modal State
  const [editingStaff, setEditingStaff] = useState(null); // doctor object
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  // Role Change Modal State
  const [roleStaff, setRoleStaff] = useState(null); // doctor object
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [newRoleInput, setNewRoleInput] = useState('Doctor');
  const [roleMasterPassword, setRoleMasterPassword] = useState('');
  const [roleError, setRoleError] = useState(null);
  const [roleLoading, setRoleLoading] = useState(false);

  // Delete Staff Modal State
  const [deletingStaff, setDeletingStaff] = useState(null); // doctor object
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteMasterPassword, setDeleteMasterPassword] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/doctors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDoctorsList(data.doctors);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [token]);

  const handleVerifyMasterPassword = async (e) => {
    e.preventDefault();
    setMasterAuthLoading(true);
    setMasterAuthError(null);

    try {
      const res = await fetch('/api/doctors/reveal-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ masterPassword: masterPasswordInput })
      });

      const data = await res.json();
      if (data.success) {
        const map = {};
        data.credentials.forEach(c => {
          map[c.id] = c;
        });
        setRevealedCredentials(map);
        setIsMasterModalOpen(false);
        setMasterPasswordInput('');
      } else {
        setMasterAuthError(data.message || 'Master Authorization Password verification failed.');
      }
    } catch (err) {
      setMasterAuthError('Network error during authorization.');
    } finally {
      setMasterAuthLoading(false);
    }
  };

  const handleAddStaffSubmit = async (e) => {
    e.preventDefault();
    setAddStaffLoading(true);
    setAddStaffError(null);

    try {
      const res = await fetch('/api/doctors/add-staff', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newStaff)
      });

      const data = await res.json();
      if (data.success) {
        setCreatedCredentialsAlert({
          name: newStaff.name,
          username: data.generatedCredentials.username,
          password: data.generatedCredentials.generatedPassword
        });
        setIsAddStaffOpen(false);
        setNewStaff({
          name: '',
          medicalCouncilRegNo: '',
          specialization: 'Cardiology',
          department: 'Cardiology',
          email: '',
          phone: '',
          isEmailVerified: true,
          isMobileVerified: true
        });
        fetchDoctors();
      } else {
        setAddStaffError(data.message || 'Failed to add staff member.');
      }
    } catch (err) {
      setAddStaffError('Network error adding staff.');
    } finally {
      setAddStaffLoading(false);
    }
  };

  const handleEditStaffSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/doctors/${editingStaff.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingStaff)
      });
      const data = await res.json();
      if (data.success) {
        setIsEditOpen(false);
        setEditingStaff(null);
        fetchDoctors();
      } else {
        setEditError(data.message || 'Failed to update staff member.');
      }
    } catch (err) {
      setEditError('Network error updating staff.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleRoleChangeSubmit = async (e) => {
    e.preventDefault();
    setRoleLoading(true);
    setRoleError(null);

    try {
      const res = await fetch(`/api/doctors/${roleStaff.id}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newRole: newRoleInput,
          masterPassword: roleMasterPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsRoleOpen(false);
        setRoleStaff(null);
        setRoleMasterPassword('');
        fetchDoctors();
      } else {
        setRoleError(data.message || 'Failed to change role.');
      }
    } catch (err) {
      setRoleError('Network error.');
    } finally {
      setRoleLoading(false);
    }
  };

  const handleDeleteStaffSubmit = async (e) => {
    e.preventDefault();
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      const res = await fetch(`/api/doctors/${deletingStaff.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          masterPassword: deleteMasterPassword
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsDeleteOpen(false);
        setDeletingStaff(null);
        setDeleteMasterPassword('');
        fetchDoctors();
      } else {
        setDeleteError(data.message || 'Failed to remove staff.');
      }
    } catch (err) {
      setDeleteError('Network error.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDoctors = doctorsList.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.medicalCouncilRegNo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isHospitalAuthority = user?.role === 'Hospital Admin' || user?.role === 'Super Admin';

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
            {!revealedCredentials ? (
              <button
                onClick={() => setIsMasterModalOpen(true)}
                className="px-3.5 py-2.5 bg-[#f8fbff] hover:bg-[#e7f7fc] text-[#0f6d8e] border border-[#d0d5dd] rounded-[9px] text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <KeyRound className="w-4 h-4 text-[#0f6d8e]" />
                <span>Unlock Passwords (Master Key)</span>
              </button>
            ) : (
              <button
                onClick={() => setRevealedCredentials(null)}
                className="px-3.5 py-2.5 bg-[#101828] text-white rounded-[9px] text-xs font-bold shadow-xs transition flex items-center gap-1.5"
              >
                <Lock className="w-4 h-4 text-[#20a7ce]" />
                <span>Lock Passwords Vault</span>
              </button>
            )}

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

      {/* Just-created credentials banner */}
      {createdCredentialsAlert && (
        <div className="p-4 bg-[#ecfdf3] border border-[#a6f4c5] rounded-[16px] text-xs text-[#067647] space-y-2 animate-in fade-in">
          <div className="flex justify-between items-center">
            <strong className="text-sm">✓ Doctor Enrolled & Credentials Generated Successfully!</strong>
            <button onClick={() => setCreatedCredentialsAlert(null)} className="font-bold">✕</button>
          </div>
          <p>
            Doctor <strong>{createdCredentialsAlert.name}</strong> has been enrolled. Share these credentials with the doctor:
          </p>
          <div className="p-3 bg-white rounded-[9px] border border-[#a6f4c5] font-mono text-xs flex flex-wrap gap-4 items-center">
            <span>Username: <strong className="text-[#101828]">{createdCredentialsAlert.username}</strong></span>
            <span>Temporary Password: <strong className="text-[#0f6d8e]">{createdCredentialsAlert.password}</strong></span>
          </div>
        </div>
      )}

      {/* Search & Vault Status Bar */}
      <div className="bg-white p-4 rounded-[18px] border border-[#e7edf4] shadow-anvay-soft flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#98a2b3]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by doctor name, license no., or specialty..."
            className="w-full h-[42px] pl-9 pr-3 bg-[#f8fbff] border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          {revealedCredentials ? (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] bg-[#ecfdf3] text-[#067647] font-bold">
              <Unlock className="w-3.5 h-3.5" />
              <span>Staff Password Vault: UNLOCKED</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-[20px] bg-[#f8fbff] text-[#667085] font-semibold border border-[#e7edf4]">
              <Lock className="w-3.5 h-3.5 text-[#0f6d8e]" />
              <span>Passwords Protected (Master Auth Required)</span>
            </span>
          )}
        </div>
      </div>

      {/* Staff Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDoctors.map((doc) => {
          const revealed = revealedCredentials?.[doc.id];

          return (
            <div key={doc.id} className="bg-white rounded-[20px] border border-[#e7edf4] p-5 shadow-anvay-soft space-y-4 hover:border-[#0f6d8e]/40 transition flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-[#101828]">{doc.name}</h3>
                      <VerifiedDoctorBadge status="Verified" />
                    </div>
                    <p className="text-xs text-[#0f6d8e] font-semibold">{doc.specialization} ({doc.department})</p>
                    <p className="text-[11px] font-mono text-[#667085]">Lic: {doc.medicalCouncilRegNo} • Role: <strong>{doc.role || 'Doctor'}</strong></p>
                  </div>

                  <div className="w-10 h-10 rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-extrabold text-xs">
                    {doc.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </div>
                </div>

                {/* Verification Badges */}
                <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded-[20px] bg-[#ecfdf3] text-[#067647] flex items-center gap-1">
                    ✓ Email Verified ({doc.email})
                  </span>
                  <span className="px-2 py-0.5 rounded-[20px] bg-[#ecfdf3] text-[#067647] flex items-center gap-1">
                    ✓ Mobile Verified ({doc.phone})
                  </span>
                </div>

                {/* Protected Credentials Box */}
                <div className="p-3.5 bg-[#f8fbff] rounded-[12px] border border-[#e7edf4] space-y-1.5 text-xs">
                  <div className="flex justify-between items-center text-[#667085] text-[11px]">
                    <span>Assigned Staff Username:</span>
                    <strong className="font-mono text-[#101828]">{doc.username}</strong>
                  </div>

                  <div className="flex justify-between items-center text-[#667085] text-[11px] pt-1 border-t border-[#eef2f6]">
                    <span>Login Password:</span>
                    {revealed ? (
                      <div className="flex items-center gap-2">
                        <strong className="font-mono text-[#0f6d8e] bg-white px-2 py-0.5 rounded border border-[#bfe7f6]">
                          {revealed.unmaskedPassword}
                        </strong>
                        <button
                          onClick={() => copyToClipboard(revealed.unmaskedPassword, doc.id)}
                          className="text-[#0f6d8e] hover:text-[#0b5874] p-1 rounded"
                          title="Copy Password"
                        >
                          {copiedId === doc.id ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-[#98a2b3]">
                        <span>••••••••••••</span>
                        <Lock className="w-3 h-3 text-[#98a2b3]" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-[#667085] flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-[#0f6d8e]" />
                  <span>Affiliated to: <strong>{doc.hospitalName}</strong></span>
                </div>
              </div>

              {/* Action Buttons: Edit, Role Change, Delete */}
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
          );
        })}
      </div>

      {/* Modal 1: Master Authorization Password */}
      {isMasterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-[22px] p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-xl font-extrabold text-[#101828]">
                Hospital Master Authorization
              </h2>
              <p className="text-xs text-[#667085]">
                Enter your Hospital Master Authorization Password to unlock and view protected staff credentials.
              </p>
            </div>

            {masterAuthError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[9px] font-medium">
                {masterAuthError}
              </div>
            )}

            <form onSubmit={handleVerifyMasterPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#344054]">
                  Master Authorization Password
                </label>
                <input
                  type="password"
                  required
                  value={masterPasswordInput}
                  onChange={(e) => setMasterPasswordInput(e.target.value)}
                  placeholder="Enter Master Password (Demo: Master@123)"
                  className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMasterModalOpen(false)}
                  className="flex-1 h-[46px] bg-[#f8fbff] text-[#344054] border border-[#d0d5dd] font-bold rounded-[9px] text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={masterAuthLoading}
                  className="flex-1 h-[46px] bg-[#0f6d8e] hover:bg-[#0b5874] text-white font-bold rounded-[9px] text-xs"
                >
                  {masterAuthLoading ? 'Verifying...' : 'Authorize & Unlock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Doctor / Staff */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-[22px] p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-[#eef2f6]">
              <div>
                <h2 className="text-lg font-extrabold text-[#101828]">Enroll Hospital Doctor / Staff</h2>
                <p className="text-xs text-[#667085]">Credentials will be generated and stored in your hospital vault.</p>
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
                <label className="block font-semibold text-[#344054]">Doctor Full Name *</label>
                <input
                  type="text"
                  required
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  placeholder="e.g. Dr. Vikram Sen"
                  className="w-full h-[44px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Medical Council Reg No *</label>
                  <input
                    type="text"
                    required
                    value={newStaff.medicalCouncilRegNo}
                    onChange={(e) => setNewStaff({ ...newStaff, medicalCouncilRegNo: e.target.value })}
                    placeholder="MCI-DL-2024-9912"
                    className="w-full h-[44px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none font-mono focus:border-[#20a7ce]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Specialization *</label>
                  <input
                    type="text"
                    required
                    value={newStaff.specialization}
                    onChange={(e) => setNewStaff({ ...newStaff, specialization: e.target.value, department: e.target.value })}
                    placeholder="e.g. Cardiology"
                    className="w-full h-[44px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Official Email</label>
                  <input
                    type="email"
                    value={newStaff.email}
                    onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                    placeholder="doctor@hospital.org"
                    className="w-full h-[44px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Mobile Phone</label>
                  <input
                    type="tel"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    placeholder="+91 98000 00000"
                    className="w-full h-[44px] px-3 bg-white border border-[#d0d5dd] rounded-[9px] outline-none focus:border-[#20a7ce]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddStaffOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-[9px] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addStaffLoading}
                  className="px-6 py-2 bg-[#0f6d8e] text-white rounded-[9px] font-bold"
                >
                  {addStaffLoading ? 'Generating...' : 'Enroll Doctor & Generate Login →'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Edit Doctor / Staff */}
      {isEditOpen && editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white max-w-lg w-full rounded-[22px] p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-[#eef2f6]">
              <h2 className="text-lg font-extrabold text-[#101828]">Edit Staff Member Profile</h2>
              <button onClick={() => { setIsEditOpen(false); setEditingStaff(null); }} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {editError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[9px]">
                {editError}
              </div>
            )}

            <form onSubmit={handleEditStaffSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Staff Full Name *</label>
                <input
                  type="text"
                  required
                  value={editingStaff.name}
                  onChange={(e) => setEditingStaff({ ...editingStaff, name: e.target.value })}
                  className="w-full h-[44px] px-3 bg-white border border-[#d0d5dd] rounded-[9px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Specialization</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.specialization}
                    onChange={(e) => setEditingStaff({ ...editingStaff, specialization: e.target.value })}
                    className="w-full h-[44px] px-3 bg-white border border-[#d0d5dd] rounded-[9px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Department</label>
                  <input
                    type="text"
                    required
                    value={editingStaff.department}
                    onChange={(e) => setEditingStaff({ ...editingStaff, department: e.target.value })}
                    className="w-full h-[44px] px-3 bg-white border border-[#d0d5dd] rounded-[9px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Official Email</label>
                  <input
                    type="email"
                    value={editingStaff.email}
                    onChange={(e) => setEditingStaff({ ...editingStaff, email: e.target.value })}
                    className="w-full h-[44px] px-3 bg-white border border-[#d0d5dd] rounded-[9px]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-semibold text-[#344054]">Mobile Phone</label>
                  <input
                    type="tel"
                    value={editingStaff.phone}
                    onChange={(e) => setEditingStaff({ ...editingStaff, phone: e.target.value })}
                    className="w-full h-[44px] px-3 bg-white border border-[#d0d5dd] rounded-[9px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setEditingStaff(null); }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-[9px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2 bg-[#0f6d8e] text-white rounded-[9px] font-bold"
                >
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Change Role */}
      {isRoleOpen && roleStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-[22px] p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-[#eef2f6]">
              <h2 className="text-lg font-extrabold text-[#101828]">Change Staff Role / Title</h2>
              <button onClick={() => { setIsRoleOpen(false); setRoleStaff(null); setRoleMasterPassword(''); }} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {roleError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[9px]">
                {roleError}
              </div>
            )}

            <form onSubmit={handleRoleChangeSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Select New Clinical/Administrative Role</label>
                <select
                  value={newRoleInput}
                  onChange={(e) => setNewRoleInput(e.target.value)}
                  className="w-full h-[44px] px-3 bg-white border border-[#d0d5dd] rounded-[9px]"
                >
                  <option value="Doctor">Doctor</option>
                  <option value="Senior Doctor">Senior Doctor</option>
                  <option value="Dept Head">Department Head</option>
                  <option value="Nurse">Nurse</option>
                  <option value="Senior Nurse">Senior Nurse</option>
                  <option value="Lab Technician">Lab Technician</option>
                  <option value="Pharmacist">Pharmacist</option>
                  <option value="Admin Staff">Admin Staff</option>
                  <option value="Receptionist">Receptionist</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Hospital Master Password Verification</label>
                <input
                  type="password"
                  required
                  value={roleMasterPassword}
                  onChange={(e) => setRoleMasterPassword(e.target.value)}
                  placeholder="Verify Master Password"
                  className="w-full h-[44px] px-3 bg-white border border-[#d0d5dd] rounded-[9px]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsRoleOpen(false); setRoleStaff(null); setRoleMasterPassword(''); }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-[9px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={roleLoading}
                  className="px-6 py-2 bg-[#0f6d8e] text-white rounded-[9px] font-bold"
                >
                  {roleLoading ? 'Updating...' : 'Confirm Role Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 5: Delete Staff */}
      {isDeleteOpen && deletingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-[22px] p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-[#eef2f6]">
              <h2 className="text-lg font-extrabold text-red-700 flex items-center gap-1">
                <AlertTriangle className="w-5 h-5 text-red-600" /> Remove Staff Member
              </h2>
              <button onClick={() => { setIsDeleteOpen(false); setDeletingStaff(null); setDeleteMasterPassword(''); }} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {deleteError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[9px]">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteStaffSubmit} className="space-y-4 text-xs">
              <p className="text-xs text-slate-600 leading-relaxed">
                Are you sure you want to remove <strong>{deletingStaff.name}</strong> from your hospital? This action will revoke their login credentials and portal access immediately.
              </p>

              <div className="space-y-1">
                <label className="block font-semibold text-[#344054]">Hospital Master Password Verification</label>
                <input
                  type="password"
                  required
                  value={deleteMasterPassword}
                  onChange={(e) => setDeleteMasterPassword(e.target.value)}
                  placeholder="Verify Master Password"
                  className="w-full h-[44px] px-3 bg-white border border-[#d0d5dd] rounded-[9px]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsDeleteOpen(false); setDeletingStaff(null); setDeleteMasterPassword(''); }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-[9px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="px-6 py-2 bg-red-700 text-white rounded-[9px] font-bold"
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
