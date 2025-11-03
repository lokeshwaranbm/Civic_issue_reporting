import { motion } from 'motion/react';
import { IssueStatus } from '../types';
import { Badge } from './ui/badge';
import { Clock, Loader2, CheckCircle2, Calendar, XCircle } from 'lucide-react';

interface StatusBadgeProps {
  status: IssueStatus;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = {
    pending: {
      label: 'Pending',
      className: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100',
      icon: Clock,
    },
    inspection_scheduled: {
      label: 'Inspection Scheduled',
      className: 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100',
      icon: Calendar,
    },
    in_progress: {
      label: 'In Progress',
      className: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100',
      icon: Loader2,
    },
    resolved: {
      label: 'Resolved',
      className: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-100',
      icon: CheckCircle2,
    },
    rejected: {
      label: 'Rejected',
      className: 'bg-red-100 text-red-700 border-red-200 hover:bg-red-100',
      icon: XCircle,
    },
  };

  const { label, className, icon: Icon } = config[status];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
    >
      <Badge className={`gap-1 ${className}`}>
        <Icon className={`h-3 w-3 ${status === 'in_progress' ? 'animate-spin' : ''}`} />
        {label}
      </Badge>
    </motion.div>
  );
};
