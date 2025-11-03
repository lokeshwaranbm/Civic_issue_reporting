import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Issue, Comment, IssueFeedback, Notification } from '../types';
import { mockUsers, initialIssues, initialComments } from '../lib/mockData';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  issues: Issue[];
  setIssues: React.Dispatch<React.SetStateAction<Issue[]>>;
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  users: User[];
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
  logout: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// SLA Configuration (in hours)
const SLA_DEADLINES: Record<string, number> = {
  'Roads & Infrastructure': 48,
  'Water Supply': 24,
  'Electricity & Power': 12,
  'Sanitation & Waste': 36,
  'Public Works': 48,
  'General': 72,
};

// Priority thresholds
const PRIORITY_THRESHOLDS = {
  high: 5,
  critical: 10
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [issues, setIssues] = useState<Issue[]>(initialIssues);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [users] = useState<User[]>(mockUsers);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  const calculatePriority = (upvoteCount: number): 'normal' | 'high' | 'critical' => {
    if (upvoteCount >= PRIORITY_THRESHOLDS.critical) return 'critical';
    if (upvoteCount >= PRIORITY_THRESHOLDS.high) return 'high';
    return 'normal';
  };

  const calculateSLADeadline = (createdAt: string, department?: string): string => {
    const created = new Date(createdAt);
    const slaHours = department ? (SLA_DEADLINES[department] || 72) : 72;
    const deadline = new Date(created.getTime() + slaHours * 60 * 60 * 1000);
    return deadline.toISOString();
  };

  const autoAssignIssue = (issue: Issue): Issue => {
    const departmentStaff = users.filter(
      (user) => user.role === 'staff' && user.department === issue.department
    );

    if (departmentStaff.length === 0) {
      return {
        ...issue,
        priority: calculatePriority(issue.upvoteCount || 0),
        slaDeadline: calculateSLADeadline(issue.createdAt, issue.department),
        isOverdue: false,
      };
    }

    const staffWorkload = departmentStaff.map((staff) => ({
      staff,
      workload: issues.filter(
        (i) => i.assignedTo === staff.id && i.status !== 'resolved'
      ).length,
    }));

    staffWorkload.sort((a, b) => a.workload - b.workload);
    const assignedStaff = staffWorkload[0].staff;

    const priority = calculatePriority(issue.upvoteCount || 0);
    const slaDeadline = calculateSLADeadline(issue.createdAt, issue.department);

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
          const upvotedBy = issue.upvotedBy || [];
          const hasUpvoted = upvotedBy.includes(userId);
          
          const newUpvotedBy = hasUpvoted
            ? upvotedBy.filter((id) => id !== userId)
            : [...upvotedBy, userId];
          
          const newUpvoteCount = newUpvotedBy.length;
          const oldPriority = issue.priority || 'normal';
          const newPriority = calculatePriority(newUpvoteCount);

          if (newPriority !== oldPriority && newPriority !== 'normal' && issue.assignedTo) {
            const escalationNotif: Notification = {
              id: `notif-${Date.now()}-${Math.random()}`,
              userId: issue.assignedTo,
              type: 'escalation',
              title: newPriority === 'critical' ? '🚨 CRITICAL Priority!' : '⚠️ High Priority Alert',
              message: `Issue "${issue.title}" escalated to ${newPriority.toUpperCase()} (${newUpvoteCount} supports)`,
              issueId: issue.id,
              createdAt: new Date().toISOString(),
              read: false,
              priority: newPriority === 'critical' ? 'urgent' : 'high',
            };

            setNotifications((n) => [escalationNotif, ...n]);
          }

          return {
            ...issue,
            upvotedBy: newUpvotedBy,
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

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const unreadCount = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id && !n.read).length
    : 0;

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