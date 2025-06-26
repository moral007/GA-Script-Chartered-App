/**
 * Login component for user authentication
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Building2, LogIn } from 'lucide-react';

/**
 * Login form component with professional styling
 */
const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (!success) {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Quick login function for demo
   */
  const quickLogin = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mx-auto">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">CA Task Manager</h1>
          <p className="text-gray-600">Professional Task Management System</p>
        </div>

        {/* Login Form */}
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <LogIn className="w-4 h-4" />
                    <span>Sign In</span>
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Credentials */}
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-amber-900 mb-3">Demo Credentials</h3>
            <div className="space-y-3">
              {/* Admin Demo */}
              <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                <div className="text-sm">
                  <p className="font-medium text-amber-900">Admin User</p>
                  <p className="text-amber-700">admin@ca.com / admin123</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => quickLogin('admin@ca.com', 'admin123')}
                  className="text-xs bg-white hover:bg-amber-50"
                >
                  Use
                </Button>
              </div>
              
              {/* User Demo */}
              <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                <div className="text-sm">
                  <p className="font-medium text-amber-900">John Doe (User)</p>
                  <p className="text-amber-700">john@ca.com / john123</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => quickLogin('john@ca.com', 'john123')}
                  className="text-xs bg-white hover:bg-amber-50"
                >
                  Use
                </Button>
              </div>

              {/* Jane Demo */}
              <div className="flex items-center justify-between p-2 bg-white/50 rounded-lg">
                <div className="text-sm">
                  <p className="font-medium text-amber-900">Jane Smith (User)</p>
                  <p className="text-amber-700">jane@ca.com / jane123</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => quickLogin('jane@ca.com', 'jane123')}
                  className="text-xs bg-white hover:bg-amber-50"
                >
                  Use
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-green-900 mb-2">How to Test</h3>
            <div className="space-y-2 text-sm text-green-800">
              <p>• <strong>Admin Login</strong> - Access all features, manage users, assign tasks</p>
              <p>• <strong>User Login</strong> - View assigned tasks, update status, chat</p>
              <p>• <strong>Quick Login</strong> - Click "Use" buttons to auto-fill credentials</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
