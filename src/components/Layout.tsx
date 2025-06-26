/**
 * Layout component providing the main application structure
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navigation from './Navigation';
import NotificationBell from './NotificationBell';
import { Button } from './ui/button';
import { LogOut, User } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentSection: string;
  onSectionChange: (section: string) => void;
}

/**
 * Main layout component with navigation and header
 */
const Layout: React.FC<LayoutProps> = ({ children, currentSection, onSectionChange }) => {
  const { user, logout } = useAuth();

  /**
   * Handle logout
   */
  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          {/* Logo and Title */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CA</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">CA Manager</h1>
            </div>
          </div>

          {/* Right side - Notifications and User */}
          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <NotificationBell />

            {/* User Info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  Welcome back, {user?.name}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {user?.role}
                </p>
              </div>
              
              {/* User Avatar */}
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-blue-600" />
              </div>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Navigation Sidebar */}
        <Navigation 
          currentSection={currentSection}
          onSectionChange={onSectionChange}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
