import React, { useState, useEffect } from 'react';
import { ShieldCheck, Clock, CheckCircle2, AlertCircle, Building2, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VerifiedHospitalBadge } from '../components/VerifiedHospitalBadge';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

export const HospitalVerificationStatusPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

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
      setLoading(false);
    });

    return () => unsub();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Accreditation & Trust Status</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Hospital Network Verification Registry
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Only verified medical institutions with approved accreditation can search, contribute, and verify patient records.
        </p>
      </div>

      {/* Verification Lifecycle Infographic */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">
          Hospital Verification Lifecycle
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-1">
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-800 font-bold flex items-center justify-center text-xs">1</span>
            <h4 className="font-bold text-slate-800">Registration Submission</h4>
            <p className="text-[11px] text-slate-500">Hospital submits license, contact info, and accreditation papers.</p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs space-y-1">
            <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-xs">2</span>
            <h4 className="font-bold text-amber-900">Pending Review</h4>
            <p className="text-[11px] text-amber-700">Application placed in Super Admin accreditation inspection queue.</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 text-xs space-y-1">
            <span className="w-6 h-6 rounded-full bg-blue-200 text-blue-900 font-bold flex items-center justify-center text-xs">3</span>
            <h4 className="font-bold text-blue-900">Super Admin Review</h4>
            <p className="text-[11px] text-blue-700">Licensure validation with state medical registration databases.</p>
          </div>

          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs space-y-1">
            <span className="w-6 h-6 rounded-full bg-emerald-200 text-emerald-900 font-bold flex items-center justify-center text-xs">4</span>
            <h4 className="font-bold text-emerald-900">Approved & Verified</h4>
            <p className="text-[11px] text-emerald-700">Verified Hospital Badge issued; full clinical read/write access unlocked.</p>
          </div>
        </div>
      </div>

      {/* Network Hospitals List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900">
            Registered Network Hospitals ({hospitals.length})
          </h3>
          <span className="text-xs text-slate-500">Live ANVAY Node Status</span>
        </div>

        <div className="divide-y divide-slate-200">
          {hospitals.map((hosp) => (
            <div key={hosp.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm">{hosp.name}</h4>
                  <VerifiedHospitalBadge status={hosp.verificationStatus} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="font-mono text-slate-600 font-medium">Reg: {hosp.regNumber}</span>
                  <span>Type: {hosp.type}</span>
                  <span>Location: {hosp.district}, {hosp.state}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Authorized Rep: <strong>{hosp.authorizedRepresentative || 'Medical Superintendent'}</strong> • Email: {hosp.email}
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[11px] text-slate-400 block">Registered On</span>
                <span className="text-xs font-medium text-slate-700">
                  {new Date(hosp.registeredAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
