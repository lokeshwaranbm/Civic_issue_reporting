import { motion } from 'motion/react';
import { IssueCategory } from '../types';
import { Badge } from './ui/badge';
import {
  Construction,
  Droplet,
  Zap,
  Trash2,
  Lightbulb,
  Waves,
  AlertCircle,
} from 'lucide-react';

interface CategoryBadgeProps {
  category: IssueCategory;
}

export const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const config: Record<IssueCategory, { label: string; icon: any; color: string }> = {
    road: { label: 'Road', icon: Construction, color: 'bg-orange-100 text-orange-700 border-orange-200' },
    water: { label: 'Water', icon: Droplet, color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    electricity: { label: 'Electricity', icon: Zap, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
    sanitation: { label: 'Sanitation', icon: Trash2, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    streetlight: { label: 'Street Light', icon: Lightbulb, color: 'bg-purple-100 text-purple-700 border-purple-200' },
    drainage: { label: 'Drainage', icon: Waves, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    other: { label: 'Other', icon: AlertCircle, color: 'bg-gray-100 text-gray-700 border-gray-200' },
  };

  const { label, icon: Icon, color } = config[category];

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      whileHover={{ scale: 1.05 }}
    >
      <Badge className={`gap-1 ${color} hover:${color}`}>
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    </motion.div>
  );
};
