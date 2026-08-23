import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Landmark, ShieldCheck, AlertTriangle, Activity, Building2,
  AlertOctagon, ArrowUpRight
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const GovernmentDashboard = () => {
  const { t } = useTranslation();
  const { token } = useAuth();

  const [metrics, setMetrics] = useState({ totalHospitals: 0, totalPatients: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time listener for Hospitals
    const qHospitals = query(collection(db, 'users'), where('role', '==', 'Hospital Admin'));
    const unsubHospitals = onSnapshot(qHospitals, (snapshot) => {
      setMetrics(prev => ({ ...prev, totalHospitals: snapshot.size }));
    });

    // Real-time listener for Patients
    const qPatients = query(collection(db, 'users'), where('role', '==', 'Patient'));
    const unsubPatients = onSnapshot(qPatients, (snapshot) => {
      setMetrics(prev => ({ ...prev, totalPatients: snapshot.size }));
    });

    setLoading(false);

    return () => {
      unsubHospitals();
      unsubPatients();
    };
  }, []);

  const timeSeriesTrends = [
    { month: "Jan", dengue: 120, malaria: 80, respiratory: 200, diabetes: 150 },
    { month: "Feb", dengue: 150, malaria: 90, respiratory: 180, diabetes: 160 },
    { month: "Mar", dengue: 320, malaria: 150, respiratory: 150, diabetes: 170 }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header & Privacy Banner */}
      <div className="border-b border-slate-200 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-purple-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Landmark className="w-4 h-4" />
            <span>State & National Public Health Surveillance</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Government Health Authority Epidemiological Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Aggregated, anonymized multi-hospital disease trend detection and outbreak prevention.
          </p>
        </div>
      </div>

      {/* Strict Privacy Protection Guarantee Banner */}
      <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 flex items-start gap-3 shadow-xs">
        <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-bold">Strict Anonymization Guarantee (Zero Patient PII)</p>
          <p className="text-purple-800 text-[11px] leading-relaxed">
            Data is anonymized. This dashboard visualizes macro disease velocity across geographical clusters without ever exposing individual patient identities or private health records.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-semibold block">Connected Hospitals</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.totalHospitals}</span>
            <span className="text-[10px] text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
              Verified Nodes
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <span className="text-xs text-slate-500 font-semibold block">Total Patients Registered</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">{metrics.totalPatients}</span>
            <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              Active Monitored
            </span>
          </div>
        </div>
      </div>

      {/* Multi-Month Disease Trend Line Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-900">
              Multi-Month Cross-Hospital Disease Velocity Trends
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated monthly cases reported across connected emergency departments
            </p>
          </div>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timeSeriesTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
              <YAxis stroke="#64748b" fontSize={11} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '12px', fontSize: '11px' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Line type="monotone" dataKey="dengue" name="Dengue Fever" stroke="#e11d48" strokeWidth={2.5} />
              <Line type="monotone" dataKey="malaria" name="Malaria" stroke="#d97706" strokeWidth={2.5} />
              <Line type="monotone" dataKey="respiratory" name="Respiratory (Asthma/COPD)" stroke="#0d9488" strokeWidth={2.5} />
              <Line type="monotone" dataKey="diabetes" name="Type 2 Diabetes" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
