import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, UserCheck, ShieldCheck, ArrowRight, UserPlus, FileText, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const PatientSearchPage = () => {
  const { t } = useTranslation();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchPatients = async (q = '') => {
    setLoading(true);
    setHasSearched(true);
    try {
      let qPatients;
      if (q.trim() === '') {
        qPatients = query(collection(db, 'users'), where('role', '==', 'Patient'));
      } else {
        const queryText = q.trim();
        qPatients = query(
          collection(db, 'users'), 
          where('role', '==', 'Patient'),
          where('anvayId', '==', queryText)
        );
      }
      
      const querySnapshot = await getDocs(qPatients);
      const data = querySnapshot.docs.map(doc => doc.data());
      setPatients(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch to show all available network patient profiles
    fetchPatients('');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPatients(searchQuery);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
            <Search className="w-4 h-4" />
            <span>Master Patient Index</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            {t('nav.searchPatient')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Locate authorized patients using ANVAY Health ID, Government Identity reference, or name.
          </p>
        </div>

        <Link
          to="/create-patient"
          className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>{t('nav.createPatient')}</span>
        </Link>
      </div>

      {/* Search Input Bar */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Enter ANVAY ID (e.g. ANVAY-2026-8F29K4), Govt ID ref (ABHA-8921...), or Patient Name"
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
        >
          {loading ? 'Searching...' : 'Search Network'}
        </button>
      </form>

      {/* Search Results List */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
            Matching Patient Identities ({patients.length})
          </h3>
          <span className="text-[11px] text-slate-500">
            Privacy Filtered: Masked identifiers shown prior to clinical open
          </span>
        </div>

        {patients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Search className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Patient Record Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No matching ANVAY profile exists in the connected network. You can register a new verified profile for this patient.
            </p>
            <div className="pt-2">
              <Link
                to="/create-patient"
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create ANVAY Profile</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {patients.map((p) => (
              <div key={p.anvayId} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/80 transition">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-bold text-slate-900 text-base">{p.fullName}</h4>
                    <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                      {p.anvayId}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Ref: {p.govtIdRef}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                    <span>{p.gender}, {p.age} years</span>
                    <span>Blood Group: <strong className="text-slate-900">{p.bloodGroup || 'Not Recorded'}</strong></span>
                    <span>Location: {p.district}, {p.state}</span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Originally Registered By: <strong>{p.registeredByHospitalName}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <Link
                    to={`/clinical-snapshot?anvayId=${p.anvayId}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-teal-50 text-teal-800 hover:text-teal-900 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>Clinical Snapshot</span>
                  </Link>

                  <Link
                    to={`/medical-history?anvayId=${p.anvayId}`}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Full Medical History</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
