import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Clock, Building2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VerifiedHospitalBadge } from '../components/VerifiedHospitalBadge';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

export const HospitalVerificationManagementPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'Hospital Admin'));
    const unsub = onSnapshot(q, (snapshot) => {
      const hospData = snapshot.docs.map(d => ({
        id: d.id,
        verificationStatus: d.data().verificationStatus || (d.data().verified ? 'Approved' : 'Pending Verification'),
        ...d.data()
      }));
      setHospitals(hospData);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching hospitals:', err);
      setFetchError('Failed to load hospital records.');
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await updateDoc(doc(db, 'users', id), {
        verificationStatus: status,
        verified: status === 'Approved',
        updatedAt: serverTimestamp()
      });
    } catch (e) {
      console.error('Error updating hospital status:', e);
      alert('Failed to update hospital status: ' + e.message);
    }
  };

  const filteredHospitals = filterStatus === 'All'
    ? hospitals
    : hospitals.filter(h => h.verificationStatus.toLowerCase() === filterStatus.toLowerCase());

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#20a7ce] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-500">Loading hospital records...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="p-8 text-center">
        <div className="w-14 h-14 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-slate-800 mb-1">Could Not Load Hospitals</h2>
        <p className="text-xs text-slate-500 mb-4">{fetchError}</p>
        <button
          onClick={fetchHospitals}
          className="px-4 py-2 bg-[#0f6d8e] text-white text-xs font-bold rounded-lg hover:bg-[#0b5874] transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-rose-700 text-xs font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Super Admin Authority</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Hospital Accreditation & Licensing Review Queue
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verify medical institutions, check compliance documents, and grant or revoke patient search access.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 text-xs font-bold">
        {['All', 'Pending Verification', 'Approved', 'Suspended'].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              filterStatus === status
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Hospitals List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
        {filteredHospitals.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">No institutions found matching selected filter.</div>
        ) : (
          filteredHospitals.map((hosp) => (
            <div key={hosp.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50 transition">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{hosp.name}</h3>
                  <VerifiedHospitalBadge status={hosp.verificationStatus} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="font-mono font-medium">Reg: {hosp.regNumber}</span>
                  <span>Type: {hosp.type}</span>
                  <span>Location: {hosp.district}, {hosp.state}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Superintendent: <strong>{hosp.authorizedRepresentative}</strong> • Email: {hosp.email} • Phone: {hosp.contactPhone}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {hosp.verificationStatus !== 'Approved' && (
                  <button
                    onClick={() => handleUpdateStatus(hosp.id, 'Approved')}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                )}

                {hosp.verificationStatus !== 'Suspended' && (
                  <button
                    onClick={() => handleUpdateStatus(hosp.id, 'Suspended')}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Suspend Access</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
