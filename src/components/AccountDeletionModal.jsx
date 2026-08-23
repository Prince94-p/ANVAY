import React, { useState, useEffect } from 'react';
import { AlertTriangle, Trash2, X, Loader2, CheckCircle2 } from 'lucide-react';
import { functions, db } from '../firebase';
import { httpsCallable } from 'firebase/functions';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export const AccountDeletionModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pendingRequest, setPendingRequest] = useState(null);

  useEffect(() => {
    if (!isOpen || !user?.uid) return;

    const q = query(
      collection(db, 'deletionRequests'),
      where('userId', '==', user.uid),
      where('status', '==', 'Pending')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        setPendingRequest({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setPendingRequest(null);
      }
    }, (err) => {
      console.warn('Error listening to deletion requests:', err);
    });

    return () => unsub();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const requestAccountDeletion = httpsCallable(functions, 'requestAccountDeletion');
      await requestAccountDeletion({ reason });
      setSuccess('Your account deletion request has been submitted for Super Admin review.');
      setReason('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to submit account deletion request.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    setCancelLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const cancelDeletionRequest = httpsCallable(functions, 'cancelDeletionRequest');
      await cancelDeletionRequest({ requestId: pendingRequest?.id });
      setSuccess('Account deletion request has been successfully cancelled.');
      setPendingRequest(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to cancel deletion request.');
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/70 backdrop-blur-xs">
      <div className="bg-white max-w-md w-full rounded-[22px] p-6 sm:p-7 space-y-4 shadow-anvay-card animate-in fade-in zoom-in duration-200 text-[#101828]">
        <div className="flex justify-between items-start pb-3 border-b border-[#eef2f6]">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Request Account Deletion</h2>
              <p className="text-[11px] text-slate-500">National Health Interoperability Security Protocol</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg hover:bg-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {pendingRequest ? (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-bold">
                <AlertTriangle className="w-4 h-4" />
                <span>Pending Deletion Review</span>
              </div>
              <p className="text-amber-700 text-[11px] leading-relaxed">
                You currently have an active deletion request submitted on{' '}
                <strong>{pendingRequest.createdAt?.toDate ? pendingRequest.createdAt.toDate().toLocaleDateString() : 'recently'}</strong>.
              </p>
              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200 font-mono text-[11px] text-amber-900">
                Reason: "{pendingRequest.reason}"
              </div>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCancelRequest}
                disabled={cancelLoading}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {cancelLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>Cancel Request</span>
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleRequestSubmit} className="space-y-4 text-xs">
            <p className="text-slate-600 text-xs leading-relaxed">
              In accordance with health data compliance standards, account deletion requests must be formally validated by a Central Super Administrator.
              Once approved, your login access will be revoked while clinical records are preserved under regulatory provenance.
            </p>

            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                Reason for Account Deletion <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please state why you wish to delete your account (e.g. duplicate account, transferred, personal preference)..."
                className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-[11px] text-slate-500">
              <p>Account: <strong>{user?.name || user?.email}</strong> ({user?.role})</p>
              {user?.anvayId && <p>ANVAY ID: <strong className="font-mono">{user.anvayId}</strong></p>}
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition"
              >
                Keep Account
              </button>
              <button
                type="submit"
                disabled={loading || !reason.trim()}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition flex items-center gap-1.5 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Submit Deletion Request</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
