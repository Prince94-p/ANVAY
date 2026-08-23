import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const DashboardLink = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return null;

  const goToDashboard = () => {
    const role = user?.role;
    if (role === 'Patient') navigate('/patient-dashboard');
    else if (role === 'Doctor') navigate('/doctor-dashboard');
    else if (role === 'Hospital Admin') navigate('/dashboard');
    else if (role === 'Government Admin') navigate('/government-dashboard');
    else if (role === 'Super Admin') navigate('/super-admin');
    else navigate('/');
  };

  return (
    <button
      type="button"
      onClick={goToDashboard}
      className="w-full py-2 bg-[#0f6d8e] hover:bg-[#0b5874] text-white font-bold rounded-[8px] text-sm transition"
    >
      Go to Dashboard
    </button>
  );
};
