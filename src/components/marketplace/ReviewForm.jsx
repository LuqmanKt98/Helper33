import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Upload, X, Send, Loader2, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function ReviewForm({ 
  itemId, 
  itemType, 
  itemTitle, 
  sellerId,
  orderId,
  onSuccess 
}) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData) => {
      return await base44.entities.MarketplaceReview.create(reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['courseReviews']);
      queryClient.invalidateQueries(['productReviews']);
      queryClient.invalidateQueries(['sellerReviews']);
      setSubmitted(true);
      toast.success('Thank you for your review! 🌟');
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast.error('Failed to submit review. Please try again.');
      console.error('Review submission error:', error);
    }
  });

  const handleImageUpload = async (file) => {
    if (images.length >= 3) {
      toast.error('Maximum 3 images allowed');
      return;
    }

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setImages([...images, file_url]);
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write a review');
      return;
    }

    const user = await base44.auth.me();

    const reviewData = {
      item_id: itemId,
      item_type: itemType,
      item_title: itemTitle,
      seller_id: sellerId,
      order_id: orderId,
      reviewer_email: user.email,
      reviewer_name: user.full_name,
      reviewer_avatar: user.avatar_url,
      rating: rating,
      title: title.trim(),
      content: content.trim(),
      images: images,
      verified_purchase: true,
      status: 'pending', // Will be moderated by admin or auto-approved
      ai_moderation_score: 1.0 // Could be enhanced with actual AI moderation
    };

    submitReviewMutation.mutate(reviewData);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Review Submitted!</h3>
            <p className="text-gray-700 mb-4">
              Thank you for sharing your feedback. Your review is being moderated and will appear shortly.
            </p>
            <div className="flex items-center justify-center gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card className="bg-white border-2 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-6 h-6 text-purple-600" />
          Write a Review
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Star Rating */}
          <div>
            <label className="block text-sm font-medium mb-3">Your Rating *</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      star <= (hoverRating || rating)
                        ? 'text-yellow-500 fill-yellow-500'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-sm font-medium text-gray-700">
                  {rating === 5 && '🌟 Excellent!'}
                  {rating === 4 && '👍 Great!'}
                  {rating === 3 && '😊 Good'}
                  {rating === 2 && '😐 Fair'}
                  {rating === 1 && '😞 Poor'}
                </span>
              )}
            </div>
          </div>

          {/* Review Title */}
          <div>
            <label className="block text-sm font-medium mb-2">Review Title (Optional)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience in a few words"
              maxLength={100}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/100 characters</p>
          </div>

          {/* Review Content */}
          <div>
            <label className="block text-sm font-medium mb-2">Your Review *</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Share your experience with this ${itemType}. What did you like? What could be improved? Would you recommend it to others?`}
              rows={6}
              maxLength={2000}
              required
            />
            <p className="text-xs text-gray-500 mt-1">{content.length}/2000 characters</p>
          </div>

          {/* Image Uploads */}
          <div>
            <label className="block text-sm font-medium mb-2">Add Photos (Optional)</label>
            <p className="text-xs text-gray-600 mb-3">Share photos to help others see your experience (max 3)</p>
            
            <div className="flex flex-wrap gap-3 mb-3">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Upload ${index + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {images.length < 3 && (
                <button
                  type="button"
                  onClick={() => document.getElementById('review-image-upload').click()}
                  disabled={uploadingImage}
                  className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-purple-500 hover:bg-purple-50 transition-colors"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-400 mb-1" />
                      <span className="text-xs text-gray-600">Add Photo</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <input
              id="review-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files[0]) {
                  handleImageUpload(e.target.files[0]);
                  e.target.value = ''; // Reset input
                }
              }}
            />
          </div>

          {/* Guidelines */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">Review Guidelines</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>✓ Be honest and constructive in your feedback</li>
              <li>✓ Focus on your personal experience</li>
              <li>✓ Respect privacy - don't share personal information</li>
              <li>✓ Keep it relevant to the {itemType}</li>
              <li>✗ No profanity, hate speech, or spam</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={submitReviewMutation.isPending || rating === 0 || !content.trim()}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-lg py-6"
            >
              {submitReviewMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Review
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}