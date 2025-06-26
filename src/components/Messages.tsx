/**
 * Messages component for viewing all task conversations
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import TaskChat from './TaskChat';
import { 
  MessageSquare, 
  Search, 
  Users, 
  Calendar, 
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  ChevronRight
} from 'lucide-react';

/**
 * Messages interface for task conversations
 */
interface TaskConversation {
  taskId: string;
  taskTitle: string;
  lastMessage: any;
  unreadCount: number;
  participants: string[];
  status: string;
  priority: string;
  dueDate: Date;
}

/**
 * Messages component for task-based conversations
 */
const Messages: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { tasks, users } = useData();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [conversations, setConversations] = useState<TaskConversation[]>([]);

  /**
   * Get user tasks with conversations
   */
  useEffect(() => {
    if (!user) return;

    // Get tasks user is involved in
    const userTasks = isAdmin ? tasks : tasks.filter(task => {
      const isAssignedTo = task.assignedToId === user.id;
      const isInAssignedUsers = task.assignedUsers && Array.isArray(task.assignedUsers) && task.assignedUsers.includes(user.id);
      const isCreatedBy = task.createdById === user.id || task.assignedById === user.id;
      return isAssignedTo || isInAssignedUsers || isCreatedBy;
    });

    // Convert tasks to conversations
    const taskConversations: TaskConversation[] = userTasks.map(task => {
      // Get messages for this task from localStorage
      const taskMessages = JSON.parse(localStorage.getItem(`task_messages_${task.id}`) || '[]');
      const lastMessage = taskMessages.length > 0 ? taskMessages[taskMessages.length - 1] : null;
      
      // Calculate unread messages (simplified - could be enhanced)
      const unreadCount = taskMessages.filter((msg: any) => 
        msg.userId !== user.id && 
        new Date(msg.timestamp) > new Date(user.lastLogin || 0)
      ).length;

      // Get all participants
      const participants = [
        task.assignedToId,
        task.assignedById,
        task.createdById,
        ...(task.assignedUsers || [])
      ].filter((id, index, self) => id && self.indexOf(id) === index);

      return {
        taskId: task.id,
        taskTitle: task.title,
        lastMessage,
        unreadCount,
        participants,
        status: task.status,
        priority: task.priority,
        dueDate: new Date(task.dueDate)
      };
    });

    // Sort by last message timestamp
    taskConversations.sort((a, b) => {
      const aTime = a.lastMessage ? new Date(a.lastMessage.timestamp).getTime() : 0;
      const bTime = b.lastMessage ? new Date(b.lastMessage.timestamp).getTime() : 0;
      return bTime - aTime;
    });

    setConversations(taskConversations);
  }, [tasks, user, isAdmin, users]);

  /**
   * Filter conversations
   */
  const filteredConversations = conversations.filter(conv =>
    conv.taskTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
   * Format time ago
   */
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Messages</h2>
        <p className="text-gray-600 text-sm sm:text-base">
          Task-based conversations with team members
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
        {/* Conversations List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Conversations
            </h3>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Conversation List */}
          <div className="space-y-2 max-h-[calc(100vh-320px)] overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
                <Card 
                  key={conversation.taskId} 
                  className={`cursor-pointer transition-all hover:shadow-md ${
                    selectedTaskId === conversation.taskId ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => setSelectedTaskId(conversation.taskId)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Task Title & Status */}
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                          {conversation.taskTitle}
                        </h4>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-red-500 text-white text-xs px-2 py-1">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>

                      {/* Status & Priority */}
                      <div className="flex gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                          {conversation.status.replace('-', ' ').toUpperCase()}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(conversation.priority)}`}>
                          {conversation.priority.toUpperCase()}
                        </span>
                      </div>

                      {/* Participants */}
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Users className="w-3 h-3" />
                        <span>{conversation.participants.length} participant{conversation.participants.length !== 1 ? 's' : ''}</span>
                      </div>

                      {/* Last Message */}
                      {conversation.lastMessage ? (
                        <div className="text-xs text-gray-600">
                          <p className="line-clamp-2">
                            <span className="font-medium">
                              {users.find(u => u.id === conversation.lastMessage.userId)?.name || 'Unknown'}:
                            </span> {conversation.lastMessage.message}
                          </p>
                          <p className="text-gray-400 mt-1">
                            {formatTimeAgo(new Date(conversation.lastMessage.timestamp))}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">No messages yet</p>
                      )}

                      {/* Due Date */}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>Due: {conversation.dueDate.toLocaleDateString()}</span>
                        {conversation.dueDate < new Date() && conversation.status !== 'completed' && (
                          <AlertTriangle className="w-3 h-3 text-red-500 ml-1" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="text-sm font-medium text-gray-900 mb-2">No conversations found</h3>
                <p className="text-xs text-gray-600">
                  {searchTerm ? 'Try different search terms' : 'Start a conversation by opening a task chat'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          {selectedTaskId ? (
            <div className="bg-white rounded-lg border border-gray-200 h-full flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {conversations.find(c => c.taskId === selectedTaskId)?.taskTitle}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Users className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {conversations.find(c => c.taskId === selectedTaskId)?.participants.length} participants
                      </span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setSelectedTaskId('')}
                    variant="ghost"
                    size="sm"
                    className="lg:hidden"
                  >
                    ✕
                  </Button>
                </div>
              </div>

              {/* Task Chat */}
              <div className="flex-1 overflow-hidden">
                <TaskChat taskId={selectedTaskId} />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 h-full flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a conversation</h3>
                <p className="text-gray-600">Choose a task conversation from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;