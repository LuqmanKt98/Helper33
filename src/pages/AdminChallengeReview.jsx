import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Sparkles,
  Crown,
  Eye,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import BackButton from '@/components/BackButton';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function AdminChallengeReview() {
  const [selectedProposal, setSelectedProposal] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ['challengeProposals'],
    queryFn: () => base44.entities.ChallengeProposal.list('-created_date'),
    enabled: !!user && user.role === 'admin'
  });

  const approveMutation = useMutation({
    mutationFn: async ({ proposalId, notes }) => {
      const proposal = proposals.find(p => p.id === proposalId);
      
      // Update proposal status
      await base44.entities.ChallengeProposal.update(proposalId, {
        status: 'approved',
        reviewed_by: user.email,
        reviewed_at: new Date().toISOString(),
        admin_notes: notes
      });

      // Create actual challenge
      await base44.entities.GroupChallenge.create({
        title: proposal.title,
        description: proposal.description,
        icon: proposal.icon,
        color_theme: proposal.color_theme,
        duration_days: proposal.duration_days,
        goal_description: proposal.goal_description,
        goal_value: proposal.goal_value,
        category: proposal.category,
        difficulty_level: proposal.difficulty_level,
        status: 'active',
        start_date: new Date().toISOString(),
        participant_count: 0,
        created_by_admin: true,
        original_proposer: proposal.proposer_email
      });

      // Notify proposer
      try {
        await base44.integrations.Core.SendEmail({
          to: proposal.proposer_email,
          subject: '🎉 Your Challenge Proposal was Approved!',
          body: `Hi ${proposal.proposer_name}!

Great news! Your challenge proposal "${proposal.title}" has been approved and is now live in the Helper33 community!

${notes ? `Admin feedback: ${notes}` : ''}

Community members can now join your challenge and start achieving their goals together!

Thank you for contributing to our community! 💜

---
Helper33 Team`
        });
      } catch (emailError) {
        console.error('Failed to send approval email:', emailError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challengeProposals']);
      queryClient.invalidateQueries(['activeChallenges']);
      toast.success('✅ Challenge approved and published!');
      setSelectedProposal(null);
      setAdminNotes('');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ proposalId, reason }) => {
      const proposal = proposals.find(p => p.id === proposalId);
      
      await base44.entities.ChallengeProposal.update(proposalId, {
        status: 'rejected',
        reviewed_by: user.email,
        reviewed_at: new Date().toISOString(),
        admin_notes: reason
      });

      // Notify proposer
      try {
        await base44.integrations.Core.SendEmail({
          to: proposal.proposer_email,
          subject: 'Challenge Proposal Update',
          body: `Hi ${proposal.proposer_name},

Thank you for submitting your challenge proposal "${proposal.title}".

After review, we're unable to approve this challenge at this time.

${reason ? `Reason: ${reason}` : ''}

You're welcome to submit a revised proposal or create a different challenge idea!

---
Helper33 Team`
        });
      } catch (emailError) {
        console.error('Failed to send rejection email:', emailError);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['challengeProposals']);
      toast.info('Challenge proposal rejected');
      setSelectedProposal(null);
      setAdminNotes('');
    }
  });

  const pendingProposals = proposals.filter(p => p.status === 'pending_review');
  const reviewedProposals = proposals.filter(p => p.status !== 'pending_review');

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md border-2 border-red-300">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access Required</h2>
            <p className="text-gray-600">This page is only accessible to administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <>
      <SEO title="Challenge Review - Admin | Helper33" description="Review and approve community challenge proposals" />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Navigation */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <BackButton className="mb-3" />
            <Breadcrumbs items={[
              { label: 'Admin' },
              { label: 'Challenge Review' }
            ]} />
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <Crown className="w-10 h-10 text-yellow-500" />
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Challenge Review
                </h1>
                <p className="text-gray-600">Review and approve community proposals</p>
              </div>
            </div>

            <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-lg px-4 py-2">
              {pendingProposals.length} Pending
            </Badge>
          </motion.div>

          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm shadow-lg">
              <TabsTrigger value="pending" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
                <Clock className="w-4 h-4 mr-2" />
                Pending ({pendingProposals.length})
              </TabsTrigger>
              <TabsTrigger value="reviewed" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
                <CheckCircle className="w-4 h-4 mr-2" />
                Reviewed ({reviewedProposals.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="space-y-4 mt-6">
              {pendingProposals.length === 0 ? (
                <Card className="border-2 border-dashed border-purple-300">
                  <CardContent className="p-12 text-center">
                    <Sparkles className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-700 mb-2">All Caught Up! 🎉</h3>
                    <p className="text-gray-500">No pending challenge proposals to review</p>
                  </CardContent>
                </Card>
              ) : (
                pendingProposals.map((proposal, idx) => (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="border-2 border-orange-300 bg-gradient-to-br from-orange-50 to-yellow-50 shadow-lg hover:shadow-xl transition-all">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`text-5xl p-3 rounded-xl bg-gradient-to-br ${proposal.color_theme} bg-opacity-20`}>
                              {proposal.icon}
                            </div>
                            <div>
                              <CardTitle className="text-2xl">{proposal.title}</CardTitle>
                              <CardDescription className="text-base">
                                Proposed by {proposal.proposer_name}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge className="bg-orange-500 text-white">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Description:</p>
                          <p className="text-gray-800 bg-white p-3 rounded-lg border border-orange-200">
                            {proposal.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-white p-3 rounded-lg border border-orange-200">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Goal:</p>
                            <p className="text-sm text-gray-900">{proposal.goal_description}</p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-orange-200">
                            <p className="text-xs font-semibold text-gray-600 mb-1">Duration:</p>
                            <p className="text-sm text-gray-900">{proposal.duration_days} days • Goal: {proposal.goal_value}</p>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Badge variant="outline">{proposal.category}</Badge>
                          <Badge variant="outline">{proposal.difficulty_level}</Badge>
                        </div>

                        {/* AI Moderation Result */}
                        {proposal.ai_moderation_result && (
                          <div className={`p-3 rounded-lg border-2 ${
                            proposal.ai_moderation_result.severity === 'safe' 
                              ? 'bg-green-50 border-green-300' 
                              : 'bg-yellow-50 border-yellow-300'
                          }`}>
                            <p className="text-sm font-semibold flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              AI Safety Check: {proposal.ai_moderation_result.severity}
                            </p>
                            <p className="text-xs text-gray-700 mt-1">{proposal.ai_moderation_result.reason}</p>
                          </div>
                        )}

                        {selectedProposal === proposal.id ? (
                          <div className="space-y-3 p-4 bg-white rounded-lg border-2 border-purple-300">
                            <Textarea
                              value={adminNotes}
                              onChange={(e) => setAdminNotes(e.target.value)}
                              placeholder="Add notes or feedback (optional)..."
                              className="h-24"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => approveMutation.mutate({ proposalId: proposal.id, notes: adminNotes })}
                                className="flex-1 bg-green-600 hover:bg-green-700"
                                disabled={approveMutation.isPending}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve & Publish
                              </Button>
                              <Button
                                onClick={() => rejectMutation.mutate({ proposalId: proposal.id, reason: adminNotes })}
                                variant="destructive"
                                className="flex-1"
                                disabled={rejectMutation.isPending}
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => {
                                  setSelectedProposal(null);
                                  setAdminNotes('');
                                }}
                                variant="outline"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => setSelectedProposal(proposal.id)}
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Review This Proposal
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
            </TabsContent>

            <TabsContent value="reviewed" className="space-y-4 mt-6">
              {reviewedProposals.map((proposal, idx) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className={`border-2 ${
                    proposal.status === 'approved' 
                      ? 'border-green-300 bg-green-50' 
                      : 'border-red-300 bg-red-50'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl">{proposal.icon}</div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">{proposal.title}</h3>
                            <p className="text-sm text-gray-600">by {proposal.proposer_name}</p>
                          </div>
                        </div>
                        <Badge className={
                          proposal.status === 'approved' 
                            ? 'bg-green-600 text-white' 
                            : 'bg-red-600 text-white'
                        }>
                          {proposal.status === 'approved' ? (
                            <><CheckCircle className="w-3 h-3 mr-1" /> Approved</>
                          ) : (
                            <><XCircle className="w-3 h-3 mr-1" /> Rejected</>
                          )}
                        </Badge>
                      </div>
                      {proposal.admin_notes && (
                        <div className="mt-3 p-2 bg-white rounded border">
                          <p className="text-xs font-semibold text-gray-600">Admin Notes:</p>
                          <p className="text-sm text-gray-800">{proposal.admin_notes}</p>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Reviewed by {proposal.reviewed_by} on {new Date(proposal.reviewed_at).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}