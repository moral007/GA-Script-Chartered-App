/**
 * Home page component that handles authentication and main application routing
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../components/Login';
import Layout from '../components/Layout';
import Dashboard from '../components/Dashboard';
import TaskManagement from '../components/TaskManagement';
import UserManagement from '../components/UserManagement';
import ClientManagement from '../components/ClientManagement';
import TaskTypeManagement from '../components/TaskTypeManagement';
import ApprovalManagement from '../components/ApprovalManagement';
import Messages from '../components/Messages';
import Settings from '../components/Settings';

/**
 * Main application sections
 */
type Section = 'dashboard' | 'tasks' | 'users' | 'clients' | 'task-types' | 'approvals' | 'messages' | 'settings';

/**
 * Home component with authentication and section routing
 */
const Home: React.FC = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [currentSection, setCurrentSection] = useState<Section>('dashboard');

  /**
   * Handle URL hash changes for navigation
   */
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as Section;
      if (hash && ['dashboard', 'tasks', 'users', 'clients', 'task-types', 'approvals', 'messages', 'settings'].includes(hash)) {
        setCurrentSection(hash);
      }
    };

    // Set initial section from URL
    handleHashChange();
    
    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  /**
   * Handle section change and update URL
   */
  const handleSectionChange = (section: string) => {
    setCurrentSection(section as Section);
    window.location.hash = section;
  };

  /**
   * Render current section content
   */
  const renderSectionContent = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <TaskManagement />;
      case 'users':
        return isAdmin ? <UserManagement /> : <Dashboard />;
      case 'clients':
        return isAdmin ? <ClientManagement /> : <Dashboard />;
      case 'task-types':
        return isAdmin ? <TaskTypeManagement /> : <Dashboard />;
      case 'approvals':
        return isAdmin ? <ApprovalManagement /> : <Dashboard />;
      case 'messages':
        return <Messages />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout 
      currentSection={currentSection}
      onSectionChange={handleSectionChange}
    >
      {renderSectionContent()}
    </Layout>
  );
};

export default Home;
