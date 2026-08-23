import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { auth, db, functions } from '../firebase';
import {
  onAuthStateChanged,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';

const KNOWN_ADMINS = {
  'superadmin@anvay.health': {
    password: 'AnvaySuper@2024!',
    username: 'anvay_superadmin',
    role: 'Super Admin',
    name: 'Super Administrator',
    anvayId: 'ANVAY-SA-0001',
    status: 'Active'
  },
  'govadmin@anvay.health': {
    password: 'AnvayGov@2024!',
    username: 'anvay_govadmin',
    role: 'Government Admin',
    name: 'National Health Authority Admin',
    anvayId: 'ANVAY-GA-0001',
    status: 'Active'
  },
  'hospitaladmin@anvay.health': {
    password: 'AnvayHospital@2024!',
    username: 'anvay_apollo_admin',
    role: 'Hospital Admin',
    name: 'Charusat Hospital Admin',
    anvayId: 'ANVAY-HA-0001',
    hospitalId: 'ANVAY-H-0001',
    hospitalName: 'Charusat Hospital',
    status: 'Approved',
    verified: true
  },
  'doctor@anvay.health': {
    password: 'AnvayDoctor@2024!',
    username: 'dr_sharma',
    role: 'Doctor',
    name: 'Dr. Sharma',
    anvayId: 'ANVAY-D-0001',
    hospitalId: 'ANVAY-H-0001',
    hospitalName: 'Charusat Hospital',
    specialization: 'Internal Medicine',
    status: 'Active'
  }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState(localStorage.getItem('anvay_lang') || 'en');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email, ...userDocSnap.data() });
          } else {
            console.error('No Firestore user document found for UID:', firebaseUser.uid);
            setUser({ uid: firebaseUser.uid, email: firebaseUser.email });
          }
        } catch (error) {
          console.error('Error fetching user data from Firestore:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ─── LOGIN: Email, Username, or ANVAY ID ───────────────────
  const login = async (identifier, password) => {
    try {
      let email = identifier.trim();

      // Check local known usernames first
      const matchedAdminKey = Object.keys(KNOWN_ADMINS).find(
        k => KNOWN_ADMINS[k].username.toLowerCase() === email.toLowerCase() ||
             KNOWN_ADMINS[k].anvayId.toLowerCase() === email.toLowerCase() ||
             k.toLowerCase() === email.toLowerCase()
      );
      if (matchedAdminKey) {
        email = matchedAdminKey;
      } else if (!email.includes('@')) {
        try {
          const resolveIdentifier = httpsCallable(functions, 'resolveLoginIdentifier');
          const result = await resolveIdentifier({ identifier: email });
          if (result.data?.email) {
            email = result.data.email;
          }
        } catch (err) {
          console.warn('resolveLoginIdentifier error:', err);
        }
      }

      let userCredential;
      try {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } catch (signInErr) {
        // If it's a known admin account and hasn't been seeded yet in Firebase Auth, auto-provision it!
        if (KNOWN_ADMINS[email] && (KNOWN_ADMINS[email].password === password || password === 'AnvaySuper@2024!' || password === 'AnvayGov@2024!')) {
          const adminInfo = KNOWN_ADMINS[email];
          try {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
          } catch (createErr) {
            // Already created in auth but wrong password? Re-throw
            throw signInErr;
          }
          // Seed the Firestore doc
          const newDoc = {
            uid: userCredential.user.uid,
            email,
            name: adminInfo.name,
            role: adminInfo.role,
            username: adminInfo.username,
            anvayId: adminInfo.anvayId,
            hospitalId: adminInfo.hospitalId || '',
            hospitalName: adminInfo.hospitalName || '',
            specialization: adminInfo.specialization || '',
            status: adminInfo.status || 'Active',
            verified: adminInfo.verified || true,
            createdAt: new Date().toISOString()
          };
          await setDoc(doc(db, 'users', userCredential.user.uid), newDoc);
          await setDoc(doc(db, 'usernames', adminInfo.username.toLowerCase()), { uid: userCredential.user.uid });
          const fullUser = { uid: userCredential.user.uid, email, ...newDoc };
          setUser(fullUser);
          return { success: true, user: fullUser };
        } else {
          throw signInErr;
        }
      }

      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        const fullUser = { uid: userCredential.user.uid, email: userCredential.user.email, ...userData };
        setUser(fullUser);
        return { success: true, user: fullUser };
      } else {
        // If Firestore document doesn't exist for a known admin, auto-create it!
        if (KNOWN_ADMINS[email]) {
          const adminInfo = KNOWN_ADMINS[email];
          const newDoc = {
            uid: userCredential.user.uid,
            email,
            name: adminInfo.name,
            role: adminInfo.role,
            username: adminInfo.username,
            anvayId: adminInfo.anvayId,
            hospitalId: adminInfo.hospitalId || '',
            hospitalName: adminInfo.hospitalName || '',
            specialization: adminInfo.specialization || '',
            status: adminInfo.status || 'Active',
            verified: adminInfo.verified || true,
            createdAt: new Date().toISOString()
          };
          await setDoc(userDocRef, newDoc);
          const fullUser = { uid: userCredential.user.uid, email, ...newDoc };
          setUser(fullUser);
          return { success: true, user: fullUser };
        }
        return { success: false, message: 'User profile not found in database.' };
      }
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Invalid credentials. Please check and try again.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Incorrect email/username/ANVAY ID or password.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many failed attempts. Please try again later.';
      } else if (error.message) {
        message = error.message;
      }
      return { success: false, message };
    }
  };

  // ─── LOGOUT ────────────────────────────────────────────────
  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // ─── PASSWORD RESET ────────────────────────────────────────
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      console.error('Password reset error:', error);
      return { success: false, message: error.message };
    }
  };

  // ─── UPDATE PROFILE PHOTO ──────────────────────────────────
  const updateProfilePhoto = async (photoURL) => {
    if (!user?.uid) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { photoURL });
      setUser((prev) => ({ ...prev, photoURL }));
    } catch (error) {
      console.error('Error updating profile photo:', error);
    }
  };

  // ─── LANGUAGE ──────────────────────────────────────────────
  const changeLanguage = (langCode) => {
    setLanguage(langCode);
    i18n.changeLanguage(langCode);
    localStorage.setItem('anvay_lang', langCode);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        language,
        login,
        logout,
        resetPassword,
        updateProfilePhoto,
        changeLanguage,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
