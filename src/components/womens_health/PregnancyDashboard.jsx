
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Baby, Calendar, Heart, Sparkles, BookOpen, AlertCircle, CheckCircle, Cake, Ruler, PartyPopper, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { differenceInDays, addDays, format, parseISO } from 'date-fns';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import MultipleBabySetup from './MultipleBabySetup';
import DevelopmentalMilestones from './DevelopmentalMilestones'; // New import

export default function PregnancyDashboard({ pregnancyData, lastPeriod }) {
  const [isSetupMode, setIsSetupMode] = useState(!pregnancyData?.pregnancy_status || pregnancyData?.pregnancy_status === 'not_tracking');
  const [lmpDate, setLmpDate] = useState(lastPeriod || pregnancyData?.last_menstrual_period || '');
  const [useUltrasoundDate, setUseUltrasoundDate] = useState(false);
  const [ultrasoundDueDate, setUltrasoundDueDate] = useState('');
  const [showBirthForm, setShowBirthForm] = useState(false);
  const [showMultipleBabySetup, setShowMultipleBabySetup] = useState(false);
  const [birthDate, setBirthDate] = useState('');
  const [babyName, setBabyName] = useState('');
  const [isMultipleBirth, setIsMultipleBirth] = useState(false);
  const queryClient = useQueryClient();

  // Check if baby was already born
  const isBabyBorn = pregnancyData?.pregnancy_status === 'postpartum' || pregnancyData?.birth_date;

  // Accurate pregnancy calculation based on LMP (Naegele's Rule)
  const calculatePregnancy = (lmp, ultrasoundDue = null) => {
    if (!lmp) return null;
    
    const lmpDateObj = parseISO(lmp);
    const today = new Date();
    
    // Calculate using LMP (280 days / 40 weeks from LMP)
    const dueDateObj = ultrasoundDue ? parseISO(ultrasoundDue) : addDays(lmpDateObj, 280);
    const conceptionDate = addDays(lmpDateObj, 14); // Conception typically 14 days after LMP
    
    // Calculate current week and days
    const daysSinceLMP = differenceInDays(today, lmpDateObj);
    const weeksPregnant = Math.floor(daysSinceLMP / 7);
    const daysExtra = daysSinceLMP % 7;
    
    // Calculate trimester (1st: weeks 1-12, 2nd: weeks 13-26, 3rd: weeks 27+)
    let trimester = 1;
    if (weeksPregnant >= 13 && weeksPregnant < 27) trimester = 2;
    else if (weeksPregnant >= 27) trimester = 3;
    
    // Days until due date
    const daysUntilDue = differenceInDays(dueDateObj, today);
    const weeksUntilDue = Math.floor(daysUntilDue / 7);
    
    // Calculate percentage complete
    const totalDays = 280; // 40 weeks
    const percentComplete = Math.min(100, Math.max(0, (daysSinceLMP / totalDays) * 100));

    return {
      weeks: weeksPregnant,
      days: daysExtra,
      dueDate: dueDateObj,
      daysUntilDue,
      weeksUntilDue,
      trimester,
      conceptionDate,
      percentComplete: Math.round(percentComplete),
      daysSinceLMP,
      isFullTerm: weeksPregnant >= 37,
      isViable: weeksPregnant >= 24
    };
  };

  // Calculate current week from pregnancy data
  const calc = pregnancyData?.last_menstrual_period 
    ? calculatePregnancy(
        pregnancyData.last_menstrual_period, 
        pregnancyData.due_date_method === 'ultrasound' ? pregnancyData.due_date : null
      ) 
    : null;

  const currentWeek = calc?.weeks || pregnancyData?.current_week;

  // Fetch weekly pregnancy insights
  const { data: weeklyInsights = [] } = useQuery({
    queryKey: ['pregnancy-insights', currentWeek],
    queryFn: async () => {
      if (!currentWeek) return [];
      const insights = await base44.entities.PregnancyWeeklyInsight.filter({
        week_number: currentWeek
      });
      return insights;
    },
    enabled: !!currentWeek && !isBabyBorn
  });

  const setupMutation = useMutation({
    mutationFn: async (data) => {
      const calculation = calculatePregnancy(
        data.last_menstrual_period, 
        data.due_date_method === 'ultrasound' ? data.ultrasound_due_date : null
      );
      
      if (!calculation) {
        throw new Error('Could not calculate pregnancy details from the provided date.');
      }

      const payload = {
        pregnancy_status: 'pregnant',
        last_menstrual_period: data.last_menstrual_period,
        due_date_method: data.due_date_method || 'lmp',
        due_date: calculation.dueDate.toISOString().split('T')[0],
        conception_date: calculation.conceptionDate.toISOString().split('T')[0],
        current_week: calculation.weeks,
        current_trimester: calculation.trimester === 1 ? 'first' : calculation.trimester === 2 ? 'second' : 'third'
      };

      // Check if tracking already exists
      const existing = await base44.entities.PregnancyTracking.list();
      
      if (existing.length > 0) {
        return await base44.entities.PregnancyTracking.update(existing[0].id, payload);
      } else {
        return await base44.entities.PregnancyTracking.create(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancy-tracking'] });
      setIsSetupMode(false);
      toast.success('🎉 Pregnancy tracking started!');
    },
    onError: (error) => {
      console.error("Error setting up pregnancy tracking:", error);
      toast.error(error.message || 'Failed to set up pregnancy tracking. Please try again.');
    }
  });

  const birthMutation = useMutation({
    mutationFn: async (data) => {
      const existing = await base44.entities.PregnancyTracking.list();
      if (existing.length === 0) {
        throw new Error('No pregnancy tracking found');
      }

      const birthDateObj = parseISO(data.birth_date);

      const payload = {
        pregnancy_status: 'postpartum',
        birth_date: data.birth_date,
        baby_name: data.baby_name,
        postpartum_weeks: Math.floor(differenceInDays(new Date(), birthDateObj) / 7),
        current_week: null,
        current_trimester: null,
        is_multiple_birth: data.is_multiple_birth || false,
        number_of_babies: data.babies?.length || 1, // Use actual count from babies array
        babies: data.babies || [{ // Ensure babies array is always present, even for single birth
          baby_id: `baby_${Date.now()}`,
          baby_name: data.baby_name,
          birth_date: data.birth_date,
          birth_order: 1,
          color: '#3b82f6', // Default color
          emoji: '👶' // Default emoji
        }]
      };

      return await base44.entities.PregnancyTracking.update(existing[0].id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pregnancy-tracking'] });
      setShowBirthForm(false);
      setShowMultipleBabySetup(false);
      toast.success('🎉 Congratulations! Baby info saved. Welcome to postpartum care!');
    },
    onError: (error) => {
      console.error("Error saving birth info:", error);
      toast.error('Failed to save birth info. Please try again.');
    }
  });

  const handleSingleBirthSubmit = (e) => {
    e.preventDefault();
    
    if (isMultipleBirth) {
      setShowMultipleBabySetup(true);
    } else {
      if (!birthDate) {
        toast.error('Please enter baby\'s birth date');
        return;
      }
      birthMutation.mutate({
        birth_date: birthDate,
        baby_name: babyName || 'Baby',
        is_multiple_birth: false,
        number_of_babies: 1
      });
    }
  };

  const handleMultipleBirthComplete = (multipleData) => {
    birthMutation.mutate({
      ...multipleData,
      birth_date: multipleData.babies[0].birth_date, // Use first baby's birth date for tracking object
      baby_name: multipleData.babies[0].baby_name, // Use first baby's name for tracking object
      is_multiple_birth: true,
      number_of_babies: multipleData.babies.length,
      babies: multipleData.babies
    });
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    
    if (!lmpDate) {
      toast.error('Please enter your last menstrual period date');
      return;
    }

    if (useUltrasoundDate && !ultrasoundDueDate) {
      toast.error('Please enter your ultrasound due date');
      return;
    }
    
    setupMutation.mutate({
      last_menstrual_period: lmpDate,
      due_date_method: useUltrasoundDate ? 'ultrasound' : 'lmp',
      ultrasound_due_date: useUltrasoundDate ? ultrasoundDueDate : null
    });
  };

  // If baby is born, show options to edit or add babies
  if (isBabyBorn) {
    const babies = pregnancyData?.babies || [];
    const isMultipleBirth = pregnancyData?.is_multiple_birth && babies.length > 0;

    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-pink-100 to-rose-100 border-2 border-pink-300 shadow-xl">
          <CardContent className="p-12 text-center">
            <PartyPopper className="w-20 h-20 text-pink-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              🎉 Congratulations, {pregnancyData.baby_name || 'Mom'}!
            </h2>
            <p className="text-lg text-gray-700 mb-6">
              Your baby was born on {format(parseISO(pregnancyData.birth_date), 'MMMM d, yyyy')}
            </p>
            <div className="bg-white rounded-xl p-6 inline-block shadow-lg mb-6">
              <p className="text-gray-700 mb-4">
                Your pregnancy journey is complete! 💕
              </p>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  ✨ Visit the <strong className="text-pink-700">Postpartum</strong> tab for your recovery journey
                </p>
                <p className="text-sm text-gray-600">
                  👶 Visit the <strong className="text-blue-700">Baby Care</strong> tab to track feedings, diapers & sleep
                </p>
              </div>
            </div>

            {/* Edit Birth Info Section */}
            <div className="max-w-md mx-auto space-y-3">
              {!isMultipleBirth && (
                <Button
                  onClick={() => setShowMultipleBabySetup(true)}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  <Users className="w-5 h-5 mr-2" />
                  👶👶 Add Multiple Babies (Twins/Triplets/Quads)
                </Button>
              )}

              {isMultipleBirth && (
                <div className="bg-white rounded-xl p-4 shadow">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    Tracking {babies.length} {babies.length === 2 ? 'Twins' : babies.length === 3 ? 'Triplets' : 'Quadruplets'}:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-3">
                    {babies.map(baby => (
                      <Badge 
                        key={baby.baby_id}
                        className="text-white"
                        style={{ backgroundColor: baby.color }}
                      >
                        {baby.emoji} {baby.baby_name}
                      </Badge>
                    ))}
                  </div>
                  <Button
                    onClick={() => setShowMultipleBabySetup(true)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    Edit Babies Info
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Multiple Baby Setup/Edit Modal */}
        {showMultipleBabySetup && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <MultipleBabySetup
              onComplete={handleMultipleBirthComplete}
              existingBabies={pregnancyData?.babies && pregnancyData.babies.length > 0 ? pregnancyData.babies : [{
                baby_id: `baby_${Date.now()}`,
                baby_name: pregnancyData.baby_name || 'Baby',
                birth_date: pregnancyData.birth_date,
                birth_order: 1,
                color: '#3b82f6',
                emoji: '👶'
              }]}
              onCancel={() => setShowMultipleBabySetup(false)}
            />
          </motion.div>
        )}
      </div>
    );
  }

  if (isSetupMode || !pregnancyData || !calc) {
    const previewCalc = lmpDate ? calculatePregnancy(lmpDate, useUltrasoundDate ? ultrasoundDueDate : null) : null;

    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Baby className="w-6 h-6 text-blue-500" />
            Pregnancy Tracker Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-6">
            <div>
              <Label htmlFor="lmp" className="text-base font-semibold">
                First Day of Last Menstrual Period (LMP) *
              </Label>
              <Input
                id="lmp"
                type="date"
                value={lmpDate}
                onChange={(e) => setLmpDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="mt-2"
                required
              />
              <p className="text-xs text-gray-500 mt-2">
                This is the first day of your last period before getting pregnant
              </p>
            </div>

            {/* Ultrasound Override Option */}
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="ultrasound"
                  checked={useUltrasoundDate}
                  onChange={(e) => setUseUltrasoundDate(e.target.checked)}
                  className="w-5 h-5 text-blue-600 rounded"
                />
                <Label htmlFor="ultrasound" className="text-sm font-medium cursor-pointer">
                  I have an ultrasound-confirmed due date (more accurate)
                </Label>
              </div>

              {useUltrasoundDate && (
                <div>
                  <Label htmlFor="ultrasound-date" className="text-sm font-medium">
                    Ultrasound Due Date
                  </Label>
                  <Input
                    id="ultrasound-date"
                    type="date"
                    value={ultrasoundDueDate}
                    onChange={(e) => setUltrasoundDueDate(e.target.value)}
                    className="mt-1"
                    required={useUltrasoundDate}
                  />
                  <p className="text-xs text-blue-700 mt-1">
                    📅 Ultrasound dating is most accurate when done between 8-13 weeks
                  </p>
                </div>
              )}
            </div>

            {/* Live Preview */}
            {previewCalc && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border-2 border-blue-300">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-2">📅 Estimated Due Date:</p>
                      <p className="text-3xl font-bold text-blue-700">
                        {format(previewCalc.dueDate, 'MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        {useUltrasoundDate ? '(Ultrasound confirmed)' : '(Calculated from LMP)'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-2">🤰 Current Progress:</p>
                      <p className="text-3xl font-bold text-blue-700">
                        {previewCalc.weeks}w {previewCalc.days}d
                      </p>
                      <p className="text-sm text-blue-600 mt-1">
                        Trimester {previewCalc.trimester} • {previewCalc.percentComplete}% complete
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="h-3 bg-blue-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${previewCalc.percentComplete}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
                      />
                    </div>
                    <div className="flex justify-between text-xs text-blue-700 mt-1">
                      <span>Week 0</span>
                      <span>Week 20</span>
                      <span>Week 40</span>
                    </div>
                  </div>
                </div>

                {/* Additional Info */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-4 border-2 border-purple-200 text-center">
                    <Cake className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 mb-1">Conception Date</p>
                    <p className="text-sm font-bold text-gray-900">
                      {format(previewCalc.conceptionDate, 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-pink-200 text-center">
                    <Calendar className="w-6 h-6 text-pink-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 mb-1">Days Until Due</p>
                    <p className="text-sm font-bold text-gray-900">
                      {previewCalc.daysUntilDue} days
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4 border-2 border-blue-200 text-center">
                    <Ruler className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <p className="text-xs text-gray-600 mb-1">Weeks Left</p>
                    <p className="text-sm font-bold text-gray-900">
                      {previewCalc.weeksUntilDue} weeks
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={!lmpDate || setupMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-6"
            >
              {setupMutation.isPending ? (
                'Setting up...'
              ) : (
                <>
                  <Baby className="w-5 h-5 mr-2" />
                  {pregnancyData ? 'Update' : 'Start'} Pregnancy Tracking
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  const currentInsight = weeklyInsights[0];

  return (
    <div className="space-y-6">
      {/* Main Pregnancy Card */}
      <Card className="bg-gradient-to-br from-blue-400 to-cyan-500 text-white border-0 shadow-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Baby className="w-16 h-16 mx-auto mb-4 opacity-90" />
            </motion.div>
            
            <h2 className="text-5xl font-bold mb-2">
              {calc.weeks} Weeks, {calc.days} Days
            </h2>
            <p className="text-blue-100 text-lg mb-4">
              Trimester {calc.trimester} • {calc.percentComplete}% Complete
            </p>

            {/* Progress Bar */}
            <div className="bg-white/20 backdrop-blur-sm rounded-full h-4 overflow-hidden mb-6">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${calc.percentComplete}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-white to-cyan-200"
              />
            </div>

            {/* Due Date */}
            <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6">
              <p className="text-sm text-blue-100 mb-1">Your Due Date</p>
              <p className="text-3xl font-bold">
                {format(calc.dueDate, 'MMMM d, yyyy')}
              </p>
              <p className="text-blue-100 mt-2">
                {calc.daysUntilDue > 0 ? `${calc.daysUntilDue} days to go (${calc.weeksUntilDue} weeks)! 💙` : 'Due date has passed'}
              </p>
              {pregnancyData.due_date_method === 'ultrasound' && (
                <Badge className="mt-2 bg-white/30 text-white border-white/50">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Ultrasound Confirmed
                </Badge>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Cake className="w-5 h-5 mx-auto mb-1 opacity-90" />
                <p className="text-xs text-blue-100 mb-1">Conception</p>
                <p className="text-sm font-bold">{format(calc.conceptionDate, 'MMM d')}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Calendar className="w-5 h-5 mx-auto mb-1 opacity-90" />
                <p className="text-xs text-blue-100 mb-1">Days Since LMP</p>
                <p className="text-sm font-bold">{calc.daysSinceLMP}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <Heart className="w-5 h-5 mx-auto mb-1 opacity-90" />
                <p className="text-xs text-blue-100 mb-1">Trimester</p>
                <p className="text-sm font-bold capitalize">{calc.trimester === 1 ? 'First' : calc.trimester === 2 ? 'Second' : 'Third'}</p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex justify-center gap-2 mt-4">
              {calc.isViable && (
                <Badge className="bg-green-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Viable (24+ weeks)
                </Badge>
              )}
              {calc.isFullTerm && (
                <Badge className="bg-emerald-500 text-white">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Full Term (37+ weeks)
                </Badge>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setIsSetupMode(true)}
                variant="outline"
                className="flex-1 bg-white/20 hover:bg-white/30 text-white border-white/40"
                size="sm"
              >
                Update Info
              </Button>
              
              <Button
                onClick={() => setShowBirthForm(true)}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white border-0 shadow-lg"
                size="sm"
              >
                <PartyPopper className="w-4 h-4 mr-2" />
                Baby Born!
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Developmental Milestones - NEW! */}
      <DevelopmentalMilestones 
        pregnancyData={pregnancyData}
        trackingMode="pregnancy"
      />

      {/* Birth Form Modal */}
      {showBirthForm && !showMultipleBabySetup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-300 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <PartyPopper className="w-6 h-6 text-pink-600" />
                🎉 Congratulations! Your Baby is Here!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSingleBirthSubmit} className="space-y-6">
                {/* Multiple Birth Option */}
                <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="multiple-birth"
                      checked={isMultipleBirth}
                      onChange={(e) => setIsMultipleBirth(e.target.checked)}
                      className="w-5 h-5 text-purple-600 rounded"
                    />
                    <Label htmlFor="multiple-birth" className="text-sm font-medium cursor-pointer">
                      👶👶 This is a multiple birth (twins, triplets, quadruplets)
                    </Label>
                  </div>
                  {isMultipleBirth && (
                    <p className="text-xs text-purple-700 mt-2">
                      You'll be able to add details for each baby individually on the next screen
                    </p>
                  )}
                </div>

                {!isMultipleBirth && (
                  <>
                    <div>
                      <Label htmlFor="birth-date" className="text-base font-semibold">
                        Baby's Birth Date *
                      </Label>
                      <Input
                        id="birth-date"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                        max={new Date().toISOString().split('T')[0]}
                        className="mt-2"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="baby-name" className="text-base font-semibold">
                        Baby's Name (Optional)
                      </Label>
                      <Input
                        id="baby-name"
                        type="text"
                        value={babyName}
                        onChange={(e) => setBabyName(e.target.value)}
                        placeholder="Enter baby's name..."
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        You can always update this later
                      </p>
                    </div>
                  </>
                )}

                {isMultipleBirth && (
                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                    <p className="text-sm text-blue-900 font-semibold mb-2">
                      📋 Multiple Birth Setup
                    </p>
                    <p className="text-xs text-blue-800">
                      Click "Continue" to set up tracking for twins, triplets, or quadruplets. 
                      You'll be able to add individual names, birth dates, and color tags for each baby.
                    </p>
                  </div>
                )}

                <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
                  <p className="text-sm text-blue-900">
                    <strong>📅 What happens next:</strong>
                  </p>
                  <ul className="text-xs text-blue-800 mt-2 space-y-1">
                    <li>✓ Switch to postpartum tracking</li>
                    <li>✓ Access baby care logs (feeding, diapers, sleep)</li>
                    <li>✓ Get weekly postpartum recovery insights</li>
                    <li>✓ Track baby's development milestones</li>
                    {isMultipleBirth && <li>✓ Individual tracking for each baby with color coding</li>}
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowBirthForm(false);
                      setIsMultipleBirth(false);
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isMultipleBirth && !birthDate || birthMutation.isPending}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  >
                    {birthMutation.isPending ? 'Saving...' : isMultipleBirth ? 'Continue' : 'Confirm Birth'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Multiple Baby Setup */}
      {showMultipleBabySetup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <MultipleBabySetup
            onComplete={handleMultipleBirthComplete}
            onCancel={() => setShowMultipleBabySetup(false)}
            birthDate={birthDate} // Pass the single birthDate if available, useful for prefilling
            existingBabies={pregnancyData?.babies || []}
          />
        </motion.div>
      )}

      {/* Weekly Insights - Enhanced with all details */}
      {currentInsight ? (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-500" />
              Week {calc.weeks} - Your Pregnancy Guide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Baby Size */}
            {currentInsight.baby_size_comparison && (
              <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                <p className="text-sm text-gray-600 mb-1">Baby's Size This Week</p>
                <p className="text-2xl font-bold text-pink-700 capitalize">
                  🍼 {currentInsight.baby_size_comparison}
                </p>
              </div>
            )}

            {/* Baby Development */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Baby className="w-5 h-5 text-blue-500" />
                Baby Development
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">{currentInsight.baby_development}</p>
            </div>

            {/* Mom's Changes */}
            {currentInsight.mom_body_changes && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-500" />
                  Your Body This Week
                </h3>
                <p className="text-gray-700 text-sm leading-relaxed">{currentInsight.mom_body_changes}</p>
              </div>
            )}

            {/* Nutrition Advice */}
            {currentInsight.nutrition_advice && currentInsight.nutrition_advice.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">🥗 Nutrition Focus</h3>
                <div className="space-y-2">
                  {currentInsight.nutrition_advice.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                      <span className="text-green-600 font-bold">•</span>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exercise Suggestions */}
            {currentInsight.exercise_suggestions && currentInsight.exercise_suggestions.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">🏃‍♀️ Physical Care</h3>
                <div className="flex flex-wrap gap-2">
                  {currentInsight.exercise_suggestions.map((exercise, idx) => (
                    <Badge key={idx} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {exercise}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Emotional Support */}
            {currentInsight.emotional_support && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                <h3 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                  💜 Emotional Health
                </h3>
                <p className="text-sm text-purple-800 leading-relaxed">{currentInsight.emotional_support}</p>
              </div>
            )}

            {/* Care Tips */}
            {currentInsight.care_tips && currentInsight.care_tips.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">💡 This Week's Tips</h3>
                <div className="space-y-2">
                  {currentInsight.care_tips.map((tip, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-purple-50 rounded-lg">
                      <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* To-Do List */}
            {currentInsight.to_do_list && currentInsight.to_do_list.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">✅ Week {calc.weeks} To-Do</h3>
                <div className="space-y-2">
                  {currentInsight.to_do_list.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Warning Signs */}
            {currentInsight.warning_signs && currentInsight.warning_signs.length > 0 && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
                <h3 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  When to Call Your Doctor
                </h3>
                <ul className="space-y-1">
                  {currentInsight.warning_signs.map((sign, idx) => (
                    <li key={idx} className="text-sm text-red-800">• {sign}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 text-blue-400 mx-auto mb-3" />
            <p className="text-blue-900 font-semibold">
              Weekly insights for week {calc.weeks} coming soon!
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Check back for detailed pregnancy information
            </p>
          </CardContent>
        </Card>
      )}

      {/* General Trimester Info */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Trimester {calc.trimester} Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {calc.weeks <= 12 && (
              <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
                <p className="font-semibold text-pink-900 mb-2">First Trimester 🌱</p>
                <p className="text-sm text-gray-700 mb-3">
                  Your baby's major organs are forming. This is a critical development period.
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600"><strong>Common experiences:</strong> Morning sickness, fatigue, breast tenderness</p>
                  <p className="text-xs text-gray-600"><strong>Focus on:</strong> Prenatal vitamins, rest, staying hydrated</p>
                  <p className="text-xs text-gray-600"><strong>Appointments:</strong> First prenatal visit, dating ultrasound</p>
                </div>
              </div>
            )}
            {calc.weeks >= 13 && calc.weeks <= 26 && (
              <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                <p className="font-semibold text-purple-900 mb-2">Second Trimester 🌸</p>
                <p className="text-sm text-gray-700 mb-3">
                  The "honeymoon" trimester! Energy returns and you'll start showing.
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600"><strong>Exciting moments:</strong> Feel baby's first kicks, anatomy scan</p>
                  <p className="text-xs text-gray-600"><strong>Focus on:</strong> Exercise, bonding with baby, preparing nursery</p>
                  <p className="text-xs text-gray-600"><strong>Appointments:</strong> Anatomy scan (18-22 weeks), glucose test</p>
                </div>
              </div>
            )}
            {calc.weeks >= 27 && (
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                <p className="font-semibold text-blue-900 mb-2">Third Trimester 🌺</p>
                <p className="text-sm text-gray-700 mb-3">
                  Final stretch! Baby is growing rapidly and preparing for birth.
                </p>
                <div className="space-y-2">
                  <p className="text-xs text-gray-600"><strong>Common experiences:</strong> Braxton Hicks, nesting instinct, back pain</p>
                  <p className="text-xs text-gray-600"><strong>Focus on:</strong> Birth plan, hospital bag, baby essentials</p>
                  <p className="text-xs text-gray-600"><strong>Appointments:</strong> Weekly check-ups, Group B Strep test</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical Disclaimer */}
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Heart className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div className="text-sm text-purple-900">
              <p className="font-semibold mb-2">💜 Important Reminder</p>
              <p>
                This tracker provides educational information and estimates. Your healthcare provider will give you 
                personalized medical advice and accurate measurements. Always consult your doctor for medical decisions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
