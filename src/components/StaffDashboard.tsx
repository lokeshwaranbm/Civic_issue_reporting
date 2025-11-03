import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { IssueCard } from './IssueCard';
import { IssueDetail } from './IssueDetail';
import { Issue, IssueStatus } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner@2.0.3';
import { ClipboardList, Clock, TrendingUp, CheckCircle2, List, AlertCircle } from 'lucide-react';

const StatCard = ({ icon: Icon, value, label, gradient, delay }: any) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, type: 'spring', stiffness: 200 }}
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
  >
    <div className={`rounded-xl bg-gradient-to-br ${gradient} p-6 shadow-lg border border-white/20`}>
      <div className="flex items-center justify-between">
        <div>
          <motion.div 
            className="text-3xl text-white mb-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: delay + 0.1 }}
          >
            {value}
          </motion.div>
          <p className="text-sm text-white/90">{label}</p>
        </div>
        <div className="h-12 w-12 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  </motion.div>
);

export const StaffDashboard = () => {
  const { issues, currentUser, updateIssue } = useApp();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<IssueStatus>('pending');
  const [resolutionNote, setResolutionNote] = useState('');

  // Filter issues by department and assigned to current user
  const departmentIssues = issues.filter(
    (issue) => issue.department === currentUser?.department
  );
  const assignedIssues = departmentIssues.filter((issue) => issue.assignedTo === currentUser?.id);
  const unassignedDepartmentIssues = departmentIssues.filter((issue) => !issue.assignedTo);

  const handleUpdateStatus = () => {
    if (!selectedIssue) return;

    const updates: Partial<Issue> = {
      status: newStatus,
    };

    if (newStatus === 'resolved') {
      updates.resolvedAt = new Date().toISOString();
      updates.resolutionNote = resolutionNote;
    }

    updateIssue(selectedIssue.id, updates);
    toast.success('Issue status updated successfully!', {
      description: `Status changed to ${newStatus.replace('_', ' ')}`,
    });
    setUpdateDialogOpen(false);
    setResolutionNote('');
  };

  const openUpdateDialog = (issue: Issue) => {
    setSelectedIssue(issue);
    setNewStatus(issue.status);
    setResolutionNote(issue.resolutionNote || '');
    setUpdateDialogOpen(true);
  };

  const overdueIssues = assignedIssues.filter((i) => i.isOverdue && i.status !== 'resolved');
  const criticalIssues = assignedIssues.filter((i) => i.priority === 'critical' && i.status !== 'resolved');

  const stats = [
    {
      icon: List,
      value: assignedIssues.length,
      label: 'Assigned to Me',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: Clock,
      value: assignedIssues.filter((i) => i.status === 'pending' || i.status === 'inspection_scheduled').length,
      label: 'Pending',
      gradient: 'from-amber-500 to-orange-600',
    },
    {
      icon: TrendingUp,
      value: assignedIssues.filter((i) => i.status === 'in_progress').length,
      label: 'In Progress',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: CheckCircle2,
      value: assignedIssues.filter((i) => i.status === 'resolved').length,
      label: 'Resolved',
      gradient: 'from-green-500 to-emerald-600',
    },
  ];

  const alertStats = [
    {
      value: overdueIssues.length,
      label: 'SLA Overdue',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
    },
    {
      value: criticalIssues.length,
      label: 'Critical Priority',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-4xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Staff Dashboard - {currentUser?.department}
        </h1>
        <p className="text-muted-foreground">Issues are automatically assigned to you based on department category</p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={0.2 + index * 0.1} />
        ))}
      </div>

      {/* SLA Alerts */}
      {(overdueIssues.length > 0 || criticalIssues.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {alertStats.map((stat, index) => (
            stat.value > 0 && (
              <motion.div
                key={stat.label}
                className={`${stat.bgColor} ${stat.borderColor} border-2 p-4 rounded-xl`}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-3xl ${stat.color} mt-1`}>{stat.value}</p>
                  </div>
                  <div className={`h-12 w-12 ${stat.bgColor} rounded-lg flex items-center justify-center ${stat.value > 0 ? 'animate-pulse' : ''}`}>
                    <AlertCircle className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </div>
      )}

      {/* Department Info */}
      <motion.div
        className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 rounded-xl border-2 border-purple-200"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 bg-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <TrendingUp className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium">Auto-Assignment System</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Issues matching <span className="font-medium">{currentUser?.department}</span> are automatically assigned to staff with the least workload.
              You'll receive new assignments as citizens report issues.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Assigned Issues */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl">My Assigned Issues</h2>
        </div>

        {assignedIssues.length === 0 ? (
          <motion.div
            className="text-center py-16 border-2 border-dashed rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="h-20 w-20 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="h-10 w-10 text-white" />
            </div>
            <p className="text-muted-foreground">No issues assigned to you yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Wait for the admin to assign issues to you
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {assignedIssues.map((issue, index) => (
              <motion.div
                key={issue.id}
                className="space-y-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <IssueCard issue={issue} onClick={setSelectedIssue} index={index} />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-2 hover:border-primary hover:text-primary"
                    onClick={() => openUpdateDialog(issue)}
                  >
                    Update Status
                  </Button>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Update Status Dialog */}
      <Dialog open={updateDialogOpen} onOpenChange={setUpdateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Update Issue Status
            </DialogTitle>
            <DialogDescription>
              Change the status and add notes about the progress or resolution
            </DialogDescription>
          </DialogHeader>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as IssueStatus)}
              >
                <SelectTrigger id="status" className="border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="inspection_scheduled">Inspection Scheduled</SelectItem>
                  <SelectItem value="in_progress">Work in Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newStatus === 'resolved' && (
              <motion.div
                className="space-y-2"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <Label htmlFor="resolution">Resolution Note</Label>
                <Textarea
                  id="resolution"
                  placeholder="Describe how the issue was resolved..."
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  rows={4}
                  className="border-2 focus:border-primary"
                />
              </motion.div>
            )}
          </motion.div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setUpdateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateStatus}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              Update Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Detail */}
      <IssueDetail
        issue={selectedIssue}
        open={!!selectedIssue && !updateDialogOpen}
        onClose={() => setSelectedIssue(null)}
      />
    </motion.div>
  );
};
