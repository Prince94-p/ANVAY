import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Clock, Building2, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VerifiedHospitalBadge } from '../components/VerifiedHospitalBadge';

export const HospitalVerificationManagementPage = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/hospitals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHospitals(data.hospitals);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, [token]);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/hospitals/${id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, remarks: `Status updated to ${status} by Super Admin` })
      });
      const data = await res.json();
      if (data.success) {
        fetchHospitals();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredHospitals = filterStatus === 'All'
    ? hospitals
    : hospitals.filter(h => h.verificationStatus.toLowerCase() === filterStatus.toLowerCase());

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
