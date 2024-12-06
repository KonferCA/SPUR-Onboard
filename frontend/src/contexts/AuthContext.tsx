import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '@/types';

interface AuthContextType {
  user: User | null;
  companyId: string | null;
  setUser: (user: User | null) => void;
  setCompanyId: (id: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedCompanyId = localStorage.getItem('company_id');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    if (storedCompanyId) {
      setCompanyId(storedCompanyId);
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  // Save companyId to localStorage when it changes
  useEffect(() => {
    if (companyId) {
      localStorage.setItem('company_id', companyId);
    } else {
      localStorage.removeItem('company_id');
    }
  }, [companyId]);

  return (
    <AuthContext.Provider value={{ user, companyId, setUser, setCompanyId }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 