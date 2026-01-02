import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Heart,
  Plus,
  Star,
  MessageCircle,
  Trophy,
  Baby,
  Brain,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { differenceInDays, format, parseISO } from 'date-fns';
import { toast } from 'sonner';

const MILESTONE_CATEGORIES = {
  physical: { icon: Trophy, color: 'from-blue-500 to-cyan-500', label: 'Physical' },
  cognitive: { icon: Brain, color: 'from-purple-500 to-pink-500', label: 'Cognitive' },
  social_emotional: { icon: Heart, color: 'from-rose-500 to-pink-500', label: 'Social & Emotional' },
  communication: { icon: MessageCircle, color: 'from-green-500 to-emerald-500', label: 'Communication' },
  feeding: { icon: Baby, color: 'from-orange-500 to-amber-500', label: 'Feeding' },
  sleep: { icon: Star, color: 'from-indigo-500 to-purple-500', label: 'Sleep' },
  health: { icon: Sparkles, color: 'from-pink-500 to-rose-500', label: 'Health' }
};

const COMMON_MILESTONES = {
  physical: [
    { name: 'First Smile', typical_age: '6-8 weeks' },
    { name: 'Holds Head Up', typical_age: '1-3 months' },
    { name: 'Rolling Over', typical_age: '4-6 months' },
    { name: 'Sits Without Support', typical_age: '6-8 months' },
    { name: 'Crawling', typical_age: '7-10 months' },
    { name: 'Stands with Support', typical_age: '9-12 months' },
    { name: 'First Steps', typical_age: '9-15 months' },
    { name: 'Walking Independently', typical_age: '12-18 months' }
  ],
  cognitive: [
    { name: 'Tracks Objects with Eyes', typical_age: '2-3 months' },
    { name: 'Responds to Name', typical_age: '6-9 months' },
    { name: 'Object Permanence', typical_age: '8-12 months' },
    { name: 'Points to Objects', typical_age: '12-18 months' },
    { name: 'Stacks Blocks', typical_age: '15-18 months' }
  ],
  social_emotional: [
    { name: 'Social Smile', typical_age: '6-8 weeks' },
    { name: 'First Laugh', typical_age: '3-4 months' },
    { name: 'Stranger Anxiety', typical_age: '6-9 months' },
    { name: 'Separation Anxiety', typical_age: '8-12 months' },
    { name: 'Shows Affection', typical_age: '12-15 months' }
  ],
  communication: [
    { name: 'Coos and Babbles', typical_age: '2-4 months' },
    { name: 'Says "Mama" or "Dada"', typical_age: '6-12 months' },
    { name: 'First Word', typical_age: '10-14 months' },
    { name: 'Waves Bye-Bye', typical_age: '9-12 months' },
    { name: 'Follows Simple Commands', typical_age: '12-18 months' }
  ]
};

export default function BabyMilestones({ pregnancyData, selectedBaby = 'all' }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    milestone_type: 'physical',
    milestone_name: '',
    description: '',
    achieved_date: new Date().toISOString().split('T')[0],
    media_urls: []
  });
  const queryClient = useQueryClient();

  const babies = pregnancyData?.babies || [];
  const isMultipleBirth = pregnancyData?.is_multiple_birth && babies.length > 0;
  const activeBaby = selectedBaby === 'all' ? babies[0] : babies.find(b => b.baby_id === selectedBaby);
  const babyName = activeBaby?.baby_name || pregnancyData?.baby_name || 'Baby';
  const babyId = activeBaby?.baby_id || 'single_baby';
  const birthDate = activeBaby?.birth_date || pregnancyData?.birth_date;

  const { data: milestones = [], isLoading } = useQuery({
    queryKey: ['baby-milestones', selectedBaby],
    queryFn: async () => {
      if (selectedBaby === 'all') {
        return await base44.entities.BabyMilestone.list('-achieved_date');
      }
      return await base44.entities.BabyMilestone.filter({ baby_id: selectedBaby }, '-achieved_date');
    }
  });

  const createMilestoneMutation = useMutation({
    mutationFn: async (data) => {
      const achievedDate = parseISO(data.achieved_date);
      const birth = parseISO(birthDate);
      const ageDays = differenceInDays(achievedDate, birth);
      const ageWeeks = Math.floor(ageDays / 7);
      const ageMonths = Math.floor(ageDays / 30);

      return await base44.entities.BabyMilestone.create({
        ...data,
        baby_id: babyId,
        baby_name: babyName,
        baby_age_days: ageDays,
        baby_age_weeks: ageWeeks,
        baby_age_months: ageMonths
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['baby-milestones'] });
      setShowAddForm(false);
      setFormData({
        milestone_type: 'physical',
        milestone_name: '',
        description: '',
        achieved_date: new Date().toISOString().split('T')[0],
        media_urls: []
      });
      toast.success('🎉 Milestone logged! What a special moment!');
    }
  });

  const handleQuickAdd = (category, milestoneName, typicalAge) => {
    setFormData({
      milestone_type: category,
      milestone_name: milestoneName,
      description: '',
      achieved_date: new Date().toISOString().split('T')[0],
      media_urls: [],
      typical_age_range_months: typicalAge
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMilestoneMutation.mutate(formData);
  };

  const milestonesByCategory = milestones.reduce((acc, m) => {
    if (!acc[m.milestone_type]) acc[m.milestone_type] = [];
    acc[m.milestone_type].push(m);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-white border-0 shadow-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ rotate: [0, 10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Sparkles className="w-7 h-7" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {babyName}'s Milestones
                </h2>
                <p className="text-white/90 text-sm">
                  {milestones.length} precious moments captured 💕
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/40"
            >
              <Plus className="w-5 h-5 mr-2" />
              Log Milestone
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Add Milestone Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 shadow-xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-6 h-6 text-purple-600" />
                    Log a New Milestone
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label className="text-base font-semibold mb-3 block">Milestone Category</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {Object.entries(MILESTONE_CATEGORIES).map(([key, { icon: Icon, color, label }]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => setFormData({ ...formData, milestone_type: key })}
                          className={`
                            p-3 rounded-xl transition-all text-sm font-medium
                            ${formData.milestone_type === key
                              ? `bg-gradient-to-br ${color} text-white shadow-lg scale-105`
                              : 'bg-white border-2 border-gray-200 hover:border-purple-300'
                            }
                          `}
                        >
                          <Icon className="w-5 h-5 mx-auto mb-1" />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="milestone_name">Milestone Name *</Label>
                    <Input
                      id="milestone_name"
                      value={formData.milestone_name}
                      onChange={(e) => setFormData({ ...formData, milestone_name: e.target.value })}
                      placeholder="e.g., First Smile, Rolling Over, First Word"
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="achieved_date">Date Achieved *</Label>
                    <Input
                      id="achieved_date"
                      type="date"
                      value={formData.achieved_date}
                      onChange={(e) => setFormData({ ...formData, achieved_date: e.target.value })}
                      max={new Date().toISOString().split('T')[0]}
                      className="mt-2"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Share details about this special moment..."
                      className="h-24 mt-2"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={createMilestoneMutation.isPending}
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {createMilestoneMutation.isPending ? 'Saving...' : 'Save Milestone'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Add Common Milestones */}
      {!showAddForm && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-amber-500" />
              Quick Add Common Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              {Object.entries(MILESTONE_CATEGORIES).map(([key, { label, color }]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
                  className={selectedCategory === key ? `bg-gradient-to-r ${color} text-white` : ''}
                >
                  {label}
                </Button>
              ))}
            </div>
            
            {selectedCategory && COMMON_MILESTONES[selectedCategory] && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {COMMON_MILESTONES[selectedCategory].map((milestone, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAdd(selectedCategory, milestone.name, milestone.typical_age)}
                    className="p-3 text-left bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg border border-purple-200 transition-all"
                  >
                    <p className="font-semibold text-gray-900 text-sm">{milestone.name}</p>
                    <p className="text-xs text-gray-600">Typical: {milestone.typical_age}</p>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Milestones Timeline */}
      {isLoading ? (
        <div className="text-center py-12">
          <Baby className="w-12 h-12 text-purple-300 animate-bounce mx-auto mb-3" />
          <p className="text-gray-600">Loading milestones...</p>
        </div>
      ) : milestones.length === 0 ? (
        <Card className="bg-white/90 backdrop-blur-sm shadow-lg">
          <CardContent className="p-12 text-center">
            <Star className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Milestones Yet</h3>
            <p className="text-gray-600 mb-6">
              Start capturing your baby's precious developmental moments!
            </p>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Plus className="w-5 h-5 mr-2" />
              Log First Milestone
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(milestonesByCategory).map(([category, categoryMilestones]) => {
            const { icon: Icon, color, label } = MILESTONE_CATEGORIES[category];
            
            return (
              <Card key={category} className="bg-white/90 backdrop-blur-sm shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-purple-600" />
                    {label} Milestones ({categoryMilestones.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {categoryMilestones.map((milestone) => (
                    <motion.div
                      key={milestone.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-xl bg-gradient-to-r ${color} bg-opacity-10 border-l-4 border-purple-500`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-bold text-gray-900">{milestone.milestone_name}</h4>
                            <Badge className="bg-purple-100 text-purple-700 text-xs">
                              {milestone.baby_age_weeks} weeks old
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {format(parseISO(milestone.achieved_date), 'MMMM d, yyyy')}
                          </p>
                          {milestone.description && (
                            <p className="text-sm text-gray-700 italic mt-2">
                              "{milestone.description}"
                            </p>
                          )}
                          {milestone.typical_age_range_months && (
                            <p className="text-xs text-gray-500 mt-2">
                              Typical age: {milestone.typical_age_range_months}
                            </p>
                          )}
                        </div>
                        <div className="text-5xl">🎉</div>
                      </div>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info Card */}
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Heart className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-purple-900 mb-2">💜 About Developmental Milestones</h3>
              <p className="text-sm text-purple-800">
                Every baby develops at their own pace! These milestones are guidelines, not deadlines. 
                If you have concerns about your baby's development, always consult with your pediatrician. 
                Celebrate each achievement - they're all special moments in your baby's journey! 🌟
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}