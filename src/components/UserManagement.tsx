/**
 * User Management component for admin to manage users
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  User, 
  Mail, 
  Phone,
  Building,
  Calendar,
  X,
  Check
} from 'lucide-react';

/**
 * User management component with full CRUD operations
 */
const UserManagement: React.FC = () => {
  const { user: currentUser, isAdmin } = useAuth();
  const { users, addUser, updateUser, deleteUser } = useData();

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'user',
    department: '',
    status: 'active',
    password: ''
  });

  // Only admins can access this component
  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600">Only administrators can manage users.</p>
      </div>
    );
  }

  /**
   * Reset form data
   */
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: 'user',
      department: '',
      status: 'active',
      password: ''
    });
    setEditingUser(null);
    setShowForm(false);
    setShowPassword(false);
  };

  /**
   * Handle form submission
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Please fill in required fields');
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      alert('Password is required for new users');
      return;
    }

    // Check if email already exists (except when editing current user)
    const existingUser = users.find(u => 
      u.email.toLowerCase() === formData.email.toLowerCase() && 
      u.id !== editingUser?.id
    );
    
    if (existingUser) {
      alert('Email already exists');
      return;
    }

    const userData = {
      ...formData,
      lastLogin: editingUser ? editingUser.lastLogin : null
    };

    if (editingUser) {
      // Update existing user
      updateUser(editingUser.id, userData);
      
      // Update localStorage users for authentication
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = savedUsers.map((u: any) => 
        u.id === editingUser.id ? { ...u, ...userData } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    } else {
      // Add new user
      addUser(userData);
      
      // Add to localStorage for authentication
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const newUser = {
        ...userData,
        id: Date.now().toString(),
        createdAt: new Date(),
        isActive: userData.status === 'active'
      };
      savedUsers.push(newUser);
      localStorage.setItem('users', JSON.stringify(savedUsers));
    }

    resetForm();
  };

  /**
   * Handle edit user
   */
  const handleEdit = (user: any) => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role || 'user',
      department: user.department || '',
      status: user.status || 'active',
      password: user.password || ''
    });
    setEditingUser(user);
    setShowForm(true);
  };

  /**
   * Handle delete user
   */
  const handleDelete = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own account');
      return;
    }

    if (confirm('Are you sure you want to delete this user?')) {
      deleteUser(userId);
      
      // Remove from localStorage
      const savedUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = savedUsers.filter((u: any) => u.id !== userId);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
  };

  /**
   * Generate random password
   */
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password });
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Manage system users and their access permissions
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add User
        </Button>
      </div>

      {/* Users List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {users.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                {/* User Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{user.name}</h3>
                      <Badge variant={(user.role || 'user') === 'admin' ? 'default' : 'secondary'}>
                        {(user.role || 'user').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <Badge variant={(user.status || 'active') === 'active' ? 'default' : 'destructive'}>
                    {(user.status || 'active').toUpperCase()}
                  </Badge>
                </div>

                {/* User Details */}
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                  {user.department && (
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>{user.department}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}</span>
                  </div>
                  {user.lastLogin && (
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>Last login: {new Date(user.lastLogin).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2 pt-2">
                  <Button
                    onClick={() => handleEdit(user)}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  {user.id !== currentUser?.id && (
                    <Button
                      onClick={() => handleDelete(user.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">
                  {editingUser ? 'Edit User' : 'Add New User'}
                </h3>
                <Button onClick={resetForm} variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    placeholder="Enter department"
                  />
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select value={formData.role} onValueChange={(value) => setFormData({...formData, role: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrator</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label htmlFor="password">Password {!editingUser && '*'}</Label>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        variant="ghost"
                        size="sm"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        type="button"
                        onClick={generatePassword}
                        variant="ghost"
                        size="sm"
                      >
                        Generate
                      </Button>
                    </div>
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    placeholder="Enter password"
                    required={!editingUser}
                  />
                </div>
              </div>

              <div className="flex space-x-2 mt-6">
                <Button type="submit" className="flex-1">
                  <Check className="w-4 h-4 mr-2" />
                  {editingUser ? 'Update User' : 'Create User'}
                </Button>
                <Button type="button" onClick={resetForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;