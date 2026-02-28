import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [team, setTeam] = useState(() => {
    const saved = localStorage.getItem('team');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (name, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { name, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('team', JSON.stringify(data.team));
      setTeam(data.team);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, password) => {
    // Registration disabled – admin creates teams. Kept for API compatibility.
    throw new Error('Self-registration is disabled. Ask the admin to create your team.');
  };

  const updateProfile = async (name, password) => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/profile', { name, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('team', JSON.stringify(data.team));
      setTeam(data.team);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('team');
    setTeam(null);
  };

  return (
    <AuthContext.Provider value={{ team, login, register, updateProfile, logout, loading, isAuthenticated: !!team }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
