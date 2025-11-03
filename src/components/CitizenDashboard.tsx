import { useState } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { IssueCard } from './IssueCard';
import { IssueDetail } from './IssueDetail';
import { ReportIssue } from './ReportIssue';
import { Issue } from '../types';
import { Plus, List, Globe, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';

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

export const CitizenDashboard = () => {
  const { issues, currentUser } = useApp();
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);

  const myIssues = issues.filter((issue) => issue.reportedBy === currentUser?.id);
  const supportedIssues = issues.filter(
    (issue) => currentUser && issue.upvotes.includes(currentUser.id) && issue.reportedBy !== currentUser.id
  );
  const allIssues = issues.sort((a, b) => b.upvoteCount - a.upvoteCount); // Sort by support

  const stats = [
    {
      icon: List,
      value: myIssues.length,
      label: 'My Reports',
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      icon: Globe,
      value: supportedIssues.length,
      label: 'Supported',
      gradient: 'from-indigo-500 to-indigo-600',
    },
    {
      icon: TrendingUp,
      value: myIssues.filter((i) => i.status === 'in_progress' || i.status === 'inspection_scheduled').length,
      label: 'In Progress',
      gradient: 'from-purple-500 to-purple-600',
    },
    {
      icon: CheckCircle2,
      value: myIssues.filter((i) => i.status === 'resolved').length,
      label: 'Resolved',
      gradient: 'from-green-500 to-emerald-600',
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
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <h1 className="text-4xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Citizen Dashboard
          </h1>
          <p className="text-muted-foreground">Report and track community issues</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            onClick={() => setShowReportDialog(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg"
            size="lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Report Issue
          </Button>
        </motion.div>
      </motion.div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} delay={0.2 + index * 0.1} />
        ))}
      </div>

      {/* Issues Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Tabs defaultValue="all-issues" className="space-y-4">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="all-issues" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <Globe className="h-4 w-4 mr-2" />
              All Community Issues
            </TabsTrigger>
            <TabsTrigger value="my-issues" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <List className="h-4 w-4 mr-2" />
              My Reports
            </TabsTrigger>
            <TabsTrigger value="supported" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white">
              <TrendingUp className="h-4 w-4 mr-2" />
              Supported Issues
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all-issues" className="space-y-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl">Community Issues</h2>
                <p className="text-sm text-muted-foreground">View and support issues reported by all citizens</p>
              </div>
            </div>
            {allIssues.length === 0 ? (
              <motion.div
                className="text-center py-16 border-2 border-dashed rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No issues in the system yet</p>
              </motion.div>
            ) : (
              <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {allIssues.map((issue, index) => (
                  <IssueCard key={issue.id} issue={issue} onClick={setSelectedIssue} index={index} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-issues" className="space-y-4 mt-6">
            {myIssues.length === 0 ? (
              <motion.div
                className="text-center py-16 border-2 border-dashed rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="h-20 w-20 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <List className="h-10 w-10 text-white" />
                </div>
                <p className="text-muted-foreground mb-4">No issues reported yet</p>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowReportDialog(true)}
                  className="border-2 hover:border-primary"
                >
                  Report Your First Issue
                </Button>
              </motion.div>
            ) : (
              <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {myIssues.map((issue, index) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onClick={setSelectedIssue}
                    showAssignment
                    index={index}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="supported" className="space-y-4 mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl">Issues I Support</h2>
                <p className="text-sm text-muted-foreground">Track issues you've endorsed</p>
              </div>
            </div>
            {supportedIssues.length === 0 ? (
              <motion.div
                className="text-center py-16 border-2 border-dashed rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <TrendingUp className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">You haven't supported any issues yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Click the support button on community issues to track them
                </p>
              </motion.div>
            ) : (
              <div className="grid gap-4 sm:gap-5 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
                {supportedIssues.map((issue, index) => (
                    <IssueCard
                      key={issue.id}
                      issue={issue}
                      onClick={setSelectedIssue}
                      showAssignment
                      index={index}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
        </Tabs>
      </motion.div>

      {/* Report Issue Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Report New Issue
            </DialogTitle>
            <DialogDescription>
              Submit a new civic issue with live photo and GPS location verification
            </DialogDescription>
          </DialogHeader>
          <ReportIssue onSuccess={() => setShowReportDialog(false)} />
        </DialogContent>
      </Dialog>

      {/* Issue Detail */}
      <IssueDetail
        issue={selectedIssue}
        open={!!selectedIssue}
        onClose={() => setSelectedIssue(null)}
      />
    </motion.div>
  );
};
