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

  // Registration removed: frontend no longer supports creating teams.
  const register = async () => {
    throw new Error('Registration disabled');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('team');
    setTeam(null);
  };

  // Update current team's name
  const updateName = async (newName) => {
    setLoading(true);
    try {
      const { data } = await api.put('/auth/name', { name: newName });
      if (data.token) localStorage.setItem('token', data.token);
      if (data.team) {
        localStorage.setItem('team', JSON.stringify(data.team));
        setTeam(data.team);
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ team, login, register, logout, updateName, loading, isAuthenticated: !!team }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
