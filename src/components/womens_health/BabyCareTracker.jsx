import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Baby, Droplet, Moon, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import BabySelector from './BabySelector';

export default function BabyCareTracker({ babyName = 'Baby', pregnancyData }) {
  const [activeLogTab, setActiveLogTab] = useState('feeding');
  const [selectedBaby, setSelectedBaby] = useState(null);
  const queryClient = useQueryClient();

  const babies = pregnancyData?.babies || [];
  const isMultipleBirth = pregnancyData?.is_multiple_birth && babies.length > 0;

  // Auto-select first baby initially
  React.useEffect(() => {
    if (babies.length > 0 && !selectedBaby) {
      setSelectedBaby(babies[0].baby_id);
    }
  }, [babies, selectedBaby]);

  const currentBaby = babies.find(b => b.baby_id === selectedBaby);
  const currentBabyName = currentBaby?.baby_name || babyName;

  // Feeding form state
  const [feedType, setFeedType] = useState('breastfeed_both');
  const [feedStartTime, setFeedStartTime] = useState(new Date().toISOString().slice(0, 16));
  const [feedEndTime, setFeedEndTime] = useState('');
  const [feedAmount, setFeedAmount] = useState('');
  const [feedNotes, setFeedNotes] = useState('');
  const [babyMood, setBabyMood] = useState('content');

  // Diaper form state
  const [diaperTime, setDiaperTime] = useState(new Date().toISOString().slice(0, 16));
  const [diaperType, setDiaperType] = useState('wet');
  const [stoolColor, setStoolColor] = useState('yellow');
  const [stoolConsistency, setStoolConsistency] = useState('soft');
  const [rashDetected, setRashDetected] = useState(false);
  const [rashSeverity, setRashSeverity] = useState('none');
  const [diaperNotes, setDiaperNotes] = useState('');

  // Sleep form state
  const [sleepStart, setSleepStart] = useState(new Date().toISOString().slice(0, 16));
  const [sleepEnd, setSleepEnd] = useState('');
  const [sleepType, setSleepType] = useState('nap');
  const [sleepQuality, setSleepQuality] = useState('peaceful');
  const [sleepLocation, setSleepLocation] = useState('crib');
  const [sleepNotes, setSleepNotes] = useState('');

  // Fetch today's logs
  const today = new Date().toISOString().split('T')[0];

  const { data: allFeedings = [] } = useQuery({
    queryKey: ['baby-feeds', today],
    queryFn: async () => {
      const logs = await base44.entities.BabyFeedLog.list('-start_time', 200);
      return logs.filter(log => log.start_time && log.start_time.startsWith(today));
    }
  });

  const { data: allDiapers = [] } = useQuery({
    queryKey: ['baby-diapers', today],
    queryFn: async () => {
      const logs = await base44.entities.DiaperLog.list('-change_time', 200);
      return logs.filter(log => log.change_time && log.change_time.startsWith(today));
    }
  });

  const { data: allSleep = [] } = useQuery({
    queryKey: ['baby-sleep', today],
    queryFn: async () => {
      const logs = await base44.entities.BabySleepLog.list('-sleep_start', 200);
      return logs.filter(log => log.sleep_start && log.sleep_start.startsWith(today));
    }
  });

  // Filter by selected baby (or show all for single baby)
  const todayFeedings = isMultipleBirth && selectedBaby
    ? allFeedings.filter(f => f.baby_id === selectedBaby)
    : allFeedings;
  
  const todayDiapers = isMultipleBirth && selectedBaby
    ? allDiapers.filter(d => d.baby_id === selectedBaby)
    : allDiapers;
  
  const todaySleep = isMultipleBirth && selectedBaby
    ? allSleep.filter(s => s.baby_id === selectedBaby)
    : allSleep;

  // Mutations
  const feedMutation = useMutation({
    mutationFn: async (data) => {
      const start = new Date(data.start_time);
      const end = data.end_time ? new Date(data.end_time) : null;
      const duration = end ? differenceInMinutes(end, start) : null;

      return await base44.entities.BabyFeedLog.create({
        baby_id: data.baby_id,
        baby_name: data.baby_name,
        feed_type: data.feed_type,
        start_time: data.start_time,
        end_time: data.end_time || null,
        duration_minutes: duration,
        amount_ml: data.amount_ml ? parseFloat(data.amount_ml) : null,
        notes: data.notes,
        baby_mood: data.baby_mood
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['baby-feeds']);
      resetFeedingForm();
      toast.success('🍼 Feeding logged!');
    }
  });

  const diaperMutation = useMutation({
    mutationFn: async (data) => {
      return await base44.entities.DiaperLog.create({
        baby_id: data.baby_id,
        baby_name: data.baby_name,
        change_time: data.change_time,
        diaper_type: data.diaper_type,
        stool_color: data.stool_color,
        stool_consistency: data.stool_consistency,
        rash_detected: data.rash_detected,
        rash_severity: data.rash_severity,
        notes: data.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['baby-diapers']);
      resetDiaperForm();
      toast.success('🧷 Diaper change logged!');
    }
  });

  const sleepMutation = useMutation({
    mutationFn: async (data) => {
      const start = new Date(data.sleep_start);
      const end = data.sleep_end ? new Date(data.sleep_end) : null;
      const duration = end ? differenceInMinutes(end, start) : null;

      return await base44.entities.BabySleepLog.create({
        baby_id: data.baby_id,
        baby_name: data.baby_name,
        sleep_start: data.sleep_start,
        sleep_end: data.sleep_end || null,
        duration_minutes: duration,
        sleep_type: data.sleep_type,
        sleep_quality: data.sleep_quality,
        location: data.location,
        notes: data.notes
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['baby-sleep']);
      resetSleepForm();
      toast.success('😴 Sleep logged!');
    }
  });

  const resetFeedingForm = () => {
    setFeedStartTime(new Date().toISOString().slice(0, 16));
    setFeedEndTime('');
    setFeedAmount('');
    setFeedNotes('');
    setBabyMood('content');
  };

  const resetDiaperForm = () => {
    setDiaperTime(new Date().toISOString().slice(0, 16));
    setDiaperType('wet');
    setRashDetected(false);
    setRashSeverity('none');
    setDiaperNotes('');
  };

  const resetSleepForm = () => {
    setSleepStart(new Date().toISOString().slice(0, 16));
    setSleepEnd('');
    setSleepNotes('');
  };

  const handleFeedSubmit = (e) => {
    e.preventDefault();
    
    if (isMultipleBirth && !selectedBaby) {
      toast.error('Please select which baby to log feeding for');
      return;
    }

    feedMutation.mutate({
      baby_id: selectedBaby || `baby_${Date.now()}`,
      baby_name: currentBabyName,
      feed_type: feedType,
      start_time: feedStartTime,
      end_time: feedEndTime,
      amount_ml: feedAmount,
      notes: feedNotes,
      baby_mood: babyMood
    });
  };

  const handleDiaperSubmit = (e) => {
    e.preventDefault();
    
    if (isMultipleBirth && !selectedBaby) {
      toast.error('Please select which baby to log diaper change for');
      return;
    }

    diaperMutation.mutate({
      baby_id: selectedBaby || `baby_${Date.now()}`,
      baby_name: currentBabyName,
      change_time: diaperTime,
      diaper_type: diaperType,
      stool_color: stoolColor,
      stool_consistency: stoolConsistency,
      rash_detected: rashDetected,
      rash_severity: rashSeverity,
      notes: diaperNotes
    });
  };

  const handleSleepSubmit = (e) => {
    e.preventDefault();
    
    if (isMultipleBirth && !selectedBaby) {
      toast.error('Please select which baby to log sleep for');
      return;
    }

    sleepMutation.mutate({
      baby_id: selectedBaby || `baby_${Date.now()}`,
      baby_name: currentBabyName,
      sleep_start: sleepStart,
      sleep_end: sleepEnd,
      sleep_type: sleepType,
      sleep_quality: sleepQuality,
      location: sleepLocation,
      notes: sleepNotes
    });
  };

  return (
    <div className="space-y-6">
      {/* Baby Selector for Multiple Births */}
      {isMultipleBirth && babies.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardContent className="p-4">
            <BabySelector
              babies={babies}
              selectedBaby={selectedBaby}
              onSelect={setSelectedBaby}
              showAll={false}
            />
            <p className="text-xs text-purple-700 mt-3 text-center">
              👆 Select which baby you're logging care for
            </p>
          </CardContent>
        </Card>
      )}

      {/* Daily Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <CardContent className="p-6 text-center">
            <Baby className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-blue-700">{todayFeedings.length}</p>
            <p className="text-sm text-gray-600">Feedings Today</p>
            {isMultipleBirth && currentBaby && (
              <Badge className="mt-2 text-white" style={{ backgroundColor: currentBaby.color }}>
                {currentBaby.emoji} {currentBaby.baby_name}
              </Badge>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
          <CardContent className="p-6 text-center">
            <Droplet className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-orange-700">{todayDiapers.length}</p>
            <p className="text-sm text-gray-600">Diaper Changes</p>
            {isMultipleBirth && currentBaby && (
              <Badge className="mt-2 text-white" style={{ backgroundColor: currentBaby.color }}>
                {currentBaby.emoji} {currentBaby.baby_name}
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
          <CardContent className="p-6 text-center">
            <Moon className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-3xl font-bold text-purple-700">{todaySleep.length}</p>
            <p className="text-sm text-gray-600">Sleep Sessions</p>
            {isMultipleBirth && currentBaby && (
              <Badge className="mt-2 text-white" style={{ backgroundColor: currentBaby.color }}>
                {currentBaby.emoji} {currentBaby.baby_name}
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Logging Tabs */}
      <Tabs value={activeLogTab} onValueChange={setActiveLogTab}>
        <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm p-1 rounded-2xl shadow-lg">
          <TabsTrigger value="feeding" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white rounded-xl">
            <Baby className="w-4 h-4 mr-2" />
            Feeding
          </TabsTrigger>
          <TabsTrigger value="diaper" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white rounded-xl">
            <Droplet className="w-4 h-4 mr-2" />
            Diaper
          </TabsTrigger>
          <TabsTrigger value="sleep" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-indigo-500 data-[state=active]:text-white rounded-xl">
            <Moon className="w-4 h-4 mr-2" />
            Sleep
          </TabsTrigger>
        </TabsList>

        {/* Feeding Tab */}
        <TabsContent value="feeding" className="mt-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-blue-600" />
                Log Feeding {isMultipleBirth && currentBaby && `for ${currentBaby.emoji} ${currentBaby.baby_name}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFeedSubmit} className="space-y-6">
                <div>
                  <Label className="text-base font-semibold mb-3 block">Feed Type</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      { value: 'breastfeed_left', label: '🤱 Left Breast' },
                      { value: 'breastfeed_right', label: '🤱 Right Breast' },
                      { value: 'breastfeed_both', label: '🤱 Both Breasts' },
                      { value: 'bottle_breast_milk', label: '🍼 Bottle (Breast Milk)' },
                      { value: 'bottle_formula', label: '🍼 Bottle (Formula)' },
                      { value: 'solid_food', label: '🥄 Solid Food' }
                    ].map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFeedType(type.value)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          feedType === type.value
                            ? 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Start Time *</Label>
                    <Input
                      type="datetime-local"
                      value={feedStartTime}
                      onChange={(e) => setFeedStartTime(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>End Time (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={feedEndTime}
                      onChange={(e) => setFeedEndTime(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                {(feedType.includes('bottle') || feedType === 'solid_food') && (
                  <div>
                    <Label>Amount (ml)</Label>
                    <Input
                      type="number"
                      value={feedAmount}
                      onChange={(e) => setFeedAmount(e.target.value)}
                      placeholder="e.g., 120"
                      className="mt-1"
                    />
                  </div>
                )}

                <div>
                  <Label>Baby's Mood</Label>
                  <div className="grid grid-cols-5 gap-2 mt-2">
                    {[
                      { value: 'content', label: '😊 Content' },
                      { value: 'fussy', label: '😣 Fussy' },
                      { value: 'sleepy', label: '😴 Sleepy' },
                      { value: 'alert', label: '👀 Alert' },
                      { value: 'cranky', label: '😠 Cranky' }
                    ].map(mood => (
                      <button
                        key={mood.value}
                        type="button"
                        onClick={() => setBabyMood(mood.value)}
                        className={`p-2 rounded-lg text-xs transition-all ${
                          babyMood === mood.value
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {mood.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={feedNotes}
                    onChange={(e) => setFeedNotes(e.target.value)}
                    placeholder="Any observations during feeding..."
                    className="h-20 mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={feedMutation.isPending || (isMultipleBirth && !selectedBaby)}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 py-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {feedMutation.isPending ? 'Saving...' : `Log Feeding${isMultipleBirth && currentBaby ? ` for ${currentBaby.emoji} ${currentBaby.baby_name}` : ''}`}
                </Button>
              </form>

              {/* Today's Feedings */}
              {todayFeedings.length > 0 && (
                <div className="mt-8 space-y-3">
                  <h4 className="font-bold text-gray-900">
                    Today's Feedings ({todayFeedings.length})
                    {isMultipleBirth && currentBaby && ` for ${currentBaby.emoji} ${currentBaby.baby_name}`}
                  </h4>
                  {todayFeedings.map((feed) => {
                    const feedBaby = babies.find(b => b.baby_id === feed.baby_id);
                    return (
                      <div 
                        key={feed.id} 
                        className="bg-blue-50 rounded-lg p-4 border-2"
                        style={{ borderColor: feedBaby?.color || '#3b82f6' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {isMultipleBirth && feedBaby && (
                              <Badge className="text-white" style={{ backgroundColor: feedBaby.color }}>
                                {feedBaby.emoji} {feedBaby.baby_name}
                              </Badge>
                            )}
                            <Badge className="bg-blue-500 text-white">
                              {feed.feed_type.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-600">
                            {format(parseISO(feed.start_time), 'h:mm a')}
                            {feed.duration_minutes && ` • ${feed.duration_minutes} min`}
                          </span>
                        </div>
                        {feed.amount_ml && (
                          <p className="text-sm text-gray-700">Amount: {feed.amount_ml}ml</p>
                        )}
                        {feed.baby_mood && (
                          <p className="text-sm text-gray-700">Mood: {feed.baby_mood}</p>
                        )}
                        {feed.notes && (
                          <p className="text-sm text-gray-600 mt-1 italic">{feed.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Diaper Tab */}
        <TabsContent value="diaper" className="mt-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Droplet className="w-5 h-5 text-orange-600" />
                Log Diaper Change {isMultipleBirth && currentBaby && `for ${currentBaby.emoji} ${currentBaby.baby_name}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleDiaperSubmit} className="space-y-6">
                <div>
                  <Label>Change Time *</Label>
                  <Input
                    type="datetime-local"
                    value={diaperTime}
                    onChange={(e) => setDiaperTime(e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-base font-semibold mb-3 block">Diaper Type</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { value: 'wet', label: '💧 Wet' },
                      { value: 'dirty', label: '💩 Dirty' },
                      { value: 'both', label: '💧💩 Both' },
                      { value: 'dry', label: '✨ Dry' }
                    ].map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setDiaperType(type.value)}
                        className={`p-3 rounded-xl text-sm font-medium transition-all ${
                          diaperType === type.value
                            ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {(diaperType === 'dirty' || diaperType === 'both') && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Stool Color</Label>
                      <select
                        value={stoolColor}
                        onChange={(e) => setStoolColor(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="yellow">Yellow (Normal)</option>
                        <option value="brown">Brown</option>
                        <option value="green">Green</option>
                        <option value="black">Black (Meconium)</option>
                        <option value="red">Red (Consult Doctor)</option>
                        <option value="white">White (Consult Doctor)</option>
                      </select>
                    </div>
                    <div>
                      <Label>Consistency</Label>
                      <select
                        value={stoolConsistency}
                        onChange={(e) => setStoolConsistency(e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="liquid">Liquid</option>
                        <option value="soft">Soft (Normal)</option>
                        <option value="firm">Firm</option>
                        <option value="hard">Hard</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      id="rash"
                      checked={rashDetected}
                      onChange={(e) => setRashDetected(e.target.checked)}
                      className="w-5 h-5"
                    />
                    <Label htmlFor="rash" className="cursor-pointer">Diaper Rash Detected?</Label>
                  </div>

                  {rashDetected && (
                    <div>
                      <Label>Rash Severity</Label>
                      <div className="grid grid-cols-4 gap-2 mt-2">
                        {['none', 'mild', 'moderate', 'severe'].map(severity => (
                          <button
                            key={severity}
                            type="button"
                            onClick={() => setRashSeverity(severity)}
                            className={`p-2 rounded-lg text-sm capitalize transition-all ${
                              rashSeverity === severity
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {severity}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={diaperNotes}
                    onChange={(e) => setDiaperNotes(e.target.value)}
                    placeholder="Any observations..."
                    className="h-20 mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={diaperMutation.isPending || (isMultipleBirth && !selectedBaby)}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 py-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {diaperMutation.isPending ? 'Saving...' : `Log Diaper Change${isMultipleBirth && currentBaby ? ` for ${currentBaby.emoji} ${currentBaby.baby_name}` : ''}`}
                </Button>
              </form>

              {/* Today's Diapers */}
              {todayDiapers.length > 0 && (
                <div className="mt-8 space-y-3">
                  <h4 className="font-bold text-gray-900">
                    Today's Changes ({todayDiapers.length})
                    {isMultipleBirth && currentBaby && ` for ${currentBaby.emoji} ${currentBaby.baby_name}`}
                  </h4>
                  {todayDiapers.map((diaper) => {
                    const diaperBaby = babies.find(b => b.baby_id === diaper.baby_id);
                    return (
                      <div 
                        key={diaper.id} 
                        className="bg-orange-50 rounded-lg p-4 border-2"
                        style={{ borderColor: diaperBaby?.color || '#f59e0b' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {isMultipleBirth && diaperBaby && (
                              <Badge className="text-white" style={{ backgroundColor: diaperBaby.color }}>
                                {diaperBaby.emoji} {diaperBaby.baby_name}
                              </Badge>
                            )}
                            <Badge className="bg-orange-500 text-white capitalize">
                              {diaper.diaper_type}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-600">
                            {format(parseISO(diaper.change_time), 'h:mm a')}
                          </span>
                        </div>
                        {diaper.rash_detected && (
                          <p className="text-sm text-red-700">⚠️ Rash: {diaper.rash_severity}</p>
                        )}
                        {diaper.stool_color && (
                          <p className="text-sm text-gray-700">Stool: {diaper.stool_color}, {diaper.stool_consistency}</p>
                        )}
                        {diaper.notes && (
                          <p className="text-sm text-gray-600 mt-1 italic">{diaper.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sleep Tab */}
        <TabsContent value="sleep" className="mt-6">
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-purple-600" />
                Log Sleep {isMultipleBirth && currentBaby && `for ${currentBaby.emoji} ${currentBaby.baby_name}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSleepSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Sleep Start *</Label>
                    <Input
                      type="datetime-local"
                      value={sleepStart}
                      onChange={(e) => setSleepStart(e.target.value)}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Sleep End (Optional)</Label>
                    <Input
                      type="datetime-local"
                      value={sleepEnd}
                      onChange={(e) => setSleepEnd(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Sleep Type</Label>
                    <select
                      value={sleepType}
                      onChange={(e) => setSleepType(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="nap">Nap</option>
                      <option value="night_sleep">Night Sleep</option>
                    </select>
                  </div>
                  <div>
                    <Label>Sleep Quality</Label>
                    <select
                      value={sleepQuality}
                      onChange={(e) => setSleepQuality(e.target.value)}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
                    >
                      <option value="peaceful">Peaceful</option>
                      <option value="restless">Restless</option>
                      <option value="woke_frequently">Woke Frequently</option>
                    </select>
                  </div>
                </div>

                <div>
                  <Label>Sleep Location</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mt-2">
                    {[
                      { value: 'crib', label: '🛏️ Crib' },
                      { value: 'bassinet', label: '🛏️ Bassinet' },
                      { value: 'co_sleeping', label: '👨‍👩‍👧 Co-sleep' },
                      { value: 'stroller', label: '🚼 Stroller' },
                      { value: 'car_seat', label: '🚗 Car Seat' },
                      { value: 'other', label: '📍 Other' }
                    ].map(loc => (
                      <button
                        key={loc.value}
                        type="button"
                        onClick={() => setSleepLocation(loc.value)}
                        className={`p-2 rounded-lg text-xs transition-all ${
                          sleepLocation === loc.value
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {loc.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={sleepNotes}
                    onChange={(e) => setSleepNotes(e.target.value)}
                    placeholder="Sleep environment, how baby fell asleep..."
                    className="h-20 mt-1"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={sleepMutation.isPending || (isMultipleBirth && !selectedBaby)}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 py-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  {sleepMutation.isPending ? 'Saving...' : `Log Sleep${isMultipleBirth && currentBaby ? ` for ${currentBaby.emoji} ${currentBaby.baby_name}` : ''}`}
                </Button>
              </form>

              {/* Today's Sleep */}
              {todaySleep.length > 0 && (
                <div className="mt-8 space-y-3">
                  <h4 className="font-bold text-gray-900">
                    Today's Sleep ({todaySleep.length})
                    {isMultipleBirth && currentBaby && ` for ${currentBaby.emoji} ${currentBaby.baby_name}`}
                  </h4>
                  {todaySleep.map((sleep) => {
                    const sleepBaby = babies.find(b => b.baby_id === sleep.baby_id);
                    return (
                      <div 
                        key={sleep.id} 
                        className="bg-purple-50 rounded-lg p-4 border-2"
                        style={{ borderColor: sleepBaby?.color || '#8b5cf6' }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {isMultipleBirth && sleepBaby && (
                              <Badge className="text-white" style={{ backgroundColor: sleepBaby.color }}>
                                {sleepBaby.emoji} {sleepBaby.baby_name}
                              </Badge>
                            )}
                            <Badge className="bg-purple-500 text-white capitalize">
                              {sleep.sleep_type.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-600">
                            {format(parseISO(sleep.sleep_start), 'h:mm a')}
                            {sleep.duration_minutes && ` • ${sleep.duration_minutes} min`}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">Quality: {sleep.sleep_quality}</p>
                        <p className="text-sm text-gray-700">Location: {sleep.location}</p>
                        {sleep.notes && (
                          <p className="text-sm text-gray-600 mt-1 italic">{sleep.notes}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}