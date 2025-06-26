/**
 * Task Management component with multi-user assignment and status control
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import TaskChat from './TaskChat';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MessageSquare, 
  Calendar,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  UserPlus,
  History,
  X,
  Check,
  Target,
  RefreshCw,
  Search
} from 'lucide-react';

/**
 * Task management component with comprehensive features
 */
const TaskManagement: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { 
    tasks, 
    users, 
    clients, 
    taskTypes, 
    addTask, 
    updateTask, 
    deleteTask
  } = useData();

  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [showChat, setShowChat] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [showUserTransfer, setShowUserTransfer] = useState(false);
  const [transferTaskId, setTransferTaskId] = useState<string>('');
  
  // State for milestone navigation per task
  const [milestoneNavigation, setMilestoneNavigation] = useState<Record<string, number>>({});

  // Force component re-render when users change
  const [, forceUpdate] = useState({});
  const [taskMessageCounts, setTaskMessageCounts] = useState<Record<string, number>>({});
  
  useEffect(() => {
    forceUpdate({});
  }, [users]);

  // Get filtered tasks based on user role
  const userTasks = isAdmin ? tasks : tasks.filter(task => {
    const isAssignedTo = task.assignedToId === user?.id;
    const isInAssignedUsers = task.assignedUsers && Array.isArray(task.assignedUsers) && task.assignedUsers.includes(user?.id || '');
    const isCreatedBy = task.createdById === user?.id || task.assignedById === user?.id;
    return isAssignedTo || isInAssignedUsers || isCreatedBy;
  });

  // Apply filters
  const filteredTasks = userTasks.filter(task => {
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    // Enhanced search functionality
    const searchLower = searchTerm.toLowerCase().trim();
    const taskNumber = task.taskNumber || '';
    const matchesSearch = searchTerm === '' || 
                         task.title.toLowerCase().includes(searchLower) ||
                         task.description.toLowerCase().includes(searchLower) ||
                         taskNumber.toLowerCase().includes(searchLower) ||
                         (searchLower.startsWith('t') && taskNumber.toLowerCase().includes(searchLower)) ||
                         (taskNumber.toLowerCase().startsWith('t') && taskNumber.substring(1).includes(searchLower)) ||
                         (!searchLower.startsWith('t') && taskNumber.toLowerCase().includes('t' + searchLower));
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  /**
   * Get unread message count for a task
   */
  const getUnreadMessageCount = (taskId: string) => {
    try {
      const taskMessages = JSON.parse(localStorage.getItem(`chat_${taskId}`) || '[]');
      const lastReadTimestamp = localStorage.getItem(`chat_lastRead_${taskId}_${user?.id}`) || '0';
      const unreadCount = taskMessages.filter((msg: any) => 
        msg.userId !== user?.id && 
        new Date(msg.timestamp) > new Date(lastReadTimestamp)
      ).length;
      return unreadCount;
    } catch {
      return 0;
    }
  };

  /**
   * Mark messages as read for a task
   */
  const markMessagesAsRead = (taskId: string) => {
    if (!user?.id) return;
    localStorage.setItem(`chat_lastRead_${taskId}_${user.id}`, new Date().toISOString());
    
    // Update the message count immediately
    setTaskMessageCounts(prev => ({
      ...prev,
      [taskId]: 0
    }));
  };

  /**
   * Update message counts for all tasks
   */
  useEffect(() => {
    const counts: Record<string, number> = {};
    filteredTasks.forEach(task => {
      counts[task.id] = getUnreadMessageCount(task.id);
    });
    setTaskMessageCounts(counts);
  }, [filteredTasks, user]);

  /**
   * Refresh message counts periodically
   */
  useEffect(() => {
    const interval = setInterval(() => {
      const counts: Record<string, number> = {};
      filteredTasks.forEach(task => {
        // Don't update count for currently open chat
        if (showChat !== task.id) {
          counts[task.id] = getUnreadMessageCount(task.id);
        } else {
          counts[task.id] = 0; // Active chat should show 0 unread
        }
      });
      setTaskMessageCounts(counts);
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(interval);
  }, [filteredTasks, user, showChat]);

  /**
   * Initialize form data
   */
  const initializeForm = () => ({
    title: '',
    description: '',
    assignedToId: '',
    assignedUsers: [],
    clientId: '',
    taskTypeId: '',
    priority: 'medium',
    status: 'pending',
    dueDate: '',
    estimatedHours: 0,
    actualHours: 0,
    milestones: []
  });

  const [formData, setFormData] = useState(initializeForm());

  /**
   * Handle status change with restrictions
   */
  const handleStatusChange = (taskId: string, newStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Check if user can change status
    if (task.status === 'completed' && newStatus !== 'completed') {
      if (!isAdmin) {
        alert('Only administrators can change status of completed tasks');
        return;
      }
    }

    // Show confirmation for completed status
    if (newStatus === 'completed') {
      if (!confirm('Are you sure you want to mark this task as completed? This will send it for approval.')) {
        return;
      }
    }

    // Update task status with activity log
    updateTask(taskId, { 
      status: newStatus,
      updatedById: user?.id 
    });
  };

  /**
   * Handle task assignment
   */
  const handleAssignTask = () => {
    if (!selectedTask || selectedUsers.length === 0) return;

    const currentAssignedUsers = selectedTask.assignedUsers || [];
    const newAssignedUsers = [...currentAssignedUsers, ...selectedUsers];

    updateTask(selectedTask.id, {
      assignedUsers: newAssignedUsers,
      updatedById: user?.id,
      updatedAt: new Date()
    });

    setSelectedUsers([]);
    setSelectedTask(null);
    
    // Force re-render to show updated assignments
    forceUpdate({});
  };

  /**
   * Handle task transfer
   */
  const handleTaskTransfer = (newUserId: string) => {
    if (!transferTaskId) return;

    const task = tasks.find(t => t.id === transferTaskId);
    if (!task) return;

    updateTask(transferTaskId, { 
      assignedToId: newUserId,
      updatedById: user?.id
    });

    setShowUserTransfer(false);
    setTransferTaskId('');
  };

  /**
   * Create new task
   */
  const handleCreateTask = () => {
    if (!formData.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    if (!formData.assignedToId) {
      alert('Please assign the task to a user');
      return;
    }

    if (!formData.clientId) {
      alert('Please select a client');
      return;
    }

    if (!formData.dueDate) {
      alert('Please set a due date');
      return;
    }

    const taskData = {
      ...formData,
      assignedUsers: selectedUsers.length > 0 ? selectedUsers : [],
      assignedById: user?.id || '',
      createdById: user?.id || '',
      estimatedHours: Number(formData.estimatedHours) || 0,
      actualHours: 0,
      dueDate: new Date(formData.dueDate),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    addTask(taskData);

    setFormData(initializeForm());
    setSelectedUsers([]);
    setShowTaskForm(false);
    setIsCreating(false);
  };

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

  /**
   * Can user change status
   */
  const canChangeStatus = (task: any) => {
    if (isAdmin) return true;
    if (task.status === 'completed' || task.status === 'approved') return false;
    return task.assignedToId === user?.id || task.assignedUsers?.includes(user?.id);
  };

  /**
   * Handle milestone completion
   */
  const handleMilestoneToggle = (taskId: string, milestoneId: string, completed: boolean) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const currentProgress = task.milestoneProgress || [];
    const updatedProgress = [...currentProgress];
    
    const existingIndex = updatedProgress.findIndex(mp => mp.milestoneId === milestoneId);
    
    if (existingIndex >= 0) {
      updatedProgress[existingIndex] = {
        ...updatedProgress[existingIndex],
        completed,
        completedAt: completed ? new Date() : undefined,
        completedById: completed ? user?.id : undefined
      };
    } else {
      updatedProgress.push({
        milestoneId,
        completed,
        completedAt: completed ? new Date() : undefined,
        completedById: completed ? user?.id : undefined
      });
    }

    updateTask(taskId, {
      milestoneProgress: updatedProgress,
      updatedById: user?.id,
      updatedAt: new Date()
    });

    // Force component re-render
    forceUpdate({});
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-full mx-auto">
        <div className="flex gap-6 h-[calc(100vh-140px)]">
          {/* Main Content - Task List */}
          <div className={`${showChat ? 'flex-1 min-w-0' : 'w-full'} transition-all duration-300 space-y-6 overflow-y-auto pr-2`}>
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Task Management</h2>
                  <p className="text-gray-600 text-sm sm:text-base">
                    {isAdmin ? 'Manage and assign tasks to team members' : 'View and manage your assigned tasks'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      // Force refresh to sync with latest task type milestones
                      forceUpdate({});
                      // Show success message
                      alert('Tasks refreshed with latest milestone updates!');
                    }}
                    variant="outline" 
                    className="flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                  </Button>
                  {isAdmin && (
                    <Button onClick={() => setShowTaskForm(true)} className="flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Task
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Input
                    placeholder="Search: T000, T001, audit, tax, or any keyword..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue placeholder="All Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>
                    Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
                    {searchTerm && (
                      <span className="ml-2 text-blue-600 font-medium">
                        for "{searchTerm}"
                      </span>
                    )}
                  </span>
                  {!searchTerm && userTasks.length > 0 && (
                    <span className="text-gray-500 text-xs">
                      Available task numbers: {userTasks.map(t => t.taskNumber || 'N/A').slice(0, 3).join(', ')}
                      {userTasks.length > 3 && '...'}
                    </span>
                  )}
                  {searchTerm && filteredTasks.length === 0 && (
                    <div className="text-orange-600 font-medium">
                      <span>No tasks found. Try searching by:</span>
                      <ul className="text-xs mt-1 space-y-1">
                        <li>• Task number: T001, T002, etc.</li>
                        <li>• Title keywords: audit, tax, etc.</li>
                        <li>• Description content</li>
                      </ul>
                    </div>
                  )}
                </div>
                {Object.values(taskMessageCounts).reduce((sum, count) => sum + count, 0) > 0 && (
                  <div className="flex items-center gap-1 text-blue-600 font-medium text-sm">
                    <MessageSquare className="w-4 h-4" />
                    {Object.values(taskMessageCounts).reduce((sum, count) => sum + count, 0)} unread message{Object.values(taskMessageCounts).reduce((sum, count) => sum + count, 0) !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>

            {/* Task List */}
            <div className="space-y-4">
              {filteredTasks.length > 0 ? (
                filteredTasks.map((task) => (
                  <Card key={task.id} className={`hover:shadow-lg transition-all duration-200 bg-white ${
                    taskMessageCounts[task.id] > 0 ? 'ring-2 ring-blue-200 border-blue-200 shadow-md' : 'shadow-sm'
                  } ${showChat === task.id ? 'ring-2 ring-green-400 border-green-300 shadow-lg' : ''}`}>
                    <CardContent className="p-4 sm:p-6 relative">
                      {/* Milestone Progress Summary - Top Right */}
                      {(() => {
                        const taskType = taskTypes.find(tt => tt.id === task.taskTypeId);
                        const milestones = taskType?.milestones || [];
                        const milestoneProgress = task.milestoneProgress || [];
                        const validProgress = milestoneProgress.filter(progress => 
                          milestones.some(milestone => milestone.id === progress.milestoneId)
                        );
                        const validCompletedCount = validProgress.filter(mp => mp.completed).length;
                        
                        if (milestones.length > 0) {
                          return (
                            <div className="absolute top-3 right-3 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-lg shadow-sm border border-gray-200 text-xs">
                              <span className="text-gray-600 font-medium whitespace-nowrap">
                                {validCompletedCount}/{milestones.length}
                              </span>
                              <div className="w-16 bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className="bg-green-500 h-1.5 rounded-full transition-all duration-300"
                                  style={{
                                    width: `${milestones.length > 0 ? (validCompletedCount / milestones.length) * 100 : 0}%`
                                  }}
                                />
                              </div>
                              <span className="text-gray-700 font-medium">
                                {milestones.length > 0 ? Math.round((validCompletedCount / milestones.length) * 100) : 0}%
                              </span>
                            </div>
                          );
                        }
                        return null;
                      })()}

                      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                            <div className="flex items-center gap-3 w-full">
                              <div className="flex items-center gap-3 flex-wrap">
                                <span className="px-3 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-md shrink-0">
                                  {task.taskNumber || 'T000'}
                                </span>
                                <h3 className="font-semibold text-gray-900 text-lg break-words">{task.title}</h3>
                              </div>
                              {taskMessageCounts[task.id] > 0 && (
                                <div className="relative">
                                  <MessageSquare className="w-5 h-5 text-blue-600" />
                                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                    {taskMessageCounts[task.id] > 9 ? '9+' : taskMessageCounts[task.id]}
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                {task.status.replace('-', ' ').toUpperCase()}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                {task.priority.toUpperCase()}
                              </span>
                              {taskMessageCounts[task.id] > 0 && (
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {taskMessageCounts[task.id]} unread
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="text-gray-600 text-sm">{task.description}</p>

                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>Primary: {users.find(u => u.id === task.assignedToId)?.name || 'Unassigned'}</span>
                            </div>
                            
                            {task.assignedUsers && task.assignedUsers.length > 0 && (
                              <div className="flex items-start gap-2">
                                <UserPlus className="w-4 h-4 mt-0.5" />
                                <div className="flex flex-wrap gap-1">
                                  <span className="font-medium">Additional:</span>
                                  {task.assignedUsers.map((userId, index) => (
                                    <span key={userId} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                      {users.find(u => u.id === userId)?.name || 'Unknown User'}
                                      {index < task.assignedUsers.length - 1 ? ',' : ''}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>Hours: {task.actualHours || 0}/{task.estimatedHours || 0}</span>
                            </div>
                          </div>

                          {/* Interactive Milestone Progress */}
                          {(() => {
                            const taskType = taskTypes.find(tt => tt.id === task.taskTypeId);
                            const milestones = taskType?.milestones || [];
                            const milestoneProgress = task.milestoneProgress || [];
                            const validProgress = milestoneProgress.filter(progress => 
                              milestones.some(milestone => milestone.id === progress.milestoneId)
                            );
                            const validCompletedCount = validProgress.filter(mp => mp.completed).length;
                            
                            if (milestones.length > 0) {
                              return (
                                <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                  {/* Milestone Header */}
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                      <Target className="w-4 h-4 text-gray-600" />
                                      <span className="text-sm font-medium text-gray-700">Milestones Progress</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-medium text-gray-600">
                                        {validCompletedCount}/{milestones.length}
                                      </span>
                                      <div className="w-16 bg-gray-200 rounded-full h-2">
                                        <div 
                                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                          style={{
                                            width: `${milestones.length > 0 ? (validCompletedCount / milestones.length) * 100 : 0}%`
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Milestone Grid */}
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    {milestones
                                      .sort((a, b) => a.order - b.order)
                                      .map((milestone) => {
                                        const progress = validProgress.find(mp => mp.milestoneId === milestone.id);
                                        const isCompleted = progress?.completed || false;
                                        
                                        return (
                                          <button
                                            key={milestone.id}
                                            className={`relative p-2 rounded-lg border-2 transition-all duration-200 text-left ${
                                              isCompleted 
                                                ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                                                : 'bg-white border-gray-200 hover:border-gray-300'
                                            } ${canChangeStatus(task) ? 'cursor-pointer' : 'cursor-default'}`}
                                            onClick={() => {
                                              if (canChangeStatus(task)) {
                                                handleMilestoneToggle(task.id, milestone.id, !isCompleted);
                                              }
                                            }}
                                            title={`${milestone.description} (${milestone.estimatedHours}h)`}
                                            disabled={!canChangeStatus(task)}
                                          >
                                            <div className="flex items-start justify-between">
                                              <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1 mb-1">
                                                  <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold ${
                                                    isCompleted 
                                                      ? 'bg-green-500 border-green-600 text-white' 
                                                      : 'bg-gray-100 border-gray-300 text-gray-600'
                                                  }`}>
                                                    {milestone.order}
                                                  </span>
                                                  {milestone.isRequired && (
                                                    <span className="text-red-500 text-xs">*</span>
                                                  )}
                                                </div>
                                                <div className="text-xs font-medium text-gray-900 truncate">
                                                  {milestone.name}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                  {milestone.estimatedHours}h
                                                </div>
                                              </div>
                                              {isCompleted && (
                                                <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                                              )}
                                            </div>
                                          </button>
                                        );
                                      })}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          {/* Status Change */}
                          {canChangeStatus(task) && (
                            <div className="flex flex-wrap gap-2">
                              {task.status === 'pending' && (
                                <Button
                                  onClick={() => handleStatusChange(task.id, 'in-progress')}
                                  size="sm"
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  Start
                                </Button>
                              )}
                              {task.status === 'in-progress' && (
                                <Button
                                  onClick={() => handleStatusChange(task.id, 'completed')}
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Complete
                                </Button>
                              )}
                              {task.status === 'rejected' && (
                                <Button
                                  onClick={() => handleStatusChange(task.id, 'pending')}
                                  size="sm"
                                  className="bg-orange-600 hover:bg-orange-700"
                                >
                                  Restart
                                </Button>
                              )}
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                
                                const isOpening = showChat !== task.id;
                                setShowChat(showChat === task.id ? '' : task.id);
                                
                                // Mark messages as read when opening chat
                                if (isOpening) {
                                  markMessagesAsRead(task.id);
                                }
                              }}
                              variant={showChat === task.id ? "default" : (taskMessageCounts[task.id] > 0 ? "default" : "outline")}
                              size="sm"
                              className={`flex items-center gap-2 relative ${
                                showChat === task.id 
                                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                                  : taskMessageCounts[task.id] > 0 
                                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                                  : ''
                              }`}
                            >
                              <MessageSquare className="w-4 h-4" />
                              <span className="hidden sm:inline">Chat</span>
                              {taskMessageCounts[task.id] > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                  {taskMessageCounts[task.id] > 9 ? '9+' : taskMessageCounts[task.id]}
                                </span>
                              )}
                            </Button>

                            {isAdmin && (
                              <>
                                <Button
                                  onClick={() => {
                                    setSelectedTask(task);
                                    setSelectedUsers([]);
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  <UserPlus className="w-4 h-4" />
                                  <span className="hidden sm:inline">Assign</span>
                                </Button>

                                <Button
                                  onClick={() => {
                                    setTransferTaskId(task.id);
                                    setShowUserTransfer(true);
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  <ArrowRight className="w-4 h-4" />
                                  <span className="hidden sm:inline">Transfer</span>
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-white shadow-sm">
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-600">
                      {isAdmin ? 'Create your first task to get started' : 'No tasks assigned to you yet'}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Chat Sidebar */}
          {showChat && (
            <div className="w-1/3 min-w-[320px] max-w-[400px] bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col h-full">
              {/* Chat Header */}
              <div className="flex-shrink-0 p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded min-w-[40px] text-center">
                          {tasks.find(t => t.id === showChat)?.taskNumber || 'T000'}
                        </span>
                        <h3 className="font-semibold text-gray-900 text-sm truncate">
                          {tasks.find(t => t.id === showChat)?.title}
                        </h3>
                      </div>
                      <p className="text-xs text-gray-600">Task Discussion</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setShowChat('')}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600 hover:bg-white/50 rounded-full flex-shrink-0 ml-2"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Chat Content */}
              <div className="flex-1 overflow-hidden min-h-0">
                <TaskChat taskId={showChat} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold">Create New Task</h3>
                <Button onClick={() => setShowTaskForm(false)} variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter task title"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="Enter task description"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="assignedTo">Assign To</Label>
                    <Select value={formData.assignedToId} onValueChange={(value) => setFormData({...formData, assignedToId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users
                          .filter((u, index, self) => 
                            (u.status === 'active' || u.isActive !== false) && 
                            self.findIndex(user => user.id === u.id) === index
                          )
                          .map(user => (
                            <SelectItem key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="taskType">Task Type</Label>
                    <Select value={formData.taskTypeId} onValueChange={(value) => setFormData({...formData, taskTypeId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select task type" />
                      </SelectTrigger>
                      <SelectContent>
                        {taskTypes.filter(tt => tt.isActive).map(taskType => (
                          <SelectItem key={taskType.id} value={taskType.id}>
                            {taskType.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client">Client</Label>
                    <Select value={formData.clientId} onValueChange={(value) => setFormData({...formData, clientId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.filter(c => c.isActive).map(client => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="estimatedHours">Estimated Hours</Label>
                    <Input
                      id="estimatedHours"
                      type="number"
                      min="0"
                      step="0.5"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData({...formData, estimatedHours: Number(e.target.value)})}
                      placeholder="Enter estimated hours"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <Label>Additional Users</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {users
                      .filter((u, index, self) => 
                        (u.status === 'active' || u.isActive !== false) && 
                        u.id !== formData.assignedToId &&
                        self.findIndex(user => user.id === u.id) === index
                      )
                      .map(user => (
                        <label key={user.id} className="flex items-center gap-2 p-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedUsers([...selectedUsers, user.id]);
                              } else {
                                setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{user.name}</span>
                        </label>
                      ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateTask}>Create Task</Button>
                  <Button onClick={() => setShowTaskForm(false)} variant="outline">Cancel</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Assignment Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Assign Users to Task</h3>
                <Button onClick={() => setSelectedTask(null)} variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {users
                  .filter((u, index, self) => 
                    (u.status === 'active' || u.isActive !== false) && 
                    u.id !== selectedTask.assignedToId && 
                    !selectedTask.assignedUsers?.includes(u.id) &&
                    self.findIndex(user => user.id === u.id) === index
                  )
                  .map(user => (
                    <label key={user.id} className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </label>
                  ))}
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={handleAssignTask} disabled={selectedUsers.length === 0}>
                  Assign Users
                </Button>
                <Button onClick={() => setSelectedTask(null)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Transfer Modal */}
      {showUserTransfer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Transfer Task</h3>
                <Button onClick={() => setShowUserTransfer(false)} variant="ghost" size="sm">
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {users
                  .filter((u, index, self) => 
                    (u.status === 'active' || u.isActive !== false) &&
                    self.findIndex(user => user.id === u.id) === index
                  )
                  .map(user => (
                    <button
                      key={user.id}
                      onClick={() => handleTaskTransfer(user.id)}
                      className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 text-left"
                    >
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-gray-600">{user.email}</div>
                      </div>
                    </button>
                  ))}
              </div>

              <div className="flex gap-2 mt-6">
                <Button onClick={() => setShowUserTransfer(false)} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManagement;
