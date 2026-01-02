
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { MapPin, DollarSign, Clock, Send, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { 
  sanitizeText, 
  checkRateLimit 
} from '@/components/security/SecureInput';

export default function JobPostingCard({ job }) {
  const queryClient = useQueryClient();
  const [showApplicationDialog, setShowApplicationDialog] = useState(false); // Renamed from showApplyDialog
  const [coverMessage, setCoverMessage] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me().catch(() => null)
  });

  // Added query for caregiver profile
  const { data: caregiverProfile } = useQuery({
    queryKey: ['caregiverProfile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const profiles = await base44.entities.CaregiverProfile.filter({ user_id: user.id });
      return profiles[0] || null; // Assuming one profile per user
    },
    enabled: !!user?.id,
  });

  const { data: hasApplied = false } = useQuery({
    queryKey: ['jobApplication', job.id],
    queryFn: async () => {
      if (!user) return false;
      const applications = await base44.entities.JobApplication.filter({ 
        job_posting_id: job.id,
        created_by: user.email 
      });
      return applications.length > 0;
    },
    enabled: !!user
  });

  const applyMutation = useMutation({
    mutationFn: async (data) => {
      // Security: Rate limiting - 3 applications per job per user per day
      const rateLimitCheck = checkRateLimit(`job_apply_${job.id}_${user?.id}`, 3, 86400000); 
      if (!rateLimitCheck.allowed) {
        throw new Error('Too many applications to this job. Please wait 24 hours.');
      }

      return await base44.entities.JobApplication.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['jobApplication', job.id]); // Keep existing to update current card status
      queryClient.invalidateQueries(['myApplications']); // Invalidate list of user's applications
      setShowApplicationDialog(false); // Changed dialog name
      setCoverMessage('');
      toast.success('Application submitted!'); // Modified toast message
    },
    onError: (error) => {
      console.error('Error submitting application:', error);
      toast.error(error.message || 'Failed to submit application'); // Modified toast message
    }
  });

  const handleApply = () => {
    // Check if caregiver profile exists
    if (!caregiverProfile) {
      toast.error('Please create a caregiver profile first');
      return;
    }

    // Security: Sanitize and validate cover message
    const sanitizedMessage = sanitizeText(coverMessage);
    
    if (sanitizedMessage.length === 0) {
      toast.error('Please write a message to the family');
      return;
    }

    if (sanitizedMessage.length > 2000) {
      toast.error('Cover message too long (max 2000 characters)');
      return;
    }

    applyMutation.mutate({
      job_posting_id: job.id,
      caregiver_id: caregiverProfile.id, // Changed to use caregiverProfile.id
      caregiver_name: caregiverProfile.full_name, // Changed to use caregiverProfile.full_name
      caregiver_email: user?.email,
      cover_message: sanitizedMessage, // Use sanitized message
      status: 'pending' // Added status field
    });
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-blue-300 hover:border-blue-500 hover:shadow-2xl transition-all h-full flex flex-col">
          <CardHeader>
            <CardTitle className="text-gray-900">{job.title}</CardTitle>
            <CardDescription>Posted {new Date(job.created_date).toLocaleDateString()}</CardDescription>
          </CardHeader>
          <CardContent className="flex-grow">
            <div className="space-y-3">
              <p className="text-sm text-gray-600 line-clamp-3">{job.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700">
                {job.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{job.location}</span>
                  </div>
                )}
                {job.pay_rate && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-gray-500" />
                    <span>${job.pay_rate}/hr</span>
                  </div>
                )}
                {job.hours_per_week && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{job.hours_per_week} hrs/week</span>
                  </div>
                )}
              </div>
              <Badge variant="secondary" className="capitalize bg-blue-100 text-blue-800">
                {job.job_type?.replace('_', ' ')}
              </Badge>
            </div>
          </CardContent>
          <div className="p-6 pt-0">
            {hasApplied ? (
              <Button disabled className="w-full bg-gray-300 cursor-not-allowed">
                ✅ Application Submitted
              </Button>
            ) : (
              <Button 
                onClick={() => setShowApplicationDialog(true)} // Changed dialog name
                className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Send className="w-4 h-4 mr-2" />
                I'm Interested
              </Button>
            )}
          </div>
        </Card>
      </motion.div>

      <Dialog open={showApplicationDialog} onOpenChange={setShowApplicationDialog}> {/* Changed dialog name */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {job.title}</DialogTitle>
            <DialogDescription>
              Introduce yourself and explain why you're a great fit for this position.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Your Message to the Family</label>
              <Textarea
                value={coverMessage}
                onChange={(e) => setCoverMessage(e.target.value)}
                placeholder="Tell them about your experience, availability, and why you'd be perfect for this role..."
                className="h-32 border-2 border-blue-200"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApplicationDialog(false)}> {/* Changed dialog name */}
              Cancel
            </Button>
            <Button 
              onClick={handleApply} 
              disabled={applyMutation.isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {applyMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Application
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
