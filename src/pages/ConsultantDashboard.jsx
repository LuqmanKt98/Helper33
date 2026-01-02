import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  Brain, Calendar, Settings, MessageSquare, CheckCircle, Loader2, Target, BarChart3
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ConsultantDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['consultantProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.ConsultantProfile.filter({ created_by: user?.email });
      return profiles[0];
    },
    enabled: !!user
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['consultantBookings'],
    queryFn: () => base44.entities.ConsultationBooking.filter({ consultant_id: profile?.id }),
    enabled: !!profile,
    initialData: []
  });

  const { data: requests = [] } = useQuery({
    queryKey: ['clientRequests'],
    queryFn: () => base44.entities.ClientRequest.list('-created_date'),
    initialData: []
  });

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  const stats = {
    totalConsultations: bookings.length,
    completedConsultations: bookings.filter(b => b.status === 'completed').length,
    upcomingConsultations: bookings.filter(b => b.status === 'confirmed').length,
    openRequests: requests.filter(r => r.status === 'open').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {profile.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt="Profile" className="w-20 h-20 rounded-full border-4 border-white" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <Brain className="w-10 h-10" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                <p className="text-white/80">{profile.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-white/20 text-white">
                    {profile.expertise?.slice(0, 2).join(', ')}
                  </Badge>
                  {profile.verified_professional && (
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Link to={createPageUrl('AccountManager')}>
              <Button variant="outline" className="bg-white/10 border-white text-white hover:bg-white/20">
                <Settings className="w-4 h-4 mr-2" />
                Manage Account
              </Button>
            </Link>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-4">
          <StatCard icon={Calendar} label="Total Consultations" value={stats.totalConsultations} color="from-blue-500 to-cyan-500" />
          <StatCard icon={CheckCircle} label="Completed" value={stats.completedConsultations} color="from-green-500 to-emerald-500" />
          <StatCard icon={Target} label="Upcoming" value={stats.upcomingConsultations} color="from-purple-500 to-pink-500" />
          <StatCard icon={MessageSquare} label="Open Requests" value={stats.openRequests} color="from-amber-500 to-orange-500" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="requests">Client Requests</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome Back!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  You have {stats.upcomingConsultations} upcoming consultation{stats.upcomingConsultations !== 1 ? 's' : ''} 
                  {stats.openRequests > 0 && ` and ${stats.openRequests} new client request${stats.openRequests !== 1 ? 's' : ''}`}
                </p>
                <div className="flex gap-3">
                  <Link to={createPageUrl('BrowseClientRequests')}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Browse Requests
                    </Button>
                  </Link>
                  <Link to={createPageUrl('ConsultantProfile?id=' + profile.id)}>
                    <Button variant="outline">
                      View Public Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Consultations</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-gray-600">No consultations scheduled yet</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.map(booking => (
                      <div key={booking.id} className="p-4 border-2 border-blue-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{booking.client_name}</p>
                            <p className="text-sm text-gray-600">{booking.consultation_type}</p>
                            <p className="text-xs text-gray-500">{booking.booking_date} at {booking.booking_time}</p>
                          </div>
                          <Badge className={
                            booking.status === 'completed' ? 'bg-green-500' :
                            booking.status === 'confirmed' ? 'bg-blue-500' : 'bg-gray-500'
                          }>
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Client Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <Link to={createPageUrl('BrowseClientRequests')}>
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Browse All Requests
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Expertise Areas:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.expertise?.map((exp, i) => (
                      <Badge key={i} className="bg-blue-100 text-blue-700">{exp}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Consultation Rate:</p>
                  <p className="text-2xl font-bold text-blue-700">${profile.consultation_rate}/hr</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Experience:</p>
                  <p className="text-lg font-semibold">{profile.years_of_experience} years</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Profile Completion:</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full"
                        style={{ width: `${profile.profile_completion || 0}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold">{profile.profile_completion || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Performance Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Analytics and insights coming soon</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -5 }}
      className="p-6 bg-white rounded-xl border-2 border-gray-200 shadow-lg"
    >
      <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </motion.div>
  );
}