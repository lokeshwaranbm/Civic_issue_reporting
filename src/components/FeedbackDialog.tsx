import { useState } from 'react';
import { motion } from 'motion/react';
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
import { Button } from './ui/button';
import { Star } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { IssueFeedback } from '../types';
import { toast } from 'sonner@2.0.3';

interface FeedbackDialogProps {
  issueId: string;
  open: boolean;
  onClose: () => void;
}

export const FeedbackDialog = ({ issueId, open, onClose }: FeedbackDialogProps) => {
  const { currentUser, addFeedback } = useApp();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentUser || rating === 0) return;

    setIsSubmitting(true);

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 500));

    const feedback: IssueFeedback = {
      userId: currentUser.id,
      userName: currentUser.name,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    addFeedback(issueId, feedback);
    toast.success('Thank you for your feedback!', {
      description: 'Your rating helps us improve our services.',
    });

    setIsSubmitting(false);
    setRating(0);
    setComment('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Provide Feedback
          </DialogTitle>
          <DialogDescription>
            Rate the resolution and share your experience
          </DialogDescription>
        </DialogHeader>

        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="space-y-2">
            <Label>Rating *</Label>
            <div className="flex gap-2 justify-center py-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <motion.button
                  key={star}
                  type="button"
                  className="focus:outline-none"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Star
                    className={`h-10 w-10 transition-colors ${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </motion.button>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              {rating === 0 && 'Click to rate'}
              {rating === 1 && 'Poor'}
              {rating === 2 && 'Fair'}
              {rating === 3 && 'Good'}
              {rating === 4 && 'Very Good'}
              {rating === 5 && 'Excellent'}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback-comment">Comments (Optional)</Label>
            <Textarea
              id="feedback-comment"
              placeholder="Share your experience with the resolution..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="border-2 focus:border-primary"
              disabled={isSubmitting}
            />
          </div>
        </motion.div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSubmitting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"
                />
                Submitting...
              </>
            ) : (
              'Submit Feedback'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
