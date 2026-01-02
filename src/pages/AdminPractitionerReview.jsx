import React, { useState } from 'react';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, X, ExternalLink, AlertCircle, Trash2, FileText, Star, Send, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function AdminPractitionerReview() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pending');
  const [adminNotes, setAdminNotes] = useState({});

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: pendingPractitioners = [] } = useQuery({
    queryKey: ['pendingPractitioners'],
    queryFn: () => base44.entities.PractitionerProfile.filter({ status: 'pending_review' }),
    initialData: []
  });

  const { data: approvedPractitioners = [] } = useQuery({
    queryKey: ['approvedPractitioners'],
    queryFn: () => base44.entities.PractitionerProfile.filter({ status: 'approved' }),
    initialData: []
  });

  const { data: removalRequests = [] } = useQuery({
    queryKey: ['removalRequests'],
    queryFn: () => base44.entities.PractitionerRemovalRequest.filter({ status: 'pending' }),
    initialData: []
  });

  const { data: allReviews = [] } = useQuery({
    queryKey: ['practitionerReviews'],
    queryFn: () => base44.entities.PractitionerReview.list(),
    initialData: []
  });

  const shareReviewMutation = useMutation({
    mutationFn: async ({ review, practitionerEmail }) => {
      await base44.integrations.Core.SendEmail({
        to: practitionerEmail,
        subject: review.review_type === 'report' 
          ? '📋 Feedback Report - Action Required' 
          : `⭐ Client Feedback (${review.rating} stars)`,
        body: review.review_type === 'report'
          ? `You have received a feedback report.\n\nReason: ${review.reason}\nDetails: ${review.details}\n\nReporter: ${review.is_anonymous ? 'Anonymous' : review.reporter_name}\n\nPlease review and take appropriate action. If you have questions, contact admin@helper33.com.`
          : `You received ${review.rating}-star feedback${review.is_anonymous ? ' from an anonymous client' : ` from ${review.reviewer_name}`}.\n\n${review.review_text ? `Review: "${review.review_text}"` : 'No additional comments provided.'}\n\nKeep up the great work!`
      });
    },
    onSuccess: () => {
      toast.success('Review shared with practitioner! 📧');
    },
    onError: () => {
      toast.error('Failed to share review');
    }
  });

  const logAuditAction = async (actionType, entityId, entityName, notes = '') => {
    try {
      await base44.entities.AdminAuditLog.create({
        admin_email: user.email,
        admin_name: user.full_name || user.email,
        action_type: actionType,
        entity_type: 'PractitionerProfile',
        entity_id: entityId,
        entity_name: entityName,
        notes: notes,
        details: {
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to log audit action:', error);
    }
  };

  const handleApprove = async (practitioner) => {
    try {
      await base44.entities.PractitionerProfile.update(practitioner.id, {
        status: 'approved',
        admin_notes: adminNotes[practitioner.id] || ''
      });

      await base44.integrations.Core.SendEmail({
        to: practitioner.contact_email,
        subject: '✅ Your Practitioner Profile is Approved!',
        body: `Congratulations ${practitioner.full_name}! Your profile has been approved and is now live on Helper33. Clients can now find and contact you.`
      });

      await logAuditAction(
        'practitioner_approved',
        practitioner.id,
        practitioner.full_name,
        adminNotes[practitioner.id] || 'Profile approved'
      );

      queryClient.invalidateQueries(['pendingPractitioners']);
      queryClient.invalidateQueries(['approvedPractitioners']);
      toast.success('Practitioner approved! ✅');
    } catch (error) {
      toast.error('Failed to approve');
    }
  };

  const handleReject = async (practitioner) => {
    try {
      await base44.entities.PractitionerProfile.update(practitioner.id, {
        status: 'rejected',
        admin_notes: adminNotes[practitioner.id] || 'Application did not meet requirements'
      });

      await base44.integrations.Core.SendEmail({
        to: practitioner.contact_email,
        subject: 'Helper33 Practitioner Application Update',
        body: `Hello ${practitioner.full_name}, thank you for your interest. Unfortunately, we cannot approve your application at this time. Reason: ${adminNotes[practitioner.id] || 'Did not meet requirements'}`
      });

      await logAuditAction(
        'practitioner_rejected',
        practitioner.id,
        practitioner.full_name,
        adminNotes[practitioner.id] || 'Application rejected'
      );

      queryClient.invalidateQueries(['pendingPractitioners']);
      toast.success('Application rejected');
    } catch (error) {
      toast.error('Failed to reject');
    }
  };

  const handleDelete = async (practitioner) => {
    if (!confirm(`Are you sure you want to permanently delete ${practitioner.full_name}'s profile?`)) {
      return;
    }

    try {
      await base44.entities.PractitionerProfile.delete(practitioner.id);
      
      await logAuditAction(
        'practitioner_deleted',
        practitioner.id,
        practitioner.full_name,
        'Profile permanently deleted by admin'
      );

      queryClient.invalidateQueries(['approvedPractitioners']);
      toast.success('Practitioner profile deleted');
    } catch (error) {
      toast.error('Failed to delete profile');
    }
  };

  const handleRemovalRequest = async (request, approved) => {
    try {
      if (approved) {
        await base44.entities.PractitionerProfile.delete(request.practitioner_id);
        await base44.integrations.Core.SendEmail({
          to: request.practitioner_email,
          subject: 'Profile Removal Completed',
          body: `Your practitioner profile has been removed from Helper33 as requested.`
        });

        await logAuditAction(
          'removal_request_approved',
          request.practitioner_id,
          request.practitioner_name,
          `Reason: ${request.reason}`
        );
      } else {
        await logAuditAction(
          'removal_request_rejected',
          request.practitioner_id,
          request.practitioner_name,
          'Removal request denied'
        );
      }

      await base44.entities.PractitionerRemovalRequest.update(request.id, {
        status: approved ? 'approved' : 'rejected'
      });

      queryClient.invalidateQueries(['removalRequests']);
      queryClient.invalidateQueries(['approvedPractitioners']);
      toast.success(approved ? 'Profile removed' : 'Request rejected');
    } catch (error) {
      toast.error('Failed to process request');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h2 className="font-bold text-xl mb-2">Admin Access Required</h2>
            <p className="text-gray-600">You need admin privileges to access this page.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const satisfactionReviews = allReviews.filter(r => r.review_type === 'satisfaction');
  const reportReviews = allReviews.filter(r => r.review_type === 'report');

  return (
    <>
      <SEO title="Review Practitioners | Admin" />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="w-8 h-8 text-purple-600" />
              Practitioner Management
            </h1>
            <Link to={createPageUrl('AdminAuditLogs')}>
              <Button variant="outline" className="border-2 border-purple-300">
                <FileText className="w-4 h-4 mr-2" />
                View Audit Logs
              </Button>
            </Link>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-white border-2 border-purple-300">
              <TabsTrigger value="pending">
                Pending ({pendingPractitioners.length})
              </TabsTrigger>
              <TabsTrigger value="approved">
                Approved ({approvedPractitioners.length})
              </TabsTrigger>
              <TabsTrigger value="reviews">
                Reviews ({satisfactionReviews.length})
              </TabsTrigger>
              <TabsTrigger value="reports">
                Reports ({reportReviews.length})
              </TabsTrigger>
              <TabsTrigger value="removal">
                Removal Requests ({removalRequests.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingPractitioners.map((p, idx) => (
                <PractitionerReviewCard
                  key={p.id}
                  practitioner={p}
                  index={idx}
                  adminNotes={adminNotes}
                  setAdminNotes={setAdminNotes}
                  onApprove={() => handleApprove(p)}
                  onReject={() => handleReject(p)}
                />
              ))}
              {pendingPractitioners.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">No pending applications</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="approved" className="space-y-4 mt-6">
              {approvedPractitioners.map(p => (
                <Card key={p.id} className="border-2 border-green-300">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold">{p.full_name}</h3>
                        <p className="text-sm text-gray-600">{p.title}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                        <Button
                          onClick={() => handleDelete(p)}
                          variant="outline"
                          size="sm"
                          className="border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4 mt-6">
              {satisfactionReviews.map((review, idx) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="border-2 border-yellow-300 bg-yellow-50/30">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-yellow-600" />
                            {review.practitioner_name}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            From: {review.is_anonymous ? 'Anonymous' : review.reviewer_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {review.review_text && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Review:</p>
                          <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                            {review.review_text}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Submitted: {new Date(review.created_date).toLocaleDateString()}</span>
                        <Badge className="bg-yellow-100 text-yellow-700">
                          {review.rating} Stars
                        </Badge>
                      </div>
                      <Button
                        onClick={() => {
                          const practitioner = approvedPractitioners.find(p => p.id === review.practitioner_id);
                          if (practitioner) {
                            shareReviewMutation.mutate({
                              review,
                              practitionerEmail: practitioner.contact_email || practitioner.created_by
                            });
                          } else {
                            toast.error('Practitioner not found');
                          }
                        }}
                        disabled={shareReviewMutation.isPending}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Share with Practitioner
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {satisfactionReviews.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <Star className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">No reviews yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reports" className="space-y-4 mt-6">
              {reportReviews.map((report, idx) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="border-2 border-red-300 bg-red-50/30">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            Report: {report.practitioner_name}
                          </CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            From: {report.is_anonymous ? 'Anonymous' : report.reporter_name}
                          </p>
                        </div>
                        <Badge className="bg-red-100 text-red-700">
                          {report.severity?.toUpperCase() || 'HIGH'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Reason:</p>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                          {report.reason}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Details:</p>
                        <p className="text-sm text-gray-600 bg-white p-3 rounded-lg">
                          {report.details}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Submitted: {new Date(report.created_date).toLocaleDateString()}</span>
                        <Badge className={`${
                          report.status === 'pending_investigation' 
                            ? 'bg-orange-100 text-orange-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {report.status || 'pending'}
                        </Badge>
                      </div>
                      <Button
                        onClick={() => {
                          const practitioner = approvedPractitioners.find(p => p.id === report.practitioner_id);
                          if (practitioner) {
                            shareReviewMutation.mutate({
                              review: report,
                              practitionerEmail: practitioner.contact_email || practitioner.created_by
                            });
                          } else {
                            toast.error('Practitioner not found');
                          }
                        }}
                        disabled={shareReviewMutation.isPending}
                        className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Share Report with Practitioner
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {reportReviews.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">No reports filed</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="removal" className="space-y-4 mt-6">
              {removalRequests.map((request, idx) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="border-2 border-orange-300">
                    <CardContent className="p-4">
                      <div className="mb-4">
                        <h3 className="font-bold text-lg">{request.practitioner_name}</h3>
                        <p className="text-sm text-gray-600">{request.practitioner_email}</p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Reason:</p>
                        <p className="text-sm text-gray-600">{request.reason}</p>
                      </div>
                      <div className="flex gap-3">
                        <Button
                          onClick={() => handleRemovalRequest(request, false)}
                          variant="outline"
                          className="flex-1 border-2 border-gray-300"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleRemovalRequest(request, true)}
                          className="flex-1 bg-gradient-to-r from-red-600 to-rose-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Approve & Remove Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {removalRequests.length === 0 && (
                <Card>
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-gray-600">No removal requests</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

function PractitionerReviewCard({ practitioner, index, adminNotes, setAdminNotes, onApprove, onReject }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-2 border-orange-300 bg-orange-50/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl">{practitioner.full_name}</CardTitle>
              <p className="text-sm text-gray-600">{practitioner.title}</p>
              <Badge className="mt-2 bg-blue-100 text-blue-700">
                <Shield className="w-3 h-3 mr-1" />
                {practitioner.license_type} #{practitioner.license_number}
              </Badge>
            </div>
            <Badge className="bg-orange-100 text-orange-700">Pending Review</Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold text-sm mb-1">Bio:</p>
            <p className="text-sm text-gray-700">{practitioner.bio}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold mb-1">Experience:</p>
              <p className="text-gray-700">{practitioner.years_of_experience} years</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Contact:</p>
              <p className="text-gray-700">{practitioner.contact_email}</p>
            </div>
          </div>

          {practitioner.verification_documents && practitioner.verification_documents.length > 0 && (
            <div>
              <p className="font-semibold text-sm mb-2">Verification Documents:</p>
              <div className="space-y-1">
                {practitioner.verification_documents.map((doc, i) => (
                  <a key={i} href={doc} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <ExternalLink className="w-3 h-3 mr-2" />
                      Document {i + 1}
                    </Button>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label className="mb-2 block font-semibold">Admin Notes</Label>
            <Textarea
              value={adminNotes[practitioner.id] || ''}
              onChange={(e) => setAdminNotes(prev => ({ ...prev, [practitioner.id]: e.target.value }))}
              placeholder="Add notes about this application..."
              rows={3}
              className="border-2 border-purple-300"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={onReject}
              variant="outline"
              className="flex-1 border-2 border-red-300 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={onApprove}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}