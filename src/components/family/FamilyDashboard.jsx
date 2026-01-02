
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, MessageSquare, UserPlus, Calendar, ListChecks, Target, Shield, Users, Phone, Edit, Trash2, ShieldCheck, HandHeart, QrCode, CheckCircle, Clock, AlertCircle, MoreVertical, Baby, CheckSquare, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FamilyMember } from '@/entities/all';
import AddMemberForm from './AddMemberForm';
import FamilyInviteQR from './FamilyInviteQR';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const getPermissions = (member, familyCreator) => {
  if (!member) return { canSendChat: false, canStartCall: false, canManageMembers: false };
  
  const role = member.role;
  const isCreator = member.email === familyCreator;
  
  return {
    canSendChat: true, // Assuming chat is generally allowed for all members
    canStartCall: ['PlatformFounder', 'FamilyAdmin', 'ParentGuardian', 'AdultMember', 'TeenMember'].includes(role),
    canManageMembers: isCreator || ['PlatformFounder', 'FamilyAdmin', 'ParentGuardian'].includes(role),
  };
};

export default function FamilyDashboard({ members, currentUser, onInitiateVideoCall, onInitiatePhoneCall, onOpenChat, onInviteMember, onNavigate, onMemberUpdate }) {
  
  // Determine who created the family (first member or current user)
  const familyCreator = members.length > 0 ? members[0].created_by : currentUser?.email;
  const currentUserPermissions = getPermissions(currentUser, familyCreator);
  const [isAdding, setIsAdding] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showInviteQR, setShowInviteQR] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const handleEditMember = (member) => {
    setEditingMember(member);
    setIsAdding(true);
  };
  
  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    
    try {
      await FamilyMember.delete(memberToDelete.id);
      onMemberUpdate();
    } catch (error) {
      console.error('Error deleting member:', error);
    } finally {
      setMemberToDelete(null);
    }
  };

  const handleFormClose = (didUpdate) => {
    setIsAdding(false);
    setEditingMember(null);
    if (didUpdate) {
      onMemberUpdate();
    }
  };

  const getMemberStatusBadge = (member) => {
    if (member.user_id) {
      return (
        <Badge className="bg-green-100 text-green-700 border-green-200">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    }
    if (member.invitation_status === 'invited') {
      return (
        <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Invited
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-700 border-gray-200">
        <AlertCircle className="w-3 h-3 mr-1" />
        Not Joined
      </Badge>
    );
  };

  // New queries for quick actions
  const { data: todosData } = useQuery({
    queryKey: ['familyTodos'],
    queryFn: () => base44.entities.FamilyTodo.list('-created_date'),
    initialData: []
  });

  const { data: moodsData } = useQuery({
    queryKey: ['familyMoodEntries'],
    queryFn: () => base44.entities.FamilyMoodEntry.list('-created_date'),
    initialData: []
  });

  const pendingTodos = todosData?.filter(t => t.status === 'pending').length || 0;
  const todayMoods = moodsData?.filter(m => {
    const today = new Date().toISOString().split('T')[0];
    return m.entry_date === today;
  }).length || 0;

  // Placeholder values for upcomingEvents and unreadCount, as they are not defined in props or calculated here
  const upcomingEvents = 0; // In a real app, this would come from a calendar query
  const unreadCount = 0; // In a real app, this would come from a chat service

  const quickActions = [
    {
      title: "Family To-Dos",
      description: "Manage shared tasks together",
      icon: CheckSquare,
      color: "from-blue-500 to-cyan-500",
      onClick: () => onNavigate('todos'),
      badge: `${pendingTodos} pending`
    },
    {
      title: "Mood Check-ins",
      description: "See how everyone is feeling",
      icon: Heart,
      color: "from-rose-500 to-pink-500",
      onClick: () => onNavigate('moods'),
      badge: `${todayMoods}/${members?.length || 0} today`
    },
    {
      title: "Shared Calendar",
      description: "View family events and schedule",
      icon: Calendar,
      color: "from-purple-500 to-indigo-500",
      onClick: () => onNavigate('schedule'),
      badge: upcomingEvents > 0 ? `${upcomingEvents} upcoming` : 'No events'
    },
    {
      title: "Family Chat",
      description: "Message your family members",
      icon: MessageSquare,
      color: "from-green-500 to-emerald-500",
      onClick: onOpenChat,
      badge: unreadCount > 0 ? `${unreadCount} unread` : 'No new messages'
    }
  ];

  return (
    <>
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-4"
          >
            <AddMemberForm member={editingMember} onClose={handleFormClose} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Family Circle Title and Share Invite Button */}
        <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="text-primary" />
              Your Family Circle ({members.length})
            </CardTitle>
            <Button onClick={() => setShowInviteQR(true)} variant="outline">
              <QrCode className="mr-2 h-4 w-4"/> Share Invite
            </Button>
        </div>

        {/* Enhanced Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card 
                  className="cursor-pointer hover:shadow-xl transition-all group bg-white/80 backdrop-blur-sm"
                  onClick={action.onClick}
                >
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{action.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    <Badge variant="outline" className="text-xs">
                      {action.badge}
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Family Members Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, index) => {
            const memberPermissions = getPermissions(member, familyCreator);
            const isCurrentUser = member.user_id === currentUser?.id;

            return (
              <motion.div
                key={member.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                  {/* Color band at top */}
                  <div 
                    className="h-2 w-full" 
                    style={{ backgroundColor: member.color || '#3b82f6' }}
                  />
                  
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {/* Avatar with emoji */}
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg"
                          style={{ backgroundColor: `${member.color || '#3b82f6'}20` }}
                        >
                          {member.emoji || '👤'}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                            {member.name}
                            {isCurrentUser && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </h3>
                          <p className="text-sm text-gray-600">{member.role?.replace(/([A-Z])/g, ' $1').trim()}</p>
                          {member.age && (
                            <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Baby className="w-3 h-3" />
                              {member.age} years old
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {currentUserPermissions.canManageMembers && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditMember(member)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {!isCurrentUser && (
                              <DropdownMenuItem 
                                onClick={() => setMemberToDelete(member)}
                                className="text-red-600 focus:bg-red-50 focus:text-red-700"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                      <div className="flex items-center justify-between">
                        {getMemberStatusBadge(member)}
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="icon" onClick={() => onOpenChat()} title="Chat with family">
                            <MessageSquare className="h-5 w-5 text-blue-500" />
                          </Button>
                          {memberPermissions.canStartCall && member.phone_number && member.user_id && (
                            <Button variant="ghost" size="icon" onClick={() => onInitiatePhoneCall(member)} title={`Call ${member.name} by phone`}>
                              <Phone className="h-5 w-5 text-gray-600" />
                            </Button>
                          )}
                          {memberPermissions.canStartCall && member.user_id && member.user_id !== currentUser?.id && (
                            <Button variant="ghost" size="icon" onClick={() => onInitiateVideoCall(member)} title={`Video call ${member.name}`}>
                              <Video className="h-5 w-5 text-green-500" />
                            </Button>
                          )}
                          {!member.user_id && member.phone_number && (
                            <Button variant="ghost" size="icon" onClick={() => onInviteMember(member)} title={`Invite ${member.name} to the app`}>
                              <UserPlus className="h-5 w-5 text-purple-500" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {member.email && <p className="text-sm text-muted-foreground mt-0.5">Email: {member.email}</p>}
                      {member.phone_number && <p className="text-sm text-muted-foreground mt-0.5">Phone: {member.phone_number}</p>}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}

          {/* Add Member Card */}
          {currentUserPermissions.canManageMembers && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: members.length * 0.05 + 0.1 }}
            >
              <Card 
                className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-dashed border-primary/30 hover:border-primary/60 transition-all cursor-pointer h-full min-h-[250px] flex items-center justify-center"
                onClick={() => { setEditingMember(null); setIsAdding(true); }}
              >
                <CardContent className="text-center py-12">
                  <UserPlus className="w-12 h-12 text-primary mx-auto mb-3" />
                  <h3 className="font-semibold text-lg text-gray-700 mb-2">Add Family Member</h3>
                  <p className="text-sm text-gray-500">Click to add a new member to your family</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Explore Your Hub & Community sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Explore Your Hub</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => onNavigate('schedule')}>
                <Calendar className="w-6 h-6 text-primary"/>
                Schedule
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => onNavigate('chores')}>
                <ListChecks className="w-6 h-6 text-primary"/>
                Chores
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => onNavigate('expenses')}>
                <Target className="w-6 h-6 text-primary"/>
                Finances
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => onNavigate('documents')}>
                <Shield className="w-6 h-6 text-primary"/>
                Documents
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => onNavigate('access')}>
                <ShieldCheck className="w-6 h-6 text-primary"/>
                Security
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-1" onClick={() => onNavigate('connect')}>
                <HandHeart className="w-6 h-6 text-primary"/>
                Discover
              </Button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Community</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button onClick={() => onNavigate('community')}>Community Feed</Button>
              <Button variant="outline" onClick={() => onNavigate('playdates')}>Play Dates</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* QR Code Invite Modal */}
      <FamilyInviteQR 
        isOpen={showInviteQR} 
        onClose={() => setShowInviteQR(false)} 
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!memberToDelete} onOpenChange={(open) => !open && setMemberToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Family Member?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove {memberToDelete?.name} from your family? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
