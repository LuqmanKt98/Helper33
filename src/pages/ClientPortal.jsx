import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Calendar, MessageSquare, User, Star, AlertCircle, Heart, Bell
} from 'lucide-react';
import SEO from '@/components/SEO';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import ClientAppointments from '@/components/client/ClientAppointments';
import ClientMessages from '@/components/client/ClientMessages';
import ClientProfileEditor from '@/components/client/ClientProfileEditor';
import ClientReviews from '@/components/client/ClientReviews';
import NotificationPreferences from '@/components/client/NotificationPreferences';

export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState('appointments');
  const navigate = useNavigate();

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  // Check if user needs onboarding
  useEffect(() => {
    if (user && !user.onboarding_completed) {
      navigate(createPageUrl('ClientOnboardingPage'));
    }
  }, [user, navigate]);

  const { data: appointments = [] } = useQuery({
    queryKey: ['clientAppointments', user?.email],
    queryFn: () => base44.entities.Appointment.filter({ client_email: user.email }, '-created_date'),
    enabled: !!user,
    initialData: []
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['clientReviews', user?.email],
    queryFn: () => base44.entities.PractitionerReview.filter({ created_by: user.email }, '-created_date'),
    enabled: !!user,
    initialData: []
  });

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h2 className="font-bold text-xl mb-2">Please Log In</h2>
            <p className="text-gray-600 mb-4">You need to be logged in to access your client portal</p>
            <Button 
              onClick={() => base44.auth.redirectToLogin()}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Log In / Sign Up
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const upcomingAppointments = appointments.filter(a => 
    ['pending', 'confirmed'].includes(a.status) && 
    new Date(a.appointment_date) >= new Date()
  );

  return (
    <>
      <SEO title="My Portal | Helper33" description="Manage your appointments, messages, and profile" />
      
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <motion.div
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg"
              >
                <Heart className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">My Client Portal</h1>
                <p className="text-gray-600">Welcome back, {user.preferred_name || user.full_name || user.email}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-4 mb-6"
          >
            <StatsCard
              icon={Calendar}
              label="Upcoming Appointments"
              value={upcomingAppointments.length}
              gradient="from-blue-500 to-cyan-500"
              index={0}
            />
            <StatsCard
              icon={Star}
              label="Reviews Given"
              value={reviews.length}
              gradient="from-amber-500 to-orange-500"
              index={1}
            />
            <StatsCard
              icon={MessageSquare}
              label="Active Conversations"
              value="View All"
              gradient="from-purple-500 to-pink-500"
              index={2}
            />
          </motion.div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white/90 backdrop-blur-sm border-2 border-purple-300 shadow-md">
              <TabsTrigger value="appointments" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Appointments
              </TabsTrigger>
              <TabsTrigger value="messages" className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Messages
              </TabsTrigger>
              <TabsTrigger value="reviews" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                My Reviews
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="appointments">
              <ClientAppointments appointments={appointments} user={user} />
            </TabsContent>

            <TabsContent value="messages">
              <ClientMessages user={user} />
            </TabsContent>

            <TabsContent value="reviews">
              <ClientReviews reviews={reviews} user={user} />
            </TabsContent>

            <TabsContent value="profile">
              <ClientProfileEditor user={user} />
            </TabsContent>

            <TabsContent value="notifications">
              <NotificationPreferences user={user} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

function StatsCard({ icon: Icon, label, value, gradient, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all">
        <CardContent className="p-6">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-md`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}