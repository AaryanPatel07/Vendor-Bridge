import { createContext, useContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

export type UserRole = 'admin' | 'procurement_officer' | 'vendor' | 'manager';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  company?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('vendorbridge_user');
    if (stored) return JSON.parse(stored);
    // Provide a default mock user so UI shows meaningful hardcoded labels during development
    const defaultUser: User = {
      id: 'dev-1',
      email: 'admin@vendorbridge.local',
      name: 'Admin User',
      role: 'admin',
      company: 'VendorBridge'
    };
    return defaultUser;
  });

  const login = async (email: string, password: string) => {
    // Mock login - in real app, this would call an API
    const mockUser: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      role: 'procurement_officer',
    };
    setUser(mockUser);
    localStorage.setItem('vendorbridge_user', JSON.stringify(mockUser));
  };

  const signup = async (email: string, password: string, name: string, role: UserRole) => {
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role,
    };
    setUser(newUser);
    localStorage.setItem('vendorbridge_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vendorbridge_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
