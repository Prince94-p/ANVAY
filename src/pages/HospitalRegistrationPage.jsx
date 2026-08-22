import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const HospitalRegistrationPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    regNumber: '',
    type: 'Multi-Specialty Hospital',
    address: '',
    district: '',
    state: '',
    contactPhone: '',
    email: '',
    authorizedRepresentative: '',
    departments: 'General Medicine, Cardiology, Emergency Care, Pediatrics',
    adminUsername: '',
    adminPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/hospitals/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          departments: formData.departments.split(',').map(d => d.trim())
        })
      });

      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Hospital registration submitted for Super Admin review.');
      } else {
        setError(data.message || 'Failed to submit hospital registration.');
      }
    } catch (err) {
      setError('Network error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-[#101828] pb-16">
      {/* Top Banner */}
      <section className="bg-[#eef9fc] py-12 px-[6%] sm:px-[8%] text-center rounded-[25px] anvay-gradient-login">
        <div className="max-w-2xl mx-auto space-y-3">
          <div className="anvay-badge mx-auto">
            HOSPITAL NETWORK ACCREDITATION
          </div>
          <h1 className="text-3xl sm:text-[44px] font-extrabold text-[#101828] leading-tight">
            Register your medical institution
          </h1>
          <p className="text-[#667085] text-[14px] leading-relaxed">
            Connect your hospital to the national ANVAY interoperability network.
          </p>
        </div>
      </section>

      <main className="max-w-4xl mx-auto px-4">
        {successMsg ? (
          <section className="bg-white border border-[#e7edf4] rounded-[22px] p-8 sm:p-12 text-center space-y-5 shadow-anvay-soft">
            <div className="w-16 h-16 rounded-full bg-[#ecfdf3] text-[#067647] flex items-center justify-center text-2xl font-bold mx-auto">
              ✓
            </div>
            <h2 className="text-2xl font-extrabold text-[#101828]">
              Registration Submitted Successfully
            </h2>
            <p className="text-[#667085] text-xs max-w-md mx-auto leading-relaxed">
              Your hospital registration is now under <strong className="text-[#0f6d8e]">Pending Verification</strong> review by the Super Admin authority.
            </p>
            <div className="pt-3">
              <button
                onClick={() => navigate('/verification-status')}
                className="px-6 py-3 bg-[#0f6d8e] text-white font-bold rounded-[9px] text-xs"
              >
                Track Verification Status →
              </button>
            </div>
          </section>
        ) : (
          <section className="bg-white border border-[#e7edf4] rounded-[22px] p-6 sm:p-10 shadow-anvay-soft space-y-8">
            <div className="flex justify-between items-center pb-4 border-b border-[#eef2f6]">
              <div>
                <p className="text-[#0f6d8e] text-[11px] font-extrabold tracking-wider uppercase mb-1">
                  INSTITUTION ONBOARDING
                </p>
                <h2 className="text-2xl font-extrabold text-[#101828]">
                  Hospital Credentials & Licensure
                </h2>
              </div>

              <div className="p-3 bg-[#f8fbff] border border-[#e7edf4] rounded-[12px] text-xs font-semibold text-[#0f6d8e]">
                Step 1 of 2
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-[9px] font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Institution Details */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-extrabold text-xs">
                    01
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#101828]">Institution Information</h3>
                    <p className="text-xs text-[#667085]">Provide hospital registration and license numbers.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#344054]">Official Hospital Name *</label>
                    <input
                      type="text"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Apollo Multi-Specialty Hospital"
                      className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#344054]">Hospital Registration Number *</label>
                    <input
                      type="text"
                      required
                      name="regNumber"
                      value={formData.regNumber}
                      onChange={handleChange}
                      placeholder="e.g. REG-DL-2024-8840"
                      className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs font-mono outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#344054]">Hospital Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                    >
                      <option value="Tertiary Care Hospital">Tertiary Care Hospital</option>
                      <option value="Multi-Specialty Hospital">Multi-Specialty Hospital</option>
                      <option value="District Hospital">District Hospital</option>
                      <option value="Clinic & Diagnostics">Clinic & Diagnostics</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#344054]">Official Email *</label>
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="admin@hospital.org"
                      className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                    />
                  </div>
                </div>
              </div>

              {/* Location & Representative */}
              <div className="space-y-4 pt-4 border-t border-[#eef2f6]">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-extrabold text-xs">
                    02
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#101828]">Location & Representative</h3>
                    <p className="text-xs text-[#667085]">State, district and medical superintendent contact.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#344054]">State *</label>
                    <input
                      type="text"
                      required
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      placeholder="e.g. Kerala or Delhi"
                      className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#344054]">District *</label>
                    <input
                      type="text"
                      required
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      placeholder="e.g. Ernakulam"
                      className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-semibold text-[#344054]">Authorized Representative / Superintendent</label>
                    <input
                      type="text"
                      name="authorizedRepresentative"
                      value={formData.authorizedRepresentative}
                      onChange={handleChange}
                      placeholder="Dr. Full Name"
                      className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Portal Credentials */}
              <div className="space-y-4 pt-4 border-t border-[#eef2f6]">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-[#eaf8fc] text-[#0f6d8e] flex items-center justify-center font-extrabold text-xs">
                    03
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-[#101828]">Hospital Administrator Account</h3>
                    <p className="text-xs text-[#667085]">Setup portal credentials for your staff admin.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#344054]">Admin Username</label>
                    <input
                      type="text"
                      name="adminUsername"
                      value={formData.adminUsername}
                      onChange={handleChange}
                      placeholder="e.g. hospadmin_metro"
                      className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-[#344054]">Admin Password</label>
                    <input
                      type="password"
                      name="adminPassword"
                      value={formData.adminPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full h-[48px] px-3.5 bg-white border border-[#d0d5dd] rounded-[9px] text-xs outline-none focus:border-[#20a7ce] focus:ring-4 focus:ring-[#20a7ce]/10"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[#eef2f6] flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 h-[50px] bg-[#0f6d8e] hover:bg-[#0b5874] text-white font-bold rounded-[9px] text-xs shadow-xs transition"
                >
                  {loading ? 'Submitting...' : 'Submit Application for Super Admin Verification →'}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
};
