/**
 * Settings component for system configuration
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Calendar,
  Clock,
  Save,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

/**
 * Settings component for system configuration
 */
const Settings: React.FC = () => {
  const { user } = useAuth();
  const { } = useData();
  
  const [settings, setSettings] = useState({
    // System Settings
    systemName: 'CA Manager',
    systemEmail: 'admin@camanager.com',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    workingHours: '9:00 AM - 6:00 PM',
    
    // Notification Settings
    emailNotifications: true,
    taskReminders: true,
    overdueAlerts: true,
    approvalNotifications: true,
    chatNotifications: true,
    
    // Task Settings
    defaultTaskPriority: 'Medium',
    autoAssignment: false,
    taskNumberPrefix: 'TSK',
    requireApproval: true,
    
    // Security Settings
    passwordExpiry: 90,
    sessionTimeout: 30,
    twoFactorAuth: false,
    loginAttempts: 3,
    
    // Backup Settings
    autoBackup: true,
    backupFrequency: 'Daily',
    retentionPeriod: 30
  });

  const [saved, setSaved] = useState(false);

  /**
   * Handle settings change
   */
  const handleChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  /**
   * Save settings
   */
  const handleSave = () => {
    // In a real app, this would save to backend
    console.log('Saving settings:', settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <SettingsIcon className="w-8 h-8 text-blue-600" />
            System Settings
          </h1>
          <p className="text-gray-600 mt-1">Configure system preferences and policies</p>
        </div>
        <Button onClick={handleSave} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          Save Changes
          {saved && <CheckCircle className="w-4 h-4 text-green-500" />}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" />
              System Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Name
              </label>
              <Input
                value={settings.systemName}
                onChange={(e) => handleChange('systemName', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                System Email
              </label>
              <Input
                type="email"
                value={settings.systemEmail}
                onChange={(e) => handleChange('systemEmail', e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={settings.timezone}
                onChange={(e) => handleChange('timezone', e.target.value)}
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date Format
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={settings.dateFormat}
                onChange={(e) => handleChange('dateFormat', e.target.value)}
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Working Hours
              </label>
              <Input
                value={settings.workingHours}
                onChange={(e) => handleChange('workingHours', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-orange-600" />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Email Notifications
              </label>
              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) => handleChange('emailNotifications', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Task Reminders
              </label>
              <input
                type="checkbox"
                checked={settings.taskReminders}
                onChange={(e) => handleChange('taskReminders', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Overdue Alerts
              </label>
              <input
                type="checkbox"
                checked={settings.overdueAlerts}
                onChange={(e) => handleChange('overdueAlerts', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Approval Notifications
              </label>
              <input
                type="checkbox"
                checked={settings.approvalNotifications}
                onChange={(e) => handleChange('approvalNotifications', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Chat Notifications
              </label>
              <input
                type="checkbox"
                checked={settings.chatNotifications}
                onChange={(e) => handleChange('chatNotifications', e.target.checked)}
                className="rounded"
              />
            </div>
          </CardContent>
        </Card>

        {/* Task Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              Task Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Task Priority
              </label>
              <select
                className="w-full p-2 border border-gray-300 rounded-md"
                value={settings.defaultTaskPriority}
                onChange={(e) => handleChange('defaultTaskPriority', e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Task Number Prefix
              </label>
              <Input
                value={settings.taskNumberPrefix}
                onChange={(e) => handleChange('taskNumberPrefix', e.target.value)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Auto Assignment
              </label>
              <input
                type="checkbox"
                checked={settings.autoAssignment}
                onChange={(e) => handleChange('autoAssignment', e.target.checked)}
                className="rounded"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Require Approval
              </label>
              <input
                type="checkbox"
                checked={settings.requireApproval}
                onChange={(e) => handleChange('requireApproval', e.target.checked)}
                className="rounded"
              />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password Expiry (days)
              </label>
              <Input
                type="number"
                value={settings.passwordExpiry}
                onChange={(e) => handleChange('passwordExpiry', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Session Timeout (minutes)
              </label>
              <Input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleChange('sessionTimeout', parseInt(e.target.value))}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Max Login Attempts
              </label>
              <Input
                type="number"
                value={settings.loginAttempts}
                onChange={(e) => handleChange('loginAttempts', parseInt(e.target.value))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Two Factor Authentication
              </label>
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(e) => handleChange('twoFactorAuth', e.target.checked)}
                className="rounded"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Status */}
      {saved && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          Settings saved successfully!
        </div>
      )}
    </div>
  );
};

export default Settings;
