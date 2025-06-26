/**
 * Notification Bell component for displaying task updates and alerts
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Bell, X, Check, AlertTriangle, Clock, User } from 'lucide-react';
import { Button } from './ui/button';

/**
 * Notification interface
 */
interface Notification {
  id: string;
  type: 'task_assigned' | 'task_completed' | 'task_status_changed' | 'task_overdue' | 'new_message';
  title: string;
  message: string;
  taskId?: string;
  timestamp: Date;
  read: boolean;
  fromUser?: string;
}

/**
 * NotificationBell component for alerts and updates
 */
const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const { tasks, users } = useData();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  /**
   * Generate notifications based on task updates
   */
  useEffect(() => {
    if (!user) return;

    const userTasks = tasks.filter(task => {
      const isAssignedTo = task.assignedToId === user.id;
      const isInAssignedUsers = task.assignedUsers && Array.isArray(task.assignedUsers) && task.assignedUsers.includes(user.id);
      return isAssignedTo || isInAssignedUsers;
    });

    const newNotifications: Notification[] = [];

    userTasks.forEach(task => {
      // Check for newly assigned tasks
      if (task.createdAt && new Date(task.createdAt) > lastCheck) {
        const assignedBy = users.find(u => u.id === task.assignedById);
        newNotifications.push({
          id: `task_assigned_${task.id}_${Date.now()}`,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `You have been assigned to "${task.title}" by ${assignedBy?.name || 'Admin'}`,
          taskId: task.id,
          timestamp: new Date(task.createdAt),
          read: false,
          fromUser: task.assignedById
        });
      }

      // Check for status changes
      if (task.updatedAt && new Date(task.updatedAt) > lastCheck && task.updatedById !== user.id) {
        const updatedBy = users.find(u => u.id === task.updatedById);
        newNotifications.push({
          id: `task_status_${task.id}_${Date.now()}`,
          type: 'task_status_changed',
          title: 'Task Status Updated',
          message: `"${task.title}" status changed to ${task.status.replace('-', ' ').toUpperCase()} by ${updatedBy?.name || 'Admin'}`,
          taskId: task.id,
          timestamp: new Date(task.updatedAt),
          read: false,
          fromUser: task.updatedById
        });
      }

      // Check for overdue tasks
      if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed' && task.status !== 'approved') {
        const isOverdueNotificationExists = notifications.some(n => 
          n.type === 'task_overdue' && n.taskId === task.id
        );
        
        if (!isOverdueNotificationExists) {
          newNotifications.push({
            id: `task_overdue_${task.id}_${Date.now()}`,
            type: 'task_overdue',
            title: 'Task Overdue',
            message: `"${task.title}" is overdue (Due: ${new Date(task.dueDate).toLocaleDateString()})`,
            taskId: task.id,
            timestamp: new Date(),
            read: false
          });
        }
      }

      // Check for completed tasks (for admin approval)
      if (task.status === 'completed' && task.updatedAt && new Date(task.updatedAt) > lastCheck && user.role === 'admin') {
        const completedBy = users.find(u => u.id === task.updatedById);
        newNotifications.push({
          id: `task_completed_${task.id}_${Date.now()}`,
          type: 'task_completed',
          title: 'Task Completed',
          message: `"${task.title}" has been completed by ${completedBy?.name || 'User'} and awaits approval`,
          taskId: task.id,
          timestamp: new Date(task.updatedAt),
          read: false,
          fromUser: task.updatedById
        });
      }
    });

    if (newNotifications.length > 0) {
      setNotifications(prev => [...newNotifications, ...prev].slice(0, 50)); // Keep last 50 notifications
    }
  }, [tasks, user, users, lastCheck, notifications]);

  /**
   * Mark notification as read
   */
  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  /**
   * Mark all notifications as read
   */
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setLastCheck(new Date());
  };

  /**
   * Delete notification
   */
  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  /**
   * Get notification icon
   */
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned': return <User className="w-4 h-4 text-blue-600" />;
      case 'task_completed': return <Check className="w-4 h-4 text-green-600" />;
      case 'task_status_changed': return <Clock className="w-4 h-4 text-orange-600" />;
      case 'task_overdue': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <Button
        onClick={() => setShowDropdown(!showDropdown)}
        variant="ghost"
        size="sm"
        className="relative p-2"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="ghost" size="sm" className="text-xs">
                  Mark all read
                </Button>
              )}
              <Button onClick={() => setShowDropdown(false)} variant="ghost" size="sm">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notification.title}
                        </h4>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-gray-600 p-1"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {notification.timestamp.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-sm">No notifications yet</p>
                <p className="text-xs text-gray-400">You'll see task updates and alerts here</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;