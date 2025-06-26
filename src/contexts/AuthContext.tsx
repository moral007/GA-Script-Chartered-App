/**
 * Authentication context for managing user authentication state
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  phone?: string;
  department?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Authentication provider component
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Auto-login on load with guest account
   */
  useEffect(() => {
    const guestUser: User = {
      id: 'guest-1',
      name: 'Guest User',
      email: 'guest@demo.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date()
    };
    setUser(guestUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(guestUser));
  }, []);

  /**
   * BYPASS LOGIN: Accept any email/password and switch user
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    const fakeUser: User = {
      id: 'user-' + Math.random().toString(36).substring(2, 9),
      name: email.split('@')[0] || 'Guest',
      email: email || 'guest@demo.com',
      role: 'admin',
      isActive: true,
      createdAt: new Date()
    };
    setUser(fakeUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(fakeUser));
    return true;
  };

  /**
   * Disable logout for demo mode
   */
  const logout = () => {
    console.warn('Logout disabled in demo mode.');
  };

  /**
   * Update user data
   */
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isAdmin: user?.role === 'admin',
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
