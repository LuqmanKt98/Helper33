
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, User, Star,
  CheckCircle, AlertCircle, TrendingUp, Eye,
  MessageSquare, Calendar, Settings, Sparkles, // Added Sparkles
  Clock, CalendarCheck // New icons from outline
} from 'lucide-react';
import SEO from '@/components/SEO';
import ProfileEditor from '@/components/practitioners/ProfileEditor';
import { Textarea } from '@/components/ui/textarea';
import toast from 'react-hot-toast'; // Assuming react-hot-toast is used for notifications
import AppointmentManager from '@/components/practitioners/AppointmentManager';
import AvailabilityManager from '@/components/practitioners/AvailabilityManager';
import AppointmentChat from '@/components/practitioners/AppointmentChat';
import PractitionerSettings from '@/components/practitioners/PractitionerSettings'; // New import
import ServiceOptimizer from '@/components/practitioners/ServiceOptimizer'; // New import
import SessionNotesGenerator from '@/components/practitioners/SessionNotesGenerator'; // New import
import BookingCalendar from '@/components/practitioners/BookingCalendar'; // New import

export default function PractitionerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [responseText, setResponseText] = useState({});
  const [selectedAppointmentForNotes, setSelectedAppointmentForNotes] = useState(null); // New state

  // Removed showRemovalDialog and removalReason states, as they will be handled by PractitionerSettings
  // const [showRemovalDialog, setShowRemovalDialog] = useState(false);
  // const [removalReason, setRemovalReason] = useState('');

  const queryClient = useQueryClient(); // Initialize useQueryClient

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['practitionerProfile', user?.email],
    queryFn: async () => {
      const profiles = await base44.entities.PractitionerProfile.filter({ created_by: user.email });
      return profiles[0];
    },
    enabled: !!user
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['practitionerReviews', profile?.id],
    queryFn: () => base44.entities.PractitionerReview.filter({ practitioner_id: profile.id }),
    enabled: !!profile,
    initialData: []
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ['practitionerAppointments', profile?.id],
    queryFn: () => base44.entities.Appointment.filter({ practitioner_id: profile.id }),
    enabled: !!profile,
    initialData: []
  });

  const handleRespondToReview = async (reviewId, review) => {
    if (!responseText[reviewId]?.trim()) {
      toast.error('Please enter a response');
      return;
    }

    try {
      await base44.entities.PractitionerReview.update(reviewId, {
        practitioner_response: responseText[reviewId],
        response_date: new Date().toISOString()
      });

      // Send notification to reviewer
      if (profile && review && review.created_by) {
        await base44.entities.Notification.create({
          user_email: review.created_by,
          title: '💬 Practitioner Responded to Your Review',
          message: `${profile.full_name} has responded to your review.`,
          type: 'review_response',
          entity_type: 'PractitionerReview',
          entity_id: reviewId,
          is_read: false
        });
      }

      queryClient.invalidateQueries(['practitionerReviews']);
      setResponseText(prev => ({ ...prev, [reviewId]: '' }));
      toast.success('Response added! 💬');
    } catch (error) {
      console.error('Error adding response:', error);
      toast.error('Failed to add response');
    }
  };

  // Removed handleRequestRemoval as it will be handled by PractitionerSettings
  /*
  const handleRequestRemoval = async () => {
    if (!removalReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }

    if (!profile || !profile.id || !profile.full_name || !profile.contact_email) {
      toast.error('Profile information missing for removal request.');
      return;
    }

    try {
      await base44.entities.PractitionerRemovalRequest.create({
        practitioner_id: profile.id,
        practitioner_name: profile.full_name,
        practitioner_email: profile.contact_email,
        reason: removalReason
      });

      toast.success('Removal request submitted. Admin will review shortly.');
      setShowRemovalDialog(false);
      setRemovalReason('');
    } catch (error) {
      console.error('Error submitting removal request:', error);
      toast.error('Failed to submit request');
    }
  };
  */

  const handleApplyOptimizations = (optimizations) => {
    // This will be called from ServiceOptimizer to apply suggestions to ProfileEditor
    setActiveTab('profile');
    // The ProfileEditor will need to accept these as props or we store in state
    // For now, this just changes the tab.
    console.log("Optimizations to apply:", optimizations);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-600">Please log in to access your dashboard</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return (
    <>
      <SEO
        title="Practitioner Dashboard | Helper33"
        description="Manage your practitioner profile and view testimonials"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-3xl font-bold text-gray-800">Practitioner Dashboard</h1>
              {profile?.status && (
                <Badge className={
                  profile.status === 'approved' ? 'bg-green-100 text-green-700' :
                  profile.status === 'pending_review' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }>
                  {profile.status === 'approved' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                   <AlertCircle className="w-3 h-3 mr-1" />}
                  {profile.status.replace('_', ' ')}
                </Badge>
              )}
            </div>
            <p className="text-gray-600">Welcome back, {user.full_name || user.email}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="bg-blue-50 border-2 border-blue-300">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-gray-700">
                    <p className="font-semibold mb-1">Directory Listing Information</p>
                    <p>Your profile is listed as a resource for individuals seeking licensed practitioners. Helper33 provides this directory free of charge and does not facilitate bookings, payments, or clinical services. All inquiries and appointments are handled directly between you and potential clients.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/90 backdrop-blur-sm border-2 border-purple-300 shadow-lg grid grid-cols-4 lg:grid-cols-8 gap-1">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span className="hidden sm:inline">Appointments</span>
              </TabsTrigger>
              <TabsTrigger value="availability" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline">Availability</span>
              </TabsTrigger>
              <TabsTrigger value="booking" className="flex items-center gap-2">
                <CalendarCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Booking View</span>
              </TabsTrigger>
              <TabsTrigger value="messaging" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Messages</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Reviews</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <StatCard
                  icon={Eye}
                  label="Profile Views"
                  value="Coming Soon"
                  color="blue"
                  index={0}
                />
                <StatCard
                  icon={Star}
                  label="Average Rating"
                  value={avgRating > 0 ? avgRating.toFixed(1) : 'N/A'}
                  color="amber"
                  index={1}
                />
                <StatCard
                  icon={TrendingUp}
                  label="Total Reviews"
                  value={reviews.length}
                  color="green"
                  index={2}
                />
              </div>

              <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500" />
                    Recent Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-3">
                      {reviews.slice(0, 5).map((review, idx) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            {[1, 2, 3, 4, 5].map(n => (
                              <Star
                                key={n}
                                className={`w-3 h-3 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                              />
                            ))}
                          </div>
                          {review.review_text && (
                            <p className="text-sm text-gray-700 line-clamp-2">{review.review_text}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">- {review.reviewer_name}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No reviews yet</p>
                  )}
                </CardContent>
              </Card>

              {profile && profile.status !== 'approved' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card className="bg-yellow-50 border-2 border-yellow-300">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-800 mb-2">Profile Status: {profile.status}</h3>
                          <p className="text-sm text-gray-700 mb-4">
                            {profile.status === 'pending_review'
                              ? 'Your profile is currently under review. You will be notified once it has been approved and listed in our directory.'
                              : 'Please complete your profile to be listed in our practitioner directory.'}
                          </p>
                          <Button
                            onClick={() => setActiveTab('profile')}
                            variant="outline"
                            className="border-2 border-yellow-400"
                          >
                            Complete Profile
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="appointments">
              {profile ? (
                <div className="space-y-6">
                  <AppointmentManager practitionerId={profile.id} />
                  
                  {/* Session Notes Generator */}
                  {appointments.filter(a => a.status === 'completed').length > 0 && (
                    <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 p-6">
                      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                        AI Session Notes Assistant
                      </h3>
                      <p className="text-gray-600 mb-4">Select a completed appointment to generate session notes.</p>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {appointments
                          .filter(a => a.status === 'completed')
                          .slice(0, 6)
                          .map(apt => (
                          <Button
                            key={apt.id}
                            variant={selectedAppointmentForNotes?.id === apt.id ? 'default' : 'outline'}
                            onClick={() => setSelectedAppointmentForNotes(apt)}
                            className={`h-auto p-4 border-2 justify-start text-left ${selectedAppointmentForNotes?.id === apt.id ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'border-purple-300 hover:bg-purple-50'}`}
                          >
                            <div className="flex flex-col items-start">
                              <p className="font-semibold">{apt.client_name}</p>
                              <p className="text-xs text-gray-600">
                                {new Date(apt.appointment_date).toLocaleDateString()} at {new Date(apt.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </Button>
                        ))}
                      </div>
                      
                      {selectedAppointmentForNotes && (
                        <SessionNotesGenerator 
                          appointment={selectedAppointmentForNotes}
                        />
                      )}
                    </Card>
                  )}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No profile found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="availability">
              {profile ? (
                <AvailabilityManager practitionerId={profile.id} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No profile found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="booking">
              {profile ? (
                <BookingCalendar practitionerId={profile.id} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No profile found to manage booking calendar.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="messaging">
              {profile ? (
                <AppointmentChat practitioner={profile} isPractitioner={true} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No profile found</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="profile">
              {profile ? (
                <div className="space-y-6">
                  <ServiceOptimizer 
                    profile={profile}
                    onApplySuggestions={handleApplyOptimizations}
                  />
                  <ProfileEditor profile={profile} />
                </div>
              ) : (
                <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600 mb-4">You don't have a practitioner profile yet.</p>
                    <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                      Create Profile
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="reviews">
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200">
                <CardHeader>
                  <CardTitle>Client Reviews & Testimonials</CardTitle>
                </CardHeader>
                <CardContent>
                  {reviews.length > 0 ? (
                    <div className="space-y-4">
                      {reviews.map((review, idx) => (
                        <motion.div
                          key={review.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-semibold text-gray-800">{review.reviewer_name}</p>
                              <div className="flex items-center gap-1 mt-1">
                                {[1, 2, 3, 4, 5].map(n => (
                                  <Star
                                    key={n}
                                    className={`w-4 h-4 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                            </div>
                            {review.verified_client && (
                              <Badge className="bg-green-100 text-green-700">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          {review.review_text && (
                            <p className="text-gray-700 text-sm leading-relaxed mb-3">{review.review_text}</p>
                          )}
                          <p className="text-xs text-gray-500 mb-3">
                            {new Date(review.created_date).toLocaleDateString()}
                          </p>

                          {review.practitioner_response ? (
                            <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                              <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                                <MessageSquare className="w-3 h-3" />
                                Your Response:
                              </p>
                              <p className="text-sm text-gray-700">{review.practitioner_response}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(review.response_date).toLocaleDateString()}
                              </p>
                            </div>
                          ) : (
                            <div className="mt-3 space-y-2">
                              <Textarea
                                value={responseText[review.id] || ''}
                                onChange={(e) => setResponseText(prev => ({ ...prev, [review.id]: e.target.value }))}
                                placeholder="Respond to this review..."
                                rows={3}
                                className="border-2 border-purple-300 text-sm"
                              />
                              <Button
                                onClick={() => handleRespondToReview(review.id, review)}
                                size="sm"
                                className="bg-gradient-to-r from-purple-600 to-pink-600"
                              >
                                <MessageSquare className="w-3 h-3 mr-2" />
                                Post Response
                              </Button>
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No reviews yet</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              {profile ? (
                <PractitionerSettings profile={profile} />
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-600">No profile found to manage settings.</p>
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

function StatCard({ icon: Icon, label, value, color, index }) {
  const colorClasses = {
    blue: 'from-blue-500 to-cyan-500',
    amber: 'from-amber-500 to-orange-500',
    green: 'from-green-500 to-emerald-500'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
