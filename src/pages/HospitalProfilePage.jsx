import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, Mail, Phone, MapPin, Award, CheckCircle2, Edit2, Save, X, Activity } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VerifiedHospitalBadge } from '../components/VerifiedHospitalBadge';

export const HospitalProfilePage = () => {
  const { t } = useTranslation();
  const { token, user } = useAuth();
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    type: '',
    address: '',
    district: '',
    state: '',
    email: '',
    contactPhone: '',
    authorizedRepresentative: '',
    departments: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchHospitalProfile = async () => {
    setLoading(true);
    const hospitalId = user?.hospitalId || 'hosp_metro_01';
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setHospital(data.hospital);
        setDoctors(data.doctors || []);
        setEditForm({
          name: data.hospital.name,
          type: data.hospital.type,
          address: data.hospital.address,
          district: data.hospital.district,
          state: data.hospital.state,
          email: data.hospital.email,
          contactPhone: data.hospital.contactPhone,
          authorizedRepresentative: data.hospital.authorizedRepresentative || '',
          departments: (data.hospital.departments || []).join(', ')
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitalProfile();
  }, [token, user]);

  const handleChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const hospitalId = hospital.id;
    const body = {
      ...editForm,
      departments: editForm.departments.split(',').map(d => d.trim()).filter(Boolean)
    };

    try {
      const res = await fetch(`/api/hospitals/${hospitalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (data.success) {
        setHospital(data.hospital);
        setSuccess('Hospital profile updated successfully');
        setIsEditing(false);
      } else {
        setError(data.message || 'Failed to update hospital profile');
      }
    } catch (err) {
      setError('Network error occurred.');
    }
  };

  if (loading || !hospital) {
    return <div className="p-8 text-center text-xs text-slate-500">Loading hospital profile...</div>;
  }

  const isHospitalAuthority = user?.role === 'Hospital Admin' || user?.role === 'Super Admin';

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-[#101828]">
      {/* Success/Error Alerts */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 text-green-700 text-xs rounded-xl font-medium">
          {success}
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">{hospital.name}</h1>
            <VerifiedHospitalBadge status={hospital.verificationStatus} />
          </div>
          <p className="text-xs text-slate-500 font-mono">
            Registration No: <strong>{hospital.regNumber}</strong> • Type: {hospital.type}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isHospitalAuthority && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-[#0f6d8e] hover:bg-[#0b5874] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
            >
              <Edit2 className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          )}
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span>ANVAY Network Node: <strong>ACTIVE</strong></span>
            <p className="text-[11px] text-teal-700 font-bold">Interoperability Protocol 2026 Compliant</p>
          </div>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
          <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">
            Edit Hospital Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#344054]">Hospital Name *</label>
              <input
                type="text"
                required
                name="name"
                value={editForm.name}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-[#d0d5dd] rounded-lg text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#344054]">Hospital Type</label>
              <input
                type="text"
                name="type"
                value={editForm.type}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-[#d0d5dd] rounded-lg text-xs outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="block text-xs font-bold text-[#344054]">Address *</label>
              <input
                type="text"
                required
                name="address"
                value={editForm.address}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-[#d0d5dd] rounded-lg text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#344054]">District *</label>
              <input
                type="text"
                required
                name="district"
                value={editForm.district}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-[#d0d5dd] rounded-lg text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#344054]">State *</label>
              <input
                type="text"
                required
                name="state"
                value={editForm.state}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-[#d0d5dd] rounded-lg text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#344054]">Official Email *</label>
              <input
                type="email"
                required
                name="email"
                value={editForm.email}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-[#d0d5dd] rounded-lg text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#344054]">Contact Phone *</label>
              <input
                type="text"
                required
                name="contactPhone"
                value={editForm.contactPhone}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-[#d0d5dd] rounded-lg text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#344054]">Authorized Representative</label>
              <input
                type="text"
                name="authorizedRepresentative"
                value={editForm.authorizedRepresentative}
                onChange={handleChange}
                className="w-full h-10 px-3 border border-[#d0d5dd] rounded-lg text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#344054]">Clinical Departments (comma-separated)</label>
              <input
                type="text"
                name="departments"
                value={editForm.departments}
                onChange={handleChange}
                placeholder="Cardiology, Pulmonology, Internal Medicine"
                className="w-full h-10 px-3 border border-[#d0d5dd] rounded-lg text-xs outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-bold flex items-center gap-1.5"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#0f6d8e] hover:bg-[#0b5874] text-white rounded-lg font-bold flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" /> Save Updates
            </button>
          </div>
        </form>
      ) : (
        /* Info Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">
              Institution Location & Contact
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Physical Address</span>
                <p className="font-semibold text-slate-800 mt-0.5">{hospital.address}</p>
                <p className="text-slate-500">{hospital.district}, {hospital.state}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Official Communications</span>
                <p className="font-semibold text-slate-800 mt-0.5">{hospital.email}</p>
                <p className="text-slate-500">{hospital.contactPhone}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Authorized Representative</span>
                <p className="font-semibold text-slate-800 mt-0.5">{hospital.authorizedRepresentative || 'Medical Superintendent'}</p>
              </div>

              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Accreditation Documents</span>
                <p className="text-teal-700 font-semibold mt-0.5">NABH & ISO Healthcare Verified</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold mb-2">Active Clinical Departments</span>
              <div className="flex flex-wrap gap-2">
                {(hospital.departments || []).map((dept, i) => (
                  <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold">
                    {dept}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Hospital Staff Roster */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-xs border-b border-slate-100 pb-2">
              Credentialed Doctors ({doctors.length})
            </h3>

            <div className="space-y-3">
              {doctors.map(d => (
                <div key={d.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{d.name}</span>
                    <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded border border-teal-200">
                      Verified
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">{d.specialization} ({d.department})</p>
                  <p className="text-[10px] font-mono text-slate-400">Reg: {d.medicalCouncilRegNo}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
