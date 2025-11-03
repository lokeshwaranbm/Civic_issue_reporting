import { useEffect, useState, FormEvent, useMemo } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { IssueCard } from './IssueCard';
import { IssueDetail } from './IssueDetail';
import { Issue, User } from '../types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { toast } from 'sonner@2.0.3';
import { BarChart3, UserCog, AlertCircle, List, Clock, TrendingUp, CheckCircle2, UserPlus, PlusCircle, Building2, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const formatStatusLabel = (status: Issue['status']) => status.replace(/_/g, ' ');

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

export const AdminDashboard = () => {
  const { issues, users, updateIssue, departments, addDepartment, createStaffMember } = useApp();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [newStaffPhone, setNewStaffPhone] = useState('');
  const [newStaffPassword, setNewStaffPassword] = useState('demo123');
  const [newStaffDepartment, setNewStaffDepartment] = useState(() => departments[0] ?? '');
  const [isCreatingStaff, setIsCreatingStaff] = useState(false);
  const [newDepartmentName, setNewDepartmentName] = useState('');
  const [isAddingDepartment, setIsAddingDepartment] = useState(false);
  const [staffReportOpen, setStaffReportOpen] = useState(false);
  const [reportStaff, setReportStaff] = useState<User | null>(null);

  const reportData = useMemo(() => {
    if (!reportStaff) {
      return {
        assigned: [] as Issue[],
        active: [] as Issue[],
        resolved: [] as Issue[],
        overdue: [] as Issue[],
      };
    }

    const assigned = issues.filter((issue) => issue.assignedTo === reportStaff.id);
    const active = assigned.filter((issue) => issue.status !== 'resolved');
    const resolved = assigned.filter((issue) => issue.status === 'resolved');
    const overdue = active.filter((issue) => issue.isOverdue);

    return {
      assigned,
      active,
      resolved,
      overdue,
    };
  }, [issues, reportStaff]);
  const { assigned: reportAssigned, active: reportActive, resolved: reportResolved, overdue: reportOverdue } = reportData;

  const staffUsers = users.filter((u) => u.role === 'staff');
  const pendingIssues = issues.filter((i) => i.status === 'pending');
  const inProgressIssues = issues.filter((i) => i.status === 'in_progress' || i.status === 'inspection_scheduled');
  const resolvedIssues = issues.filter((i) => i.status === 'resolved');

  useEffect(() => {
    if (!departments.length) {
      setNewStaffDepartment('');
      return;
    }

    if (!newStaffDepartment || !departments.includes(newStaffDepartment)) {
      setNewStaffDepartment(departments[0]);
    }
  }, [departments, newStaffDepartment]);
  
  // Trending issues with high citizen support
  const trendingIssues = issues
    .filter((i) => i.upvoteCount >= 2)
    .sort((a, b) => b.upvoteCount - a.upvoteCount);
  
  // Calculate average resolution time
  const calculateAvgResolutionTime = () => {
    const resolved = issues.filter((i) => i.resolvedAt);
    if (resolved.length === 0) return 0;
    
    const totalHours = resolved.reduce((sum, issue) => {
      const created = new Date(issue.createdAt).getTime();
      const resolved = new Date(issue.resolvedAt!).getTime();
      return sum + (resolved - created) / (1000 * 60 * 60);
    }, 0);
    
    return Math.round(totalHours / resolved.length);
  };

  const handleAssignIssue = () => {
    if (!selectedIssue || !selectedStaffId) return;

    const staff = users.find((u) => u.id === selectedStaffId);
    if (!staff) return;

    const wasAssigned = !!selectedIssue.assignedTo;
    
    updateIssue(selectedIssue.id, {
      assignedTo: selectedStaffId,
      assignedToName: staff.name,
      status: selectedIssue.status === 'pending' ? 'pending' : selectedIssue.status,
    });

    toast.success(wasAssigned ? `Issue reassigned to ${staff.name}` : `Issue assigned to ${staff.name}`, {
      description: wasAssigned 
        ? `Changed from ${selectedIssue.assignedToName || 'unassigned'}`
        : 'The staff member will be notified',
    });
    setAssignDialogOpen(false);
    setSelectedStaffId('');
  };

  const openAssignDialog = (issue: Issue) => {
    setSelectedIssue(issue);
    setSelectedStaffId(issue.assignedTo || '');
    setAssignDialogOpen(true);
  };

  // Analytics data
  const statusData = [
    { name: 'Pending', value: pendingIssues.length, color: '#f59e0b' },
    { name: 'In Progress', value: inProgressIssues.length, color: '#3b82f6' },
    { name: 'Resolved', value: resolvedIssues.length, color: '#10b981' },
  ];

  const categoryData = [
    { category: 'Road', count: issues.filter((i) => i.category === 'road').length, support: issues.filter((i) => i.category === 'road').reduce((sum, i) => sum + i.upvoteCount, 0) },
    { category: 'Water', count: issues.filter((i) => i.category === 'water').length, support: issues.filter((i) => i.category === 'water').reduce((sum, i) => sum + i.upvoteCount, 0) },
    { category: 'Electricity', count: issues.filter((i) => i.category === 'electricity' || i.category === 'streetlight').length, support: issues.filter((i) => i.category === 'electricity' || i.category === 'streetlight').reduce((sum, i) => sum + i.upvoteCount, 0) },
    { category: 'Sanitation', count: issues.filter((i) => i.category === 'sanitation').length, support: issues.filter((i) => i.category === 'sanitation').reduce((sum, i) => sum + i.upvoteCount, 0) },
    { category: 'Drainage', count: issues.filter((i) => i.category === 'drainage').length, support: issues.filter((i) => i.category === 'drainage').reduce((sum, i) => sum + i.upvoteCount, 0) },
  ].filter((d) => d.count > 0).sort((a, b) => b.support - a.support);

  // Department performance
  const analyticsDepartments = ['Roads & Infrastructure', 'Water Supply', 'Electricity & Power', 'Sanitation & Waste', 'Public Works'];
  const departmentData = analyticsDepartments.map((dept) => {
    const deptIssues = issues.filter((i) => i.department === dept);
    const resolved = deptIssues.filter((i) => i.status === 'resolved').length;
    const total = deptIssues.length;
    return {
      department: dept.split('&')[0].trim(),
      total,
      resolved,
      rate: total > 0 ? Math.round((resolved / total) * 100) : 0,
    };
  }).filter((d) => d.total > 0);

  const stats = [
    { icon: List, value: issues.length, label: 'Total Issues', gradient: 'from-indigo-500 to-indigo-600' },
    { icon: Clock, value: pendingIssues.length, label: 'Pending', gradient: 'from-amber-500 to-orange-600' },
    { icon: TrendingUp, value: inProgressIssues.length, label: 'In Progress', gradient: 'from-blue-500 to-blue-600' },
    { icon: CheckCircle2, value: resolvedIssues.length, label: 'Resolved', gradient: 'from-green-500 to-emerald-600' },
  ];

  const staffMetrics = staffUsers.map((staff) => {
    const activeIssues = issues.filter((issue) => issue.assignedTo === staff.id && issue.status !== 'resolved').length;
    const resolvedCount = issues.filter((issue) => issue.assignedTo === staff.id && issue.status === 'resolved').length;
    return {
      staff,
      activeIssues,
      resolvedCount,
    };
  });

  const handleAddDepartment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isAddingDepartment) return;
    setIsAddingDepartment(true);

    try {
      const trimmedName = newDepartmentName.trim();
      addDepartment(trimmedName);
      toast.success('Department added', {
        description: `${trimmedName} is now available.`,
      });
      setNewDepartmentName('');
      setNewStaffDepartment(trimmedName);
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Please try again.';
      toast.error('Unable to add department', { description });
    } finally {
      setIsAddingDepartment(false);
    }
  };

  const handleCreateStaff = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreatingStaff) return;

    setIsCreatingStaff(true);
    try {
      const user = createStaffMember({
        name: newStaffName,
        email: newStaffEmail,
        phone: newStaffPhone,
        department: newStaffDepartment,
        password: newStaffPassword,
      });

      toast.success('Staff account created', {
        description: `${user.name} can now sign in using password: ${newStaffPassword}.`,
      });

      setNewStaffName('');
      setNewStaffEmail('');
      setNewStaffPhone('');
      setNewStaffPassword('demo123');
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Please try again.';
      toast.error('Unable to create staff account', { description });
    } finally {
      setIsCreatingStaff(false);
    }
  };

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
        <h1 className="text-4xl bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
          Admin Dashboard
        </h1>
        <p className="text-muted-foreground">Manage issues, staff assignments, and analytics</p>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={0.2 + index * 0.1} />
        ))}
      </div>

      {/* Main Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Tabs defaultValue="issues" className="space-y-4">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="trending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending Issues
            </TabsTrigger>
            <TabsTrigger value="issues" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <AlertCircle className="h-4 w-4 mr-2" />
              Manage Issues
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Reports & Analytics
            </TabsTrigger>
            <TabsTrigger value="teams" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <UserPlus className="h-4 w-4 mr-2" />
              Teams & Departments
            </TabsTrigger>
          </TabsList>

          {/* Trending Issues Tab */}
          <TabsContent value="trending" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-2xl">High Priority - Citizen Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Issues with significant community backing (2+ supports)
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-3xl bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    {trendingIssues.length}
                  </div>
                  <p className="text-sm text-muted-foreground">Trending</p>
                </div>
              </div>

              {trendingIssues.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed rounded-xl bg-gradient-to-br from-red-50 to-pink-50">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No trending issues at the moment</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Issues with 2+ citizen supports will appear here
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                  {trendingIssues.map((issue, index) => (
                    <motion.div
                      key={issue.id}
                      className="space-y-2"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <IssueCard issue={issue} onClick={setSelectedIssue} showAssignment index={index} />
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          onClick={() => openAssignDialog(issue)}
                          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                          size="sm"
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          {issue.assignedTo ? 'Reassign' : 'Assign Priority'}
                        </Button>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </TabsContent>

          {/* Issues Tab */}
          <TabsContent value="issues" className="space-y-6 mt-6">
            {/* Auto-Assignment Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4"
            >
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-medium">Automatic Assignment Active</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Issues are automatically assigned to staff members from the matching department with the least workload.
                    You can reassign issues if needed.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* All Issues */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl">All Issues</h3>
                <div className="text-right">
                  <div className="text-2xl">{issues.length}</div>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
              <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {issues.map((issue, index) => (
                  <motion.div
                    key={issue.id}
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + index * 0.02 }}
                  >
                    <IssueCard issue={issue} onClick={setSelectedIssue} showAssignment index={index} />
                    {issue.status !== 'resolved' && (
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-2 hover:border-primary hover:text-primary"
                          onClick={() => openAssignDialog(issue)}
                        >
                          <UserCog className="h-4 w-4 mr-2" />
                          Reassign Staff
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Status Distribution */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Issue Status Distribution
                    </CardTitle>
                    <CardDescription>Overview of issue statuses</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Most Common Issues by Citizen Support */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-2 shadow-lg">
                  <CardHeader>
                    <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      Most Common Issues
                    </CardTitle>
                    <CardDescription>Based on citizen support (total upvotes)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={categoryData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="support" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                        <defs>
                          <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" />
                            <stop offset="100%" stopColor="#a855f7" />
                          </linearGradient>
                        </defs>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                whileHover={{ y: -4 }}
              >
                <Card className="border-2 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardHeader>
                    <CardTitle>Resolution Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {issues.length > 0
                        ? Math.round((resolvedIssues.length / issues.length) * 100)
                        : 0}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {resolvedIssues.length} of {issues.length} issues resolved
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ y: -4 }}
              >
                <Card className="border-2 shadow-md bg-gradient-to-br from-blue-50 to-indigo-50">
                  <CardHeader>
                    <CardTitle>Active Staff</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {staffUsers.length}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Staff members available</p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <Card className="border-2 shadow-md bg-gradient-to-br from-purple-50 to-pink-50">
                  <CardHeader>
                    <CardTitle>Avg. Resolution Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {calculateAvgResolutionTime()}h
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Average hours to resolve</p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Department Performance */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Department Performance
                  </CardTitle>
                  <CardDescription>Resolution rate by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="rate" fill="url(#deptGradient)" radius={[8, 8, 0, 0]} />
                      <defs>
                        <linearGradient id="deptGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {departmentData.map((dept, i) => (
                      <div key={i} className="flex items-center justify-between text-sm border-l-4 border-green-500 pl-3 py-1">
                        <span>{dept.department}</span>
                        <span className="text-muted-foreground">
                          {dept.resolved}/{dept.total} resolved ({dept.rate}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Teams & Departments Tab */}
          <TabsContent value="teams" className="space-y-6 mt-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    Department Directory
                  </CardTitle>
                  <CardDescription>Manage departments available for staff assignments.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <form className="flex flex-col sm:flex-row gap-3" onSubmit={handleAddDepartment}>
                    <Input
                      placeholder="Add new department"
                      value={newDepartmentName}
                      onChange={(event) => setNewDepartmentName(event.target.value)}
                      disabled={isAddingDepartment}
                      className="border-2"
                    />
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      disabled={isAddingDepartment || !newDepartmentName.trim()}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add Department
                    </Button>
                  </form>

                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {departments.map((dept) => (
                      <div
                        key={dept}
                        className="border-2 rounded-lg px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50"
                      >
                        <p className="text-sm font-medium text-indigo-700">{dept}</p>
                        <p className="text-xs text-muted-foreground">
                          {issues.filter((issue) => issue.department === dept).length} active issues
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              className="grid gap-6 lg:grid-cols-[1fr_1.5fr]"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5 text-indigo-600" />
                    Create Staff Account
                  </CardTitle>
                  <CardDescription>Grant access to new municipal staff in specific departments.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4" onSubmit={handleCreateStaff}>
                    <div className="space-y-2">
                      <Label htmlFor="staff-name">Full name</Label>
                      <Input
                        id="staff-name"
                        placeholder="Jane Doe"
                        value={newStaffName}
                        onChange={(event) => setNewStaffName(event.target.value)}
                        disabled={isCreatingStaff}
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-email">Email</Label>
                      <Input
                        id="staff-email"
                        type="email"
                        placeholder="name@city.gov"
                        value={newStaffEmail}
                        onChange={(event) => setNewStaffEmail(event.target.value)}
                        disabled={isCreatingStaff}
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-phone">Phone (optional)</Label>
                      <Input
                        id="staff-phone"
                        placeholder="+1234567890"
                        value={newStaffPhone}
                        onChange={(event) => setNewStaffPhone(event.target.value)}
                        disabled={isCreatingStaff}
                        className="border-2"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-department">Department</Label>
                      <Select
                        value={newStaffDepartment}
                        onValueChange={setNewStaffDepartment}
                        disabled={isCreatingStaff || departments.length === 0}
                      >
                        <SelectTrigger id="staff-department" className="border-2">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((dept) => (
                            <SelectItem key={dept} value={dept}>
                              {dept}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {departments.length === 0 && (
                        <p className="text-xs text-muted-foreground">
                          Add at least one department before creating staff accounts.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="staff-password">Temporary password</Label>
                      <Input
                        id="staff-password"
                        type="text"
                        value={newStaffPassword}
                        onChange={(event) => setNewStaffPassword(event.target.value)}
                        disabled={isCreatingStaff}
                        className="border-2"
                      />
                      <p className="text-xs text-muted-foreground">
                        Share this password with the staff member. They can change it later in production systems.
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                      disabled={
                        isCreatingStaff ||
                        !newStaffName.trim() ||
                        !newStaffEmail.trim() ||
                        !newStaffDepartment.trim() ||
                        !newStaffPassword.trim()
                      }
                    >
                      {isCreatingStaff ? 'Creating...' : 'Create Staff Account'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-2 shadow-lg overflow-hidden">
                <CardHeader>
                  <CardTitle>Active Staff Members</CardTitle>
                  <CardDescription>Overview of staff capacity and assignments.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  {staffMetrics.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No staff accounts yet. Create one to get started.
                    </div>
                  ) : (
                    <table className="min-w-full text-sm">
                      <thead className="bg-muted/60">
                        <tr className="text-left">
                          <th className="py-2 px-3 font-medium">Name</th>
                          <th className="py-2 px-3 font-medium">Department</th>
                          <th className="py-2 px-3 font-medium">Email</th>
                          <th className="py-2 px-3 font-medium">Phone</th>
                          <th className="py-2 px-3 font-medium text-center">Active</th>
                          <th className="py-2 px-3 font-medium text-center">Resolved</th>
                          <th className="py-2 px-3 font-medium text-right">Report</th>
                        </tr>
                      </thead>
                      <tbody>
                        {staffMetrics.map(({ staff, activeIssues, resolvedCount }) => (
                          <tr key={staff.id} className="border-b border-muted/40">
                            <td className="py-2 px-3">
                              <p className="font-medium">{staff.name}</p>
                            </td>
                            <td className="py-2 px-3">{staff.department || 'Unassigned'}</td>
                            <td className="py-2 px-3">{staff.email}</td>
                            <td className="py-2 px-3">{staff.phone || '—'}</td>
                            <td className="py-2 px-3 text-center">{activeIssues}</td>
                            <td className="py-2 px-3 text-center">{resolvedCount}</td>
                            <td className="py-2 px-3 text-right">
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-2"
                                onClick={() => {
                                  setReportStaff(staff);
                                  setStaffReportOpen(true);
                                }}
                              >
                                <ClipboardList className="h-4 w-4 mr-2" />
                                Report
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <Dialog
        open={staffReportOpen}
        onOpenChange={(open: boolean) => {
          setStaffReportOpen(open);
          if (!open) {
            setReportStaff(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Staff Performance Report
            </DialogTitle>
            {reportStaff ? (
              <DialogDescription>
                {reportStaff.name} · {reportStaff.department || 'Unassigned'} · {reportStaff.email}
              </DialogDescription>
            ) : (
              <DialogDescription>Select a staff member to inspect their assignments.</DialogDescription>
            )}
          </DialogHeader>
          {reportStaff ? (
            (() => {
              const activeSorted = [...reportActive].sort((a, b) => {
                const aDate = a.slaDeadline ? new Date(a.slaDeadline).getTime() : new Date(a.createdAt).getTime();
                const bDate = b.slaDeadline ? new Date(b.slaDeadline).getTime() : new Date(b.createdAt).getTime();
                return aDate - bDate;
              });
              const resolvedSorted = [...reportResolved]
                .sort((a, b) => {
                  const aDate = a.resolvedAt ? new Date(a.resolvedAt).getTime() : new Date(a.updatedAt).getTime();
                  const bDate = b.resolvedAt ? new Date(b.resolvedAt).getTime() : new Date(b.updatedAt).getTime();
                  return bDate - aDate;
                })
                .slice(0, 5);

              return (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-indigo-700">Total Assigned</p>
                      <p className="text-2xl font-semibold text-indigo-700">{reportAssigned.length}</p>
                    </div>
                    <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Active Queue</p>
                      <p className="text-2xl font-semibold text-amber-700">{reportActive.length}</p>
                    </div>
                    <div className="rounded-lg border-2 border-green-200 bg-green-50 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-green-700">Resolved</p>
                      <p className="text-2xl font-semibold text-green-700">{reportResolved.length}</p>
                    </div>
                    <div className={`rounded-lg border-2 p-4 ${reportOverdue.length ? 'border-red-200 bg-red-50' : 'border-slate-200 bg-slate-50'}`}>
                      <p className={`text-xs font-medium uppercase tracking-wide ${reportOverdue.length ? 'text-red-700' : 'text-slate-600'}`}>
                        Overdue
                      </p>
                      <p className={`text-2xl font-semibold ${reportOverdue.length ? 'text-red-700' : 'text-slate-700'}`}>{reportOverdue.length}</p>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium">Active assignments</h4>
                        <p className="text-xs text-muted-foreground">Sorted by upcoming deadlines.</p>
                      </div>
                      {activeSorted.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-muted-foreground">
                          No active assignments for this staff member.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {activeSorted.map((issue) => (
                            <div key={issue.id} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-medium leading-snug">{issue.title}</p>
                                  <p className="text-xs text-muted-foreground">Citizen: {issue.reporterName}</p>
                                </div>
                                <span className={`text-xs font-semibold uppercase tracking-wide ${issue.isOverdue ? 'text-red-600' : 'text-amber-600'}`}>
                                  {formatStatusLabel(issue.status)}
                                </span>
                              </div>
                              <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                                <span>Department: {issue.department || '—'}</span>
                                {issue.slaDeadline && (
                                  <span>SLA deadline: {new Date(issue.slaDeadline).toLocaleString()}</span>
                                )}
                                <span>Updated: {new Date(issue.updatedAt).toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-medium">Recently resolved</h4>
                        <p className="text-xs text-muted-foreground">Latest five resolutions logged by this staff member.</p>
                      </div>
                      {resolvedSorted.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-200 p-4 text-sm text-muted-foreground">
                          No resolved issues recorded yet.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {resolvedSorted.map((issue) => (
                            <div key={issue.id} className="rounded-lg border border-slate-200 bg-green-50 p-3">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-medium leading-snug">{issue.title}</p>
                                  <p className="text-xs text-muted-foreground">Citizen: {issue.reporterName}</p>
                                </div>
                                <span className="text-xs font-semibold uppercase tracking-wide text-green-700">
                                  {formatStatusLabel(issue.status)}
                                </span>
                              </div>
                              <div className="mt-2 grid gap-1 text-xs text-muted-foreground">
                                <span>Resolved: {issue.resolvedAt ? new Date(issue.resolvedAt).toLocaleString() : 'Pending timestamp'}</span>
                                {issue.resolutionNote && (
                                  <span>Note: {issue.resolutionNote}</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            <div className="text-sm text-muted-foreground">
              Select a staff member to view their assignments.
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assign/Reassign Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {selectedIssue?.assignedTo ? 'Reassign Issue' : 'Assign Issue'}
            </DialogTitle>
            <DialogDescription>
              {selectedIssue?.assignedTo 
                ? 'Change the staff member assigned to this issue'
                : 'Select a staff member to assign this issue to'}
            </DialogDescription>
          </DialogHeader>

          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {selectedIssue && (
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-3 rounded-lg border-2 border-indigo-200">
                <p className="text-sm">
                  <span className="font-medium">Issue:</span> {selectedIssue.title}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  <span className="font-medium">Department:</span> {selectedIssue.department}
                </p>
                {selectedIssue.upvoteCount > 0 && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Citizen Support:</span> {selectedIssue.upvoteCount} upvotes
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="staff">Staff Member (Department Match Recommended)</Label>
              <Select value={selectedStaffId} onValueChange={setSelectedStaffId}>
                <SelectTrigger id="staff" className="border-2">
                  <SelectValue placeholder="Select staff member" />
                </SelectTrigger>
                <SelectContent>
                  {staffUsers
                    .sort((a, b) => {
                      // Prioritize staff from matching department
                      if (selectedIssue) {
                        const aMatch = a.department === selectedIssue.department;
                        const bMatch = b.department === selectedIssue.department;
                        if (aMatch && !bMatch) return -1;
                        if (!aMatch && bMatch) return 1;
                      }
                      return 0;
                    })
                    .map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name} - {staff.department}
                        {selectedIssue && staff.department === selectedIssue.department && ' ✓'}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignIssue} 
              disabled={!selectedStaffId}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              <UserCog className="h-4 w-4 mr-2" />
              {selectedIssue?.assignedTo ? 'Reassign' : 'Assign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Issue Detail */}
      <IssueDetail
        issue={selectedIssue}
        open={!!selectedIssue && !assignDialogOpen}
        onClose={() => setSelectedIssue(null)}
      />
    </motion.div>
  );
};
