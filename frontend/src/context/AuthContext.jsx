import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

// Create the Context object
const AuthContext = createContext(null);

/**
 * AuthProvider component that wraps our app and distributes user state.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Stores logged-in user profile metadata
  const [loading, setLoading] = useState(true); // Tracks initial auth checking process

  /**
   * Queries the backend profile endpoint. If an HttpOnly cookie containing a
   * valid JWT is sent by the browser, the backend resolves the user's data.
   */
  const checkUserSession = async () => {
    try {
      const response = await api.get('/auth/profile');
      if (response.data.success) {
        setUser(response.data.user);
      }
    } catch (err) {
      // User is not logged in or cookie is expired/invalid
      setUser(null);
    } finally {
      // End loading state once session verification check completes
      setLoading(false);
    }
  };

  // Run the session verification once when the application mounts (page refresh)
  useEffect(() => {
    checkUserSession();
  }, []);

  /**
   * Log In logic
   */
  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      setUser(response.data.user);
    }
    return response.data;
  };

  /**
   * Sign Up logic
   */
  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    if (response.data.success) {
      setUser(response.data.user);
    }
    return response.data;
  };

  /**
   * Log Out logic
   */
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      // Clear user state on frontend regardless of API server output
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkUserSession }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook to consume AuthContext values conveniently
export const useAuth = () => useContext(AuthContext);
export default AuthContext;
