/**
 * Navigation component for sidebar navigation
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Building, 
  FileText, 
  CheckCircle, 
  MessageSquare, 
  Settings 
} from 'lucide-react';

interface NavigationProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

/**
 * Main navigation sidebar component
 */
const Navigation: React.FC<NavigationProps> = ({ currentSection, onSectionChange }) => {
  const { user } = useAuth();

  /**
   * Navigation items configuration
   */
  const getNavigationItems = () => {
    const baseItems = [
      { 
        id: 'dashboard', 
        label: 'Dashboard', 
        icon: LayoutDashboard,
        adminOnly: false 
      },
      { 
        id: 'tasks', 
        label: 'Tasks', 
        icon: CheckSquare,
        adminOnly: false 
      },
      { 
        id: 'messages', 
        label: 'Messages', 
        icon: MessageSquare,
        adminOnly: false 
      }
    ];

    const adminItems = [
      { 
        id: 'users', 
        label: 'Users', 
        icon: Users,
        adminOnly: true 
      },
      { 
        id: 'clients', 
        label: 'Clients', 
        icon: Building,
        adminOnly: true 
      },
      { 
        id: 'task-types', 
        label: 'Task Types', 
        icon: FileText,
        adminOnly: true 
      },
      { 
        id: 'approvals', 
        label: 'Approvals', 
        icon: CheckCircle,
        adminOnly: true 
      },
      { 
        id: 'settings', 
        label: 'Settings', 
        icon: Settings,
        adminOnly: true 
      }
    ];

    // Show all items for admin, only base items for regular users
    if (user?.role === 'admin') {
      return [...baseItems, ...adminItems];
    }
    
    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <aside className="w-64 bg-white shadow-sm border-r border-gray-200">
      <nav className="p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Navigation;
