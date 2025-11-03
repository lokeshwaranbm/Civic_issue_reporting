import { motion } from 'motion/react';
import { Issue } from '../types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { StatusBadge } from './StatusBadge';
import { CategoryBadge } from './CategoryBadge';
import { MapPin, Calendar, User, ThumbsUp, AlertTriangle, Clock, Flame } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../contexts/AppContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface IssueCardProps {
  issue: Issue;
  onClick: (issue: Issue) => void;
  showAssignment?: boolean;
  index?: number;
}

export const IssueCard = ({ issue, onClick, showAssignment = false, index = 0 }: IssueCardProps) => {
  const { currentUser, toggleUpvote } = useApp();
  const hasUpvoted = currentUser ? issue.upvotes.includes(currentUser.id) : false;

  const handleUpvote = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentUser) {
      toggleUpvote(issue.id, currentUser.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.05,
        ease: 'easeOut'
      }}
      whileHover={{ 
        y: -8,
        transition: { duration: 0.2 }
      }}
    >
      <Card 
        className={`cursor-pointer hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 bg-white overflow-hidden group ${
          issue.isOverdue ? 'ring-2 ring-red-500' : ''
        } ${issue.priority === 'critical' ? 'ring-2 ring-orange-500' : ''}`}
        onClick={() => onClick(issue)}
      >
        <CardHeader className="relative">
          {/* Priority and SLA Badges */}
          <div className="flex gap-2 mb-2">
            {issue.priority === 'critical' && (
              <Badge className="bg-gradient-to-r from-red-600 to-red-700 border-0">
                <Flame className="h-3 w-3 mr-1" />
                CRITICAL
              </Badge>
            )}
            {issue.priority === 'high' && (
              <Badge className="bg-gradient-to-r from-orange-600 to-orange-700 border-0">
                <AlertTriangle className="h-3 w-3 mr-1" />
                HIGH
              </Badge>
            )}
            {issue.isOverdue && (
              <Badge variant="destructive" className="animate-pulse">
                <Clock className="h-3 w-3 mr-1" />
                OVERDUE
              </Badge>
            )}
          </div>

          <div className="flex items-start justify-between gap-2 mb-2">
            <CardTitle className="line-clamp-1 group-hover:text-primary transition-colors">
              {issue.title}
            </CardTitle>
            <StatusBadge status={issue.status} />
          </div>
          <CardDescription className="line-clamp-2">{issue.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 justify-between">
            <CategoryBadge category={issue.category} />
            {currentUser?.role === 'citizen' && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={hasUpvoted ? 'default' : 'outline'}
                  size="sm"
                  onClick={handleUpvote}
                  className={`gap-1 ${hasUpvoted ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}`}
                >
                  <ThumbsUp className={`h-3 w-3 ${hasUpvoted ? 'fill-current' : ''}`} />
                  <span>{issue.upvoteCount}</span>
                </Button>
              </motion.div>
            )}
            {currentUser?.role !== 'citizen' && issue.upvoteCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ThumbsUp className="h-3 w-3" />
                <span>{issue.upvoteCount} support{issue.upvoteCount !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          <motion.div 
            className="flex items-center gap-2 text-sm text-muted-foreground"
            whileHover={{ x: 4 }}
            transition={{ duration: 0.2 }}
          >
            <MapPin className="h-4 w-4 text-primary" />
            <span>{issue.location}</span>
          </motion.div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            <span>Reported {formatDistanceToNow(new Date(issue.createdAt), { addSuffix: true })}</span>
          </div>

          {showAssignment && issue.assignedToName && (
            <motion.div 
              className="flex items-center gap-2 text-sm text-muted-foreground bg-primary/5 p-2 rounded-md"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <User className="h-4 w-4 text-primary" />
              <span>Assigned to {issue.assignedToName}</span>
            </motion.div>
          )}

          {issue.imageUrl && (
            <motion.div 
              className="mt-2 overflow-hidden rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={issue.imageUrl}
                alt={issue.title}
                className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </motion.div>
          )}

          {/* Hover indicator */}
          <motion.div
            className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full origin-left"
            initial={{ scaleX: 0 }}
            whileHover={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
};
