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
  password?: string;
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
   * Initialize authentication state
   */
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error loading saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  /**
   * Login function with proper password validation
   */
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Get users from localStorage
      const savedUsers = localStorage.getItem('users');
      let users: User[] = [];
      
      if (savedUsers) {
        users = JSON.parse(savedUsers);
      }

      // Add default admin if no users exist
      if (users.length === 0) {
        const defaultAdmin: User = {
          id: 'admin-1',
          name: 'Admin User',
          email: 'admin@ca.com',
          role: 'admin',
          isActive: true,
          phone: '+1-555-0101',
          department: 'Management',
          createdAt: new Date(),
          password: 'admin123'
        };
        users = [defaultAdmin];
        localStorage.setItem('users', JSON.stringify(users));
      }

      // Find user by email and password
      const foundUser = users.find(u => 
        u.email.toLowerCase() === email.toLowerCase() && 
        u.password === password &&
        u.isActive
      );

      if (foundUser) {
        // Don't store password in session
        const sessionUser = { ...foundUser };
        delete sessionUser.password;
        
        setUser(sessionUser);
        setIsAuthenticated(true);
        localStorage.setItem('currentUser', JSON.stringify(sessionUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
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
