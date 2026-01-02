import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Star, AlertTriangle, Send, Shield, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { sendExternalEmail } from '@/functions/sendExternalEmail';

export default function ReviewReportSystem({ practitionerId, practitionerName, practitionerEmail }) {
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('satisfaction');
  
  const [rating, setRating] = useState(0);
  const [satisfactionText, setSatisfactionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [reportAnonymous, setReportAnonymous] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const sendNotifications = async (recipientEmail, title, message) => {
    try {
      await sendExternalEmail({
        to: recipientEmail,
        subject: title,
        body: message
      });
    } catch (error) {
      console.error('Email notification failed:', error);
    }
  };

  const handleSatisfactionSubmit = async () => {
    if (!user) {
      toast.error('Please log in to submit feedback');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const reviewData = {
        practitioner_id: practitionerId,
        practitioner_name: practitionerName,
        reviewer_name: isAnonymous ? 'Anonymous' : (user.full_name || user.email),
        reviewer_email: user.email,
        rating: rating,
        review_text: satisfactionText,
        verified_client: true,
        is_anonymous: isAnonymous,
        review_type: 'satisfaction',
        status: 'pending_review'
      };

      const review = await base44.entities.PractitionerReview.create(reviewData);

      // Notify practitioner
      await sendNotifications(
        practitionerEmail,
        '⭐ New Client Feedback Received',
        `You received ${rating}-star feedback${isAnonymous ? ' from an anonymous client' : ` from ${user.full_name || user.email}`}.\n\n${satisfactionText ? `Review: "${satisfactionText}"` : ''}\n\nLog in to Helper33 to view details.`
      );

      // Notify admin
      await sendNotifications(
        'admin@helper33.com',
        '📊 New Practitioner Feedback',
        `${practitionerName} received ${rating}-star feedback from ${isAnonymous ? 'Anonymous' : user.email}.\n\nReview: "${satisfactionText}"\n\nReview in admin dashboard.`
      );

      toast.success('Thank you for your feedback! 🙏');
      setRating(0);
      setSatisfactionText('');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Feedback submission error:', error);
      toast.error('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportSubmit = async () => {
    if (!user) {
      toast.error('Please log in to submit a report');
      return;
    }

    if (!reportReason || !reportDetails) {
      toast.error('Please fill in all fields');
      return;
    }

    setSubmitting(true);
    try {
      const reportData = {
        practitioner_id: practitionerId,
        practitioner_name: practitionerName,
        reporter_name: reportAnonymous ? 'Anonymous' : (user.full_name || user.email),
        reporter_email: user.email,
        reason: reportReason,
        details: reportDetails,
        is_anonymous: reportAnonymous,
        status: 'pending_investigation',
        severity: 'high',
        rating: 0,
        review_type: 'report'
      };

      const report = await base44.entities.PractitionerReview.create(reportData);

      // Notify admin (URGENT)
      await sendNotifications(
        'admin@helper33.com',
        '🚨 URGENT: Practitioner Report Filed',
        `A report has been filed against ${practitionerName}.\n\nReason: ${reportReason}\nDetails: ${reportDetails}\n\nReporter: ${reportAnonymous ? 'Anonymous' : user.email}\n\nRequires immediate review in admin dashboard.`
      );

      // Notify practitioner (neutral)
      await sendNotifications(
        practitionerEmail,
        '📋 Feedback Report Received',
        'A feedback report has been submitted regarding your practice. Our admin team will review it and contact you if needed.\n\nYou can view details in your dashboard.'
      );

      toast.success('Report submitted. Admin team has been notified. 🛡️');
      setReportReason('');
      setReportDetails('');
      setReportAnonymous(false);
    } catch (error) {
      console.error('Report submission error:', error);
      toast.error('Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          Share Your Experience
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-700">
            <strong>🌟 Coming Soon:</strong> Public reviews will be available soon! 
            For now, your feedback helps improve the platform and practitioner services.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-purple-100">
            <TabsTrigger value="satisfaction" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Satisfaction
            </TabsTrigger>
            <TabsTrigger value="report" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Report Issue
            </TabsTrigger>
          </TabsList>

          <TabsContent value="satisfaction" className="space-y-4 mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  How satisfied were you with this practitioner?
                </label>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <motion.button
                      key={star}
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors ${
                          star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </motion.button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Share more about your experience (optional)
                </label>
                <Textarea
                  value={satisfactionText}
                  onChange={(e) => setSatisfactionText(e.target.value)}
                  placeholder="What did you appreciate most? Any suggestions for improvement?"
                  rows={4}
                  className="border-2 border-purple-300 focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Submit anonymously</p>
                    <p className="text-xs text-gray-600">Your identity won't be shared</p>
                  </div>
                </div>
                <Switch
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
              </div>

              <Button
                onClick={handleSatisfactionSubmit}
                disabled={submitting || rating === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
            </motion.div>
          </TabsContent>

          <TabsContent value="report" className="space-y-4 mt-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-700">
                    <strong>Important:</strong> Reports are reviewed by our admin team. 
                    If this is a medical emergency, call 911 or 988 immediately.
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Reason for report
                </label>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full p-3 border-2 border-purple-300 rounded-lg focus:border-purple-500 focus:outline-none"
                >
                  <option value="">Select a reason</option>
                  <option value="unprofessional_behavior">Unprofessional behavior</option>
                  <option value="boundary_violation">Boundary violation</option>
                  <option value="inappropriate_communication">Inappropriate communication</option>
                  <option value="cancellation_issues">Cancellation issues</option>
                  <option value="billing_concerns">Billing concerns</option>
                  <option value="other">Other concern</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Details
                </label>
                <Textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Please provide details about the issue..."
                  rows={5}
                  className="border-2 border-purple-300 focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Submit anonymously</p>
                    <p className="text-xs text-gray-600">Maintain confidentiality</p>
                  </div>
                </div>
                <Switch
                  checked={reportAnonymous}
                  onCheckedChange={setReportAnonymous}
                />
              </div>

              <Button
                onClick={handleReportSubmit}
                disabled={submitting || !reportReason || !reportDetails}
                className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Submit Report
              </Button>
            </motion.div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}