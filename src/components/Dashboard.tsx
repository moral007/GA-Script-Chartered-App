/**
 * Dashboard component showing overview statistics and charts
 */

import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Building2, 
  FileText,
  TrendingUp,
  Calendar,
  BarChart3,
  Grid3X3,
  List
} from 'lucide-react';

/**
 * Dashboard component with statistics and overview
 */
const Dashboard: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { 
    refreshDashboardStats, 
    tasks, 
    users, 
    clients 
  } = useData();

  useEffect(() => {
    refreshDashboardStats();
  }, [tasks, users, clients]);

  // Calculate real-time statistics
  const stats = {
    totalTasks: tasks.length,
    pendingTasks: tasks.filter(t => t.status === 'pending').length,
    inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
    completedTasks: tasks.filter(t => t.status === 'completed' || t.status === 'approved').length,
    overdueTests: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed' && t.status !== 'approved').length,
    totalUsers: users.filter(u => u.status === 'active').length,
    totalClients: clients.filter(c => c.isActive).length
  };

  /**
   * Get user-specific tasks if not admin
   */
  const userTasks = isAdmin ? tasks : tasks.filter(task => task.assignedToId === user?.id);
  const userStats = {
    totalTasks: userTasks.length,
    pendingTasks: userTasks.filter(t => t.status === 'pending').length,
    inProgressTasks: userTasks.filter(t => t.status === 'in-progress').length,
    completedTasks: userTasks.filter(t => t.status === 'completed').length,
    overdueTests: userTasks.filter(t => t.dueDate < new Date() && t.status !== 'completed' && t.status !== 'approved').length
  };

  /**
   * Statistics cards for admin
   */
  const adminStats = [
    {
      title: 'Total Tasks',
      value: stats.totalTasks,
      icon: FileText,
      color: 'bg-blue-500',
      description: 'All tasks in system'
    },
    {
      title: 'Pending Tasks',
      value: stats.pendingTasks,
      icon: Clock,
      color: 'bg-orange-500',
      description: 'Awaiting assignment'
    },
    {
      title: 'Completed Tasks',
      value: stats.completedTasks,
      icon: CheckCircle,
      color: 'bg-green-500',
      description: 'Successfully completed'
    },
    {
      title: 'Overdue Tasks',
      value: stats.overdueTests,
      icon: AlertTriangle,
      color: 'bg-red-500',
      description: 'Past due date'
    },
    {
      title: 'Active Users',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-500',
      description: 'Registered users'
    },
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: Building2,
      color: 'bg-indigo-500',
      description: 'Active clients'
    }
  ];

  /**
   * Statistics cards for users
   */
  const userStatCards = [
    {
      title: 'My Tasks',
      value: userStats.totalTasks,
      icon: FileText,
      color: 'bg-blue-500',
      description: 'Total assigned tasks'
    },
    {
      title: 'Pending',
      value: userStats.pendingTasks,
      icon: Clock,
      color: 'bg-orange-500',
      description: 'Awaiting start'
    },
    {
      title: 'In Progress',
      value: userStats.inProgressTasks,
      icon: TrendingUp,
      color: 'bg-yellow-500',
      description: 'Currently working'
    },
    {
      title: 'Completed',
      value: userStats.completedTasks,
      icon: CheckCircle,
      color: 'bg-green-500',
      description: 'Finished tasks'
    },
    {
      title: 'Overdue',
      value: userStats.overdueTests,
      icon: AlertTriangle,
      color: 'bg-red-500',
      description: 'Past due date'
    }
  ];

  const statsToShow = isAdmin ? adminStats : userStatCards;

  /**
   * Get recent tasks
   */
  const recentTasks = (isAdmin ? tasks : userTasks)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  /**
   * Get status color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-purple-100 text-purple-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 min-h-screen bg-gray-50">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-4 sm:p-6 text-white">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-blue-100 text-sm sm:text-base">
          {isAdmin 
            ? 'Manage your team and oversee all operations from this dashboard.'
            : 'Track your tasks and stay on top of your assignments.'
          }
        </p>
      </div>

      {/* Statistics Cards - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
        {statsToShow.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-4 lg:p-6">
              <div className="flex flex-col items-center text-center space-y-2 sm:space-y-3">
                <div className={`${stat.color} p-2 sm:p-3 rounded-full`}>
                  <stat.icon className="w-4 h-4 sm:w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-lg sm:text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1 hidden sm:block">{stat.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Tasks - Takes 2 columns on xl screens */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Recent Tasks</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                {recentTasks.length > 0 ? (
                  recentTasks.map((task) => (
                    <div key={task.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg space-y-2 sm:space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                            {task.taskNumber || 'T000'}
                          </span>
                          <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status.replace('-', ' ').toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority.toUpperCase()}
                          </span>
                          <span className="text-xs text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No tasks found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {isAdmin ? (
                  <>
                    <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <div className="font-medium text-blue-900 text-sm">Create New Task</div>
                      <div className="text-xs text-blue-600">Assign tasks to team members</div>
                    </button>
                    <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      <div className="font-medium text-green-900 text-sm">Review Approvals</div>
                      <div className="text-xs text-green-600">Approve completed tasks</div>
                    </button>
                    <button className="w-full p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                      <div className="font-medium text-purple-900 text-sm">Generate Reports</div>
                      <div className="text-xs text-purple-600">View detailed analytics</div>
                    </button>
                  </>
                ) : (
                  <>
                    <button className="w-full p-3 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                      <div className="font-medium text-blue-900 text-sm">View My Tasks</div>
                      <div className="text-xs text-blue-600">See all assigned tasks</div>
                    </button>
                    <button className="w-full p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                      <div className="font-medium text-green-900 text-sm">Update Progress</div>
                      <div className="text-xs text-green-600">Mark tasks as complete</div>
                    </button>
                    <button className="w-full p-3 text-left bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                      <div className="font-medium text-orange-900 text-sm">Request Support</div>
                      <div className="text-xs text-orange-600">Get help with tasks</div>
                    </button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">System Health</span>
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Operational</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Database</span>
                  <span className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Connected</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Last Backup</span>
                  <span className="text-sm text-gray-600">2 hours ago</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Active Sessions</span>
                  <span className="text-sm text-gray-600">{users.filter(u => u.isActive).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dashboard View Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Dashboard Views</span>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                <BarChart3 className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                <List className="w-4 h-4" />
              </button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 border-2 border-blue-200 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-900">Analytics View</span>
              </div>
              <p className="text-sm text-blue-700">Current active view with detailed statistics</p>
            </div>
            <div className="p-4 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <Grid3X3 className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">Kanban Board</span>
              </div>
              <p className="text-sm text-gray-600">Drag and drop task management</p>
            </div>
            <div className="p-4 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-3 mb-2">
                <List className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-900">List View</span>
              </div>
              <p className="text-sm text-gray-600">Detailed task list with filters</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
