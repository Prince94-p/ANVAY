import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Activity,
  User,
  Building2,
  FilePlus,
  AlertTriangle
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { CompletenessScoreGauge } from '../components/CompletenessScoreGauge';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const MissingRecordsPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'users'), where('role', '==', 'Patient'));
    const unsub = onSnapshot(q, (snapshot) => {
      const pList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPatients(pList);
      setLoading(false);
    }, (err) => {
      console.warn('Error loading patients:', err);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
          <Activity className="w-4 h-4" />
          <span>Clinical Data Quality & Gap Analysis</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Medical Record Completeness & Missing Gaps
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Automated clinical surveillance identifying critical missing vaccines, allergies, and diagnostic screenings.
        </p>
      </div>

      {/* Critical Medical Distinction Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5 shadow-xs space-y-2">
        <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>Clinical Safety Notice: Interpreting Missing Medical Records</span>
        </div>
        <p className="text-xs text-amber-900 leading-relaxed">
          The system strictly distinguishes between <strong className="underline">“No known record”</strong> (data was never entered in the network) and <strong className="underline">“Confirmed none / Confirmed negative”</strong> (a clinician explicitly tested or confirmed absence, e.g. NKDA). <em>Clinicians must never assume a patient does not have a medical condition simply because a record is missing.</em>
        </p>
      </div>

      {/* Patient Gaps Breakdown */}
      <div className="space-y-6">
        {patients.map((p) => (
          <div key={p.anvayId} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-900 text-base">{p.fullName}</h3>
                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                    {p.anvayId}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {p.gender}, {p.age} yrs • Blood Group: <strong>{p.bloodGroup || 'UNKNOWN'}</strong> • Hospital: {p.registeredByHospitalName}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`/add-record?anvayId=${p.anvayId}`}
                  className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                  <span>Update Record</span>
                </Link>
                <Link
                  to={`/clinical-snapshot?anvayId=${p.anvayId}`}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
                >
                  Clinical Snapshot
                </Link>
              </div>
            </div>

            {/* Gauge and Itemized Gaps */}
            <CompletenessScoreGauge completeness={p.completeness} showDetails={true} />
          </div>
        ))}
      </div>
    </div>
  );
};
