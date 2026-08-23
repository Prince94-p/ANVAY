import React, { useState, useEffect } from 'react';
import { Building2, ShieldCheck, Mail, Phone, MapPin, Award, CheckCircle2, Edit2, Save, X, Activity, Trash2, Plus, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { VerifiedHospitalBadge } from '../components/VerifiedHospitalBadge';
import { AccountDeletionModal } from '../components/AccountDeletionModal';
import { db, storage } from '../firebase';
import { collection, query, where, onSnapshot, getDocs, doc, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const HospitalProfilePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [hospital, setHospital] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '', type: '', address: '', district: '', state: '', email: '', contactPhone: '', authorizedRepresentative: '', departments: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [fetchError, setFetchError] = useState(null);

  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [galleryError, setGalleryError] = useState(null);

  useEffect(() => {
    let unsubHospital;
    let unsubDoctors;

    const resolveAndSubscribe = async () => {
      if (!user) return;

      try {
        const userHospitalId = user?.hospitalId || user?.anvayHospitalId;

        // ── Case 1: User IS the Hospital Admin ───────────────────────
        if (user.role === 'Hospital Admin') {
          unsubHospital = onSnapshot(doc(db, 'users', user.uid), (snap) => {
            if (snap.exists()) {
              const data = { id: snap.id, ...snap.data() };
              setHospital(data);
              setEditForm({
                name: data.fullName || data.name || '',
                type: data.type || '',
                address: data.address || '',
                district: data.district || '',
                state: data.state || '',
                email: data.email || '',
                contactPhone: data.mobile || data.contactPhone || '',
                authorizedRepresentative: data.authorizedRepresentative || '',
                departments: (data.departments || []).join(', ')
              });
            } else {
              // Seed a minimal hospital doc from KNOWN_ADMIN data
              const synthetic = {
                id: user.uid,
                name: user.hospitalName || user.name || 'Hospital',
                fullName: user.hospitalName || user.name || 'Hospital',
                type: user.type || 'Multi-Specialty Hospital',
                address: user.address || 'Anand, Gujarat',
                district: user.district || 'Anand',
                state: user.state || 'Gujarat',
                email: user.email || '',
                mobile: user.mobile || '',
                contactPhone: user.contactPhone || user.mobile || '',
                hospitalId: userHospitalId || user.uid,
                anvayId: user.anvayId || '',
                role: 'Hospital Admin',
                departments: user.departments || [],
                verificationStatus: 'Verified',
                galleryUrls: []
              };
              setHospital(synthetic);
              setEditForm({
                name: synthetic.name,
                type: synthetic.type,
                address: synthetic.address,
                district: synthetic.district,
                state: synthetic.state,
                email: synthetic.email,
                contactPhone: synthetic.contactPhone,
                authorizedRepresentative: synthetic.authorizedRepresentative || '',
                departments: (synthetic.departments || []).join(', ')
              });
            }
            setLoading(false);
          }, (err) => {
            console.error('Error fetching hospital:', err);
            setFetchError('Network error loading hospital profile.');
            setLoading(false);
          });

        // ── Case 2: Doctor/Staff — look up Hospital Admin doc ─────────
        } else if (userHospitalId) {
          // Try to find the Hospital Admin user whose doc has hospitalId matching
          const q1 = await getDocs(
            query(collection(db, 'users'),
              where('role', '==', 'Hospital Admin'),
              where('hospitalId', '==', userHospitalId))
          );

          if (!q1.empty) {
            // Found the Hospital Admin Firestore doc
            const hospitalDocId = q1.docs[0].id;
            unsubHospital = onSnapshot(doc(db, 'users', hospitalDocId), (snap) => {
              if (snap.exists()) {
                const data = { id: snap.id, ...snap.data() };
                setHospital(data);
                setEditForm({
                  name: data.fullName || data.name || '',
                  type: data.type || '',
                  address: data.address || '',
                  district: data.district || '',
                  state: data.state || '',
                  email: data.email || '',
                  contactPhone: data.mobile || data.contactPhone || '',
                  authorizedRepresentative: data.authorizedRepresentative || '',
                  departments: (data.departments || []).join(', ')
                });
              }
              setLoading(false);
            });
          } else {
            // Hospital Admin doc doesn't exist yet — build synthetic from Doctor's own data
            const synthetic = {
              id: `synthetic_${userHospitalId}`,
              name: user.hospitalName || 'Charusat Hospital',
              fullName: user.hospitalName || 'Charusat Hospital',
              type: 'Multi-Specialty Hospital',
              address: 'Anand, Gujarat',
              district: 'Anand',
              state: 'Gujarat',
              email: '',
              mobile: '',
              contactPhone: '',
              hospitalId: userHospitalId,
              anvayId: userHospitalId,
              departments: [],
              verificationStatus: 'Verified',
              galleryUrls: []
            };
            setHospital(synthetic);
            setEditForm({
              name: synthetic.name,
              type: synthetic.type,
              address: synthetic.address,
              district: synthetic.district,
              state: synthetic.state,
              email: synthetic.email,
              contactPhone: synthetic.contactPhone,
              authorizedRepresentative: '',
              departments: ''
            });
            setLoading(false);
          }

        } else {
          setFetchError('No hospital associated with your account.');
          setLoading(false);
          return;
        }

        // ── Staff list for this hospital ──────────────────────────────
        const staffHospitalId = userHospitalId || user.uid;
        const qStaff = query(
          collection(db, 'users'),
          where('hospitalId', '==', staffHospitalId),
          where('role', 'in', ['Doctor', 'Staff'])
        );
        unsubDoctors = onSnapshot(qStaff, (snap) => {
          setDoctors(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (err) => console.warn('Staff query error:', err));

      } catch (err) {
        console.error('Hospital profile error:', err);
        setFetchError('Failed to load hospital profile.');
        setLoading(false);
      }
    };

    resolveAndSubscribe();

    return () => {
      if (unsubHospital) unsubHospital();
      if (unsubDoctors) unsubDoctors();
    };
  }, [user]);


  const handleChange = (e) => setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Always update using the Hospital Admin's own UID as doc ID
    // For Doctor viewing a real hospital doc, use hospital.id (which is the HA's UID)
    const realDocId = hospital.id?.startsWith('synthetic_') ? user.uid : hospital.id;
    try {
      await updateDoc(doc(db, 'users', realDocId), {
        name: editForm.name,
        fullName: editForm.name, // ensure both are updated for consistency
        type: editForm.type,
        address: editForm.address,
        district: editForm.district,
        state: editForm.state,
        email: editForm.email,
        mobile: editForm.contactPhone,
        authorizedRepresentative: editForm.authorizedRepresentative,
        departments: editForm.departments.split(',').map(d => d.trim()).filter(Boolean),
        updatedAt: serverTimestamp()
      });
      setSuccess('Hospital profile updated successfully');
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError('Network error occurred.');
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    setGalleryError(null);
    setSuccess(null);
    const hospitalId = hospital.id;
    const currentUrls = hospital.galleryUrls || [];

    if (currentUrls.length + files.length > 10) {
      setGalleryError('A maximum of 10 photos are allowed in the gallery.');
      return;
    }

    setUploadingGallery(true);
    try {
      const newUrls = [];
      for (const file of files) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
          throw new Error('Only JPEG, PNG, and WebP images are allowed.');
        }
        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Each image must be smaller than 5 MB.');
        }

        const fileName = `${Date.now()}_${file.name}`;
        const storageRef = ref(storage, `hospitals/${hospitalId}/gallery/${fileName}`);
        await uploadBytes(storageRef, file);
        const downloadUrl = await getDownloadURL(storageRef);
        newUrls.push(downloadUrl);
      }

      await updateDoc(doc(db, 'users', hospitalId), {
        galleryUrls: arrayUnion(...newUrls)
      });
      setSuccess('Gallery images uploaded successfully!');
    } catch (err) {
      console.error(err);
      setGalleryError(err.message || 'Failed to upload images.');
    } finally {
      setUploadingGallery(false);
      e.target.value = ''; // Reset input
    }
  };

  const handleGalleryDelete = async (url) => {
    setGalleryError(null);
    setSuccess(null);
    const hospitalId = hospital.id;
    try {
      // Decode the URL path to reference the exact Storage file path
      const decodedPath = decodeURIComponent(url.split('/o/')[1].split('?')[0]);
      const storageRef = ref(storage, decodedPath);
      await deleteObject(storageRef);

      await updateDoc(doc(db, 'users', hospitalId), {
        galleryUrls: arrayRemove(url)
      });
      setSuccess('Gallery image deleted successfully!');
    } catch (err) {
      console.error(err);
      setGalleryError('Failed to delete image from storage.');
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-block w-8 h-8 border-4 border-[#20a7ce] border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs text-slate-500">Loading hospital profile...</p>
      </div>
    );
  }

  if (fetchError || !hospital) {
    return (
      <div className="p-8 text-center">
        <div className="w-14 h-14 bg-red-50 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="w-7 h-7" />
        </div>
        <h2 className="text-base font-bold text-slate-800 mb-1">Could Not Load Hospital Profile</h2>
        <p className="text-xs text-slate-500 mb-4">{fetchError || 'Hospital data is unavailable.'}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#0f6d8e] text-white text-xs font-bold rounded-lg hover:bg-[#0b5874] transition"
        >
          Retry
        </button>
      </div>
    );
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
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-[#0f6d8e] hover:bg-[#0b5874] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              {user?.role === 'Hospital Admin' && (
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Account</span>
                </button>
              )}
            </>
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
        /* Info Cards Grid & Gallery */
        <div className="space-y-6">
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

          {/* Hospital Gallery Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#101828] flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-[#0f6d8e]" />
                  <span>Hospital Gallery</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Visual portfolio, facilities, and campus highlights. (Max 10 photos)
                </p>
              </div>

              {((user?.role === 'Hospital Admin' && (user?.hospitalId === hospital?.id || user?.uid === hospital?.id)) || user?.role === 'Super Admin') && (
                <div>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0f6d8e] hover:bg-[#0b5874] text-white rounded-lg text-xs font-bold transition cursor-pointer">
                    {uploadingGallery ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>{uploadingGallery ? 'Uploading...' : 'Upload Photos'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleGalleryUpload}
                      disabled={uploadingGallery}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {galleryError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
                {galleryError}
              </div>
            )}

            {(!hospital.galleryUrls || hospital.galleryUrls.length === 0) ? (
              <div className="py-8 text-center text-slate-400 border-2 border-dashed border-slate-250 rounded-xl">
                <ImageIcon className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-xs">No gallery photos uploaded yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {hospital.galleryUrls.map((url, index) => (
                  <div key={index} className="relative group aspect-square bg-slate-100 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                    <img
                      src={url}
                      alt={`Facility ${index + 1}`}
                      className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    
                    {(((user?.role === 'Hospital Admin' && (user?.hospitalId === hospital?.id || user?.uid === hospital?.id)) || user?.role === 'Super Admin')) && (
                      <button
                        onClick={() => handleGalleryDelete(url)}
                        className="absolute top-2 right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow-xs"
                        title="Delete photo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <AccountDeletionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
};
