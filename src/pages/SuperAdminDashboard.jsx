import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Building2,
  Users,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Activity,
  FileText
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VerifiedHospitalBadge } from '../components/VerifiedHospitalBadge';

export const SuperAdminDashboard = () => {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [metrics, setMetrics] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [recentAudits, setRecentAudits] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Fetch platform metrics
      const mRes = await fetch('/api/analytics/platform-metrics', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const mData = await mRes.json();
      if (mData.success) setMetrics(mData.metrics);

      // Fetch hospitals
      const hRes = await fetch('/api/hospitals', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const hData = await hRes.json();
      if (hData.success) setHospitals(hData.hospitals);

      // Fetch audit logs
      const aRes = await fetch('/api/audit?limit=6', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const aData = await aRes.json();
      if (aData.success) setRecentAudits(aData.logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [token]);

  const handleVerifyHospital = async (id, status) => {
    try {
      const res = await fetch(`/api/hospitals/${id}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, remarks: `Processed by Super Admin on ${new Date().toLocaleDateString()}` })
      });
      const data = await res.json();
      if (data.success) {
        fetchAdminData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
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
          <Link
            to="/audit-logs"
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-700"
          >
            <FileCheck className="w-4 h-4 text-teal-400" />
            <span>Audit Trail Explorer</span>
          </Link>
          <Link
            to="/hospital-verifications"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verification Queue</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-semibold block">Connected Hospitals</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics?.totalHospitals || hospitals.length}</span>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              {metrics?.approvedHospitals || 3} Approved
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-semibold block">Pending Approvals</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-amber-600">{metrics?.pendingHospitals || 1}</span>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Review Needed
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-semibold block">Verified Doctors</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics?.verifiedDoctors || 3}</span>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              MCI Licensed
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-semibold block">Audit Trail Entries</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-purple-700">{metrics?.totalAuditEntries || 6}</span>
            <span className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Tamper-Evident
            </span>
          </div>
        </div>
      </div>

      {/* Hospital Verification Action List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Hospital Accreditation & Verification Queue
            </h3>
            <p className="text-[11px] text-slate-500">
              Review official hospital registration licenses and grant network access.
            </p>
          </div>
          <Link to="/hospital-verifications" className="text-xs font-bold text-teal-600 hover:underline">
            View All Verifications
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {hospitals.map((hosp) => (
            <div key={hosp.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition">
              <div className="space-y-0.5">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{hosp.name}</h4>
                  <VerifiedHospitalBadge status={hosp.verificationStatus} />
                </div>
                <p className="text-xs text-slate-500">
                  Reg No: <span className="font-mono text-slate-700 font-medium">{hosp.regNumber}</span> • Type: {hosp.type} • {hosp.district}, {hosp.state}
                </p>
                <p className="text-[11px] text-slate-400">
                  Representative: {hosp.authorizedRepresentative} • Email: {hosp.email}
                </p>
              </div>

              {/* Action Buttons for Super Admin */}
              <div className="flex items-center gap-2 shrink-0">
                {hosp.verificationStatus !== 'Approved' && (
                  <button
                    onClick={() => handleVerifyHospital(hosp.id, 'Approved')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Verify</span>
                  </button>
                )}

                {hosp.verificationStatus !== 'Suspended' && (
                  <button
                    onClick={() => handleVerifyHospital(hosp.id, 'Suspended')}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Suspend Node</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Live Audit Log Feed Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Live Clinical & Security Audit Trail
            </h3>
            <p className="text-[11px] text-slate-500">
              Real-time tamper-evident stream of medical record accesses, amendments, and emergency accesses
            </p>
          </div>
          <Link to="/audit-logs" className="text-xs font-bold text-teal-600 hover:underline">
            Open Full Log Stream
          </Link>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {recentAudits.map((log) => (
            <div key={log.id} className="p-3.5 hover:bg-slate-50 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    log.severity === 'HIGH_ALERT'
                      ? 'bg-rose-100 text-rose-800'
                      : log.severity === 'SECURITY'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-slate-100 text-slate-800'
                  }`}>
                    {log.action}
                  </span>
                  <span className="font-bold text-slate-800">{log.actorName}</span>
                  <span className="text-slate-400">({log.actorRole})</span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{log.details}</p>
                {log.hospitalName && (
                  <p className="text-[10px] text-slate-400">Hospital: {log.hospitalName}</p>
                )}
              </div>

              <span className="text-[10px] text-slate-400 shrink-0">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
