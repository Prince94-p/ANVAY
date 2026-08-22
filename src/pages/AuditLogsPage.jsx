import React, { useState, useEffect } from 'react';
import { FileCheck, ShieldAlert, Filter, Clock, Building2, User, Activity, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export const AuditLogsPage = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();

  const [logs, setLogs] = useState([]);
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [filterAction, setFilterAction] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      let url = `/api/audit?limit=100&`;
      if (filterSeverity !== 'All') url += `severity=${encodeURIComponent(filterSeverity)}&`;
      if (filterAction !== 'All') url += `action=${encodeURIComponent(filterAction)}&`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [filterSeverity, filterAction, token]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
          <FileCheck className="w-4 h-4" />
          <span>Security & Compliance Trail</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Central Immutable Audit Trail
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Tamper-evident chronological logs of clinical record accesses, amendments, break-glass emergencies, and administrative reviews.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-700">
            <Filter className="w-4 h-4 text-teal-600" />
            <span>Filter Audit Trail:</span>
          </div>

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="All">All Severity Levels</option>
            <option value="HIGH_ALERT">High Alert (Emergency Access)</option>
            <option value="SECURITY">Security / Verification</option>
            <option value="INFO">Informational Events</option>
          </select>

          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
          >
            <option value="All">All Action Types</option>
            <option value="Emergency">Emergency Access</option>
            <option value="Created">Record Created</option>
            <option value="Updated">Record Updated / Amended</option>
            <option value="Viewed">Record Viewed</option>
            <option value="Document">Document Uploaded</option>
            <option value="Hospital">Hospital Status Action</option>
          </select>
        </div>

        <span className="text-slate-500 font-medium">
          Logged Events: <strong>{logs.length}</strong>
        </span>
      </div>

      {/* Log Feed Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="divide-y divide-slate-100 text-xs">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No audit events match filters.</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50/80 transition space-y-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.severity === 'HIGH_ALERT'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : log.severity === 'SECURITY'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {log.action}
                    </span>

                    <span className="font-bold text-slate-900">{log.actorName}</span>
                    <span className="text-slate-500 font-medium">({log.actorRole})</span>
                  </div>

                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <p className="text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200 font-sans">
                  {log.details}
                </p>

                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-0.5">
                  {log.hospitalName && <span>Hospital: <strong>{log.hospitalName}</strong></span>}
                  {log.patientAnvayId && <span>Patient Reference: <strong className="font-mono text-slate-700">{log.patientAnvayId}</strong></span>}
                  <span className="font-mono">Log ID: {log.id}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
