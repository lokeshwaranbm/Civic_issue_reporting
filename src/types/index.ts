export type UserRole = 'citizen' | 'staff' | 'admin';

export type IssueStatus = 
  | 'pending' 
  | 'inspection_scheduled'
  | 'in_progress' 
  | 'resolved'
  | 'rejected';

export type IssueCategory =
  | 'road'
  | 'water'
  | 'electricity'
  | 'sanitation'
  | 'streetlight'
  | 'drainage'
  | 'other';

export const DEFAULT_DEPARTMENTS = [
  'Roads & Infrastructure',
  'Water Supply',
  'Electricity & Power',
  'Sanitation & Waste',
  'Public Works',
  'General',
] as const;

export type Department = (typeof DEFAULT_DEPARTMENTS)[number] | string;

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  department?: string; // For staff members
  password?: string; // Stored for demo authentication only
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  status: IssueStatus;
  location: string;
  latitude?: number;
  longitude?: number;
  imageUrl?: string;
  reportedBy: string; // User ID
  reporterName: string;
  assignedTo?: string; // Staff user ID
  assignedToName?: string;
  department?: Department;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolutionImageUrl?: string;
  resolutionNote?: string;
  upvotes: string[]; // Array of user IDs who upvoted
  upvoteCount: number;
  feedback?: IssueFeedback;
  rejectionReason?: string;
  priority?: 'normal' | 'high' | 'critical'; // Based on upvotes
  slaDeadline?: string; // ISO date string
  isOverdue?: boolean;
}

export interface Comment {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  message: string;
  createdAt: string;
}

export interface IssueFeedback {
  userId: string;
  userName: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export type NotificationType = 'assignment' | 'escalation' | 'sla_warning' | 'sla_overdue' | 'status_update';

export interface Notification {
  id: string;
  userId: string; // Who should receive this notification
  type: NotificationType;
  title: string;
  message: string;
  issueId?: string;
  createdAt: string;
  read: boolean;
  priority: 'normal' | 'high' | 'urgent';
}
