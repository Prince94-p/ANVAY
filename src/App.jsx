import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { HospitalRegistrationPage } from './pages/HospitalRegistrationPage';
import { HospitalVerificationStatusPage } from './pages/HospitalVerificationStatusPage';
import { PatientDashboard } from './pages/PatientDashboard';
import { HospitalDashboard } from './pages/HospitalDashboard';
import { PatientSearchPage } from './pages/PatientSearchPage';
import { CreatePatientPage } from './pages/CreatePatientPage';
import { ClinicalSnapshotPage } from './pages/ClinicalSnapshotPage';
import { CompleteMedicalHistoryPage } from './pages/CompleteMedicalHistoryPage';
import { AddMedicalRecordPage } from './pages/AddMedicalRecordPage';
import { UploadMedicalDocumentPage } from './pages/UploadMedicalDocumentPage';
import { MissingRecordsPage } from './pages/MissingRecordsPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { HospitalProfilePage } from './pages/HospitalProfilePage';
import { GovernmentDashboard } from './pages/GovernmentDashboard';
import { DiseaseAnalyticsPage } from './pages/DiseaseAnalyticsPage';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { HospitalVerificationManagementPage } from './pages/HospitalVerificationManagementPage';
import { AuditLogsPage } from './pages/AuditLogsPage';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbff] text-[#667085] text-xs font-semibold">
        Verifying health network access...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const role = user?.role;
    if (role === 'Patient') return <Navigate to="/patient-dashboard" replace />;
    if (role === 'Doctor') return <Navigate to="/doctor-dashboard" replace />;
    if (role === 'Government Admin') return <Navigate to="/government-dashboard" replace />;
    if (role === 'Super Admin') return <Navigate to="/super-admin" replace />;
    if (role === 'Hospital Admin') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
};

export function App() {
  const { isAuthenticated, loading, user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const publicRoutes = ['/', '/login', '/register', '/register-hospital', '/verification-status'];
  const isPublicPage = publicRoutes.includes(location.pathname) || location.pathname.startsWith('/register');
  const isPatient = user?.role === 'Patient';

  // Show sidebar on authenticated portal pages (for staff/hospital/govt/admin)
  const showSidebar = isAuthenticated && !isPublicPage && !isPatient;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fbff] text-[#0f6d8e] text-sm font-bold">
        Initializing ANVAY Healthcare Network...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fbff] flex flex-col selection:bg-[#20a7ce] selection:text-white">
      {/* Top Header */}
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isPublicPage={isPublicPage} />

      {/* Main Body Layout */}
      <div className="flex-1 flex">
        {showSidebar && (
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        )}

        <main className={`flex-1 transition-all duration-200 ${showSidebar ? 'lg:ml-64 p-4 sm:p-6 lg:p-8' : (isAuthenticated && isPatient ? 'p-4 sm:p-6 lg:p-8' : '')}`}>
          <Routes>
            {/* Public Pages */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/register-hospital" element={<Navigate to="/register?tab=hospital" replace />} />
            <Route path="/verification-status" element={<HospitalVerificationStatusPage />} />

            {/* Patient Portal */}
            <Route path="/patient-dashboard" element={<ProtectedRoute allowedRoles={['Patient', 'Super Admin']}><PatientDashboard /></ProtectedRoute>} />

            {/* Hospital & Doctor Portal */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['Hospital Admin']}><HospitalDashboard /></ProtectedRoute>} />
            <Route path="/doctor-dashboard" element={<ProtectedRoute allowedRoles={['Doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/patient-search" element={<ProtectedRoute allowedRoles={['Hospital Admin', 'Doctor', 'Super Admin']}><PatientSearchPage /></ProtectedRoute>} />
            <Route path="/create-patient" element={<ProtectedRoute allowedRoles={['Hospital Admin', 'Doctor', 'Super Admin']}><CreatePatientPage /></ProtectedRoute>} />
            <Route path="/clinical-snapshot" element={<ProtectedRoute allowedRoles={['Hospital Admin', 'Doctor']}><ClinicalSnapshotPage /></ProtectedRoute>} />
            <Route path="/medical-history" element={<ProtectedRoute allowedRoles={['Hospital Admin', 'Doctor']}><CompleteMedicalHistoryPage /></ProtectedRoute>} />
            <Route path="/add-record" element={<ProtectedRoute allowedRoles={['Hospital Admin', 'Doctor']}><AddMedicalRecordPage /></ProtectedRoute>} />
            <Route path="/upload-document" element={<ProtectedRoute allowedRoles={['Hospital Admin', 'Doctor']}><UploadMedicalDocumentPage /></ProtectedRoute>} />
            <Route path="/missing-records" element={<ProtectedRoute allowedRoles={['Hospital Admin', 'Doctor']}><MissingRecordsPage /></ProtectedRoute>} />
            <Route path="/doctors" element={<ProtectedRoute allowedRoles={['Hospital Admin', 'Super Admin']}><DoctorsPage /></ProtectedRoute>} />
            <Route path="/hospital-profile" element={<ProtectedRoute allowedRoles={['Hospital Admin', 'Doctor', 'Government Admin', 'Super Admin']}><HospitalProfilePage /></ProtectedRoute>} />

            {/* Government & Surveillance */}
            <Route path="/government-dashboard" element={<ProtectedRoute allowedRoles={['Government Admin', 'Super Admin']}><GovernmentDashboard /></ProtectedRoute>} />
            <Route path="/disease-analytics" element={<ProtectedRoute allowedRoles={['Government Admin', 'Super Admin']}><DiseaseAnalyticsPage /></ProtectedRoute>} />

            {/* Super Admin */}
            <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['Super Admin']}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="/hospital-verifications" element={<ProtectedRoute allowedRoles={['Super Admin']}><HospitalVerificationManagementPage /></ProtectedRoute>} />
            <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['Hospital Admin', 'Super Admin']}><AuditLogsPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

    </div>
  );
}

export default App;
