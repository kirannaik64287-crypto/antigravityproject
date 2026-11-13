import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(() => localStorage.getItem('agri_token') || 'demo_token');

  // Load profile on start or token change
  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get('/api/auth/profile', { headers });
      if (res.data?.success) {
        setProfile(res.data.data);
        setUser({ id: res.data.data.id, email: res.data.data.email });
      }
    } catch (err) {
      console.warn('Profile fetch note:', err.message);
      // Fallback local profile
      setProfile({
        id: '00000000-0000-0000-0000-000000000001',
        fullName: 'Rajesh Patel',
        email: 'farmer@agrisahayak.local',
        phone: '+91 98765 43210',
        preferredLanguage: 'en',
        state: 'Maharashtra',
        district: 'Nagpur',
        village: 'Kalmeshwar',
        preferredUnits: 'acres',
        farmingExperience: 12
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updatedData) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.put('/api/auth/profile', updatedData, { headers });
      if (res.data?.success) {
        setProfile(res.data.data);
        return { success: true };
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      return { success: false, error: err.response?.data?.error || err.message };
    }
  };

  const login = (sessionToken, userData) => {
    localStorage.setItem('agri_token', sessionToken);
    setToken(sessionToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('agri_token');
    setToken('demo_token');
    fetchProfile();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, updateProfile, login, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
