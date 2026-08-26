import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginApi, demoLoginApi, registerApi, getMeApi } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('skillsphere_token') || null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const loadUser = async () => {
    const savedToken = localStorage.getItem('skillsphere_token');
    if (!savedToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const userData = await getMeApi();
      setUser(userData);
    } catch (err) {
      console.warn('Session expired or invalid. Resetting token.');
      localStorage.removeItem('skillsphere_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const data = await loginApi(email, password);
      localStorage.setItem('skillsphere_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      showToast(`Welcome back, ${data.user.profile?.full_name || 'Learner'}!`, 'success');
      return data.user;
    } catch (err) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAsDemo = async (role = 'student') => {
    setIsLoading(true);
    try {
      const data = await demoLoginApi(role);
      localStorage.setItem('skillsphere_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      const roleLabel = role === 'student' ? 'Student (Ravi Kumar)' : role === 'instructor' ? 'Instructor (Dr. Sunita Sharma)' : 'Administrator';
      showToast(`Switched to Demo Persona: ${roleLabel}`, 'success');
      return data.user;
    } catch (err) {
      showToast(err.message || 'Demo login failed.', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const data = await registerApi(userData);
      localStorage.setItem('skillsphere_token', data.access_token);
      setToken(data.access_token);
      setUser(data.user);
      showToast('Account created successfully! Welcome to SkillSphere AI.', 'success');
      return data.user;
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('skillsphere_token');
    setToken(null);
    setUser(null);
    showToast('You have been logged out.', 'info');
  };

  const refreshUser = async () => {
    try {
      const updated = await getMeApi();
      setUser(updated);
    } catch (err) {
      console.warn('Could not refresh user profile:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        loginAsDemo,
        register,
        logout,
        refreshUser,
        showToast,
      }}
    >
      {children}

      {/* Global Modern Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 text-sm font-medium text-white rounded-xl shadow-2xl transition-all duration-300 animate-slide-up backdrop-blur-md"
             style={{
               backgroundColor:
                 toast.type === 'success' ? '#15803d' : toast.type === 'error' ? '#b91c1c' : '#1e293b',
             }}>
          <span>{toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}</span>
          <span>{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100 text-xs">✕</button>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
