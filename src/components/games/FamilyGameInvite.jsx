
import React, { useState, useEffect } from "react";
import { GameInvitation, FamilyMember, GameSession } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Users,
  Send,
  Heart,
  Calendar,
  Clock,
  Trophy,
  Star,
  Mail,
  MessageSquare,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const moodOptions = [
  { value: 1, label: "Very Sad", icon: "😢", color: "text-red-500" },
  { value: 2, label: "Sad", icon: "😞", color: "text-orange-500" },
  { value: 3, label: "Okay", icon: "😐", color: "text-yellow-500" },
  { value: 4, label: "Good", icon: "😊", color: "text-green-500" },
  { value: 5, label: "Great", icon: "😄", color: "text-blue-500" },
];

const gameTypes = [
  { value: "memory", label: "Focus Memory", description: "Memory matching game" },
  { value: "color-match", label: "Color Match", description: "Fast color matching" },
  { value: "sequence", label: "Sequence Memory", description: "Simon-style memory game" },
  { value: "fidget", label: "Fidget Bubbles", description: "Relaxing bubble popping" },
  { value: "breathing", label: "Breathing Exercise", description: "Guided breathing together" }
];

export default function FamilyGameInvite({ onInviteSent, onSessionStart }) {
  const [familyMembers, setFamilyMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [currentMood, setCurrentMood] = useState(3);
  const [newInvite, setNewInvite] = useState({
    game_type: "",
    to_member_name: "",
    message: "",
    scheduled_time: ""
  });
  const [sentInviteInfo, setSentInviteInfo] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [members, invites] = await Promise.all([
        FamilyMember.list('name'),
        GameInvitation.list('-created_date')
      ]);
      
      setFamilyMembers(members);
      setInvitations(invites);
    } catch (error) {
      console.log("Error loading family game data", error);
    }
  };

  const sendInvitation = async (e) => {
    e.preventDefault();
    if (!newInvite.game_type || !newInvite.to_member_name) return;

    try {
      const invitation = await GameInvitation.create({
        ...newInvite,
        from_member_name: "You" // In a real app, this would be the current user's name
      });

      setInvitations([invitation, ...invitations]);
      
      const invitedMember = familyMembers.find(m => m.name === newInvite.to_member_name);

      // Prepare for manual notification
      setSentInviteInfo({ ...newInvite, member: invitedMember });
      
      setNewInvite({
        game_type: "",
        to_member_name: "",
        message: "",
        scheduled_time: ""
      });
      setShowInviteForm(false);
      
      if (onInviteSent) onInviteSent();
    } catch (error) {
      console.log("Error sending invitation", error);
    }
  };

  const notifyByEmail = () => {
    if (!sentInviteInfo || !sentInviteInfo.member || !sentInviteInfo.member.email) return;

    const gameLabel = gameTypes.find(g => g.value === sentInviteInfo.game_type)?.label;
    const subject = "You're invited to play a game on DobryLife!";
    let body = `Hi ${sentInviteInfo.member.name},\n\nYou've been invited to play a game of ${gameLabel} on DobryLife.`;
    if (sentInviteInfo.message) {
      body += `\n\nHere's a personal message for you:\n"${sentInviteInfo.message}"`;
    }
    body += `\n\nOpen the DobryLife app to accept the invitation and play together.\n\nWith love,\nYour Family`;

    const mailtoUrl = `mailto:${sentInviteInfo.member.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  const notifyByText = () => {
    if (!sentInviteInfo || !sentInviteInfo.member || !sentInviteInfo.member.phone_number) return;
    
    const gameLabel = gameTypes.find(g => g.value === sentInviteInfo.game_type)?.label;
    let message = `Hi ${sentInviteInfo.member.name}! You're invited to play a game of ${gameLabel} on DobryLife.`;
    if (sentInviteInfo.message) {
      message += ` Message: "${sentInviteInfo.message}"`;
    }
    
    const smsUrl = `sms:${sentInviteInfo.member.phone_number}?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, '_blank');
  };

  const acceptInvitation = async (inviteId) => {
    try {
      const invite = invitations.find(i => i.id === inviteId);
      if (!invite) return;

      // Create game session
      const session = await GameSession.create({
        game_type: invite.game_type,
        participants: [invite.from_member_name, invite.to_member_name],
        moods_before: {
          [invite.to_member_name]: currentMood
        }
      });

      // Update invitation status
      await GameInvitation.update(inviteId, {
        status: "accepted",
        session_id: session.id
      });

      loadData();
      
      if (onSessionStart) onSessionStart(session);
    } catch (error) {
      console.log("Error accepting invitation", error);
    }
  };

  const declineInvitation = async (inviteId) => {
    try {
      await GameInvitation.update(inviteId, { status: "declined" });
      loadData();
    } catch (error) {
      console.log("Error declining invitation", error);
    }
  };

  const pendingInvites = invitations.filter(i => i.status === "pending");
  const recentInvites = invitations.filter(i => i.status !== "pending").slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Mood Check-in */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            How are you feeling right now?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            {moodOptions.map((mood) => (
              <button
                key={mood.value}
                onClick={() => setCurrentMood(mood.value)}
                className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                  currentMood === mood.value 
                    ? 'bg-blue-100 border-2 border-blue-500 transform scale-110' 
                    : 'hover:bg-gray-100'
                }`}
              >
                <span className="text-2xl mb-1">{mood.icon}</span>
                <span className={`text-xs font-medium ${mood.color}`}>
                  {mood.label}
                </span>
              </button>
            ))}
          </div>
          <p className="text-sm text-gray-600 text-center">
            Your mood helps us understand how games might help you feel better
          </p>
        </CardContent>
      </Card>

      {/* Invite Form */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Family Game Time</h3>
        <Button
          onClick={() => {
            setShowInviteForm(!showInviteForm);
            setSentInviteInfo(null); // Clear sent info when opening form
          }}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Users className="w-4 h-4 mr-2" />
          Invite Family
        </Button>
      </div>

      <AnimatePresence>
        {showInviteForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Send Game Invitation</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={sendInvitation} className="space-y-4">
                  <div>
                    <Label htmlFor="game">Choose a Game</Label>
                    <Select
                      value={newInvite.game_type}
                      onValueChange={(value) => setNewInvite({...newInvite, game_type: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a game" />
                      </SelectTrigger>
                      <SelectContent>
                        {gameTypes.map((game) => (
                          <SelectItem key={game.value} value={game.value}>
                            <div>
                              <div className="font-medium">{game.label}</div>
                              <div className="text-sm text-gray-500">{game.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="member">Invite Family Member</Label>
                    <Select
                      value={newInvite.to_member_name}
                      onValueChange={(value) => setNewInvite({...newInvite, to_member_name: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose family member" />
                      </SelectTrigger>
                      <SelectContent>
                        {familyMembers.map((member) => (
                          <SelectItem key={member.id} value={member.name}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="message">Personal Message</Label>
                    <Textarea
                      id="message"
                      value={newInvite.message}
                      onChange={(e) => setNewInvite({...newInvite, message: e.target.value})}
                      placeholder="Hey! Want to play a game together? It might help us both feel better..."
                      className="h-20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="schedule">Schedule for Later (Optional)</Label>
                    <Input
                      id="schedule"
                      type="datetime-local"
                      value={newInvite.scheduled_time}
                      onChange={(e) => setNewInvite({...newInvite, scheduled_time: e.target.value})}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">
                      <Send className="w-4 h-4 mr-2" />
                      Send Invitation
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowInviteForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-Invite Notification */}
      {sentInviteInfo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="bg-green-50 border-green-200 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle className="w-5 h-5" />
                Invitation Sent to {sentInviteInfo.to_member_name}!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700 mb-4">
                You can now notify {sentInviteInfo.to_member_name} via email or text message.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  onClick={notifyByEmail} 
                  disabled={!sentInviteInfo.member?.email}
                  className="flex-1 bg-sky-600 hover:bg-sky-700"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Notify by Email
                </Button>
                <Button 
                  onClick={notifyByText} 
                  disabled={!sentInviteInfo.member?.phone_number}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Notify by Text
                </Button>
              </div>
              <div className="mt-2 text-xs text-yellow-600 space-y-1">
                {!sentInviteInfo.member?.email && (
                  <p>No email on file to send an email notification.</p>
                )}
                {!sentInviteInfo.member?.phone_number && (
                  <p>No phone number on file to send a text.</p>
                )}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setSentInviteInfo(null)}
                className="w-full mt-4"
              >
                Done
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Pending Invitations */}
      {pendingInvites.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Game Invitations ({pendingInvites.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingInvites.map((invite) => (
                <motion.div
                  key={invite.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium text-gray-800">
                        {invite.from_member_name} invited you to play{' '}
                        <span className="text-blue-600">
                          {gameTypes.find(g => g.value === invite.game_type)?.label}
                        </span>
                      </h4>
                      {invite.message && (
                        <p className="text-sm text-gray-600 mt-1">"{invite.message}"</p>
                      )}
                      {invite.scheduled_time && (
                        <p className="text-sm text-blue-600 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Scheduled for {new Date(invite.scheduled_time).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Badge className="bg-blue-100 text-blue-800">
                      {new Date(invite.created_date).toLocaleDateString()}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => acceptInvitation(invite.id)}
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Trophy className="w-3 h-3 mr-1" />
                      Accept & Play
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => declineInvitation(invite.id)}
                    >
                      Decline
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {recentInvites.length > 0 && (
        <Card className="bg-white/60 backdrop-blur-sm border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Recent Game Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentInvites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                  <div>
                    <span className="text-sm">
                      {invite.status === 'completed' ? '🎮' : invite.status === 'accepted' ? '✅' : '❌'}{' '}
                      {gameTypes.find(g => g.value === invite.game_type)?.label} with {invite.to_member_name}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {invite.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
