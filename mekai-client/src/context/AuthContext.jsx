import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [token, setToken]   = useState(() => localStorage.getItem('mekai_token'));
  const [loading, setLoading] = useState(true);

  // Vérifier le token au démarrage
  useEffect(() => {
    if (token) {
      axios.get(`${API}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => setUser(res.data.user))
        .catch(() => { setToken(null); localStorage.removeItem('mekai_token'); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post(`${API}/api/auth/login`, { email, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('mekai_token', t);
    return u;
  };

  const register = async (name, email, password) => {
    const res = await axios.post(`${API}/api/auth/register`, { name, email, password });
    const { token: t, user: u } = res.data;
    setToken(t);
    setUser(u);
    localStorage.setItem('mekai_token', t);
    return u;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('mekai_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);