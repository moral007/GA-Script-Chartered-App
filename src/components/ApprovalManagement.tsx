/**
 * ApprovalManagement component for task approval workflow
 */

import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Calendar,
  Filter,
  Search,
  FileText,
  AlertCircle,
  MessageSquare,
  BarChart3
} from 'lucide-react';

/**
 * ApprovalManagement component for reviewing and approving tasks
 */
const ApprovalManagement: React.FC = () => {
  const { user } = useAuth();
  const { tasks, users, clients, taskTypes, updateTask, chatMessages } = useData();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<string>('');

  /**
   * Get tasks that need approval (completed status)
   */
  const pendingApprovalTasks = tasks.filter(task => 
    task.status === 'completed' || task.status === 'pending-approval'
  );

  /**
   * Filter tasks based on search and filters
   */
  const filteredTasks = pendingApprovalTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesType = typeFilter === 'all' || task.typeId === typeFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesType && matchesPriority;
  });

  /**
   * Get task statistics
   */
  const stats = {
    total: pendingApprovalTasks.length,
    completed: pendingApprovalTasks.filter(t => t.status === 'completed').length,
    pendingApproval: pendingApprovalTasks.filter(t => t.status === 'pending-approval').length,
    overdue: pendingApprovalTasks.filter(t => 
      new Date(t.dueDate) < new Date() && t.status !== 'approved'
    ).length
  };

  /**
   * Approve task
   */
  const handleApprove = (taskId: string) => {
    updateTask(taskId, { 
      status: 'approved',
      approvedBy: user?.id,
      approvedAt: new Date()
    });
  };

  /**
   * Reject task
   */
  const handleReject = (taskId: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason) {
      updateTask(taskId, { 
        status: 'rejected',
        rejectedBy: user?.id,
        rejectedAt: new Date(),
        rejectionReason: reason
      });
    }
  };

  /**
   * Request revision
   */
  const handleRequestRevision = (taskId: string) => {
    const feedback = prompt('Please provide revision feedback:');
    if (feedback) {
      updateTask(taskId, { 
        status: 'in-progress',
        revisionRequested: true,
        revisionFeedback: feedback,
        reviewedBy: user?.id,
        reviewedAt: new Date()
      });
    }
  };

  /**
   * Get user name by ID
   */
  const getUserName = (userId: string) => {
    const taskUser = users.find(u => u.id === userId);
    return taskUser ? taskUser.name : 'Unknown User';
  };

  /**
   * Get client name by ID
   */
  const getClientName = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : 'Unknown Client';
  };

  /**
   * Get task type name by ID
   */
  const getTaskTypeName = (typeId: string) => {
    const type = taskTypes.find(t => t.id === typeId);
    return type ? type.name : 'Unknown Type';
  };

  /**
   * Get priority color
   */
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending-approval': return 'bg-purple-100 text-purple-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  /**
   * Get message count for task
   */
  const getMessageCount = (taskId: string) => {
    return chatMessages.filter(msg => msg.taskId === taskId).length;
  };

  /**
   * Check if task is overdue
   */
  const isOverdue = (dueDate: Date) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-purple-600" />
            Task Approvals
          </h1>
          <p className="text-gray-600 mt-1">Review and approve completed tasks</p>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Awaiting Review</p>
                <p className="text-2xl font-bold text-purple-600">{stats.pendingApproval}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending-approval">Pending Approval</option>
              </select>
            </div>
            
            <div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Types</option>
                {taskTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="p-2 border border-gray-300 rounded-md"
              >
                <option value="all">All Priority</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            
            <div className="text-sm text-gray-500">
              Showing {filteredTasks.length} of {pendingApprovalTasks.length} tasks
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length > 0 ? (
          filteredTasks.map(task => (
            <Card key={task.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {task.title}
                      </h3>
                      <Badge className={getStatusColor(task.status)}>
                        {task.status}
                      </Badge>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                      {isOverdue(task.dueDate) && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Overdue
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3">{task.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span>Assigned to: {getUserName(task.assignedTo)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400" />
                        <span>Type: {getTaskTypeName(task.typeId)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400" />
                        <span>Messages: {getMessageCount(task.id)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                      <span>Client: {getClientName(task.clientId)}</span>
                      {task.timeSpent && (
                        <>
                          <span>•</span>
                          <span>Time: {task.timeSpent}h</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      onClick={() => handleApprove(task.id)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    
                    <Button 
                      onClick={() => handleRequestRevision(task.id)}
                      size="sm"
                      variant="outline"
                      className="border-orange-300 text-orange-600 hover:bg-orange-50"
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      Revise
                    </Button>
                    
                    <Button 
                      onClick={() => handleReject(task.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No tasks pending approval
              </h3>
              <p className="text-gray-500">
                All tasks are up to date or no completed tasks require approval.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ApprovalManagement;
