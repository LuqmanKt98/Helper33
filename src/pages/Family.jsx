
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from '@tanstack/react-query';
import { Card } from "@/components/ui/card";
import {
  Users, Calendar, ListChecks, Globe, Shield, Target, ShieldCheck, HandHeart, PartyPopper, BookOpenText, Heart, CheckSquare 
} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';

// Import components
import FamilyDashboard from "@/components/family/FamilyDashboard";
import ChoreScheduler from "@/components/family/ChoreScheduler";
import DocumentHub from "@/components/family/DocumentHub";
import ExpenseTracker from "@/components/family/ExpenseTracker";
import FamilyDiscovery from "@/components/family/FamilyDiscovery";
import PlayDateManager from "@/components/family/PlayDateManager";
import CommunityFeed from "@/components/family/CommunityFeed";
import FamilySchedule from "@/components/family/FamilySchedule";
import FamilyAccessManager from "@/components/family/FamilyAccessManager";
import FamilyChat from "@/components/family/FamilyChat";
import SMSComposer from "@/components/family/SMSComposer";
import KidsProgress from "@/components/family/KidsProgress";
import KidsJournalProgress from "@/components/family/KidsJournalProgress";
import TeacherMentorView from "@/components/family/TeacherMentorView";
import FamilyTodoList from "@/components/family/FamilyTodoList"; 
import FamilyMoodTracker from "@/components/family/FamilyMoodTracker"; 

// New imports for AI components
import AIMoodInsights from '@/components/family/AIMoodInsights';
import AIActivitySuggestions from '@/components/family/AIActivitySuggestions';
import AIChoreAssistant from '@/components/family/AIChoreAssistant';

// New dedicated module imports
import CollaborativeTaskBoard from '@/components/family/CollaborativeTaskBoard';
import FamilyJournalHub from '@/components/family/FamilyJournalHub';
import SharedMemoryAlbum from '@/components/family/SharedMemoryAlbum';

import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Loader2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SEO from '@/components/SEO';
import { getSEOForPage } from '@/components/SEODefaults';

export default function Family() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSmsOpen, setIsSmsOpen] = useState(false);
  const [smsConfig, setSmsConfig] = useState({ recipient: null, prefilledMessage: '' });
  const [callConfirmation, setCallConfirmation] = useState({ isOpen: false, member: null });
  const [isPlacingCall, setIsPlacingCall] = useState(false);

  // Load user data
  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  // Lazy load data based on active tab
  const { data: members = [], refetch: refetchMembers } = useQuery({
    queryKey: ['familyMembers'],
    queryFn: () => base44.entities.FamilyMember.list('-name'),
    enabled: true, // Always load members as they're needed for permissions
    initialData: []
  });

  const { data: profile, refetch: refetchProfile } = useQuery({
    queryKey: ['familyProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.FamilyProfile.list();
      return profiles[0] || null;
    },
    enabled: activeTab === 'connect',
    initialData: null
  });

  const { data: connections = [], refetch: refetchConnections } = useQuery({
    queryKey: ['familyConnections'],
    queryFn: () => base44.entities.FamilyConnection.list(),
    enabled: activeTab === 'connect',
    initialData: []
  });

  const { data: playdates = [], refetch: refetchPlaydates } = useQuery({
    queryKey: ['playDateInvitations'],
    queryFn: () => base44.entities.PlayDateInvitation.list(),
    enabled: activeTab === 'playdates',
    initialData: []
  });

  const { data: updates = [], refetch: refetchUpdates } = useQuery({
    queryKey: ['familyUpdates'],
    queryFn: () => base44.entities.FamilyUpdate.list('-created_date'),
    enabled: activeTab === 'community',
    initialData: []
  });

  const { data: chores = [], refetch: refetchChores } = useQuery({
    queryKey: ['familyChores'],
    queryFn: () => base44.entities.Chore.list('-created_date'),
    enabled: activeTab === 'chores',
    initialData: []
  });

  const { data: events = [], refetch: refetchEvents } = useQuery({
    queryKey: ['familyEvents'],
    queryFn: () => base44.entities.FamilyEvent.list('-start_date'),
    enabled: activeTab === 'schedule',
    initialData: []
  });

  const { data: documents = [], refetch: refetchDocuments } = useQuery({
    queryKey: ['familyDocuments'],
    queryFn: () => base44.entities.FamilyDocument.list('-created_date'),
    enabled: activeTab === 'documents',
    initialData: []
  });

  const { data: budgets = [], refetch: refetchBudgets } = useQuery({
    queryKey: ['familyBudgets'],
    queryFn: () => base44.entities.FamilyBudget.list(),
    enabled: activeTab === 'expenses',
    initialData: []
  });

  const { data: expenses = [], refetch: refetchExpenses } = useQuery({
    queryKey: ['familyExpenses'],
    queryFn: () => base44.entities.FamilyExpense.list('-date'),
    enabled: activeTab === 'expenses',
    initialData: []
  });

  const { data: todos = [], refetch: refetchTodos } = useQuery({
    queryKey: ['familyTodos'],
    queryFn: () => base44.entities.FamilyTodo.list('-created_date'),
    enabled: activeTab === 'todos',
    initialData: []
  });

  const { data: moodEntries = [], refetch: refetchMoods } = useQuery({
    queryKey: ['familyMoodEntries'],
    queryFn: () => base44.entities.FamilyMoodEntry.list('-created_date'),
    enabled: activeTab === 'moods',
    initialData: []
  });

  const handleRefresh = () => {
    // Refetch data for current tab
    switch (activeTab) {
      case 'dashboard':
        refetchMembers();
        break;
      case 'todos':
        refetchTodos();
        break;
      case 'moods':
        refetchMoods();
        break;
      case 'schedule':
        refetchEvents();
        break;
      case 'chores':
        refetchChores();
        break;
      case 'expenses':
        refetchBudgets();
        refetchExpenses();
        break;
      case 'documents':
        refetchDocuments();
        break;
      case 'connect':
        refetchProfile();
        refetchConnections();
        break;
      case 'playdates':
        refetchPlaydates();
        break;
      case 'community':
        refetchUpdates();
        break;
      case 'access':
        refetchMembers();
        break;
      case 'kids':
        refetchMembers();
        break;
    }
  };
  
  const handleInitiateVideoCall = async (member) => {
    if (!member.user_id) {
        toast.error(`${member.name} has not joined the app yet and cannot be called.`);
        return;
    }
    toast.info(`Starting video call with ${member.name}...`);
    try {
        const response = await base44.functions.invoke('createDailyRoom');
        if (response.data?.url) {
            window.location.href = createPageUrl(`VideoCall?url=${encodeURIComponent(response.data.url)}`);
        } else {
            throw new Error(response.data?.error || "Failed to create video room.");
        }
    } catch (error) {
        toast.error(`Failed to start video call. ${error.message}`);
        console.error("Error initiating video call:", error);
    }
  };

  const handleInitiatePhoneCall = (member) => {
    if (!member.phone_number) {
        toast.error(`${member.name} does not have a phone number saved.`);
        return;
    }
    if (!user?.phone_number) {
        toast.info("Please add your phone number to your profile in the 'Account' page to use this feature.");
        return;
    }
    setCallConfirmation({ isOpen: true, member });
  };
  
  const confirmPhoneCall = async () => {
    if (!callConfirmation.member) return;
    
    setIsPlacingCall(true);
    try {
        const response = await base44.functions.invoke('makePhoneCall', {
            to: callConfirmation.member.phone_number,
        });

        if (response.data.success) {
            toast.success(response.data.message || "Call initiated! Your phone will ring first.");
        } else {
            throw new Error(response.data.error || "Failed to place call.");
        }

    } catch (error) {
        toast.error(error.message);
        console.error("Error making phone call:", error);
    } finally {
        setIsPlacingCall(false);
        setCallConfirmation({ isOpen: false, member: null });
    }
  };

  const handleInviteMember = (member) => {
      const appUrl = window.location.origin;
      const inviteMessage = `You've been invited to join our family on Helper33! Click here to join: ${appUrl}`;
      setSmsConfig({ recipient: member, prefilledMessage: inviteMessage });
      setIsSmsOpen(true);
  };
  
  const onSmsSent = async (member) => {
    try {
        await base44.entities.FamilyMember.update(member.id, {
            invitation_status: 'invited',
            invitation_sent_date: new Date().toISOString()
        });
        toast.success(`Invitation sent to ${member.name}`);
        refetchMembers();
    } catch (error) {
        toast.error("Failed to update invitation status.");
    }
    setIsSmsOpen(false);
  };

  // VIEWS object is adapted for Tabs component usage, renamed to VIEWS_CONFIG
  const VIEWS_CONFIG = {
      dashboard: {
          label: 'Hub',
          icon: Users,
          component: <FamilyDashboard 
              members={members} 
              currentUser={user}
              onInitiateVideoCall={handleInitiateVideoCall}
              onInitiatePhoneCall={handleInitiatePhoneCall}
              onOpenChat={() => setIsChatOpen(true)}
              onInviteMember={handleInviteMember}
              onNavigate={setActiveTab}
              onMemberUpdate={refetchMembers}
          />
      },
      collaborative: {
          label: 'Tasks',
          icon: ListChecks,
          component: <CollaborativeTaskBoard />
      },
      journal: {
          label: 'Journal',
          icon: BookOpenText,
          component: <FamilyJournalHub />
      },
      memories: {
          label: 'Memories',
          icon: Heart,
          component: <SharedMemoryAlbum />
      },
      todos: { 
          label: 'Quick List', 
          icon: CheckSquare, 
          component: <FamilyTodoList todos={todos} familyMembers={members} onUpdate={refetchTodos} />
      },
      moods: { 
          label: 'Moods', 
          icon: Heart, 
          component: (
            <div className="space-y-6">
              <FamilyMoodTracker moodEntries={moodEntries} familyMembers={members} onUpdate={refetchMoods} />
              <AIMoodInsights familyMembers={members} />
            </div>
          )
      },
      schedule: { label: 'Schedule', icon: Calendar, component: <FamilySchedule events={events} onUpdate={refetchEvents} familyMembers={members} /> },
      chores: { 
        label: 'Chores', 
        icon: ListChecks, 
        component: (
          <div className="space-y-6">
            <AIChoreAssistant 
              chores={chores} 
              familyMembers={members}
              onApplySuggestions={refetchChores}
            />
            <ChoreScheduler chores={chores} familyMembers={members} onChoreUpdate={refetchChores} />
          </div>
        )
      },
      expenses: { label: 'Finances', icon: Shield, component: <ExpenseTracker budgets={budgets} expenses={expenses} onUpdate={() => { refetchBudgets(); refetchExpenses(); }} /> },
      documents: { label: 'Docs', icon: BookOpenText, component: <DocumentHub documents={documents} onDocumentUpdate={refetchDocuments} /> },
      connect: { label: 'Discovery', icon: Globe, component: <FamilyDiscovery currentUser={user} familyProfile={profile} onProfileUpdate={refetchProfile} /> },
      playdates: { 
        label: 'Activities', 
        icon: PartyPopper, 
        component: (
          <div className="space-y-6">
            <AIActivitySuggestions familyMembers={members} />
            <PlayDateManager invitations={playdates} onUpdate={refetchPlaydates} />
          </div>
        )
      },
      community: { label: 'Community', icon: HandHeart, component: <CommunityFeed updates={updates} onUpdate={refetchUpdates} /> },
      access: { label: 'Access', icon: ShieldCheck, component: <FamilyAccessManager members={members} onMemberUpdate={refetchMembers} /> },
      kids: { label: 'Kids', icon: Target,
          component: ( 
            <div className="space-y-6">
                <KidsProgress familyMembers={members} />
                <KidsJournalProgress familyMembers={members} />
                <TeacherMentorView familyMembers={members} />
            </div>
          )
      }
  };

  const seo = getSEOForPage('Family');

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        url="https://www.helper33.com/Family"
        structuredData={seo.structuredData}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 p-4 sm:p-6 pb-24">
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
          {/* Main Title/Branding */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-3 mb-2">
              <Users className="w-10 h-10 text-rose-500" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                Family Ecosystem
              </h1>
            </div>
            <p className="text-gray-600">Complete family management: calendars, tasks, memories, and collaboration</p>
          </motion.div>

          {/* Main Content Card */}
          <Card className="p-4 sm:p-6 bg-white rounded-lg shadow-lg">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="mb-8 overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
                <TabsList className="inline-flex w-max min-w-full bg-gradient-to-r from-purple-50 to-pink-50 p-2 rounded-lg gap-1 sm:gap-2">
                  {Object.entries(VIEWS_CONFIG).map(([key, { label, icon: Icon }]) => (
                    <TabsTrigger 
                      key={key} 
                      value={key} 
                      className="flex flex-col items-center justify-center gap-1 px-3 py-2.5 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-md min-w-[70px] sm:min-w-[80px]"
                    >
                      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
                      <span className="text-[10px] sm:text-xs font-medium text-center whitespace-nowrap">{label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>
              
              {Object.entries(VIEWS_CONFIG).map(([key, { component }]) => (
                <TabsContent key={key} value={key} className="mt-0">
                  {component}
                </TabsContent>
              ))}
            </Tabs>
          </Card>
          
          {/* Family Chat Overlay */}
          <AnimatePresence>
            {isChatOpen && user && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <FamilyChat currentUser={user} onClose={() => setIsChatOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
          
          {/* SMS Composer */}
          {isSmsOpen && (
            <SMSComposer 
              member={smsConfig.recipient} 
              isOpen={isSmsOpen} 
              onClose={() => setIsSmsOpen(false)} 
              prefilledMessage={smsConfig.prefilledMessage}
              onSmsSent={() => onSmsSent(smsConfig.recipient)}
            />
          )}
          
          {/* Phone Call Confirmation Dialog */}
          <AlertDialog open={callConfirmation.isOpen} onOpenChange={(open) => !open && setCallConfirmation({isOpen: false, member: null})}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Call {callConfirmation.member?.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will initiate a call from your registered phone number ({user?.phone_number}) to {callConfirmation.member?.name}'s phone. Your phone will ring first to connect you. Standard carrier rates may apply.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isPlacingCall}>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={confirmPhoneCall} disabled={isPlacingCall}>
                  {isPlacingCall ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Call
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </>
  );
}
