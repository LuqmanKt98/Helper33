import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Star, CheckCircle, Loader2, Mail, Sparkles, Heart, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim()) {
      alert('Please provide a rating and a comment.');
      return;
    }
    setIsSubmitting(true);
    try {
      await base44.entities.Feedback.create({ rating, comment, category });
      setIsSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      alert('There was an error submitting your feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-8 bg-green-50 border-2 border-green-200 rounded-xl"
      >
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-green-800 mb-2">Thank You!</h3>
        <p className="text-green-700 mb-4">Your feedback has been submitted successfully.</p>
        <div className="bg-white/80 rounded-lg p-4 text-left border border-green-200">
          <p className="text-sm text-green-800">
            💡 <strong>We read every submission!</strong> Your insights help us train our AI daily to serve you better.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encouragement Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 rounded-xl p-6 border-2 border-purple-200"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
              Your Voice Shapes Our AI
              <Heart className="w-5 h-5 text-red-500 animate-pulse" />
            </h3>
            <p className="text-gray-700 mb-3">
              We're training our AI <strong>every single day</strong> to serve your needs better. Every piece of feedback you share directly improves DobryLife for everyone.
            </p>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Our team reads every submission personally</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Your feedback trains our AI to be smarter and more compassionate</span>
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>We implement user suggestions regularly</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200">
        <div className="space-y-2">
          <label className="font-medium text-gray-800">How would you rate your experience?</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-8 h-8 cursor-pointer transition-all ${
                  rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                }`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="category" className="font-medium text-gray-800">Feedback Category</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="general">General Feedback</SelectItem>
              <SelectItem value="bug_report">Bug Report</SelectItem>
              <SelectItem value="feature_request">Feature Request</SelectItem>
              <SelectItem value="ui_ux">Design & Usability</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="comment" className="font-medium text-gray-800">Share your thoughts</label>
          <Textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="What's working well? What could be improved? Any ideas for new features?"
            className="h-32"
          />
        </div>
        
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <MessageSquare className="w-4 h-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>
      </form>

      {/* Direct Contact Option */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200"
      >
        <div className="flex items-start gap-4">
          <Mail className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h4 className="font-bold text-blue-900 mb-2">Need to reach us directly?</h4>
            <p className="text-blue-800 text-sm mb-3">
              For detailed reports, bug findings, or in-depth feedback, email us directly:
            </p>
            <a 
              href="mailto:contact@dobrylife.com?subject=Feedback%20from%20DobryLife%20User"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Mail className="w-4 h-4" />
              contact@dobrylife.com
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}