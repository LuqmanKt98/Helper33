import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Send,
  DollarSign,
  Clock,
  Calendar,
  User,
  CheckCircle,
  Loader2,
  MessageSquare,
  Star
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

export default function ClientRequestDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const requestId = urlParams.get('requestId');
  
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerData, setOfferData] = useState({
    proposed_rate: '',
    proposed_duration_minutes: 60,
    cover_message: '',
    why_im_best_fit: '',
    relevant_experience: '',
    proposed_approach: ''
  });

  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: request, isLoading } = useQuery({
    queryKey: ['clientRequest', requestId],
    queryFn: async () => {
      const requests = await base44.entities.ClientRequest.filter({ id: requestId });
      
      // Increment view count
      if (requests[0]) {
        await base44.entities.ClientRequest.update(requestId, {
          view_count: (requests[0].view_count || 0) + 1
        });
      }
      
      return requests[0];
    },
    enabled: !!requestId
  });

  const { data: consultantProfile } = useQuery({
    queryKey: ['myConsultantProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.ConsultantProfile.filter({
        created_by: user?.email
      });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  const { data: offers = [] } = useQuery({
    queryKey: ['requestOffers', requestId],
    queryFn: async () => {
      const data = await base44.entities.ConsultantOffer.filter({
        request_id: requestId
      }, '-created_date');
      return data || [];
    },
    enabled: !!requestId,
    refetchInterval: 10000
  });

  const { data: myOffer } = useQuery({
    queryKey: ['myOffer', requestId],
    queryFn: async () => {
      const data = await base44.entities.ConsultantOffer.filter({
        request_id: requestId,
        created_by: user?.email
      });
      return data[0] || null;
    },
    enabled: !!requestId && !!user
  });

  const submitOfferMutation = useMutation({
    mutationFn: async (data) => {
      const offerPayload = {
        ...data,
        request_id: requestId,
        consultant_id: consultantProfile.id,
        consultant_name: consultantProfile.full_name,
        consultant_title: consultantProfile.title,
        consultant_avatar: consultantProfile.profile_picture_url,
        consultant_rating: consultantProfile.average_rating,
        offer_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      };
      
      const offer = await base44.entities.ConsultantOffer.create(offerPayload);
      
      // Update request offer count
      await base44.entities.ClientRequest.update(requestId, {
        offer_count: (request.offer_count || 0) + 1
      });

      // Send notification email to client
      await base44.integrations.Core.SendEmail({
        to: request.client_email,
        subject: `🎯 New Offer for Your Request: ${request.title}`,
        body: `
Hello ${request.client_name},

Great news! ${consultantProfile.full_name} has submitted an offer for your consultation request.

Request: ${request.title}
Consultant: ${consultantProfile.full_name}
Proposed Rate: $${data.proposed_rate}/hour

View the offer and respond: ${window.location.origin}${createPageUrl('MyConsultationRequests')}

Best regards,
Helper33 Team
        `
      });

      return offer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['requestOffers']);
      queryClient.invalidateQueries(['myOffer']);
      toast.success('✅ Offer submitted successfully!');
      setShowOfferForm(false);
    },
    onError: (error) => {
      console.error('Offer submission error:', error);
      toast.error('Failed to submit offer');
    }
  });

  const handleSubmitOffer = () => {
    if (!offerData.cover_message || !offerData.proposed_rate) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (parseFloat(offerData.proposed_rate) <= 0) {
      toast.error('Please enter a valid rate');
      return;
    }

    const submitData = {
      ...offerData,
      proposed_rate: parseFloat(offerData.proposed_rate),
      proposed_duration_minutes: parseInt(offerData.proposed_duration_minutes)
    };

    submitOfferMutation.mutate(submitData);
  };

  const isMyRequest = request?.created_by === user?.email;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Request not found</p>
            <Link to={createPageUrl('BrowseClientRequests')}>
              <Button>Back to Requests</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const urgencyColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800 animate-pulse'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link to={createPageUrl(isMyRequest ? 'MyConsultationRequests' : 'BrowseClientRequests')}>
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Request Details */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-4 border-purple-400 shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <CardTitle className="text-2xl mb-2">{request.title}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={`${urgencyColors[request.urgency]} border-2`}>
                      {request.urgency}
                    </Badge>
                    <Badge className="bg-white/20 text-white">
                      {request.category.replace('_', ' ')}
                    </Badge>
                    <Badge className="bg-white/20 text-white">
                      {request.offer_count || 0} offers
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                  {/* Description */}
                  <div>
                    <h3 className="font-bold text-gray-900 mb-2">📝 Description</h3>
                    <p className="text-gray-700 leading-relaxed bg-white/60 p-4 rounded-lg border-2 border-gray-200">
                      {request.description}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {request.budget_range?.min && request.budget_range?.max && (
                      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                        <DollarSign className="w-5 h-5 text-green-600 mb-2" />
                        <p className="text-xs text-gray-600">Budget Range</p>
                        <p className="text-lg font-bold text-green-900">
                          ${request.budget_range.min} - ${request.budget_range.max}/hr
                        </p>
                        {request.budget_range.flexible && (
                          <Badge className="mt-2 bg-green-500 text-white text-xs">Flexible</Badge>
                        )}
                      </div>
                    )}

                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                      <Clock className="w-5 h-5 text-blue-600 mb-2" />
                      <p className="text-xs text-gray-600">Duration</p>
                      <p className="text-lg font-bold text-blue-900">
                        {request.preferred_duration_minutes} minutes
                      </p>
                    </div>

                    {request.timeline && (
                      <div className="bg-amber-50 p-4 rounded-lg border-2 border-amber-200">
                        <Calendar className="w-5 h-5 text-amber-600 mb-2" />
                        <p className="text-xs text-gray-600">Timeline</p>
                        <p className="text-sm font-bold text-amber-900">{request.timeline}</p>
                      </div>
                    )}

                    <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
                      <p className="text-xs text-gray-600">Meeting Type</p>
                      <p className="text-sm font-bold text-purple-900">
                        {request.preferred_meeting_type === 'virtual' && '💻 Virtual'}
                        {request.preferred_meeting_type === 'phone' && '📞 Phone'}
                        {request.preferred_meeting_type === 'in_person' && '🤝 In Person'}
                        {request.preferred_meeting_type === 'flexible' && '🔄 Flexible'}
                      </p>
                    </div>
                  </div>

                  {/* Required Expertise */}
                  {request.required_expertise && request.required_expertise.length > 0 && (
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">🎯 Required Expertise</h3>
                      <div className="flex flex-wrap gap-2">
                        {request.required_expertise.map((skill, idx) => (
                          <Badge key={idx} className="bg-blue-100 text-blue-800 border-2 border-blue-300">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Offers Section - Only visible to request owner */}
            {isMyRequest && offers.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="border-4 border-green-400 shadow-xl">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="w-6 h-6" />
                      Consultant Offers ({offers.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {offers.map((offer, idx) => (
                      <motion.div
                        key={offer.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                      >
                        <Card className="border-2 border-purple-300 hover:shadow-lg transition-all">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4 mb-3">
                              {offer.consultant_avatar ? (
                                <img
                                  src={offer.consultant_avatar}
                                  alt={offer.consultant_name}
                                  className="w-16 h-16 rounded-full border-2 border-purple-300"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                                  <User className="w-8 h-8 text-white" />
                                </div>
                              )}
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900">{offer.consultant_name}</h4>
                                <p className="text-sm text-gray-600">{offer.consultant_title}</p>
                                {offer.consultant_rating > 0 && (
                                  <div className="flex items-center gap-1 mt-1">
                                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                    <span className="text-sm font-semibold">{offer.consultant_rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">
                                  ${offer.proposed_rate}/hr
                                </p>
                                <p className="text-xs text-gray-500">{offer.proposed_duration_minutes} min</p>
                              </div>
                            </div>

                            <p className="text-sm text-gray-700 mb-3 bg-purple-50 p-3 rounded-lg">
                              {offer.cover_message}
                            </p>

                            <Link to={createPageUrl(`ConsultantProfile?consultantId=${offer.consultant_id}`)}>
                              <Button variant="outline" className="w-full border-2 border-purple-300">
                                View Full Profile & Accept
                              </Button>
                            </Link>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submit Offer - Only for consultants who haven't offered */}
            {!isMyRequest && consultantProfile && !myOffer && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card className="border-4 border-green-400 shadow-xl sticky top-6">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                    <CardTitle className="text-lg">Submit Your Offer</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Your Rate ($/hour) *
                      </label>
                      <Input
                        type="number"
                        value={offerData.proposed_rate}
                        onChange={(e) => setOfferData(prev => ({ ...prev, proposed_rate: e.target.value }))}
                        placeholder={consultantProfile.consultation_rate?.toString() || "150"}
                        className="border-2 border-green-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Cover Message *
                      </label>
                      <Textarea
                        value={offerData.cover_message}
                        onChange={(e) => setOfferData(prev => ({ ...prev, cover_message: e.target.value }))}
                        placeholder="Introduce yourself and explain why you're a great fit..."
                        className="h-32 border-2 border-green-300"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">
                        Why You're the Best Fit
                      </label>
                      <Textarea
                        value={offerData.why_im_best_fit}
                        onChange={(e) => setOfferData(prev => ({ ...prev, why_im_best_fit: e.target.value }))}
                        placeholder="What makes you uniquely qualified for this?"
                        className="h-24 border-2 border-green-300"
                      />
                    </div>

                    <Button
                      onClick={handleSubmitOffer}
                      disabled={submitOfferMutation.isLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl py-6 text-lg"
                    >
                      {submitOfferMutation.isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Submit Offer
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Your Offer Status */}
            {myOffer && (
              <Card className="border-4 border-blue-400 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Your Offer
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
                      <p className="text-xs text-gray-600">Your Rate</p>
                      <p className="text-2xl font-bold text-green-900">
                        ${myOffer.proposed_rate}/hr
                      </p>
                    </div>
                    <Badge className={`${
                      myOffer.status === 'accepted' ? 'bg-green-500' :
                      myOffer.status === 'rejected' ? 'bg-red-500' :
                      'bg-amber-500'
                    } text-white w-full justify-center py-2`}>
                      Status: {myOffer.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Client Info */}
            {!request.is_anonymous && (
              <Card className="border-2 border-purple-300 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-lg">Posted By</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {request.client_avatar ? (
                      <img
                        src={request.client_avatar}
                        alt={request.client_name}
                        className="w-12 h-12 rounded-full border-2 border-purple-300"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{request.client_name}</p>
                      <p className="text-xs text-gray-500">
                        Posted {new Date(request.created_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}