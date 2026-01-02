import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Gift, 
  Heart, 
  Phone, 
  Users, 
  ExternalLink, 
  CheckCircle, 
  TrendingUp, 
  MessageSquare,
  Plus,
  Leaf,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { updateConstellationProgress } from './ConstellationHelper';

export default function GiveZone({ onBack }) {
  const [completedChallenges, setCompletedChallenges] = useState(new Set());
  const [showAddKindness, setShowAddKindness] = useState(false);
  const [kindnessForm, setKindnessForm] = useState({
    act_type: 'other',
    description: '',
    recipient: '',
    mood_before: 'neutral',
    mood_after: 'good',
    share_publicly: true,
    is_anonymous: true,
    leaf_color: 'amber'
  });
  const queryClient = useQueryClient();

  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me(),
  });

  const { data: kindnessActs = [], isLoading } = useQuery({
    queryKey: ['kindnessActs'],
    queryFn: () => base44.entities.KindnessAct.filter({ share_publicly: true }),
    enabled: !!user
  });

  const { data: myKindnessActs = [] } = useQuery({
    queryKey: ['myKindnessActs'],
    queryFn: () => base44.entities.KindnessAct.list('-created_date'),
    enabled: !!user
  });

  const createKindnessMutation = useMutation({
    mutationFn: async (actData) => {
      const act = await base44.entities.KindnessAct.create(actData);
      
      // Update constellation progress
      const result = await updateConstellationProgress(user, {
        activity_date: new Date().toISOString().split('T')[0],
        zone: 'give',
        activity_type: 'act_of_kindness',
        activity_title: actData.act_type.replace(/_/g, ' '),
        activity_content: actData.description,
        points_earned: 25,
      });

      return { act, result };
    },
    onSuccess: ({ result }) => {
      queryClient.invalidateQueries(['kindnessActs']);
      queryClient.invalidateQueries(['myKindnessActs']);
      queryClient.invalidateQueries(['holidayActivities']);
      queryClient.invalidateQueries(['myConstellationProgress']);
      
      setShowAddKindness(false);
      setKindnessForm({
        act_type: 'other',
        description: '',
        recipient: '',
        mood_before: 'neutral',
        mood_after: 'good',
        share_publicly: true,
        is_anonymous: true,
        leaf_color: 'amber'
      });

      const successMsg = result.isComplete 
        ? `🌳 TREE COMPLETE! Constellation lit! +${result.pointsEarned} points! 🏆`
        : `🍃 New leaf added! +${result.pointsEarned} points! Star #${result.starsLit} lit! ⭐`;
      
      toast.success(successMsg, { duration: 5000 });
    }
  });

  const dailyChallenges = [
    { id: 'call_someone', title: 'Call Someone You Haven\'t Spoken To', description: 'Reconnect with someone from your past.', icon: Phone, points: 30, impact: 'Releases oxytocin and combats loneliness' },
    { id: 'kind_comment', title: 'Write One Kind Comment Online', description: 'Leave genuine encouragement online.', icon: MessageSquare, points: 15, impact: 'Creates ripple effect of positivity' },
    { id: 'check_on_someone', title: 'Check on a Friend', description: 'Let them know you\'re thinking of them.', icon: Heart, points: 25, impact: 'Strengthens community bonds' },
    { id: 'donate_online', title: 'Make a Small Donation', description: 'Give $5-10 to a cause you care about.', icon: Gift, points: 40, impact: 'Activates reward pathways' },
    { id: 'help_stranger', title: 'Help a Stranger', description: 'Small acts matter.', icon: Users, points: 20, impact: 'Increases serotonin' },
  ];

  const volunteerOpportunities = [
    { name: 'Crisis Text Line', description: 'Volunteer crisis counselor - remote, 4 hrs/week', url: 'https://www.crisistextline.org/volunteer', type: 'Remote', commitment: '4 hours/week' },
    { name: 'Local Food Bank', description: 'Help sort and pack food', url: 'https://www.feedingamerica.org/find-your-local-foodbank', type: 'In-Person', commitment: 'Flexible' },
    { name: '7 Cups', description: 'Become an active listener for emotional support', url: 'https://www.7cups.com/@Intern', type: 'Remote', commitment: '2-3 hours/week' },
    { name: 'Be My Eyes', description: 'Help blind people through video calls', url: 'https://www.bemyeyes.com', type: 'Remote', commitment: 'On-demand' },
  ];

  const actTypes = [
    { id: 'called_someone', label: '📞 Called Someone', color: 'blue' },
    { id: 'sent_message', label: '💌 Sent Message', color: 'pink' },
    { id: 'helped_neighbor', label: '🏘️ Helped Neighbor', color: 'green' },
    { id: 'volunteered', label: '🤝 Volunteered', color: 'purple' },
    { id: 'donated', label: '💝 Donated', color: 'red' },
    { id: 'complimented_stranger', label: '💫 Complimented', color: 'yellow' },
    { id: 'listened_deeply', label: '👂 Listened', color: 'indigo' },
    { id: 'forgave_someone', label: '🕊️ Forgave', color: 'cyan' },
    { id: 'supported_online', label: '💬 Online Support', color: 'teal' },
    { id: 'other', label: '✨ Other', color: 'amber' }
  ];

  const leafColors = [
    { id: 'amber', label: '🍂 Amber', class: 'from-amber-400 to-orange-400' },
    { id: 'orange', label: '🧡 Orange', class: 'from-orange-400 to-red-400' },
    { id: 'red', label: '❤️ Red', class: 'from-red-400 to-rose-400' },
    { id: 'gold', label: '💛 Gold', class: 'from-yellow-400 to-amber-400' },
    { id: 'green', label: '💚 Green', class: 'from-green-400 to-emerald-400' }
  ];

  const markComplete = async (challengeId) => {
    if (!user) {
      toast.error('Please log in to track activities');
      return;
    }

    setCompletedChallenges(new Set(completedChallenges).add(challengeId));
    
    const challenge = dailyChallenges.find(c => c.id === challengeId);
    
    try {
      const result = await updateConstellationProgress(user, {
        activity_date: new Date().toISOString().split('T')[0],
        zone: 'give',
        activity_type: 'act_of_giving',
        activity_title: challenge.title,
        activity_content: challenge.description,
        points_earned: challenge.points,
      });

      queryClient.invalidateQueries();
      
      const successMsg = result.isComplete 
        ? `🎉 CONSTELLATION COMPLETE! ✨ +${result.pointsEarned} points! All 10 stars lit! You earned the Heartful Holidays badge! 🏆`
        : `✨ +${result.pointsEarned} points! Star #${result.starsLit} lit! ${10 - result.starsLit} more stars to go! ⭐`;
      
      toast.success(successMsg, { duration: 5000 });
      
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to log. Please try again.');
    }
  };

  const getTreeVisualization = () => {
    const leafCount = kindnessActs.length;
    const myLeaves = myKindnessActs.length;
    
    // Tree growth stages
    if (leafCount === 0) {
      return {
        stage: 'seedling',
        height: 120,
        emoji: '🌱',
        message: 'is waiting for its first leaf...',
        subMessage: 'Add an act of kindness and watch it grow!'
      };
    } else if (leafCount < 10) {
      return {
        stage: 'young',
        height: 200,
        emoji: '🌿',
        message: `has ${leafCount} ${leafCount === 1 ? 'leaf' : 'leaves'}!`,
        subMessage: 'Keep growing with more kindness!'
      };
    } else if (leafCount < 25) {
      return {
        stage: 'growing',
        height: 280,
        emoji: '🌳',
        message: `is growing strong with ${leafCount} leaves!`,
        subMessage: 'This tree represents our community kindness!'
      };
    } else {
      return {
        stage: 'mature',
        height: 350,
        emoji: '🌲',
        message: `is thriving with ${leafCount} acts of kindness!`,
        subMessage: 'What a beautiful community we\'ve built! 💚'
      };
    }
  };

  const tree = getTreeVisualization();

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="bg-white/80">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2">
          <Gift className="w-4 h-4 mr-2" />
          Give Zone
        </Badge>
      </div>

      {/* Kindness Tree Visualization */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="mb-8"
      >
        <Card className="bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-300 shadow-xl overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-green-900 mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-8 h-8 text-green-700" />
                Community Kindness Tree
              </h2>
              <p className="text-green-700">Watch our tree grow with every act of kindness! 🌳</p>
            </div>

            {/* Tree Visualization */}
            <div className="relative flex items-end justify-center mb-6" style={{ height: `${tree.height}px` }}>
              {/* Tree Trunk */}
              <motion.div
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="w-16 bg-gradient-to-b from-amber-700 to-amber-900 rounded-t-lg"
                style={{ height: tree.height * 0.4, transformOrigin: 'bottom' }}
              />

              {/* Tree Top (Emoji or Leaves) */}
              <motion.div
                initial={{ scale: 0, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
                className="absolute"
                style={{ bottom: tree.height * 0.35 }}
              >
                <motion.div
                  animate={{ 
                    y: [0, -10, 0],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="text-center"
                >
                  <div className="text-8xl mb-2">{tree.emoji}</div>
                  
                  {/* Leaves floating around */}
                  {kindnessActs.length > 0 && (
                    <div className="absolute inset-0 -m-12">
                      {kindnessActs.slice(0, 20).map((act, idx) => {
                        const angle = (idx / Math.min(kindnessActs.length, 20)) * 360;
                        const radius = 80 + (idx % 3) * 20;
                        const x = Math.cos((angle * Math.PI) / 180) * radius;
                        const y = Math.sin((angle * Math.PI) / 180) * radius;
                        
                        return (
                          <motion.div
                            key={act.id}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ 
                              scale: 1, 
                              opacity: 1,
                              x: [0, x * 0.2, x],
                              y: [0, y * 0.2, y],
                              rotate: [0, 360]
                            }}
                            transition={{ 
                              duration: 2,
                              delay: 1 + idx * 0.1,
                              ease: "easeOut"
                            }}
                            className="absolute"
                            style={{ 
                              left: '50%',
                              top: '50%',
                            }}
                          >
                            <motion.div
                              animate={{ 
                                rotate: [0, 10, -10, 0],
                                y: [0, -5, 0]
                              }}
                              transition={{ 
                                duration: 3 + (idx % 3),
                                repeat: Infinity,
                                delay: idx * 0.2
                              }}
                              className={`w-6 h-6 bg-gradient-to-br ${
                                leafColors.find(c => c.id === act.leaf_color)?.class || 'from-amber-400 to-orange-400'
                              } rounded-full shadow-lg flex items-center justify-center text-xs`}
                            >
                              🍃
                            </motion.div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              </motion.div>

              {/* Ground */}
              <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-800 via-green-900 to-amber-800 rounded-full" />
            </div>

            {/* Tree Status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="text-center"
            >
              <p className="text-2xl font-bold text-green-900 mb-1">
                {tree.message}
              </p>
              <p className="text-green-700 mb-4">{tree.subMessage}</p>
              
              <div className="flex items-center justify-center gap-4 mb-6">
                <Badge className="bg-green-600 text-white text-lg px-4 py-2">
                  <Leaf className="w-5 h-5 mr-2" />
                  {kindnessActs.length} Community Leaves
                </Badge>
                <Badge className="bg-amber-600 text-white text-lg px-4 py-2">
                  <Heart className="w-5 h-5 mr-2" />
                  {myKindnessActs.length} Your Acts
                </Badge>
              </div>

              <Button
                onClick={() => setShowAddKindness(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg text-lg px-8 py-6"
              >
                <Plus className="w-5 h-5 mr-2" />
                {kindnessActs.length === 0 ? 'Add First Leaf' : 'Add Another Leaf'}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Add Kindness Act Modal */}
      <AnimatePresence>
        {showAddKindness && (
          <Dialog open={true} onOpenChange={() => setShowAddKindness(false)}>
            <DialogContent className="sm:max-w-xl bg-gradient-to-br from-green-50 to-emerald-50 max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Leaf className="w-6 h-6 text-green-600" />
                  Add a Leaf to the Kindness Tree
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What did you do? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {actTypes.map((type) => (
                      <Button
                        key={type.id}
                        onClick={() => setKindnessForm({...kindnessForm, act_type: type.id})}
                        variant={kindnessForm.act_type === type.id ? 'default' : 'outline'}
                        className={`text-sm ${
                          kindnessForm.act_type === type.id 
                            ? 'bg-green-600 hover:bg-green-700' 
                            : ''
                        }`}
                        size="sm"
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Describe your act of kindness <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={kindnessForm.description}
                    onChange={(e) => setKindnessForm({...kindnessForm, description: e.target.value})}
                    placeholder="I called my elderly neighbor to check on her..."
                    className="min-h-24 border-2 border-green-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Who benefited? (optional)
                  </label>
                  <Input
                    value={kindnessForm.recipient}
                    onChange={(e) => setKindnessForm({...kindnessForm, recipient: e.target.value})}
                    placeholder="My neighbor, a stranger, etc."
                    className="border-2 border-green-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Choose your leaf color 🍃
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {leafColors.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setKindnessForm({...kindnessForm, leaf_color: color.id})}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          kindnessForm.leaf_color === color.id 
                            ? 'border-green-500 shadow-lg scale-105' 
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <div className={`w-full h-8 rounded bg-gradient-to-br ${color.class} mb-1`} />
                        <p className="text-xs">{color.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={kindnessForm.share_publicly}
                    onChange={(e) => setKindnessForm({...kindnessForm, share_publicly: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-blue-900">
                    <strong>Add to Community Tree</strong> (Your leaf will inspire others!)
                  </label>
                </div>

                <div className="flex items-center gap-2 p-3 bg-purple-50 border-2 border-purple-200 rounded-lg">
                  <input
                    type="checkbox"
                    checked={kindnessForm.is_anonymous}
                    onChange={(e) => setKindnessForm({...kindnessForm, is_anonymous: e.target.checked})}
                    className="w-4 h-4"
                  />
                  <label className="text-sm text-purple-900">
                    <strong>Post Anonymously</strong> (Hide your name)
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => setShowAddKindness(false)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => createKindnessMutation.mutate(kindnessForm)}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600"
                    disabled={!kindnessForm.description.trim() || createKindnessMutation.isPending}
                  >
                    {createKindnessMutation.isPending ? (
                      <>Planting Leaf...</>
                    ) : (
                      <>
                        <Leaf className="w-4 h-4 mr-2" />
                        Plant Leaf 🍃
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Daily Challenges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Card className="bg-gradient-to-r from-amber-600 to-orange-600 text-white border-0 shadow-xl">
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-3" />
            <h3 className="text-2xl font-bold mb-2">Transform Loneliness into Purpose</h3>
            <p className="text-white/90 text-lg">
              Helping others releases oxytocin, serotonin, and dopamine
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Daily Acts of Giving</h2>
        <div className="space-y-4">
          {dailyChallenges.map((challenge, i) => {
            const Icon = challenge.icon;
            const isCompleted = completedChallenges.has(challenge.id);
            
            return (
              <motion.div key={challenge.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className={`bg-white/90 border-2 transition-all ${isCompleted ? 'border-green-300 bg-green-50/50' : 'border-amber-200 hover:border-amber-400 hover:shadow-lg'}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl shadow-lg ${isCompleted ? 'bg-green-500' : 'bg-gradient-to-br from-amber-500 to-orange-500'}`}>
                        {isCompleted ? <CheckCircle className="w-6 h-6 text-white" /> : <Icon className="w-6 h-6 text-white" />}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-lg font-bold">{challenge.title}</h4>
                          <Badge className="bg-amber-100 text-amber-700">+{challenge.points} pts</Badge>
                        </div>
                        <p className="text-gray-700 mb-2">{challenge.description}</p>
                        <p className="text-xs text-gray-500 italic">💡 {challenge.impact}</p>
                      </div>

                      {!isCompleted && (
                        <Button onClick={() => markComplete(challenge.id)} size="sm" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                          Complete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Community Kindness Acts */}
      {kindnessActs.length > 0 && (
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
            <Heart className="w-8 h-8 text-rose-600" />
            Community Acts of Kindness
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {kindnessActs.slice(0, 12).map((act, idx) => {
              const leafColor = leafColors.find(c => c.id === act.leaf_color) || leafColors[0];
              
              return (
                <motion.div
                  key={act.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <Card className={`bg-gradient-to-br from-white to-green-50 border-2 border-green-200 shadow-md hover:shadow-xl transition-all h-full`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3 mb-3">
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                          className={`w-12 h-12 rounded-full bg-gradient-to-br ${leafColor.class} flex items-center justify-center text-2xl shadow-lg`}
                        >
                          🍃
                        </motion.div>
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 text-sm mb-1">
                            {act.is_anonymous ? '🎭 Anonymous' : act.created_by?.split('@')[0]}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {act.act_type.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-sm text-gray-800 mb-2">{act.description}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(act.created_date).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Volunteer Opportunities */}
      <div>
        <h2 className="text-3xl font-bold mb-6">Volunteer Opportunities</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {volunteerOpportunities.map((opp, i) => (
            <motion.div key={opp.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="h-full bg-white/90 border-2 border-orange-200 hover:border-orange-400 hover:shadow-lg transition-all">
                <CardHeader>
                  <CardTitle className="text-xl">{opp.name}</CardTitle>
                  <CardDescription>{opp.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 text-sm">
                      <Badge variant="outline">{opp.type}</Badge>
                      <span className="text-gray-600">{opp.commitment}</span>
                    </div>
                    <Button asChild className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white">
                      <a href={opp.url} target="_blank" rel="noopener noreferrer">
                        Learn More<ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}