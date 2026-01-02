import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import {
  Users,
  Calendar,
  MessageSquare,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Send,
  Loader2,
  Plus,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function CoachDashboard() {
  const [selectedClient, setSelectedClient] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me()
  });

  // Get all connections where user is the coach
  const { data: connections = [], isLoading: connectionsLoading } = useQuery({
    queryKey: ['coachConnections'],
    queryFn: async () => {
      const allConnections = await base44.entities.CoachConnection.filter({
        coach_email: user?.email,
        relationship_status: 'active'
      });
      return allConnections;
    },
    enabled: !!user?.email
  });

  // Get all clients' goals
  const { data: clientGoals = [] } = useQuery({
    queryKey: ['clientGoals', connections],
    queryFn: async () => {
      if (connections.length === 0) return [];
      
      const clientEmails = connections.map(c => c.client_email || c.created_by);
      const allGoals = [];
      
      for (const email of clientEmails) {
        try {
          const goals = await base44.entities.CoachingGoal.filter({
            created_by: email,
            shared_with_coach: true,
            coach_email: user?.email
          });
          allGoals.push(...goals);
        } catch (error) {
          console.log('Error fetching goals for client:', email);
        }
      }
      
      return allGoals;
    },
    enabled: connections.length > 0 && !!user?.email
  });

  // Get recent sessions
  const { data: recentSessions = [] } = useQuery({
    queryKey: ['recentSessions', connections],
    queryFn: async () => {
      if (connections.length === 0) return [];
      
      const clientEmails = connections.map(c => c.client_email || c.created_by);
      const allSessions = [];
      
      for (const email of clientEmails) {
        try {
          const sessions = await base44.entities.CoachingSession.filter({
            created_by: email,
            shared_with_coach: true
          }, '-created_date', 10);
          allSessions.push(...sessions);
        } catch (error) {
          console.log('Error fetching sessions for client:', email);
        }
      }
      
      return allSessions.sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
    },
    enabled: connections.length > 0
  });

  // Get scheduled sessions
  const { data: scheduledSessions = [] } = useQuery({
    queryKey: ['scheduledSessions'],
    queryFn: () => base44.entities.CoachSessionSchedule.filter({
      coach_email: user?.email
    }, '-scheduled_date'),
    enabled: !!user?.email
  });

  // Get unread messages
  const { data: unreadMessages = [] } = useQuery({
    queryKey: ['coachMessages'],
    queryFn: async () => {
      const allMessages = await base44.entities.CoachClientMessage.filter({
        is_read: false
      });
      return allMessages.filter(m => m.sender_type === 'client');
    }
  });

  // Calculate stats
  const totalClients = connections.length;
  const activeGoals = clientGoals.filter(g => g.status === 'active').length;
  const pendingCheckIns = clientGoals.filter(g => 
    g.next_checkin_date && isPast(new Date(g.next_checkin_date))
  ).length;
  const upcomingSessions = scheduledSessions.filter(s => 
    !isPast(new Date(s.scheduled_date)) && s.status !== 'cancelled'
  ).length;

  // Get client overview data
  const clientOverviews = connections.map(connection => {
    const clientEmail = connection.client_email || connection.created_by;
    const goals = clientGoals.filter(g => g.created_by === clientEmail);
    const sessions = recentSessions.filter(s => s.created_by === clientEmail);
    const messages = unreadMessages.filter(m => m.sender_email === clientEmail);
    
    const pendingCheckIns = goals.filter(g => 
      g.next_checkin_date && isPast(new Date(g.next_checkin_date))
    );
    
    const recentProgress = sessions.slice(0, 3);
    
    return {
      connection,
      clientEmail,
      clientName: connection.client_name || clientEmail,
      goals,
      activeGoals: goals.filter(g => g.status === 'active').length,
      completedGoals: goals.filter(g => g.status === 'completed').length,
      recentSessions: recentProgress,
      lastActivity: sessions[0]?.created_date || connection.created_date,
      pendingCheckIns: pendingCheckIns.length,
      unreadMessages: messages.length,
      needsAttention: pendingCheckIns.length > 0 || messages.length > 0
    };
  });

  if (connectionsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your coaching dashboard...</p>
        </div>
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Card className="text-center py-12">
            <CardContent>
              <Users className="w-16 h-16 text-purple-300 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Your Coach Dashboard
              </h2>
              <p className="text-gray-600 mb-6">
                You don't have any connected clients yet. Clients can add you as their coach from their coaching progress page.
              </p>
              <Button asChild>
                <Link to={createPageUrl('Dashboard')}>
                  Back to Dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Coach Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your clients and track their progress
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900 mb-1">Total Clients</p>
                  <p className="text-3xl font-bold text-blue-600">{totalClients}</p>
                </div>
                <Users className="w-10 h-10 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900 mb-1">Active Goals</p>
                  <p className="text-3xl font-bold text-purple-600">{activeGoals}</p>
                </div>
                <Target className="w-10 h-10 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-900 mb-1">Needs Attention</p>
                  <p className="text-3xl font-bold text-orange-600">{pendingCheckIns}</p>
                </div>
                <AlertCircle className="w-10 h-10 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-900 mb-1">Upcoming Sessions</p>
                  <p className="text-3xl font-bold text-emerald-600">{upcomingSessions}</p>
                </div>
                <Calendar className="w-10 h-10 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-white/80 p-1 mb-6">
            <TabsTrigger value="overview">Clients Overview</TabsTrigger>
            <TabsTrigger value="sessions">Scheduled Sessions</TabsTrigger>
            <TabsTrigger value="messages">Messages ({unreadMessages.length})</TabsTrigger>
          </TabsList>

          {/* Clients Overview */}
          <TabsContent value="overview">
            <div className="grid gap-6">
              {clientOverviews
                .sort((a, b) => (b.needsAttention ? 1 : 0) - (a.needsAttention ? 1 : 0))
                .map((client, idx) => (
                  <ClientCard
                    key={client.clientEmail}
                    client={client}
                    onMessage={() => {
                      setSelectedClient(client);
                      setShowMessageModal(true);
                    }}
                    onSchedule={() => {
                      setSelectedClient(client);
                      setShowScheduleModal(true);
                    }}
                    delay={idx * 0.1}
                  />
                ))}
            </div>
          </TabsContent>

          {/* Scheduled Sessions */}
          <TabsContent value="sessions">
            <SessionsView 
              sessions={scheduledSessions}
              onScheduleNew={() => setShowScheduleModal(true)}
            />
          </TabsContent>

          {/* Messages */}
          <TabsContent value="messages">
            <MessagesView messages={unreadMessages} />
          </TabsContent>
        </Tabs>

        {/* Message Modal */}
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => {
            setShowMessageModal(false);
            setSelectedClient(null);
          }}
          client={selectedClient}
        />

        {/* Schedule Modal */}
        <ScheduleModal
          isOpen={showScheduleModal}
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedClient(null);
          }}
          client={selectedClient}
          connections={connections}
        />
      </div>
    </div>
  );
}

function ClientCard({ client, onMessage, onSchedule, delay }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className={`hover:shadow-lg transition-all ${
        client.needsAttention ? 'ring-2 ring-orange-400' : ''
      }`}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                  {client.clientName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <CardTitle className="text-lg">{client.clientName}</CardTitle>
                  <p className="text-sm text-gray-500">
                    Last active {formatDistanceToNow(new Date(client.lastActivity), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs">
                  <Target className="w-3 h-3 mr-1" />
                  {client.activeGoals} Active Goals
                </Badge>
                <Badge variant="outline" className="text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  {client.completedGoals} Completed
                </Badge>
                {client.pendingCheckIns > 0 && (
                  <Badge className="bg-orange-100 text-orange-700 text-xs">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {client.pendingCheckIns} Pending Check-ins
                  </Badge>
                )}
                {client.unreadMessages > 0 && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    <MessageSquare className="w-3 h-3 mr-1" />
                    {client.unreadMessages} New Messages
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={onMessage}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </Button>
              <Button
                onClick={onSchedule}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Calendar className="w-4 h-4" />
                Schedule
              </Button>
            </div>
          </div>
        </CardHeader>

        {client.recentSessions.length > 0 && (
          <CardContent>
            <Button
              onClick={() => setExpanded(!expanded)}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              {expanded ? 'Hide' : 'Show'} Recent Activity
            </Button>

            <AnimatePresence>
              {expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-3"
                >
                  {client.recentSessions.map(session => (
                    <div key={session.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-sm text-gray-900">{session.session_title}</p>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(session.created_date), 'MMM d')}
                        </Badge>
                      </div>
                      {session.ai_summary && (
                        <p className="text-xs text-gray-600 line-clamp-2">{session.ai_summary}</p>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        )}
      </Card>
    </motion.div>
  );
}

function SessionsView({ sessions, onScheduleNew }) {
  const upcomingSessions = sessions.filter(s => !isPast(new Date(s.scheduled_date)) && s.status !== 'cancelled');
  const pastSessions = sessions.filter(s => isPast(new Date(s.scheduled_date)) || s.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900">Upcoming Sessions</h3>
        <Button onClick={onScheduleNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Schedule New
        </Button>
      </div>

      {upcomingSessions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No upcoming sessions scheduled</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {upcomingSessions.map(session => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}

      {pastSessions.length > 0 && (
        <>
          <h3 className="text-lg font-bold text-gray-900 mt-8">Past Sessions</h3>
          <div className="space-y-4">
            {pastSessions.slice(0, 5).map(session => (
              <SessionCard key={session.id} session={session} isPast />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SessionCard({ session, isPast = false }) {
  return (
    <Card className={isPast ? 'opacity-75' : ''}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-bold text-gray-900">{session.session_title}</h4>
              {session.status === 'pending' && !session.client_confirmed && (
                <Badge className="bg-yellow-100 text-yellow-700 text-xs">
                  Awaiting Confirmation
                </Badge>
              )}
              {session.status === 'confirmed' && (
                <Badge className="bg-green-100 text-green-700 text-xs">
                  Confirmed
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {format(new Date(session.scheduled_date), 'MMM d, yyyy • h:mm a')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {session.duration_minutes} min
              </div>
            </div>

            {session.session_description && (
              <p className="text-sm text-gray-600 mb-2">{session.session_description}</p>
            )}

            {session.meeting_link && (
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                  <Video className="w-4 h-4" />
                  Join Meeting
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MessagesView({ messages }) {
  if (messages.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No new messages</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {messages.map(message => (
        <Card key={message.id}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="font-semibold text-gray-900">{message.sender_name}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(message.created_date), { addSuffix: true })}
                </p>
              </div>
              <Badge className="bg-blue-100 text-blue-700">New</Badge>
            </div>
            {message.subject && (
              <p className="font-medium text-gray-700 mb-1">{message.subject}</p>
            )}
            <p className="text-gray-600 whitespace-pre-wrap">{message.content}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function MessageModal({ isOpen, onClose, client }) {
  const [messageData, setMessageData] = useState({
    subject: '',
    content: '',
    message_type: 'direct_message'
  });

  const queryClient = useQueryClient();

  const sendMessageMutation = useMutation({
    mutationFn: async (data) => {
      if (!client) throw new Error('No client selected');
      
      await base44.entities.CoachClientMessage.create({
        connection_id: client.connection.id,
        sender_email: client.connection.coach_email,
        sender_name: client.connection.coach_name || 'Your Coach',
        sender_type: 'coach',
        ...data
      });

      // Send email notification
      await base44.integrations.Core.SendEmail({
        from_name: 'DobryLife Coaching',
        to: client.clientEmail,
        subject: data.subject || 'Message from your coach',
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Message from your coach</h2>
            <p><strong>Subject:</strong> ${data.subject || 'N/A'}</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              ${data.content.replace(/\n/g, '<br>')}
            </div>
            <a href="${window.location.origin}/CoachingProgress" style="display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
              View in App
            </a>
          </div>
        `
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coachMessages']);
      toast.success('Message sent! 💜');
      setMessageData({ subject: '', content: '', message_type: 'direct_message' });
      onClose();
    }
  });

  if (!isOpen || !client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Send Message to {client.clientName}</DialogTitle>
          <DialogDescription>
            Send a message or feedback to your client
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Subject (Optional)</label>
            <Input
              value={messageData.subject}
              onChange={(e) => setMessageData({ ...messageData, subject: e.target.value })}
              placeholder="e.g., Great progress this week!"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Message *</label>
            <Textarea
              value={messageData.content}
              onChange={(e) => setMessageData({ ...messageData, content: e.target.value })}
              placeholder="Write your message here..."
              rows={6}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => sendMessageMutation.mutate(messageData)}
              disabled={!messageData.content || sendMessageMutation.isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {sendMessageMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </>
              )}
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ScheduleModal({ isOpen, onClose, client, connections }) {
  const [sessionData, setSessionData] = useState({
    session_title: '',
    session_description: '',
    scheduled_date: '',
    scheduled_time: '',
    duration_minutes: 60,
    meeting_link: ''
  });
  const [selectedClientEmail, setSelectedClientEmail] = useState(client?.clientEmail || '');

  const queryClient = useQueryClient();

  const scheduleSessionMutation = useMutation({
    mutationFn: async (data) => {
      const selectedConnection = connections.find(c => 
        (c.client_email || c.created_by) === selectedClientEmail
      );
      
      if (!selectedConnection) throw new Error('No connection found');

      const scheduledDateTime = `${data.scheduled_date}T${data.scheduled_time}`;
      
      await base44.entities.CoachSessionSchedule.create({
        connection_id: selectedConnection.id,
        coach_email: selectedConnection.coach_email,
        client_email: selectedClientEmail,
        session_title: data.session_title,
        session_description: data.session_description,
        scheduled_date: scheduledDateTime,
        duration_minutes: data.duration_minutes,
        meeting_link: data.meeting_link,
        status: 'pending'
      });

      // Send email notification
      await base44.integrations.Core.SendEmail({
        from_name: 'DobryLife Coaching',
        to: selectedClientEmail,
        subject: `Session Scheduled: ${data.session_title}`,
        body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Your coach has scheduled a session</h2>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3>${data.session_title}</h3>
              <p><strong>Date & Time:</strong> ${format(new Date(scheduledDateTime), 'MMMM d, yyyy • h:mm a')}</p>
              <p><strong>Duration:</strong> ${data.duration_minutes} minutes</p>
              ${data.session_description ? `<p><strong>Description:</strong> ${data.session_description}</p>` : ''}
              ${data.meeting_link ? `<p><strong>Meeting Link:</strong> <a href="${data.meeting_link}">${data.meeting_link}</a></p>` : ''}
            </div>
            <a href="${window.location.origin}/CoachingProgress" style="display: inline-block; background: #7C3AED; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
              View & Confirm
            </a>
          </div>
        `
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['scheduledSessions']);
      toast.success('Session scheduled! 📅');
      setSessionData({
        session_title: '',
        session_description: '',
        scheduled_date: '',
        scheduled_time: '',
        duration_minutes: 60,
        meeting_link: ''
      });
      onClose();
    }
  });

  // Update selected client email when client prop changes
  React.useEffect(() => {
    if (client?.clientEmail) {
      setSelectedClientEmail(client.clientEmail);
    }
  }, [client]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Schedule Coaching Session</DialogTitle>
          <DialogDescription>
            Schedule a session with your client
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!client && (
            <div>
              <label className="text-sm font-medium mb-1 block">Select Client *</label>
              <select
                value={selectedClientEmail}
                onChange={(e) => setSelectedClientEmail(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Choose a client...</option>
                {connections.map(conn => (
                  <option key={conn.id} value={conn.client_email || conn.created_by}>
                    {conn.client_name || conn.client_email || conn.created_by}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-1 block">Session Title *</label>
            <Input
              value={sessionData.session_title}
              onChange={(e) => setSessionData({ ...sessionData, session_title: e.target.value })}
              placeholder="e.g., Weekly Check-in"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Description</label>
            <Textarea
              value={sessionData.session_description}
              onChange={(e) => setSessionData({ ...sessionData, session_description: e.target.value })}
              placeholder="What will you cover in this session?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Date *</label>
              <Input
                type="date"
                value={sessionData.scheduled_date}
                onChange={(e) => setSessionData({ ...sessionData, scheduled_date: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Time *</label>
              <Input
                type="time"
                value={sessionData.scheduled_time}
                onChange={(e) => setSessionData({ ...sessionData, scheduled_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Duration (minutes)</label>
            <Input
              type="number"
              value={sessionData.duration_minutes}
              onChange={(e) => setSessionData({ ...sessionData, duration_minutes: parseInt(e.target.value) })}
              min={15}
              step={15}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Meeting Link (Zoom, Google Meet, etc.)</label>
            <Input
              value={sessionData.meeting_link}
              onChange={(e) => setSessionData({ ...sessionData, meeting_link: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => scheduleSessionMutation.mutate(sessionData)}
              disabled={
                !sessionData.session_title || 
                !sessionData.scheduled_date || 
                !sessionData.scheduled_time ||
                !selectedClientEmail ||
                scheduleSessionMutation.isLoading
              }
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              {scheduleSessionMutation.isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Session
                </>
              )}
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}