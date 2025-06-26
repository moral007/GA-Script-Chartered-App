/**
 * Type definitions for the chartered accountant task management system
 */

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  department?: string;
  createdAt: Date;
  isActive: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  isActive: boolean;
}

export interface TaskType {
  id: string;
  name: string;
  description: string;
  estimatedHours: number;
  isRecurring: boolean;
  category: string;
  isActive: boolean;
}

export interface Task {
  id: string;
  taskNumber: string;
  title: string;
  description: string;
  taskTypeId: string;
  clientId: string;
  assignedToId: string;
  assignedById: string;
  status: 'pending' | 'in-progress' | 'completed' | 'approved' | 'rejected';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  dueDate: Date;
  createdAt: Date;
  completedAt?: Date;
  approvedAt?: Date;
  estimatedHours: number;
  actualHours?: number;
  comments?: string;
  isRecurring: boolean;
  recurringInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

export interface ChatMessage {
  id: string;
  taskId: string;
  userId: string;
  message: string;
  timestamp: Date;
  userName: string;
}

export interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  approvedTasks: number;
  totalUsers: number;
  totalClients: number;
  totalHours: number;
  overduetasks: number;
}
