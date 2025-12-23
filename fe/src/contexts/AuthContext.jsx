import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, removeToken, authAPI } from '../services/api';
import { getUserFromToken } from '../utils/jwt';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (has token)
    const token = getToken();
    if (token) {
      // try to fetch profile from server first
      (async () => {
        try {
          const profile = await authAPI.getProfile();
          setUser(profile);
          setIsAuthenticated(true);
        } catch (err) {
          // fallback to decoding token if profile fails
          const u = getUserFromToken(token);
          if (u) {
            setUser(u);
            setIsAuthenticated(true);
          } else {
            removeToken();
            setIsAuthenticated(false);
          }
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async ({ email, password }) => {
    // Call backend login -> returns { access_token }
    const data = await authAPI.login(email, password);
    const token = getToken();
    if (token) {
      // prefer server profile if available
      try {
        const profile = await authAPI.getProfile();
        setUser(profile);
      } catch (err) {
        const u = getUserFromToken(token);
        setUser(u);
      }
      setIsAuthenticated(true);
    }
    return data;
  };

  const register = async (registerData) => {
    // register returns created user (without password_hash)
    const user = await authAPI.register(registerData);
    return user;
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      // ignore server errors for logout
    }
    removeToken();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

