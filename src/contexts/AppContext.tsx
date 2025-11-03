import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Issue, Comment, IssueFeedback, Notification, DEFAULT_DEPARTMENTS } from '../types';
import { mockUsers, initialIssues, initialComments } from '../lib/mockData';
import { toast } from 'sonner@2.0.3';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  users: User[];
  departments: string[];
  notifications: Notification[];
  unreadCount: number;
  addIssue: (issue: Issue) => void;
  updateIssue: (id: string, updates: Partial<Issue>) => void;
  addComment: (comment: Comment) => void;
  toggleUpvote: (issueId: string, userId: string) => void;
  addFeedback: (issueId: string, feedback: IssueFeedback) => void;
  addNotification: (notification: Notification) => void;
  markNotificationRead: (notificationId: string) => void;
  markAllNotificationsRead: () => void;
  addDepartment: (name: string) => void;
  createStaffMember: (input: CreateStaffInput) => User;
  logout: () => void;
}

interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  department: string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// SLA Configuration (in hours)
const SLA_DEADLINES = {
  'Roads & Infrastructure': 48,
  'Water Supply': 24,
  'Electricity & Power': 12,
  'Sanitation & Waste': 36,
  'Public Works': 48,
  'General': 72,
};

// Priority thresholds
const PRIORITY_THRESHOLDS = {
  high: 5,    // 5+ upvotes = high priority
  critical: 10 // 10+ upvotes = critical priority
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window === 'undefined') return mockUsers;
    const stored = window.localStorage.getItem('appUsers');
    if (stored) {
      try {
        const parsed: User[] = JSON.parse(stored);
        return parsed.length ? parsed : mockUsers;
      } catch (error) {
        console.warn('Failed to parse stored users, falling back to mock data.', error);
      }
    }
    return mockUsers;
  });
  const [departments, setDepartments] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [...DEFAULT_DEPARTMENTS];
    const stored = window.localStorage.getItem('appDepartments');
    if (stored) {
      try {
        const parsed: string[] = JSON.parse(stored);
        return parsed.length ? parsed : [...DEFAULT_DEPARTMENTS];
      } catch (error) {
        console.warn('Failed to parse stored departments, using defaults.', error);
      }
    }
    return [...DEFAULT_DEPARTMENTS];
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('appUsers', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('appDepartments', JSON.stringify(departments));
  }, [departments]);

  // Calculate priority based on upvotes
  const calculatePriority = (upvoteCount: number): 'normal' | 'high' | 'critical' => {
    if (upvoteCount >= PRIORITY_THRESHOLDS.critical) return 'critical';
    if (upvoteCount >= PRIORITY_THRESHOLDS.high) return 'high';
    return 'normal';
  };

  // Calculate SLA deadline
  const calculateSLADeadline = (createdAt: string, department?: string): string => {
    const created = new Date(createdAt);
    const slaHours = department ? SLA_DEADLINES[department as keyof typeof SLA_DEADLINES] || 72 : 72;
    const deadline = new Date(created.getTime() + slaHours * 60 * 60 * 1000);
    return deadline.toISOString();
  };

  // Check if issue is overdue
  const checkOverdue = (slaDeadline?: string, status?: string): boolean => {
    if (!slaDeadline || status === 'resolved') return false;
    return new Date() > new Date(slaDeadline);
  };

  // Auto-assign issue to staff member from matching department with least workload
  const autoAssignIssue = (issue: Issue): Issue => {
    // Get staff members from the same department as the issue
    const departmentStaff = users.filter(
      (user) => user.role === 'staff' && user.department === issue.department
    );

    if (departmentStaff.length === 0) {
      // No staff available in this department, return unassigned
      return issue;
    }

    // Find staff member with least assigned issues (load balancing)
    const staffWorkload = departmentStaff.map((staff) => ({
      staff,
      workload: issues.filter(
        (i) => i.assignedTo === staff.id && i.status !== 'resolved'
      ).length,
    }));

    // Sort by workload (ascending) and get the staff with least work
    staffWorkload.sort((a, b) => a.workload - b.workload);
    const assignedStaff = staffWorkload[0].staff;

    const priority = calculatePriority(issue.upvoteCount || 0);
    const slaDeadline = calculateSLADeadline(issue.createdAt, issue.department);

    // Create assignment notification
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random()}`,
      userId: assignedStaff.id,
      type: 'assignment',
      title: '🔔 New Issue Assigned',
      message: `You've been assigned: "${issue.title}"`,
      issueId: issue.id,
      createdAt: new Date().toISOString(),
      read: false,
      priority: priority === 'critical' ? 'urgent' : priority === 'high' ? 'high' : 'normal',
    };

    setNotifications((prev) => [notification, ...prev]);

    return {
      ...issue,
      assignedTo: assignedStaff.id,
      assignedToName: assignedStaff.name,
      status: 'pending',
      priority,
      slaDeadline,
      isOverdue: false,
    };
  };

  const addIssue = (issue: Issue) => {
    const assignedIssue = autoAssignIssue(issue);
    setIssues((prev) => [assignedIssue, ...prev]);
  };

  const updateIssue = (id: string, updates: Partial<Issue>) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === id
          ? { ...issue, ...updates, updatedAt: new Date().toISOString() }
          : issue
      )
    );
  };

  const addComment = (comment: Comment) => {
    setComments((prev) => [...prev, comment]);
  };

  const toggleUpvote = (issueId: string, userId: string) => {
    setIssues((prev) =>
      prev.map((issue) => {
        if (issue.id === issueId) {
          const hasUpvoted = issue.upvotes.includes(userId);
          const newUpvotes = hasUpvoted
            ? issue.upvotes.filter((id) => id !== userId)
            : [...issue.upvotes, userId];
          
          const newUpvoteCount = newUpvotes.length;
          const oldPriority = issue.priority || 'normal';
          const newPriority = calculatePriority(newUpvoteCount);

          // Check for escalation
          if (newPriority !== oldPriority && newPriority !== 'normal') {
            // Create escalation notification for assigned staff and admin
            const escalationNotif: Notification = {
              id: `notif-${Date.now()}-${Math.random()}`,
              userId: issue.assignedTo || '',
              type: 'escalation',
              title: newPriority === 'critical' ? '🚨 CRITICAL Priority!' : '⚠️ High Priority Alert',
              message: `Issue "${issue.title}" has been escalated to ${newPriority.toUpperCase()} priority (${newUpvoteCount} community supports)`,
              issueId: issue.id,
              createdAt: new Date().toISOString(),
              read: false,
              priority: newPriority === 'critical' ? 'urgent' : 'high',
            };

            setNotifications((n) => [escalationNotif, ...n]);

            // Also notify admins
            const adminUsers = users.filter(u => u.role === 'admin');
            adminUsers.forEach(admin => {
              const adminNotif: Notification = {
                ...escalationNotif,
                id: `notif-${Date.now()}-${Math.random()}-${admin.id}`,
                userId: admin.id,
              };
              setNotifications((n) => [adminNotif, ...n]);
            });
          }

          return {
            ...issue,
            upvotes: newUpvotes,
            upvoteCount: newUpvoteCount,
            priority: newPriority,
            updatedAt: new Date().toISOString(),
          };
        }
        return issue;
      })
    );
  };

  const addFeedback = (issueId: string, feedback: IssueFeedback) => {
    setIssues((prev) =>
      prev.map((issue) =>
        issue.id === issueId
          ? { ...issue, feedback, updatedAt: new Date().toISOString() }
          : issue
      )
    );
  };

  const addNotification = (notification: Notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const markNotificationRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addDepartment = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) {
      throw new Error('Department name is required.');
    }

    const exists = departments.some(
      (dept) => dept.toLowerCase() === trimmed.toLowerCase()
    );

    if (exists) {
      throw new Error('Department already exists.');
    }

    setDepartments((prev) => [...prev, trimmed]);
  };

  const createStaffMember = ({ name, email, password, phone, department }: CreateStaffInput): User => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!name.trim() || !trimmedEmail || !password.trim() || !department.trim()) {
      throw new Error('Name, email, password, and department are required.');
    }

    const emailExists = users.some(
      (user) => user.email.toLowerCase() === trimmedEmail
    );

    if (emailExists) {
      throw new Error('A user with this email already exists.');
    }

    if (!departments.includes(department)) {
      throw new Error('Selected department does not exist.');
    }

    const newUser: User = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      email: trimmedEmail,
      role: 'staff',
      phone: phone?.trim() || undefined,
      department,
      password: password.trim(),
    };

    setUsers((prev) => [newUser, ...prev]);
    return newUser;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  // Unread notifications count for current user
  const unreadCount = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id && !n.read).length
    : 0;

  // SLA monitoring - check for overdue and near-due issues
  useEffect(() => {
    const checkSLAs = () => {
      const now = new Date();
      
      issues.forEach((issue) => {
        if (issue.status === 'resolved' || !issue.slaDeadline || !issue.assignedTo) return;

        const deadline = new Date(issue.slaDeadline);
        const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

        // Check if overdue
        if (hoursRemaining < 0 && !issue.isOverdue) {
          // Mark as overdue
          setIssues((prev) =>
            prev.map((i) => (i.id === issue.id ? { ...i, isOverdue: true } : i))
          );

          // Create overdue notification
          const overdueNotif: Notification = {
            id: `notif-${Date.now()}-${Math.random()}`,
            userId: issue.assignedTo,
            type: 'sla_overdue',
            title: '🔴 SLA OVERDUE',
            message: `Issue "${issue.title}" has exceeded its SLA deadline!`,
            issueId: issue.id,
            createdAt: new Date().toISOString(),
            read: false,
            priority: 'urgent',
          };
          setNotifications((n) => [overdueNotif, ...n]);

          // Notify admins too
          users.filter(u => u.role === 'admin').forEach(admin => {
            const adminNotif: Notification = {
              ...overdueNotif,
              id: `notif-${Date.now()}-${Math.random()}-${admin.id}`,
              userId: admin.id,
            };
            setNotifications((n) => [adminNotif, ...n]);
          });
        }
        // Check if approaching deadline (6 hours remaining)
        else if (hoursRemaining > 0 && hoursRemaining <= 6) {
          // Check if we already sent a warning
          const hasWarning = notifications.some(
            (n) => n.type === 'sla_warning' && n.issueId === issue.id
          );

          if (!hasWarning) {
            const warningNotif: Notification = {
              id: `notif-${Date.now()}-${Math.random()}`,
              userId: issue.assignedTo,
              type: 'sla_warning',
              title: '⚠️ SLA Deadline Approaching',
              message: `Issue "${issue.title}" is due in ${Math.floor(hoursRemaining)} hours`,
              issueId: issue.id,
              createdAt: new Date().toISOString(),
              read: false,
              priority: 'high',
            };
            setNotifications((n) => [warningNotif, ...n]);
          }
        }
      });
    };

    // Check SLAs every minute
    const interval = setInterval(checkSLAs, 60000);
    checkSLAs(); // Initial check

    return () => clearInterval(interval);
  }, [issues, users]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        issues,
        setIssues,
        comments,
        setComments,
        users,
        departments,
        notifications,
        unreadCount,
        addIssue,
        updateIssue,
        addComment,
        toggleUpvote,
        addFeedback,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        addDepartment,
        createStaffMember,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
