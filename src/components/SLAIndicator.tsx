import { Clock, AlertTriangle } from 'lucide-react';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface SLAIndicatorProps {
  slaDeadline?: string;
  isOverdue?: boolean;
  status: string;
}

export const SLAIndicator = ({ slaDeadline, isOverdue, status }: SLAIndicatorProps) => {
  if (!slaDeadline || status === 'resolved') return null;

  const deadline = new Date(slaDeadline);
  const now = new Date();
  const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (isOverdue) {
    return (
      <Badge variant="destructive" className="gap-1 animate-pulse">
        <AlertTriangle className="h-3 w-3" />
        SLA OVERDUE by {formatDistanceToNow(deadline)}
      </Badge>
    );
  }

  if (hoursRemaining <= 6) {
    return (
      <Badge className="gap-1 bg-orange-500 hover:bg-orange-600">
        <Clock className="h-3 w-3" />
        Due in {Math.floor(hoursRemaining)}h
      </Badge>
    );
  }

  if (hoursRemaining <= 24) {
    return (
      <Badge variant="outline" className="gap-1 border-yellow-500 text-yellow-700">
        <Clock className="h-3 w-3" />
        Due in {Math.floor(hoursRemaining)}h
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      <Clock className="h-3 w-3" />
      Due {formatDistanceToNow(deadline, { addSuffix: true })}
    </Badge>
  );
};
