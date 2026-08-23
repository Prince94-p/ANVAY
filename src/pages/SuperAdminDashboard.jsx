import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Building2, Users, FileCheck, AlertTriangle, CheckCircle2, XCircle, Clock,
  ArrowRight, ShieldCheck, Activity, FileText, Trash2, Check, X, Loader2, RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VerifiedHospitalBadge } from '../components/VerifiedHospitalBadge';
import { db, functions, auth } from '../firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { sendPasswordResetEmail } from 'firebase/auth';

export const SuperAdminDashboard = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  const [metrics, setMetrics] = useState({ totalHospitals: 0, verifiedDoctors: 0, totalPatients: 0, pendingDeletions: 0 });
  const [hospitals, setHospitals] = useState([]);
  const [deletionRequests, setDeletionRequests] = useState([]);
  const [deletionFilter, setDeletionFilter] = useState('ALL'); // 'ALL' | 'Pending' | 'Approved' | 'Rejected'
  const [loading, setLoading] = useState(true);

  // Action Modal for Deletion Request Approval / Rejection
  const [actionModal, setActionModal] = useState(null); // { request, action: 'Approved' | 'Rejected', reason: '' }
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Self Deletion Modal State
  const [isSelfDeleteOpen, setIsSelfDeleteOpen] = useState(false);
  const [selfDeleteLoading, setSelfDeleteLoading] = useState(false);
  const [selfDeleteError, setSelfDeleteError] = useState(null);

  useEffect(() => {
    // 1. Real-time listener for Hospitals
    const qHospitals = query(collection(db, 'users'), where('role', '==', 'Hospital Admin'));
    const unsubHospitals = onSnapshot(qHospitals, (snapshot) => {
      const hospData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHospitals(hospData);
      setMetrics(prev => ({ ...prev, totalHospitals: hospData.length }));
    });

    // 2. Real-time listener for Doctors
    const qDoctors = query(collection(db, 'users'), where('role', '==', 'Doctor'));
    const unsubDoctors = onSnapshot(qDoctors, (snapshot) => {
      setMetrics(prev => ({ ...prev, verifiedDoctors: snapshot.size }));
    });

    // 3. Real-time listener for Patients
    const qPatients = query(collection(db, 'users'), where('role', '==', 'Patient'));
    const unsubPatients = onSnapshot(qPatients, (snapshot) => {
      setMetrics(prev => ({ ...prev, totalPatients: snapshot.size }));
    });

    // 4. Real-time listener for Deletion Requests
    const qDeletions = query(collection(db, 'deletionRequests'));
    const unsubDeletions = onSnapshot(qDeletions, (snapshot) => {
      const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDeletionRequests(reqs);
      const pendingCount = reqs.filter(r => r.status === 'Pending').length;
      setMetrics(prev => ({ ...prev, pendingDeletions: pendingCount }));
      setLoading(false);
    }, (err) => {
      console.warn('Error fetching deletion requests:', err);
      setLoading(false);
    });

    return () => {
      unsubHospitals();
      unsubDoctors();
      unsubPatients();
      unsubDeletions();
    };
  }, []);

  const handleProcessRequest = async (e) => {
    e.preventDefault();
    if (!actionModal) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const processDeletionRequest = httpsCallable(functions, 'processDeletionRequest');
      await processDeletionRequest({
        requestId: actionModal.request.id,
        action: actionModal.action,
        adminReason: actionModal.reason
      });

      setActionSuccess(`Request successfully marked as ${actionModal.action}.`);
      setTimeout(() => {
        setActionModal(null);
        setActionSuccess(null);
      }, 1500);
    } catch (err) {
      console.error('Error processing deletion request:', err);
      setActionError(err.message || 'Failed to process request.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSelfDelete = async () => {
    setSelfDeleteLoading(true);
    setSelfDeleteError(null);

    try {
      const selfDeleteSuperAdmin = httpsCallable(functions, 'selfDeleteSuperAdmin');
      await selfDeleteSuperAdmin();
      alert('Super Admin account has been deleted successfully. You will now be signed out.');
      if (logout) await logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Self delete error:', err);
      setSelfDeleteError(err.message || 'Failed to delete account.');
      setSelfDeleteLoading(false);
    }
  };

  const filteredRequests = deletionRequests.filter(req => {
    if (deletionFilter === 'ALL') return true;
    return req.status === deletionFilter;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#101828]">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-rose-600 rounded-lg">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black">
              Central Super Admin Governance
            </h1>
          </div>
          <p className="text-xs text-slate-300">
            National Healthcare Interoperability Network • Access Control, Accreditation & Audit Authority
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSelfDeleteOpen(true)}
            className="px-3.5 py-2 bg-rose-700/80 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-rose-600"
          >
            <Trash2 className="w-4 h-4" />
            <span>Self-Delete Super Admin</span>
          </button>
        </div>
      </div>

      {/* Admin Profile Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <h2 className="text-sm font-black text-slate-900">Your Administrator Profile</h2>
          <div className="text-xs text-slate-600 space-y-1">
            <p>Role: <strong className="text-slate-900">{user?.role || 'Super Admin'}</strong></p>
            <p>ANVAY ID: <strong className="font-mono text-[#0f6d8e]">{user?.anvayId || user?.username || 'ANVAY-SA-0001'}</strong></p>
            <p>Email: <strong>{user?.email}</strong></p>
            <p>Status: <strong className="text-green-600">Active / Verified Authority</strong></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (user?.email) {
                sendPasswordResetEmail(auth, user.email).then(() => {
                  alert('Password reset email sent to your registered email address.');
                }).catch(e => {
                  console.error('Password reset error:', e);
                  alert('Failed to send password reset email.');
                });
              } else {
                alert('No email associated with this account.');
              }
            }}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
          >
            <span>Send Password Reset Link</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-semibold block">Connected Hospitals</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.totalHospitals}</span>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Live Network
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-semibold block">Total Patients</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">{metrics.totalPatients}</span>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Registered
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-semibold block">Verified Doctors</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.verifiedDoctors}</span>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              MCI Licensed
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-semibold block">Pending Deletions</span>
          <div className="flex items-baseline justify-between">
            <span className={`text-2xl font-black ${metrics.pendingDeletions > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {metrics.pendingDeletions}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              metrics.pendingDeletions > 0 ? 'text-rose-700 bg-rose-50 border-rose-200' : 'text-slate-700 bg-slate-50 border-slate-200'
            }`}>
              Requests
            </span>
          </div>
        </div>
      </div>

      {/* Deletion Requests Manager Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-base text-slate-900">
                Account Deletion Requests Manager
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Review and audit account deletion requests submitted by Patients, Doctors, and Hospitals.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            {['ALL', 'Pending', 'Approved', 'Rejected'].map(filter => (
              <button
                key={filter}
                onClick={() => setDeletionFilter(filter)}
                className={`px-3 py-1.5 rounded-lg transition ${
                  deletionFilter === filter
                    ? 'bg-white text-[#0f6d8e] shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter === 'ALL' ? `All (${deletionRequests.length})` : filter}
              </button>
            ))}
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-xl space-y-2">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500" />
            <p className="text-xs font-semibold text-slate-700">No {deletionFilter !== 'ALL' ? deletionFilter.toLowerCase() : ''} deletion requests found.</p>
            <p className="text-[11px] text-slate-400">All user accounts in the network are healthy and compliant.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold tracking-wider border-y border-slate-200">
                <tr>
                  <th className="px-4 py-3">User Details</th>
                  <th className="px-4 py-3">Role & ANVAY ID</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Requested At</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map(req => {
                  const reqDate = req.createdAt?.toDate ? req.createdAt.toDate().toLocaleDateString() : 'N/A';
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{req.userName || 'Unnamed'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{req.userEmail}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[11px]">
                          {req.role}
                        </span>
                        {req.anvayId && (
                          <div className="text-[11px] font-mono text-[#0f6d8e] font-bold mt-0.5">
                            {req.anvayId}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3.5 max-w-xs">
                        <p className="text-slate-700 text-xs italic bg-slate-50 p-2 rounded-lg border border-slate-200">
                          "{req.reason || 'No reason provided'}"
                        </p>
                        {req.adminReason && (
                          <p className="text-[10px] text-slate-500 mt-1">
                            <strong>Admin Note:</strong> {req.adminReason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-500 text-[11px]">
                        {reqDate}
                      </td>
                      <td className="px-4 py-3.5">
                        {req.status === 'Pending' && (
                          <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-[10px] flex items-center gap-1 w-max">
                            <Clock className="w-3 h-3" /> Pending Review
                          </span>
                        )}
                        {req.status === 'Approved' && (
                          <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px] flex items-center gap-1 w-max">
                            <Check className="w-3 h-3" /> Approved / Deleted
                          </span>
                        )}
                        {req.status === 'Rejected' && (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[10px] flex items-center gap-1 w-max">
                            <X className="w-3 h-3" /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2">
                        {req.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActionModal({ request: req, action: 'Approved', reason: '' })}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition shadow-2xs"
                              title="Approve and delete user"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setActionModal({ request: req, action: 'Rejected', reason: '' })}
                              className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold text-[11px] transition shadow-2xs"
                              title="Reject deletion request"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Processed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hospital Network List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Hospital Network
            </h3>
            <p className="text-[11px] text-slate-500">
              All officially registered hospitals in the platform.
            </p>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {hospitals.map((hosp) => (
            <div key={hosp.id || hosp.uid || hosp.anvayId || Math.random()} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{hosp.fullName || hosp.name}</h4>
                  <VerifiedHospitalBadge status="Approved" />
                </div>
                <p className="text-xs text-slate-500">
                  Email: {hosp.email} • ID: {hosp.anvayId}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal: Process Deletion Request (Approve/Reject with Reason) */}
      {actionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-[22px] p-6 sm:p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-base text-slate-900">
                {actionModal.action === 'Approved' ? 'Confirm Account Deletion' : 'Reject Deletion Request'}
              </h3>
              <button onClick={() => setActionModal(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {actionError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {actionError}
              </div>
            )}
            {actionSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium">
                {actionSuccess}
              </div>
            )}

            <form onSubmit={handleProcessRequest} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="text-slate-500">Target User: <strong>{actionModal.request.userName}</strong> ({actionModal.request.role})</p>
                <p className="text-slate-500">User Email: <span className="font-mono">{actionModal.request.userEmail}</span></p>
                <p className="text-slate-500">User Reason: <em className="text-slate-800">"{actionModal.request.reason}"</em></p>
              </div>

              {actionModal.action === 'Approved' ? (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 space-y-1">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" /> Caution
                  </p>
                  <p className="text-[11px] leading-relaxed">
                    Approving this request will permanently revoke the user's authentication and mark their profile as deleted. Longitudinal medical history records will retain provenance compliance.
                  </p>
                </div>
              ) : (
                <p className="text-slate-600">
                  Please provide a reason why this deletion request is being rejected.
                </p>
              )}

              <div className="space-y-1">
                <label className="block font-bold text-slate-700">
                  Admin Resolution Note / Reason {actionModal.action === 'Rejected' && <span className="text-rose-500">*</span>}
                </label>
                <textarea
                  rows={3}
                  required={actionModal.action === 'Rejected'}
                  value={actionModal.reason}
                  onChange={(e) => setActionModal({ ...actionModal, reason: e.target.value })}
                  placeholder={actionModal.action === 'Approved' ? 'Optional remarks for audit logs...' : 'Reason for rejecting this request...'}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#0f6d8e]"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`px-4 py-2 rounded-xl text-white font-bold transition flex items-center gap-1.5 disabled:opacity-50 ${
                    actionModal.action === 'Approved' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#0f6d8e] hover:bg-[#0b5874]'
                  }`}
                >
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Confirm {actionModal.action}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Self-Delete Super Admin */}
      {isSelfDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs">
          <div className="bg-white max-w-md w-full rounded-[22px] p-6 sm:p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-rose-600">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-base text-slate-900">Direct Super Admin Self-Deletion</h3>
              </div>
              <button onClick={() => setIsSelfDeleteOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {selfDeleteError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {selfDeleteError}
              </div>
            )}

            <p className="text-xs text-slate-600 leading-relaxed">
              As a Super Administrator, you can execute instant self-deletion. This will immediately purge your Firebase Auth account and mark your administrator record as deleted.
            </p>

            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs space-y-1">
              <p className="font-bold">⚠️ Warning: Irreversible Action</p>
              <p className="text-[11px]">You will be logged out immediately and will lose central governance access.</p>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsSelfDeleteOpen(false)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSelfDelete}
                disabled={selfDeleteLoading}
                className="px-4 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold transition text-xs flex items-center gap-1.5 disabled:opacity-50"
              >
                {selfDeleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Confirm Immediate Deletion</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
