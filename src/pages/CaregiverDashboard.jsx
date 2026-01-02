import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  HeartHandshake, Calendar, DollarSign, Settings, CheckCircle, Clock, Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CaregiverDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: profile } = useQuery({
    queryKey: ['caregiverProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.CaregiverProfile.filter({ created_by: user?.email });
      return profiles[0];
    },
    enabled: !!user
  });

  const { data: bookings = [] } = useQuery({
    queryKey: ['caregiverBookings'],
    queryFn: () => base44.entities.Booking.filter({ caregiver_id: profile?.id }),
    enabled: !!profile,
    initialData: []
  });

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
      </div>
    );
  }

  const stats = {
    totalBookings: bookings.length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    upcomingBookings: bookings.filter(b => b.status === 'confirmed').length,
    totalEarnings: bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (b.total_cost || 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-teal-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-teal-600 rounded-2xl p-6 text-white shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {profile.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt="Profile" className="w-20 h-20 rounded-full border-4 border-white" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
                  <HeartHandshake className="w-10 h-10" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold">{profile.full_name}</h1>
                <p className="text-white/80">{profile.services?.join(', ')}</p>
                <Badge className={`mt-2 ${
                  profile.status === 'active' ? 'bg-green-500' : 
                  profile.status === 'pending_admin_review' ? 'bg-yellow-500' : 'bg-gray-500'
                } text-white`}>
                  {profile.status}
                </Badge>
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
          <StatCard icon={Calendar} label="Total Bookings" value={stats.totalBookings} color="from-blue-500 to-cyan-500" />
          <StatCard icon={CheckCircle} label="Completed" value={stats.completedBookings} color="from-green-500 to-emerald-500" />
          <StatCard icon={Clock} label="Upcoming" value={stats.upcomingBookings} color="from-purple-500 to-pink-500" />
          <StatCard icon={DollarSign} label="Total Earnings" value={`$${stats.totalEarnings}`} color="from-amber-500 to-orange-500" />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Your recent bookings and activity will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {bookings.length === 0 ? (
                  <p className="text-gray-600">No bookings yet</p>
                ) : (
                  <div className="space-y-3">
                    {bookings.map(booking => (
                      <div key={booking.id} className="p-4 border-2 border-green-200 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">Booking #{booking.id.slice(0, 8)}</p>
                            <p className="text-sm text-gray-600">{new Date(booking.start_time).toLocaleDateString()}</p>
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

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Services Offered:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {profile.services?.map((service, i) => (
                      <Badge key={i} className="bg-green-100 text-green-700">{service}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hourly Rate:</p>
                  <p className="text-2xl font-bold text-green-700">${profile.hourly_rate}/hr</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Experience:</p>
                  <p className="text-lg font-semibold">{profile.experience_years} years</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Caregiver Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Manage your caregiver-specific settings here</p>
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