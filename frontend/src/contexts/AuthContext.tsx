import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type UserRole = 
  | 'Super Admin' 
  | 'Fleet Manager' 
  | 'Dispatcher' 
  | 'Driver' 
  | 'Safety Officer' 
  | 'Financial Analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  driverId?: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
  login: (email: string, password: string, rememberMe: boolean) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  hasAccess: (module: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define allowed sidebar modules for each role
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  'Super Admin': [
    'Dashboard', 'Fleet', 'Drivers', 'Trips', 'Dispatch', 'Maintenance', 
    'Fuel', 'Expenses', 'Reports', 'Analytics', 'Notifications', 'Documents', 
    'Settings', 'Profile'
  ],
  'Fleet Manager': [
    'Dashboard', 'Fleet', 'Drivers', 'Maintenance', 'Fuel', 'Expenses', 
    'Reports', 'Notifications', 'Documents', 'Profile'
  ],
  'Dispatcher': [
    'Dashboard', 'Fleet', 'Drivers', 'Trips', 'Dispatch', 
    'Notifications', 'Documents', 'Profile'
  ],
  'Driver': [
    'Dashboard', 'Trips', 'Maintenance', 'Notifications', 'Profile'
  ],
  'Safety Officer': [
    'Dashboard', 'Fleet', 'Drivers', 'Maintenance', 'Analytics', 
    'Notifications', 'Documents', 'Profile'
  ],
  'Financial Analyst': [
    'Dashboard', 'Fuel', 'Expenses', 'Reports', 'Analytics', 
    'Notifications', 'Profile'
  ]
};

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const loadSession = () => {
      const savedToken = localStorage.getItem('transitops-token');
      const savedUser = localStorage.getItem('transitops-user');

      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('transitops-token');
          localStorage.removeItem('transitops-user');
        }
      }
      setIsLoading(false);
    };

    const timer = setTimeout(loadSession, 600);
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
        credentials: 'include',
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      const { accessToken, user: loggedInUser } = data.data;

      setToken(accessToken);
      setUser(loggedInUser);
      setIsAuthenticated(true);

      if (rememberMe) {
        localStorage.setItem('transitops-token', accessToken);
        localStorage.setItem('transitops-user', JSON.stringify(loggedInUser));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          credentials: 'include',
        });
      }
    } catch { /* ignore network errors on logout */ }

    setIsAuthenticated(false);
    setUser(null);
    setToken(null);
    localStorage.removeItem('transitops-token');
    localStorage.removeItem('transitops-user');
  }, [token]);

  const forgotPassword = async (email: string) => {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    const res = await fetch(`${API_BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Reset failed');
  };

  const hasAccess = (module: string): boolean => {
    if (!user) return false;
    const allowed = ROLE_PERMISSIONS[user.role] || [];
    return allowed.includes(module);
  };

  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated, 
        isLoading, 
        user,
        token,
        login, 
        logout, 
        forgotPassword, 
        resetPassword,
        hasAccess
      }}
    >
      {children}
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
