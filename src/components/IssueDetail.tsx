import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Issue } from '../types';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from './ui/sheet';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { SLAIndicator } from './SLAIndicator';
import { MapPin, Calendar, User, CheckCircle2, Eye, Star, ThumbsUp, MessageSquare, Flame, AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { CommentSection } from './CommentSection';
import { Separator } from './ui/separator';
import { Button } from './ui/button';
import { useApp } from '../contexts/AppContext';
import { FeedbackDialog } from './FeedbackDialog';
import { Badge } from './ui/badge';

interface IssueDetailProps {
  issue: Issue | null;
  open: boolean;
  onClose: () => void;
}

export const IssueDetail = ({ issue, open, onClose }: IssueDetailProps) => {
  const { currentUser, toggleUpvote } = useApp();
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);

  if (!issue) return null;

  const hasUpvoted = currentUser ? issue.upvotes.includes(currentUser.id) : false;
  const canProvideFeedback = currentUser?.role === 'citizen' && 
    issue.status === 'resolved' && 
    !issue.feedback &&
    issue.reportedBy === currentUser?.id;

  const handleUpvote = () => {
    if (currentUser) {
      toggleUpvote(issue.id, currentUser.id);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-gradient-to-br from-white to-gray-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SheetHeader className="space-y-4 pb-6">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <SheetTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {issue.title}
                  </SheetTitle>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <StatusBadge status={issue.status} />
                </motion.div>
              </div>
              <SheetDescription className="text-base leading-relaxed">
                {issue.description}
              </SheetDescription>
            </div>

            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {/* Priority and SLA Badges */}
              <div className="flex flex-wrap gap-2">
                {issue.priority === 'critical' && (
                  <Badge className="bg-gradient-to-r from-red-600 to-red-700 border-0 gap-1">
                    <Flame className="h-3 w-3" />
                    CRITICAL PRIORITY
                  </Badge>
                )}
                {issue.priority === 'high' && (
                  <Badge className="bg-gradient-to-r from-orange-600 to-orange-700 border-0 gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    HIGH PRIORITY
                  </Badge>
                )}
                <SLAIndicator 
                  slaDeadline={issue.slaDeadline} 
                  isOverdue={issue.isOverdue} 
                  status={issue.status}
                />
              </div>

              <div className="flex flex-wrap gap-2 items-center justify-between">
                <div className="flex gap-2">
                  <CategoryBadge category={issue.category} />
                  {issue.department && (
                    <Badge variant="outline" className="gap-1">
                      <User className="h-3 w-3" />
                      {issue.department}
                    </Badge>
                  )}
                </div>
                {currentUser?.role === 'citizen' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      variant={hasUpvoted ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleUpvote}
                      className={`gap-1 ${hasUpvoted ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}`}
                    >
                      <ThumbsUp className={`h-3 w-3 ${hasUpvoted ? 'fill-current' : ''}`} />
                      <span>{issue.upvoteCount} Support{issue.upvoteCount !== 1 ? 's' : ''}</span>
                    </Button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            {/* Issue Image */}
            {issue.imageUrl && (
              <motion.div
                className="relative overflow-hidden rounded-xl border-2 shadow-lg group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <img
                  src={issue.imageUrl}
                  alt={issue.title}
                  className="w-full rounded-xl object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Eye className="h-4 w-4" />
                  <span className="text-sm">View Image</span>
                </div>
              </motion.div>
            )}

            {/* Issue Details */}
            <motion.div
              className="space-y-4 bg-white p-5 rounded-xl border-2 shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="font-medium text-lg flex items-center gap-2 text-primary">
                <Calendar className="h-5 w-5" />
                Issue Details
              </h3>
              
              <div className="space-y-3">
                <motion.div
                  className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="text-sm">{issue.location}</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <User className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Reported by</p>
                    <p className="text-sm">{issue.reporterName}</p>
                  </div>
                </motion.div>

                <motion.div
                  className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <Calendar className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Reported</p>
                    <p className="text-sm">
                      {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </motion.div>

                {issue.assignedToName && (
                  <motion.div
                    className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <User className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Assigned to</p>
                      <p className="text-sm">{issue.assignedToName}</p>
                    </div>
                  </motion.div>
                )}

                {issue.resolvedAt && (
                  <motion.div
                    className="flex items-start gap-3 p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground">Resolved</p>
                      <p className="text-sm">
                        {formatDistanceToNow(new Date(issue.resolvedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Resolution Details */}
            <AnimatePresence>
              {issue.status === 'resolved' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Separator className="my-6" />
                  <motion.div
                    className="space-y-4 bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-xl border-2 border-green-200 shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <h3 className="font-medium text-lg flex items-center gap-2 text-green-700">
                      <CheckCircle2 className="h-5 w-5" />
                      Resolution
                    </h3>
                    {issue.resolutionNote && (
                      <p className="text-sm leading-relaxed bg-white/50 p-4 rounded-lg border border-green-200">
                        {issue.resolutionNote}
                      </p>
                    )}
                    {issue.resolutionImageUrl && (
                      <motion.div
                        className="relative overflow-hidden rounded-lg border-2 border-green-200"
                        whileHover={{ scale: 1.02 }}
                      >
                        <img
                          src={issue.resolutionImageUrl}
                          alt="Resolution"
                          className="w-full rounded-lg object-cover"
                        />
                      </motion.div>
                    )}

                    {/* Feedback Section */}
                    {issue.feedback ? (
                      <motion.div
                        className="bg-white/70 p-4 rounded-lg border-2 border-green-200"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Citizen Feedback
                          </h4>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-4 w-4 ${
                                  star <= issue.feedback!.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          by {issue.feedback.userName}
                        </p>
                        {issue.feedback.comment && (
                          <p className="text-sm mt-2">{issue.feedback.comment}</p>
                        )}
                      </motion.div>
                    ) : canProvideFeedback && (
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          onClick={() => setFeedbackDialogOpen(true)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Provide Feedback
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            <Separator className="my-6" />

            {/* Comments Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CommentSection issueId={issue.id} />
            </motion.div>
          </div>
        </motion.div>
      </SheetContent>

      {/* Feedback Dialog */}
      <FeedbackDialog
        issueId={issue.id}
        open={feedbackDialogOpen}
        onClose={() => setFeedbackDialogOpen(false)}
      />
    </Sheet>
  );
};
