import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 
  | 'Super Admin' 
  | 'Fleet Manager' 
  | 'Dispatcher' 
  | 'Driver' 
  | 'Safety Officer' 
  | 'Financial Analyst';

export interface User {
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  driverId?: string; // Links driver user to their driver profile
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  login: (email: string, role: UserRole, rememberMe: boolean) => Promise<void>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (email: string, code: string) => Promise<void>;
  switchRole: (role: UserRole) => void;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Simulate reading session
    const loadSession = () => {
      const savedAuth = localStorage.getItem('transitops-auth');
      const savedUser = localStorage.getItem('transitops-user');
      
      if (savedAuth === 'true' && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
          setIsAuthenticated(true);
        } catch {
          localStorage.removeItem('transitops-auth');
          localStorage.removeItem('transitops-user');
        }
      }
      setIsLoading(false);
    };

    const timer = setTimeout(loadSession, 1200); // Elegant dashboard loading effect
    return () => clearTimeout(timer);
  }, []);

  const login = async (email: string, role: UserRole, rememberMe: boolean) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Server lag simulation

    const nameMap: Record<UserRole, string> = {
      'Super Admin': 'Alex Rivera',
      'Fleet Manager': 'Marcus Vance',
      'Dispatcher': 'Elena Rostova',
      'Driver': 'John Miller',
      'Safety Officer': 'Chief Safety Officer Davis',
      'Financial Analyst': 'Sarah Jenkins'
    };

    const mockUser: User = {
      name: nameMap[role],
      email: email || `${role.toLowerCase().replace(' ', '')}@transitops.com`,
      role,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${nameMap[role]}`,
      driverId: role === 'Driver' ? 'DRV-1001' : undefined
    };

    setUser(mockUser);
    setIsAuthenticated(true);
    setIsLoading(false);

    if (rememberMe) {
      localStorage.setItem('transitops-auth', 'true');
      localStorage.setItem('transitops-user', JSON.stringify(mockUser));
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('transitops-auth');
    localStorage.removeItem('transitops-user');
  };

  const forgotPassword = async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Mock reset password instructions sent to: ${email}`);
  };

  const resetPassword = async (email: string, code: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`Password reset for ${email} with code ${code}`);
  };

  const switchRole = (role: UserRole) => {
    if (!user) return;
    const nameMap: Record<UserRole, string> = {
      'Super Admin': 'Alex Rivera',
      'Fleet Manager': 'Marcus Vance',
      'Dispatcher': 'Elena Rostova',
      'Driver': 'John Miller',
      'Safety Officer': 'Chief Safety Officer Davis',
      'Financial Analyst': 'Sarah Jenkins'
    };

    const updated: User = {
      ...user,
      name: nameMap[role],
      role,
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${nameMap[role]}`,
      driverId: role === 'Driver' ? 'DRV-1001' : undefined
    };
    setUser(updated);
    if (localStorage.getItem('transitops-auth') === 'true') {
      localStorage.setItem('transitops-user', JSON.stringify(updated));
    }
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
        login, 
        logout, 
        forgotPassword, 
        resetPassword,
        switchRole,
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
