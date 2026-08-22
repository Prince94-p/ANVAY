import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FilePlus, ShieldCheck, Building2, User, Stethoscope, CheckCircle2, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VerifiedDoctorBadge } from '../components/VerifiedDoctorBadge';

export const AddMedicalRecordPage = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialAnvayId = searchParams.get('anvayId') || 'ANVAY-2026-8F29K4';

  const [formData, setFormData] = useState({
    patientAnvayId: initialAnvayId,
    recordType: 'Diagnosis',
    title: '',
    department: 'General Medicine',
    description: '',
    systolicBP: '',
    diastolicBP: '',
    pulseRate: '',
    prescribedMeds: ''
  });

  const [loading, setLoading] = useState(false);
  const [successRecord, setSuccessRecord] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const clinicalData = {};
    if (formData.systolicBP) clinicalData.systolicBP = formData.systolicBP;
    if (formData.diastolicBP) clinicalData.diastolicBP = formData.diastolicBP;
    if (formData.pulseRate) clinicalData.pulseRate = formData.pulseRate;

    if (formData.recordType === 'Prescription' && formData.prescribedMeds) {
      clinicalData.medications = formData.prescribedMeds.split(',').map(m => {
        const parts = m.trim().split(' ');
        return { name: parts[0] || m.trim(), strength: parts.slice(1).join(' ') || 'Standard', frequency: 'Daily' };
      });
    }

    try {
      const res = await fetch('/api/records/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          patientAnvayId: formData.patientAnvayId,
          recordType: formData.recordType,
          title: formData.title,
          department: formData.department,
          description: formData.description,
          clinicalData
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessRecord(data.record);
      } else {
        setError(data.message || 'Failed to add medical record');
      }
    } catch (err) {
      setError('Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-2 text-teal-700 text-xs font-bold uppercase tracking-wider mb-1">
          <FilePlus className="w-4 h-4" />
          <span>Clinical Encounter Registration</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900">
          Add New Medical Entry
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Record provenance will be permanently stamped with your hospital and verified doctor credentials.
        </p>
      </div>

      {/* Originating Clinician Provenance Card */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Authoring Clinician</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900">{user?.name}</span>
              <VerifiedDoctorBadge regNumber="MCI-VERIFIED" />
            </div>
          </div>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase block">Affiliated Hospital</span>
          <span className="font-bold text-slate-800">{user?.hospitalName || 'Network Hospital'}</span>
        </div>
      </div>

      {successRecord ? (
        <div className="bg-white rounded-2xl border border-emerald-200 p-8 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            Medical Record Added to Patient Timeline
          </h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Record ID <strong>{successRecord.recordId}</strong> has been sealed with complete source attribution for patient <strong>{formData.patientAnvayId}</strong>.
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/medical-history?anvayId=${formData.patientAnvayId}`)}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs"
            >
              <span>View Updated Longitudinal History</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSuccessRecord(null);
                setFormData({ ...formData, title: '', description: '' });
              }}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
            >
              Add Another Entry
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient ANVAY Health ID <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                name="patientAnvayId"
                value={formData.patientAnvayId}
                onChange={handleChange}
                placeholder="e.g. ANVAY-2026-8F29K4"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Record Category <span className="text-rose-500">*</span>
              </label>
              <select
                name="recordType"
                value={formData.recordType}
                onChange={handleChange}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
              >
                <option value="Diagnosis">Diagnosis</option>
                <option value="Prescription">Prescription</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Imaging Report">Imaging Report</option>
                <option value="Vaccination">Vaccination</option>
                <option value="Allergy">Allergy</option>
                <option value="Surgery">Surgery</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="General Check-up">General Check-up</option>
                <option value="Doctor Notes">Doctor Notes</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Encounter Title / Summary <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Post-viral respiratory follow-up & Spirometry review"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="e.g. Cardiology or Pulmonology"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            {formData.recordType === 'Prescription' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prescribed Medicines (Comma separated)
                </label>
                <input
                  type="text"
                  name="prescribedMeds"
                  value={formData.prescribedMeds}
                  onChange={handleChange}
                  placeholder="e.g. Telmisartan 40mg, Atorvastatin 10mg"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Clinical Findings & Physician Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter clinical examination notes, vitals, diagnostic impressions, and treatment instructions..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
            >
              {loading ? 'Submitting Record...' : 'Seal & Add to Longitudinal Record'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
