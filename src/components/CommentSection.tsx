import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Comment } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarFallback } from './ui/avatar';
import { formatDistanceToNow } from 'date-fns';
import { useApp } from '../contexts/AppContext';
import { Send, MessageSquare } from 'lucide-react';

interface CommentSectionProps {
  issueId: string;
}

export const CommentSection = ({ issueId }: CommentSectionProps) => {
  const { comments, addComment, currentUser } = useApp();
  const [newComment, setNewComment] = useState('');
  const [isSending, setIsSending] = useState(false);

  const issueComments = comments.filter((c) => c.issueId === issueId);

  const handleSubmit = async () => {
    if (!newComment.trim() || !currentUser) return;

    setIsSending(true);

    // Simulate sending
    await new Promise((resolve) => setTimeout(resolve, 500));

    const comment: Comment = {
      id: Date.now().toString(),
      issueId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      message: newComment.trim(),
      createdAt: new Date().toISOString(),
    };

    addComment(comment);
    setNewComment('');
    setIsSending(false);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'from-red-500 to-pink-500';
      case 'staff':
        return 'from-purple-500 to-purple-600';
      case 'citizen':
        return 'from-blue-500 to-blue-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Comments & Updates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Comment List */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {issueComments.length === 0 ? (
            <motion.div
              className="text-center py-8 border-2 border-dashed rounded-xl bg-gradient-to-br from-gray-50 to-gray-100"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">
                No comments yet. Be the first to comment!
              </p>
            </motion.div>
          ) : (
            <AnimatePresence>
              {issueComments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  className="flex gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-primary/20">
                    <AvatarFallback className={`bg-gradient-to-br ${getRoleColor(comment.userRole)} text-white`}>
                      {comment.userName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm">{comment.userName}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                        {comment.userRole}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm bg-white/50 p-2 rounded-md border">{comment.message}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Add Comment */}
        <motion.div
          className="space-y-2 pt-4 border-t-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Textarea
            placeholder="Add a comment or update..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            disabled={isSending}
            className="border-2 focus:border-primary transition-all"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                handleSubmit();
              }
            }}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Press Cmd/Ctrl + Enter to send
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSubmit}
                disabled={!newComment.trim() || isSending}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isSending ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="h-4 w-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post Comment
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </CardContent>
    </Card>
  );
};
