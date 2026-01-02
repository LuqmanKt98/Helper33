
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  MentorProfile,
  FamilyMentorConnection,
  User
} from '@/entities/all';
import {
  GraduationCap,
  Users,
  Bell,
  CheckCircle,
  XCircle,
  Clock,
  Heart,
  Sparkles,
  Eye,
  Award
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useNotifications as useSounds } from '../SoundManager';

import MentorWelcomeBanner from './MentorWelcomeBanner';

export default function MentorDashboard() {
  const [user, setUser] = useState(null);
  const [mentorProfile, setMentorProfile] = useState(null);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [activeConnections, setActiveConnections] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [responseMessage, setResponseMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { playSound } = useSounds();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      // Find mentor profile for this user
      const profiles = await MentorProfile.filter({ created_by: userData.email });
      if (profiles.length > 0) {
        const profile = profiles[0];
        setMentorProfile(profile);

        // Load all connections for this mentor
        const allConnections = await FamilyMentorConnection.filter({ mentor_id: profile.id });
        setConnections(allConnections);
        
        setPendingRequests(allConnections.filter(c => c.status === 'pending'));
        setActiveConnections(allConnections.filter(c => c.status === 'approved'));
      }
    } catch (error) {
      console.error("Error loading mentor data:", error);
    }
  };

  const openRequestDialog = (request) => {
    setSelectedRequest(request);
    setResponseMessage(`Thank you ${request.family_name} for inviting me to join your DobryLife space. I'm excited to support your family's learning journey!`);
    setShowRequestDialog(true);
  };

  const respondToRequest = async (accept) => {
    if (!selectedRequest) return;

    setIsLoading(true);
    try {
      const newStatus = accept ? 'approved' : 'declined';
      
      await FamilyMentorConnection.update(selectedRequest.id, {
        status: newStatus,
        approved_at: accept ? new Date().toISOString() : undefined,
        approved_by: mentorProfile.full_name,
        connection_notes: responseMessage
      });

      playSound('success');
      
      if (accept) {
        alert(`✅ Connection approved! Welcome, ${selectedRequest.family_name}! You can now view student progress and provide support.`);
      } else {
        alert(`Connection request declined. The family has been notified.`);
      }

      setShowRequestDialog(false);
      setSelectedRequest(null);
      setResponseMessage('');
      loadData();
    } catch (error) {
      console.error("Error responding to request:", error);
      alert("Failed to respond to connection request. Please try again.");
      playSound('error');
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessLevelDescription = (level) => {
    switch(level) {
      case 'view_only': return 'View student progress';
      case 'feedback': return 'View progress & leave feedback';
      case 'full_collaboration': return 'Full access to collaborate';
      default: return level;
    }
  };

  if (!mentorProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <GraduationCap className="w-16 h-16 mx-auto mb-4 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Create Your Mentor Profile</h2>
            <p className="text-gray-600 mb-4">
              Complete your mentor onboarding to start connecting with families.
            </p>
            <Button className="bg-indigo-600 hover:bg-indigo-700">
              Start Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Banner for New Mentors */}
        <MentorWelcomeBanner />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <GraduationCap className="w-8 h-8 text-indigo-600" />
                Mentor Dashboard
              </h1>
              <p className="text-gray-600 mt-1">Support families through compassionate guidance</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-green-100 text-green-800 px-3 py-1">
                <CheckCircle className="w-4 h-4 mr-1" />
                Verified Mentor
              </Badge>
              {pendingRequests.length > 0 && (
                <Badge className="bg-amber-100 text-amber-800 px-3 py-1 animate-pulse">
                  <Bell className="w-4 h-4 mr-1" />
                  {pendingRequests.length} New Request{pendingRequests.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Connections</p>
                    <p className="text-3xl font-bold text-indigo-600">{activeConnections.length}</p>
                  </div>
                  <Users className="w-10 h-10 text-indigo-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending Requests</p>
                    <p className="text-3xl font-bold text-amber-600">{pendingRequests.length}</p>
                  </div>
                  <Clock className="w-10 h-10 text-amber-600 opacity-50" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/70 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Students</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {activeConnections.reduce((sum, conn) => sum + (conn.student_access?.length || 0), 0)}
                    </p>
                  </div>
                  <Award className="w-10 h-10 text-purple-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="requests" className="gap-2">
              <Bell className="w-4 h-4" />
              Connection Requests ({pendingRequests.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="gap-2">
              <Users className="w-4 h-4" />
              Active Connections ({activeConnections.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Requests */}
          <TabsContent value="requests">
            {pendingRequests.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Bell className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                  <p className="text-gray-600">You'll be notified when families send connection requests</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {pendingRequests.map(request => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className="border-2 border-amber-200 bg-amber-50/50">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{request.family_name}</CardTitle>
                            <p className="text-sm text-gray-600 mt-1">
                              Requested {new Date(request.created_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge className="bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Request Message */}
                        {request.request_message && (
                          <div className="bg-white/80 rounded-lg p-3 border border-gray-200">
                            <p className="text-sm text-gray-700 italic">"{request.request_message}"</p>
                          </div>
                        )}

                        {/* Access Details */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">Requested Access:</p>
                          <Badge variant="outline" className="text-xs">
                            {getAccessLevelDescription(request.access_level)}
                          </Badge>
                        </div>

                        {/* Students */}
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2">
                            Students: {request.student_access?.length || 0}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setResponseMessage('');
                              setShowRequestDialog(true);
                            }}
                            className="flex-1"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                          <Button
                            onClick={() => openRequestDialog(request)}
                            className="flex-1 bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Active Connections */}
          <TabsContent value="active">
            {activeConnections.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Connections</h3>
                  <p className="text-gray-600">Accept connection requests to start supporting families</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {activeConnections.map(connection => (
                  <Card key={connection.id} className="border-green-200 bg-green-50/50">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{connection.family_name}</CardTitle>
                          <p className="text-sm text-gray-600 mt-1">
                            Connected {new Date(connection.approved_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">Access Level:</p>
                        <Badge variant="outline" className="text-xs">
                          {getAccessLevelDescription(connection.access_level)}
                        </Badge>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-1">
                          Students: {connection.student_access?.length || 0}
                        </p>
                      </div>

                      <Button variant="outline" className="w-full gap-2">
                        <Eye className="w-4 h-4" />
                        View Student Progress
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Request Response Dialog */}
      <Dialog open={showRequestDialog} onOpenChange={setShowRequestDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              Respond to Connection Request
            </DialogTitle>
            <DialogDescription>
              From {selectedRequest?.family_name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Optional Welcome Message
              </label>
              <Textarea
                value={responseMessage}
                onChange={(e) => setResponseMessage(e.target.value)}
                rows={3}
                placeholder="Add a personal message to the family..."
              />
              <p className="text-xs text-gray-500 mt-1">
                This message will be visible to the family when you accept
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <Heart className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Remember</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    All interactions are transparent to parents. Focus on positive, encouraging feedback that supports growth.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => respondToRequest(false)}
              disabled={isLoading}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Decline
            </Button>
            <Button
              onClick={() => respondToRequest(true)}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {isLoading ? 'Processing...' : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Accept & Connect
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
