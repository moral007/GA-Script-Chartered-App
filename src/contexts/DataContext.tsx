/**
 * Data context for managing application data and state
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Task, Client, TaskType, ChatMessage } from '../types';
import { Notification } from '../components/NotificationBell';

interface DataContextType {
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'taskNumber'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;

  // Clients
  clients: Client[];
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  // Task Types
  taskTypes: TaskType[];
  addTaskType: (taskType: Omit<TaskType, 'id' | 'createdAt'>) => void;
  updateTaskType: (id: string, updates: Partial<TaskType>) => void;
  deleteTaskType: (id: string) => void;

  // Chat Messages
  chatMessages: ChatMessage[];
  addChatMessage: (message: Omit<ChatMessage, 'id'>) => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (id: string) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: (userId: string) => void;
  markAllNotificationsAsRead: (userId: string) => void;

  // Dashboard stats
  refreshDashboardStats: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

/**
 * Hook to use data context
 */
export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

/**
 * Data provider component
 */
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize users from localStorage or use default data
  const initializeUsers = () => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      try {
        return JSON.parse(savedUsers);
      } catch (error) {
        console.error('Error parsing saved users:', error);
      }
    }
    
    // Default users if none exist
    const defaultUsers = [
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@ca.com',
      phone: '+1-555-0101',
      role: 'admin',
      department: 'Management',
      status: 'active',
      createdAt: new Date('2024-01-01'),
      lastLogin: new Date(),
      password: 'admin123'
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john@ca.com',
      phone: '+1-555-0102',
      role: 'user',
      department: 'Accounting',
      status: 'active',
      createdAt: new Date('2024-01-15'),
      lastLogin: new Date('2024-06-20'),
      password: 'john123'
    },
    {
      id: '3',
      name: 'Jane Smith',
      email: 'jane@ca.com',
      phone: '+1-555-0103',
      role: 'user',
      department: 'Tax',
      status: 'active',
      createdAt: new Date('2024-02-01'),
      lastLogin: new Date('2024-06-22'),
      password: 'jane123'
    }
    ];
    
    // Save default users to localStorage
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    return defaultUsers;
  };

  const [users, setUsers] = useState<User[]>(initializeUsers());

  const [clients, setClients] = useState<Client[]>([
    {
      id: '1',
      name: 'ABC Limited',
      email: 'contact@abc.com',
      phone: '+1-555-1001',
      address: '123 Business Street, City, State 12345',
      contactPerson: 'Michael Johnson',
      isActive: true,
      createdAt: new Date('2024-01-10')
    },
    {
      id: '2',
      name: 'XYZ Corporation',
      email: 'info@xyz.com',
      phone: '+1-555-1002',
      address: '456 Corporate Ave, City, State 67890',
      contactPerson: 'Sarah Wilson',
      isActive: true,
      createdAt: new Date('2024-01-20')
    }
  ]);

  const [taskTypes, setTaskTypes] = useState<TaskType[]>([
    {
      id: '1',
      name: 'Tax Return Preparation',
      description: 'Prepare individual and corporate tax returns',
      category: 'Tax',
      defaultPriority: 'medium',
      estimatedHours: 8,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      milestones: [
        { id: '1', name: 'Document Collection', description: 'Collect all necessary tax documents', estimatedHours: 2, order: 1 },
        { id: '2', name: 'Data Entry', description: 'Enter data into tax software', estimatedHours: 3, order: 2 },
        { id: '3', name: 'Review & Verification', description: 'Review calculations and verify accuracy', estimatedHours: 2, order: 3 },
        { id: '4', name: 'Final Submission', description: 'Submit tax return to authorities', estimatedHours: 1, order: 4 }
      ]
    },
    {
      id: '2',
      name: 'Audit Preparation',
      description: 'Prepare documentation for annual audit',
      category: 'Audit',
      defaultPriority: 'high',
      estimatedHours: 16,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      milestones: [
        { id: '1', name: 'Document Gathering', description: 'Collect audit-required documents', estimatedHours: 4, order: 1 },
        { id: '2', name: 'Trial Balance', description: 'Prepare trial balance', estimatedHours: 6, order: 2 },
        { id: '3', name: 'Working Papers', description: 'Prepare audit working papers', estimatedHours: 4, order: 3 },
        { id: '4', name: 'Final Review', description: 'Final review before audit', estimatedHours: 2, order: 4 }
      ]
    },
    {
      id: '3',
      name: 'Monthly Financial Statements',
      description: 'Prepare monthly financial statements',
      category: 'Accounting',
      defaultPriority: 'medium',
      estimatedHours: 6,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      milestones: [
        { id: '1', name: 'Journal Entries', description: 'Post monthly journal entries', estimatedHours: 2, order: 1 },
        { id: '2', name: 'Bank Reconciliation', description: 'Reconcile bank statements', estimatedHours: 2, order: 2 },
        { id: '3', name: 'Financial Statements', description: 'Generate financial statements', estimatedHours: 2, order: 3 }
      ]
    },
    {
      id: '4',
      name: 'Compliance Review',
      description: 'Review compliance with regulatory requirements',
      category: 'Compliance',
      defaultPriority: 'high',
      estimatedHours: 12,
      isActive: true,
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      milestones: [
        { id: '1', name: 'Regulation Analysis', description: 'Analyze applicable regulations', estimatedHours: 4, order: 1 },
        { id: '2', name: 'Compliance Check', description: 'Check current compliance status', estimatedHours: 4, order: 2 },
        { id: '3', name: 'Gap Analysis', description: 'Identify compliance gaps', estimatedHours: 2, order: 3 },
        { id: '4', name: 'Remediation Plan', description: 'Create remediation plan', estimatedHours: 2, order: 4 }
      ]
    }
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      taskNumber: 'T001',
      title: 'Tax Return Preparation',
      description: 'Prepare tax returns for Q4 2024',
      taskTypeId: '1',
      clientId: '2',
      assignedToId: '2',
      assignedById: '1',
      status: 'pending',
      priority: 'high',
      dueDate: new Date('2024-07-30'),
      estimatedHours: 8,
      actualHours: 0,
      createdAt: new Date('2024-06-15'),
      isRecurring: false,
      assignedUsers: ['2'],
      activityLog: [
        {
          id: '1',
          userId: '1',
          userName: 'Admin User',
          action: 'Task created and assigned to John Doe',
          timestamp: new Date('2024-06-15T10:00:00')
        }
      ]
    },
    {
      id: '2',
      taskNumber: 'T002',
      title: 'Audit Preparation',
      description: 'Prepare documentation for annual audit',
      taskTypeId: '2',
      clientId: '2',
      assignedToId: '2',
      assignedById: '1',
      status: 'pending',
      priority: 'urgent',
      dueDate: new Date('2024-07-30'),
      estimatedHours: 16,
      actualHours: 0,
      createdAt: new Date('2024-06-20'),
      isRecurring: false,
      assignedUsers: ['2'],
      activityLog: [
        {
          id: '1',
          userId: '1',
          userName: 'Admin User',
          action: 'Task created and assigned to John Doe',
          timestamp: new Date('2024-06-20T09:00:00')
        }
      ]
    },
    {
      id: '3',
      taskNumber: 'T003',
      title: 'Monthly Financial Statements',
      description: 'Prepare monthly financial statements for May 2024',
      taskTypeId: '3',
      clientId: '1',
      assignedToId: '3',
      assignedById: '1',
      status: 'in-progress',
      priority: 'medium',
      dueDate: new Date('2024-07-15'),
      estimatedHours: 6,
      actualHours: 3,
      createdAt: new Date('2024-06-10'),
      isRecurring: true,
      recurringInterval: 'monthly',
      assignedUsers: ['3'],
      activityLog: [
        {
          id: '1',
          userId: '1',
          userName: 'Admin User',
          action: 'Task created and assigned to Jane Smith',
          timestamp: new Date('2024-06-10T14:00:00')
        },
        {
          id: '2',
          userId: '3',
          userName: 'Jane Smith',
          action: 'Status changed to In Progress',
          timestamp: new Date('2024-06-12T09:00:00')
        }
      ]
    }
  ]);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      taskId: '1',
      userId: '1',
      userName: 'Admin User',
      message: 'Please start working on this tax return preparation. The client has provided all necessary documents.',
      timestamp: new Date('2024-06-15T10:00:00')
    },
    {
      id: '2',
      taskId: '1',
      userId: '2',
      userName: 'John Doe',
      message: 'Understood. I will begin reviewing the documents today.',
      timestamp: new Date('2024-06-15T14:30:00')
    },
    {
      id: '3',
      taskId: '2',
      userId: '1',
      userName: 'Admin User',
      message: 'This audit preparation is urgent. Please prioritize this task.',
      timestamp: new Date('2024-06-20T09:00:00')
    },
    {
      id: '4',
      taskId: '3',
      userId: '3',
      userName: 'Jane Smith',
      message: 'I have completed the preliminary work. Will finish by tomorrow.',
      timestamp: new Date('2024-06-24T16:00:00')
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'task',
      title: 'Task overdue',
      message: 'Tax Return Preparation was due on 7/30/2024',
      timestamp: new Date('2024-06-24T16:00:00'),
      isRead: false,
      userId: '2',
      taskId: '1',
      priority: 'urgent'
    },
    {
      id: '2',
      type: 'task',
      title: 'Task overdue',
      message: 'Audit Preparation was due on 7/30/2024',
      timestamp: new Date('2024-07-30T09:00:00'),
      isRead: false,
      userId: '2',
      taskId: '2',
      priority: 'urgent'
    },
    {
      id: '3',
      type: 'task',
      title: 'Task overdue',
      message: 'Monthly Financial Statements was due on 7/15/2024',
      timestamp: new Date('2024-07-15T10:00:00'),
      isRead: false,
      userId: '3',
      taskId: '3',
      priority: 'medium'
    },
    {
      id: '4',
      type: 'message',
      title: 'New message in Tax Return Preparation',
      message: 'Please start working on this tax return preparation...',
      timestamp: new Date('2024-06-24T15:30:00'),
      isRead: false,
      userId: '2',
      taskId: '1'
    },
    {
      id: '5',
      type: 'approval',
      title: 'Task pending approval',
      message: 'Monthly Financial Statements is ready for review',
      timestamp: new Date('2024-06-24T14:00:00'),
      isRead: false,
      userId: '1',
      taskId: '3'
    }
  ]);

  /**
   * Generate notification for task assignment
   */
  const generateTaskNotification = (task: Task, type: 'created' | 'assigned' | 'updated' | 'completed' | 'overdue') => {
    const taskTypeName = taskTypes.find(tt => tt.id === task.taskTypeId)?.name || 'Unknown Task';
    const clientName = clients.find(c => c.id === task.clientId)?.name || 'Unknown Client';
    
    let title = '';
    let message = '';
    let priority = task.priority;
    let targetUserId = '';

    switch (type) {
      case 'created':
        title = 'New task created';
        message = `${taskTypeName} created for ${clientName}`;
        targetUserId = task.assignedToId;
        break;
      case 'assigned':
        title = 'Task assigned to you';
        message = `${taskTypeName} for ${clientName}`;
        targetUserId = task.assignedToId;
        break;
      case 'updated':
        title = 'Task updated';
        message = `${taskTypeName} has been updated`;
        targetUserId = task.assignedToId;
        break;
      case 'completed':
        title = 'Task completed';
        message = `${taskTypeName} has been marked as completed`;
        targetUserId = task.assignedById;
        break;
      case 'overdue':
        title = 'Task overdue';
        message = `${taskTypeName} was due on ${new Date(task.dueDate).toLocaleDateString()}`;
        targetUserId = task.assignedToId;
        priority = 'urgent';
        break;
    }

    if (targetUserId) {
      addNotification({
        type: 'task',
        title,
        message,
        isRead: false,
        userId: targetUserId,
        taskId: task.id,
        priority
      });
    }
  };

  /**
   * Generate notification for new message
   */
  const generateMessageNotification = (message: ChatMessage) => {
    const task = tasks.find(t => t.id === message.taskId);
    if (!task) return;

    const sender = users.find(u => u.id === message.userId);
    const senderName = sender?.name || 'Unknown User';
    
    // Notify all users involved in the task except the sender
    const usersToNotify = [task.assignedToId, task.assignedById].filter(id => id !== message.userId);
    
    usersToNotify.forEach(userId => {
      if (userId) {
        addNotification({
          type: 'message',
          title: `New message in ${task.title}`,
          message: `${senderName}: ${message.message.substring(0, 50)}${message.message.length > 50 ? '...' : ''}`,
          isRead: false,
          userId,
          taskId: task.id
        });
      }
    });
  };

  // Generate next task number
  const generateTaskNumber = () => {
    const existingNumbers = tasks
      .map(task => task.taskNumber)
      .filter(num => num && /^T\d{3}$/.test(num)) // Ensure proper format T###
      .map(num => parseInt(num.substring(1)))
      .filter(num => !isNaN(num));
    
    const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
    return `T${nextNumber.toString().padStart(3, '0')}`;
  };

  // User management functions
  const addUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    
    // Sync with localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Generate system notification for admin
    const adminUsers = users.filter(u => u.role === 'admin');
    adminUsers.forEach(admin => {
      addNotification({
        type: 'system',
        title: 'New user added',
        message: `${newUser.name} has been added to the system`,
        isRead: false,
        userId: admin.id
      });
    });
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    const updatedUsers = users.map(user => 
      user.id === id ? { 
        ...user, 
        ...updates,
        role: updates.role || user.role || 'user',
        status: updates.status || user.status || 'active',
        isActive: (updates.status || user.status || 'active') === 'active'
      } : user
    );
    setUsers(updatedUsers);
    
    // Sync with localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  const deleteUser = (id: string) => {
    const updatedUsers = users.filter(user => user.id !== id);
    setUsers(updatedUsers);
    
    // Sync with localStorage
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  // Task management functions
  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'taskNumber'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      taskNumber: generateTaskNumber(),
      createdAt: new Date(),
      assignedUsers: taskData.assignedUsers || [taskData.assignedToId],
      activityLog: [
        {
          id: '1',
          userId: taskData.assignedById,
          userName: users.find(u => u.id === taskData.assignedById)?.name || 'Unknown',
          action: `Task created and assigned to ${users.find(u => u.id === taskData.assignedToId)?.name || 'Unknown'}`,
          timestamp: new Date()
        }
      ]
    };
    setTasks(prev => [...prev, newTask]);
    
    // Generate notifications
    generateTaskNotification(newTask, 'created');
    generateTaskNotification(newTask, 'assigned');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const originalTask = tasks.find(t => t.id === id);
    if (!originalTask) return;

    const updatedTask = { ...originalTask, ...updates } as Task;
    
    // Add activity log entry if status changed
    if (updates.status && updates.status !== originalTask.status) {
      const activityEntry = {
        id: Date.now().toString(),
        userId: updates.updatedById || originalTask.assignedById,
        userName: users.find(u => u.id === (updates.updatedById || originalTask.assignedById))?.name || 'Unknown',
        action: `Status changed from ${originalTask.status.replace('-', ' ')} to ${updates.status.replace('-', ' ')}`,
        timestamp: new Date()
      };
      
      updatedTask.activityLog = [...(originalTask.activityLog || []), activityEntry];
    }
    
    setTasks(prev => prev.map(task => 
      task.id === id ? updatedTask : task
    ));
    
    // Generate notifications based on status change
    if (updates.status) {
      if (updates.status === 'completed') {
        generateTaskNotification(updatedTask, 'completed');
      } else {
        generateTaskNotification(updatedTask, 'updated');
      }
    }
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  // Client management functions
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient: Client = {
      ...clientData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(client => 
      client.id === id ? { ...client, ...updates } : client
    ));
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(client => client.id !== id));
  };

  // Task type management functions
  const addTaskType = (taskTypeData: Omit<TaskType, 'id' | 'createdAt'>) => {
    const newTaskType: TaskType = {
      ...taskTypeData,
      id: Date.now().toString(),
      createdAt: new Date()
    };
    setTaskTypes(prev => [...prev, newTaskType]);
  };

  const updateTaskType = (id: string, updates: Partial<TaskType>) => {
    const originalTaskType = taskTypes.find(tt => tt.id === id);
    
    setTaskTypes(prev => prev.map(taskType => 
      taskType.id === id ? { ...taskType, ...updates, updatedAt: new Date() } : taskType
    ));

    // Sync milestone changes to existing tasks and notify users
    if (updates.milestones && originalTaskType) {
      syncTaskMilestones(id, updates.milestones);
      notifyMilestoneUpdates(id, originalTaskType.name);
    }
  };

  /**
   * Sync milestone changes to existing tasks
   */
  const syncTaskMilestones = (taskTypeId: string, newMilestones: any[]) => {
    setTasks(prev => prev.map(task => {
      if (task.taskTypeId === taskTypeId) {
        const currentProgress = task.milestoneProgress || [];
        
        // Keep existing progress for milestones that still exist
        const updatedProgress = currentProgress.filter(progress => 
          newMilestones.some(milestone => milestone.id === progress.milestoneId)
        );
        
        return {
          ...task,
          milestoneProgress: updatedProgress,
          updatedAt: new Date()
        };
      }
      return task;
    }));
  };

  /**
   * Notify users about milestone updates
   */
  const notifyMilestoneUpdates = (taskTypeId: string, taskTypeName: string) => {
    // Find all tasks using this task type
    const affectedTasks = tasks.filter(task => task.taskTypeId === taskTypeId);
    
    // Notify all users involved in these tasks
    const notifiedUsers = new Set<string>();
    
    affectedTasks.forEach(task => {
      // Notify assigned user
      if (task.assignedToId && !notifiedUsers.has(task.assignedToId)) {
        addNotification({
          type: 'system',
          title: 'Task milestones updated',
          message: `Milestones for "${taskTypeName}" tasks have been updated. Please review your tasks.`,
          isRead: false,
          userId: task.assignedToId,
          priority: 'medium'
        });
        notifiedUsers.add(task.assignedToId);
      }
      
      // Notify additional assigned users
      if (task.assignedUsers) {
        task.assignedUsers.forEach(userId => {
          if (!notifiedUsers.has(userId)) {
            addNotification({
              type: 'system',
              title: 'Task milestones updated',
              message: `Milestones for "${taskTypeName}" tasks have been updated. Please review your tasks.`,
              isRead: false,
              userId: userId,
              priority: 'medium'
            });
            notifiedUsers.add(userId);
          }
        });
      }
    });
  };

  const deleteTaskType = (id: string) => {
    setTaskTypes(prev => prev.filter(taskType => taskType.id !== id));
  };

  // Chat message functions
  const addChatMessage = (messageData: Omit<ChatMessage, 'id'>) => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: Date.now().toString()
    };
    setChatMessages(prev => [...prev, newMessage]);
    
    // Generate message notification
    generateMessageNotification(newMessage);
  };

  // Notification functions
  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: Date.now().toString(),
      timestamp: new Date()
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === id ? { ...notification, isRead: true } : notification
    ));
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const clearAllNotifications = (userId: string) => {
    setNotifications(prev => prev.filter(notification => notification.userId !== userId));
  };

  const markAllNotificationsAsRead = (userId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.userId === userId ? { ...notification, isRead: true } : notification
    ));
  };

  const refreshDashboardStats = () => {
    // This function can be used to trigger dashboard updates
    // Currently handled by real-time state updates
  };

  // Check for overdue tasks on mount and periodically
  useEffect(() => {
    const checkOverdueTasks = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (new Date(task.dueDate) < now && task.status !== 'completed' && task.status !== 'approved') {
          // Check if we already have an overdue notification for this task
          const hasOverdueNotification = notifications.some(n => 
            n.taskId === task.id && 
            n.type === 'task' && 
            n.title.includes('overdue')
          );
          
          if (!hasOverdueNotification) {
            generateTaskNotification(task, 'overdue');
          }
        }
      });
    };

    // Check immediately
    checkOverdueTasks();
    
    // Check every hour
    const interval = setInterval(checkOverdueTasks, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [tasks, notifications]);

  const value: DataContextType = {
    users,
    addUser,
    updateUser,
    deleteUser,
    tasks,
    addTask,
    updateTask,
    deleteTask,
    clients,
    addClient,
    updateClient,
    deleteClient,
    taskTypes,
    addTaskType,
    updateTaskType,
    deleteTaskType,
    chatMessages,
    addChatMessage,
    notifications,
    addNotification,
    markNotificationAsRead,
    clearNotification,
    clearAllNotifications,
    markAllNotificationsAsRead,
    refreshDashboardStats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};
