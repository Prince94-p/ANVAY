import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [token, setToken] = useState(localStorage.getItem('anvay_token') || null);
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('anvay_user') || 'null'));
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(localStorage.getItem('anvay_lang') || 'en');

  // Verify stored session on boot
  useEffect(() => {
    const checkAuth = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setUser(data.user);
          localStorage.setItem('anvay_user', JSON.stringify(data.user));
        } else {
          logout();
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [token]);

  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (data.success) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('anvay_token', data.token);
      localStorage.setItem('anvay_user', JSON.stringify(data.user));
      return { success: true, user: data.user };
    }
    return { success: false, message: data.message || 'Login failed' };
  };

  const switchDemoPersona = async (username) => {
    try {
      const res = await fetch('/api/auth/switch-demo-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('anvay_token', data.token);
        localStorage.setItem('anvay_user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message };
    } catch (e) {
      return { success: false, message: e.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('anvay_token');
    localStorage.removeItem('anvay_user');
  };

  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem('anvay_lang', langCode);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        loading,
        language,
        login,
        logout,
        switchDemoPersona,
        changeLanguage,
        isAuthenticated: !!token && !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
