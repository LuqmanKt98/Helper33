
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  User,
  Mail,
  Award,
  Video,
  ExternalLink,
  Loader2,
  Sparkles,
  AlertCircle,
  FileText,
  Calendar,
  Globe
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminConsultantReview() {
  const [selectedConsultant, setSelectedConsultant] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: consultants = [], isLoading, error } = useQuery({
    queryKey: ['allConsultants'],
    queryFn: async () => {
      console.log('🔍 Fetching all consultant profiles...');
      const data = await base44.entities.ConsultantProfile.list('-created_date', 100);
      console.log('📊 Total consultants fetched:', data?.length, data);
      return data || [];
    },
    refetchInterval: 10000, // Auto-refresh every 10 seconds
    staleTime: 0
  });

  const approveMutation = useMutation({
    mutationFn: async ({ consultantId, applicantEmail }) => {
      await base44.entities.ConsultantProfile.update(consultantId, {
        verified_professional: true,
        verification_date: new Date().toISOString().split('T')[0],
        accepting_clients: true
      });

      // Send approval email
      await base44.integrations.Core.SendEmail({
        to: applicantEmail,
        subject: '🎉 Your Consultant Profile Has Been Approved!',
        body: `
Congratulations! Your Helper33 consultant profile has been approved.

Your profile is now live and visible to potential clients. You can start accepting consultations right away.

Next Steps:
✅ Complete your availability schedule
✅ Connect Zoom for virtual consultations
✅ Add more credentials and case studies
✅ Start receiving client inquiries

Visit your profile: ${window.location.origin}${'/FindConsultants'}

Thank you for joining our expert network!

Best regards,
The Helper33 Team
        `
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allConsultants']);
      toast.success('✅ Consultant approved and notified!');
      setSelectedConsultant(null);
    },
    onError: (error) => {
      console.error('Approval error:', error);
      toast.error('Failed to approve consultant');
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ consultantId, applicantEmail, reason }) => {
      await base44.entities.ConsultantProfile.update(consultantId, {
        verified_professional: false,
        accepting_clients: false
      });

      // Send rejection email
      await base44.integrations.Core.SendEmail({
        to: applicantEmail,
        subject: 'Update on Your Helper33 Consultant Application',
        body: `
Thank you for your interest in becoming a Helper33 consultant.

After careful review, we are unable to approve your application at this time.

Reason: ${reason || 'Application does not meet current requirements'}

What You Can Do:
• Update your profile with more details
• Add relevant certifications
• Provide case studies or testimonials
• Reapply after making improvements

If you have questions, please reply to this email.

Best regards,
The Helper33 Team
        `
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allConsultants']);
      toast.success('❌ Application rejected and applicant notified');
      setSelectedConsultant(null);
      setRejectReason('');
    },
    onError: (error) => {
      console.error('Rejection error:', error);
      toast.error('Failed to reject application');
    }
  });

  const handleApprove = (consultant) => {
    approveMutation.mutate({
      consultantId: consultant.id,
      applicantEmail: consultant.created_by
    });
  };

  const handleReject = (consultant) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    rejectMutation.mutate({
      consultantId: consultant.id,
      applicantEmail: consultant.created_by,
      reason: rejectReason
    });
  };

  const filteredConsultants = consultants.filter(consultant => {
    // Status filter
    if (filterStatus === 'pending' && consultant.verified_professional) return false;
    if (filterStatus === 'approved' && !consultant.verified_professional) return false;
    if (filterStatus === 'unverified' && consultant.verified_professional) return false;

    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const matchesSearch = 
        consultant.full_name?.toLowerCase().includes(search) ||
        consultant.title?.toLowerCase().includes(search) ||
        consultant.created_by?.toLowerCase().includes(search) ||
        consultant.expertise?.some(e => e.toLowerCase().includes(search));
      
      if (!matchesSearch) return false;
    }

    return true;
  });

  const pendingCount = consultants.filter(c => !c.verified_professional).length;
  const approvedCount = consultants.filter(c => c.verified_professional).length;

  if (user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <Card className="max-w-md border-4 border-red-300">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">This page is only accessible to administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-16 h-16 text-purple-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.15, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl"
              >
                <CheckCircle className="w-10 h-10 text-white" />
              </motion.div>
              <div>
                <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  🛡️ Consultant Review Center
                </h1>
                <p className="text-gray-600">Review and verify consultant applications</p>
              </div>
            </div>

            {/* Debug Info */}
            <Card className="bg-blue-50 border-2 border-blue-300">
              <CardContent className="p-3">
                <p className="text-xs text-blue-900">
                  🔍 Debug: {consultants.length} total records in DB
                </p>
                {error && (
                  <p className="text-xs text-red-600 mt-1">
                    ❌ Error: {error.message}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats Cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="border-4 border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Clock className="w-12 h-12 text-amber-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-amber-900">{pendingCount}</p>
                  <p className="text-sm text-gray-600">Pending Review</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="border-4 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
                <CardContent className="p-6 text-center">
                  <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-green-900">{approvedCount}</p>
                  <p className="text-sm text-gray-600">Approved</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <Card className="border-4 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg">
                <CardContent className="p-6 text-center">
                  <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-2" />
                  <p className="text-3xl font-bold text-purple-900">{consultants.length}</p>
                  <p className="text-sm text-gray-600">Total Applications</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <Card className="border-2 border-purple-300 shadow-lg">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name, email, or expertise..."
                    className="pl-10 border-2 border-purple-200"
                  />
                </div>

                {/* Status Filter */}
                <div className="flex gap-2">
                  {[
                    { value: 'all', label: 'All', color: 'purple' },
                    { value: 'pending', label: 'Pending', color: 'amber' },
                    { value: 'approved', label: 'Approved', color: 'green' }
                  ].map(filter => (
                    <Button
                      key={filter.value}
                      onClick={() => setFilterStatus(filter.value)}
                      variant={filterStatus === filter.value ? 'default' : 'outline'}
                      size="sm"
                      className={filterStatus === filter.value 
                        ? `bg-${filter.color}-600 hover:bg-${filter.color}-700 shadow-md`
                        : `border-2 border-${filter.color}-300 hover:bg-${filter.color}-50`
                      }
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Applications List */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* List Panel */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Filter className="w-6 h-6 text-purple-600" />
              Applications ({filteredConsultants.length})
            </h2>

            {consultants.length === 0 ? (
              <Card className="border-4 border-dashed border-purple-300 shadow-xl">
                <CardContent className="p-12 text-center">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <FileText className="w-20 h-20 text-purple-300 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-gray-700 mb-2">
                    No Applications Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    No consultant applications have been submitted. Check back later or invite experts to join!
                  </p>
                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-blue-900">
                      💡 <strong>Tip:</strong> Share the consultant application link to recruit experts to your platform
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : filteredConsultants.length === 0 ? (
              <Card className="border-2 border-dashed border-gray-300">
                <CardContent className="p-12 text-center">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No applications match your filters</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredConsultants.map((consultant, idx) => (
                  <motion.div
                    key={consultant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    whileHover={{ scale: 1.02, x: 5 }}
                  >
                    <Card
                      className={`cursor-pointer border-4 transition-all shadow-lg hover:shadow-xl ${
                        selectedConsultant?.id === consultant.id
                          ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50'
                          : consultant.verified_professional
                            ? 'border-green-300 bg-green-50/50'
                            : 'border-amber-300 bg-amber-50/50'
                      }`}
                      onClick={() => setSelectedConsultant(consultant)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          {consultant.profile_picture_url ? (
                            <img
                              src={consultant.profile_picture_url}
                              alt={consultant.full_name}
                              className="w-16 h-16 rounded-full border-4 border-purple-300 object-cover shadow-lg"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center border-4 border-purple-300 shadow-lg">
                              <User className="w-8 h-8 text-white" />
                            </div>
                          )}

                          <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 text-lg truncate">
                              {consultant.full_name}
                            </h3>
                            <p className="text-sm text-gray-600 truncate">{consultant.title}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {consultant.verified_professional ? (
                                <Badge className="bg-green-500 text-white">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Approved
                                </Badge>
                              ) : (
                                <Badge className="bg-amber-500 text-white animate-pulse">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                              {consultant.consultation_rate && (
                                <Badge variant="outline" className="border-green-300 text-green-700">
                                  ${consultant.consultation_rate}/hr
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:sticky lg:top-6 h-fit">
            <AnimatePresence mode="wait">
              {!selectedConsultant ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="border-4 border-dashed border-purple-300 shadow-xl">
                    <CardContent className="p-16 text-center">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <FileText className="w-20 h-20 text-purple-300 mx-auto mb-4" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-700 mb-2">
                        Select an Application
                      </h3>
                      <p className="text-gray-500">
                        Click on an application to view details and take action
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key={selectedConsultant.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="border-4 border-purple-400 shadow-2xl bg-gradient-to-br from-white to-purple-50">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      <div className="flex items-start gap-4">
                        {selectedConsultant.profile_picture_url ? (
                          <img
                            src={selectedConsultant.profile_picture_url}
                            alt={selectedConsultant.full_name}
                            className="w-20 h-20 rounded-full border-4 border-white shadow-xl object-cover"
                          />
                        ) : (
                          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-xl">
                            <User className="w-10 h-10 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-2xl mb-1">{selectedConsultant.full_name}</CardTitle>
                          <CardDescription className="text-white/90 text-base">
                            {selectedConsultant.title}
                          </CardDescription>
                          <div className="flex items-center gap-2 mt-2">
                            <Mail className="w-4 h-4" />
                            <span className="text-sm">{selectedConsultant.created_by}</span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                      {/* Status Badge */}
                      <div className="flex justify-center">
                        {selectedConsultant.verified_professional ? (
                          <Badge className="bg-green-500 text-white text-base px-4 py-2 shadow-lg">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            Verified Professional
                            {selectedConsultant.verification_date && (
                              <span className="ml-2 text-xs">
                                • {new Date(selectedConsultant.verification_date).toLocaleDateString()}
                              </span>
                            )}
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500 text-white text-base px-4 py-2 shadow-lg animate-pulse">
                            <Clock className="w-5 h-5 mr-2" />
                            Pending Verification
                          </Badge>
                        )}
                      </div>

                      {/* Application Details */}
                      <div className="space-y-4">
                        {/* Bio */}
                        <div className="bg-white/80 p-4 rounded-xl border-2 border-purple-200">
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            Professional Bio
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {selectedConsultant.bio || 'No bio provided'}
                          </p>
                        </div>

                        {/* Expertise */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Award className="w-4 h-4 text-purple-600" />
                            Areas of Expertise
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedConsultant.expertise?.map((skill, idx) => (
                              <Badge key={idx} className="bg-purple-100 text-purple-800 border-2 border-purple-300">
                                {skill}
                              </Badge>
                            )) || <p className="text-sm text-gray-500">None listed</p>}
                          </div>
                        </div>

                        {/* Experience & Rate */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                            <p className="text-xs text-gray-600 mb-1">Experience</p>
                            <p className="text-2xl font-bold text-blue-900">
                              {selectedConsultant.years_of_experience || 0}
                              <span className="text-sm ml-1">years</span>
                            </p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                            <p className="text-xs text-gray-600 mb-1">Rate</p>
                            <p className="text-2xl font-bold text-green-900">
                              ${selectedConsultant.consultation_rate || 0}
                              <span className="text-sm ml-1">/hr</span>
                            </p>
                          </div>
                        </div>

                        {/* Media & Links */}
                        <div>
                          <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-purple-600" />
                            Media & Links
                          </h4>
                          <div className="space-y-2">
                            {selectedConsultant.video_introduction_url && (
                              <a href={selectedConsultant.video_introduction_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                                <Video className="w-4 h-4" />
                                Video Introduction
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {selectedConsultant.portfolio_url && (
                              <a href={selectedConsultant.portfolio_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                                <Globe className="w-4 h-4" />
                                Portfolio
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {selectedConsultant.linkedin_url && (
                              <a href={selectedConsultant.linkedin_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                                <Globe className="w-4 h-4" />
                                LinkedIn Profile
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {selectedConsultant.website_url && (
                              <a href={selectedConsultant.website_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
                                <Globe className="w-4 h-4" />
                                Website
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {!selectedConsultant.video_introduction_url && !selectedConsultant.portfolio_url && !selectedConsultant.linkedin_url && !selectedConsultant.website_url && (
                              <p className="text-sm text-gray-500">No links provided</p>
                            )}
                          </div>
                        </div>

                        {/* Application Date */}
                        <div className="bg-gray-50 p-3 rounded-lg border-2 border-gray-200">
                          <p className="text-xs text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Applied: {new Date(selectedConsultant.created_date).toLocaleDateString()} at {new Date(selectedConsultant.created_date).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {!selectedConsultant.verified_professional && (
                        <div className="space-y-4 pt-6 border-t-2 border-gray-200">
                          <h4 className="font-bold text-gray-900">Review Decision</h4>
                          
                          {/* Approve */}
                          <Button
                            onClick={() => handleApprove(selectedConsultant)}
                            disabled={approveMutation.isLoading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl py-6 text-lg"
                          >
                            {approveMutation.isLoading ? (
                              <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Approving...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Approve & Notify
                              </>
                            )}
                          </Button>

                          {/* Reject */}
                          <div className="space-y-2">
                            <Textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Reason for rejection (will be sent to applicant)..."
                              className="h-24 border-2 border-red-300 focus:border-red-500"
                            />
                            <Button
                              onClick={() => handleReject(selectedConsultant)}
                              disabled={rejectMutation.isLoading || !rejectReason.trim()}
                              variant="outline"
                              className="w-full border-2 border-red-400 text-red-700 hover:bg-red-50 py-4"
                            >
                              {rejectMutation.isLoading ? (
                                <>
                                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                  Rejecting...
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-5 h-5 mr-2" />
                                  Reject & Notify
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}

                      {selectedConsultant.verified_professional && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-300 text-center">
                          <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                          <p className="font-bold text-green-900 text-lg">Already Verified</p>
                          <p className="text-sm text-gray-600 mt-1">
                            This consultant is approved and accepting clients
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
