import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

export default function ReviewForm({ caregiverId, onSuccess }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.Review.create(data);
    },
    onSuccess: () => {
      toast.success('Review submitted!');
      setRating(0);
      setComment('');
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      console.error('Failed to submit review:', error);
      toast.error(error.message || 'Failed to submit review. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating.');
      return;
    }

    const trimmedComment = comment.trim();
    if (!trimmedComment || trimmedComment.length < 10) {
      toast.error('Comment must be at least 10 characters.');
      return;
    }

    if (trimmedComment.length > 1000) {
      toast.error('Comment too long (max 1000 characters).');
      return;
    }

    createReviewMutation.mutate({
      caregiver_id: caregiverId,
      client_name: user?.full_name || user?.email || 'Anonymous',
      rating,
      comment: trimmedComment
    });
  };

  return (
    <Card className="bg-white/70 backdrop-blur-sm border-0">
      <CardHeader>
        <CardTitle>Leave a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-medium">Your Rating</label>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-8 h-8 cursor-pointer transition-colors ${
                    rating >= star ? 'text-yellow-500 fill-yellow-400' : 'text-gray-300'
                  }`}
                  onClick={() => setRating(star)}
                />
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="comment" className="font-medium">Your Comment</label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
              className="mt-2"
              rows={4}
              disabled={createReviewMutation.isPending}
            />
          </div>
          <Button type="submit" disabled={createReviewMutation.isPending}>
            {createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}