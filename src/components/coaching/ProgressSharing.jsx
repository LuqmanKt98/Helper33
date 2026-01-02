
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Share2,
  UserPlus,
  Shield,
  Calendar,
  Mail,
  Loader2,
  FileText,
  Send,
  MessageSquare // Added for coach messages section
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function ProgressSharing({ coachType }) {
  const [showAddCoach, setShowAddCoach] = useState(false);
  const [newCoach, setNewCoach] = useState({
    coach_name: '',
    coach_email: '',
    coaching_type: coachType === 'grief_coach' ? 'grief_counseling' : 'life_coaching'
  });
  const [sharingPrefs, setSharingPrefs] = useState({
    share_goals: true,
    share_sessions: true,
    share_progress: true,
    share_journal_entries: false,
    auto_share: false
  });

  const queryClient = useQueryClient();

  const { data: connections = [], isLoading } = useQuery({
    queryKey: ['coachConnections'],
    queryFn: () => base44.entities.CoachConnection.list('-created_date')
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['coachingGoals', coachType],
    queryFn: () => base44.entities.CoachingGoal.filter({ coach_type: coachType })
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['coachingSessions', coachType],
    queryFn: () => base44.entities.CoachingSession.filter({ coach_type: coachType })
  });

  const addCoachMutation = useMutation({
    mutationFn: async (coachData) => {
      const verificationCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      return await base44.entities.CoachConnection.create({
        ...coachData,
        sharing_preferences: sharingPrefs,
        check_in_frequency: 'weekly',
        verification_code: verificationCode
      });
    },
    onSuccess: (newConnection) => {
      queryClient.invalidateQueries(['coachConnections']);
      setShowAddCoach(false);
      setNewCoach({ coach_name: '', coach_email: '', coaching_type: coachType === 'grief_coach' ? 'grief_counseling' : 'life_coaching' });
      toast.success('Coach added! Sending invitation...');
      sendInvitation(newConnection);
    }
  });

  const updateConnectionMutation = useMutation({
    mutationFn: ({ id, updates }) => base44.entities.CoachConnection.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries(['coachConnections']);
      toast.success('Settings updated!');
    }
  });

  const sendReportMutation = useMutation({
    mutationFn: async (connectionId) => {
      const connection = connections.find(c => c.id === connectionId);
      if (!connection) return;

      // Generate progress report
      const report = await generateProgressReport(connection);
      
      // Send via email
      await base44.integrations.Core.SendEmail({
        to: connection.coach_email,
        subject: `Progress Report from ${base44.auth.me().full_name}`,
        body: report
      });

      // Update last report sent
      await base44.entities.CoachConnection.update(connectionId, {
        last_report_sent: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['coachConnections']);
      toast.success('Report sent to your coach! 📧');
    }
  });

  const sendInvitation = async (connection) => {
    try {
      const user = await base44.auth.me();
      const inviteMessage = `
Hello ${connection.coach_name},

${user.full_name} has invited you to be their ${connection.coaching_type.replace('_', ' ')} on DobryLife.

You'll receive progress updates and check-ins based on their preferences.

Verification Code: ${connection.verification_code}

This secure connection allows you to support their journey while respecting their privacy.

Best regards,
The DobryLife Team
      `;

      await base44.integrations.Core.SendEmail({
        to: connection.coach_email,
        subject: `You've been invited as a coach on DobryLife`,
        body: inviteMessage
      });
    } catch (error) {
      console.error('Invitation error:', error);
    }
  };

  const generateProgressReport = async (connection) => {
    const user = await base44.auth.me();
    const prefs = connection.sharing_preferences;

    let report = `Progress Report for ${user.full_name}\n`;
    report += `Date: ${format(new Date(), 'MMMM d, yyyy')}\n`;
    report += `\n---\n\n`;

    if (prefs.share_goals) {
      const sharedGoals = goals.filter(g => g.shared_with_coach);
      report += `## Goals (${sharedGoals.length})\n\n`;
      sharedGoals.forEach(goal => {
        report += `### ${goal.goal_title}\n`;
        report += `Progress: ${goal.progress_percentage}%\n`;
        report += `Status: ${goal.status}\n`;
        if (goal.goal_description) {
          report += `Description: ${goal.goal_description}\n`;
        }
        report += `\n`;
      });
    }

    if (prefs.share_sessions) {
      const recentSessions = sessions.filter(s => s.shared_with_coach).slice(0, 5);
      report += `## Recent Sessions (${recentSessions.length})\n\n`;
      recentSessions.forEach(session => {
        report += `### ${session.session_title}\n`;
        report += `Date: ${format(new Date(session.created_date), 'MMM d, yyyy')}\n`;
        report += `Duration: ${session.duration_minutes} minutes\n`;
        if (session.ai_summary) {
          report += `Summary: ${session.ai_summary}\n`;
        }
        report += `\n`;
      });
    }

    return report;
  };

  const handleAddCoach = () => {
    if (!newCoach.coach_name || !newCoach.coach_email) {
      toast.error('Please fill in all required fields');
      return;
    }

    addCoachMutation.mutate(newCoach);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const activeConnections = connections.filter(c => c.relationship_status === 'active');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Share2 className="w-6 h-6 text-purple-600" />
            Share Progress
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            Securely share your journey with your human coach
          </p>
        </div>

        <Button
          onClick={() => setShowAddCoach(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Coach
        </Button>
      </div>

      {/* Privacy Notice */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-semibold mb-1">Your Privacy is Protected</p>
              <p>
                You control what you share. Your coach will only receive information you explicitly choose to share. 
                You can pause or stop sharing at any time.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connections */}
      {activeConnections.length === 0 ? (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardContent className="p-12 text-center">
            <UserPlus className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h4 className="text-xl font-bold text-gray-900 mb-2">No coaches connected</h4>
            <p className="text-gray-600 mb-6">
              Add your human coach to share progress and receive support
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {activeConnections.map((connection) => (
            <Card key={connection.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{connection.coach_name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="w-4 h-4" />
                      {connection.coach_email}
                    </CardDescription>
                    <Badge className="mt-2" variant="outline">
                      {connection.coaching_type.replace('_', ' ')}
                    </Badge>
                  </div>

                  <Button
                    onClick={() => sendReportMutation.mutate(connection.id)}
                    disabled={sendReportMutation.isLoading}
                    size="sm"
                    className="gap-2"
                  >
                    {sendReportMutation.isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Send Report
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Sharing Preferences */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold">What to Share</Label>
                  
                  {[
                    { key: 'share_goals', label: 'Goals & Milestones', icon: FileText },
                    { key: 'share_sessions', label: 'Session Summaries', icon: FileText },
                    { key: 'share_progress', label: 'Progress Updates', icon: FileText },
                    { key: 'auto_share', label: 'Automatic Sharing', icon: Send }
                  ].map(({ key, label, icon: Icon }) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">{label}</span>
                      </div>
                      <Switch
                        checked={connection.sharing_preferences?.[key]}
                        onCheckedChange={(checked) => {
                          updateConnectionMutation.mutate({
                            id: connection.id,
                            updates: {
                              sharing_preferences: {
                                ...connection.sharing_preferences,
                                [key]: checked
                              }
                            }
                          });
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Last Report */}
                {connection.last_report_sent && (
                  <div className="pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last report sent: {format(new Date(connection.last_report_sent), 'MMM d, yyyy')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Coach Messages Section */}
      {activeConnections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-600" />
              Messages from Your Coach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CoachMessagesView connections={activeConnections} />
          </CardContent>
        </Card>
      )}

      {/* Add Coach Dialog */}
      <Dialog open={showAddCoach} onOpenChange={setShowAddCoach}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Your Coach</DialogTitle>
            <DialogDescription>
              Your coach will receive an invitation to securely view your progress
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label>Coach's Name *</Label>
              <Input
                value={newCoach.coach_name}
                onChange={(e) => setNewCoach({ ...newCoach, coach_name: e.target.value })}
                placeholder="Dr. Jane Smith"
                className="mt-1"
              />
            </div>

            <div>
              <Label>Coach's Email *</Label>
              <Input
                type="email"
                value={newCoach.coach_email}
                onChange={(e) => setNewCoach({ ...newCoach, coach_email: e.target.value })}
                placeholder="coach@example.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label className="mb-3 block">What would you like to share?</Label>
              <div className="space-y-2">
                {[
                  { key: 'share_goals', label: 'Goals & Milestones' },
                  { key: 'share_sessions', label: 'Session Summaries' },
                  { key: 'share_progress', label: 'Progress Updates' }
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-700">{label}</span>
                    <Switch
                      checked={sharingPrefs[key]}
                      onCheckedChange={(checked) => setSharingPrefs({ ...sharingPrefs, [key]: checked })}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddCoach}
                disabled={addCoachMutation.isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {addCoachMutation.isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Coach
                  </>
                )}
              </Button>

              <Button
                onClick={() => setShowAddCoach(false)}
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CoachMessagesView({ connections }) {
  const { data: messages = [], isLoading } = useQuery({
    queryKey: ['coachClientMessages', connections.map(conn => conn.id)], // Include connection IDs in query key for re-fetch on connection changes
    queryFn: async () => {
      const allMessages = [];
      const fetchPromises = connections.map(async (conn) => {
        try {
          const msgs = await base44.entities.CoachClientMessage.filter({
            connection_id: conn.id,
            sender_type: 'coach'
          }, '-created_date', 10);
          allMessages.push(...msgs);
        } catch (error) {
          console.error(`Error fetching messages for connection ${conn.id}:`, error);
        }
      });
      await Promise.all(fetchPromises);
      return allMessages.sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
    },
    enabled: connections.length > 0 // Only run query if there are connections
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  if (messages.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p>No messages yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {messages.map(message => (
        <div key={message.id} className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-semibold text-gray-900">{message.sender_name}</p>
              <p className="text-xs text-gray-500">
                {format(new Date(message.created_date), 'MMM d, yyyy • h:mm a')}
              </p>
            </div>
            {message.is_read === false && ( // Check for explicit false, as undefined might mean not yet read
              <Badge className="bg-blue-500 text-white text-xs">New</Badge>
            )}
          </div>
          {message.subject && (
            <p className="font-medium text-gray-700 mb-2 text-sm">{message.subject}</p>
          )}
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>
      ))}
    </div>
  );
}
