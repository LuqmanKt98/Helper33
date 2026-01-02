import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const MOOD_OPTIONS = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'energized', emoji: '⚡', label: 'Energized' },
  { value: 'calm', emoji: '😌', label: 'Calm' },
  { value: 'irritable', emoji: '😠', label: 'Irritable' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'emotional', emoji: '🥺', label: 'Emotional' },
  { value: 'confident', emoji: '💪', label: 'Confident' }
];

const PHYSICAL_SYMPTOMS = [
  { value: 'cramps', label: 'Cramps', icon: '💥' },
  { value: 'bloating', label: 'Bloating', icon: '🎈' },
  { value: 'headache', label: 'Headache', icon: '🤕' },
  { value: 'back_pain', label: 'Back Pain', icon: '🔙' },
  { value: 'breast_tenderness', label: 'Breast Tenderness', icon: '💗' },
  { value: 'fatigue', label: 'Fatigue', icon: '😴' },
  { value: 'nausea', label: 'Nausea', icon: '🤢' },
  { value: 'acne', label: 'Acne', icon: '✨' },
  { value: 'food_cravings', label: 'Food Cravings', icon: '🍫' }
];

export default function DailySymptomLogger({ currentCycle, cycleInfo }) {
  const today = new Date().toISOString().split('T')[0];
  const queryClient = useQueryClient();

  const { data: todayLog } = useQuery({
    queryKey: ['today-symptom-log', today],
    queryFn: async () => {
      const logs = await base44.entities.CycleSymptom.filter({ log_date: today });
      return logs.length > 0 ? logs[0] : null;
    }
  });

  const [formData, setFormData] = useState({
    flow_type: 'none',
    mood: [],
    physical_symptoms: [],
    energy_level: 5,
    mood_rating: 5,
    sleep_hours: 7,
    water_intake: 8,
    exercise_minutes: 0,
    basal_body_temp: null,
    cervical_mucus: 'none',
    notes: ''
  });

  useEffect(() => {
    if (todayLog) {
      setFormData({
        flow_type: todayLog.flow_type || 'none',
        mood: todayLog.mood || [],
        physical_symptoms: todayLog.physical_symptoms || [],
        energy_level: todayLog.energy_level || 5,
        mood_rating: todayLog.mood_rating || 5,
        sleep_hours: todayLog.sleep_hours || 7,
        water_intake: todayLog.water_intake || 8,
        exercise_minutes: todayLog.exercise_minutes || 0,
        basal_body_temp: todayLog.basal_body_temp || null,
        cervical_mucus: todayLog.cervical_mucus || 'none',
        notes: todayLog.notes || ''
      });
    }
  }, [todayLog]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const logData = {
        log_date: today,
        cycle_id: currentCycle?.id,
        cycle_day: cycleInfo.cycleDay,
        ...data
      };

      if (todayLog) {
        return await base44.entities.CycleSymptom.update(todayLog.id, logData);
      } else {
        return await base44.entities.CycleSymptom.create(logData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cycle-symptoms'] });
      queryClient.invalidateQueries({ queryKey: ['today-symptom-log'] });
      toast.success('Daily log saved!', {
        description: 'Your symptoms and mood have been recorded.'
      });
    }
  });

  const toggleMood = (mood) => {
    setFormData(prev => ({
      ...prev,
      mood: prev.mood.includes(mood)
        ? prev.mood.filter(m => m !== mood)
        : [...prev.mood, mood]
    }));
  };

  const toggleSymptom = (symptom) => {
    setFormData(prev => ({
      ...prev,
      physical_symptoms: prev.physical_symptoms.includes(symptom)
        ? prev.physical_symptoms.filter(s => s !== symptom)
        : [...prev.physical_symptoms, symptom]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Heart className="w-6 h-6 text-pink-500" />
          Today's Health Log
        </CardTitle>
        {cycleInfo.cycleDay > 0 && (
          <Badge className="bg-purple-100 text-purple-700 w-fit">
            Cycle Day {cycleInfo.cycleDay}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Flow Type */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Period Flow</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { value: 'none', label: 'None', color: 'from-gray-200 to-gray-300' },
                { value: 'spotting', label: 'Spotting', color: 'from-pink-200 to-pink-300' },
                { value: 'light', label: 'Light', color: 'from-pink-300 to-pink-400' },
                { value: 'medium', label: 'Medium', color: 'from-red-400 to-pink-500' },
                { value: 'heavy', label: 'Heavy', color: 'from-red-500 to-red-600' },
                { value: 'very_heavy', label: 'Very Heavy', color: 'from-red-600 to-red-700' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, flow_type: option.value }))}
                  className={`
                    p-3 rounded-xl text-xs font-semibold transition-all
                    ${formData.flow_type === option.value
                      ? `bg-gradient-to-br ${option.color} text-white shadow-lg scale-105`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selection */}
          <div>
            <Label className="text-base font-semibold mb-3 block">How Are You Feeling?</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {MOOD_OPTIONS.map(mood => (
                <button
                  key={mood.value}
                  type="button"
                  onClick={() => toggleMood(mood.value)}
                  className={`
                    p-3 rounded-xl transition-all text-sm font-medium
                    ${formData.mood.includes(mood.value)
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg scale-105'
                      : 'bg-white border-2 border-gray-200 hover:border-purple-300'
                    }
                  `}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  {mood.label}
                </button>
              ))}
            </div>
          </div>

          {/* Physical Symptoms */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Physical Symptoms</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PHYSICAL_SYMPTOMS.map(symptom => (
                <button
                  key={symptom.value}
                  type="button"
                  onClick={() => toggleSymptom(symptom.value)}
                  className={`
                    p-3 rounded-xl transition-all text-sm font-medium text-left
                    ${formData.physical_symptoms.includes(symptom.value)
                      ? 'bg-gradient-to-br from-rose-400 to-pink-500 text-white shadow-lg'
                      : 'bg-white border-2 border-gray-200 hover:border-rose-300'
                    }
                  `}
                >
                  <span className="mr-2">{symptom.icon}</span>
                  {symptom.label}
                </button>
              ))}
            </div>
          </div>

          {/* Energy & Mood Ratings */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label className="text-sm font-medium">Energy Level ({formData.energy_level}/10)</Label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.energy_level}
                onChange={(e) => setFormData(prev => ({ ...prev, energy_level: parseInt(e.target.value) }))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer mt-2"
                style={{
                  background: `linear-gradient(to right, #F472B6 0%, #EC4899 ${formData.energy_level * 10}%, #e5e7eb ${formData.energy_level * 10}%, #e5e7eb 100%)`
                }}
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Overall Mood ({formData.mood_rating}/10)</Label>
              <input
                type="range"
                min="1"
                max="10"
                value={formData.mood_rating}
                onChange={(e) => setFormData(prev => ({ ...prev, mood_rating: parseInt(e.target.value) }))}
                className="w-full h-2 rounded-lg appearance-none cursor-pointer mt-2"
                style={{
                  background: `linear-gradient(to right, #A78BFA 0%, #8B5CF6 ${formData.mood_rating * 10}%, #e5e7eb ${formData.mood_rating * 10}%, #e5e7eb 100%)`
                }}
              />
            </div>
          </div>

          {/* Fertility Tracking */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="bbt" className="text-sm font-medium">Basal Body Temp (°F)</Label>
              <Input
                id="bbt"
                type="number"
                step="0.1"
                min="95"
                max="100"
                value={formData.basal_body_temp || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, basal_body_temp: parseFloat(e.target.value) || null }))}
                placeholder="97.5"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-sm font-medium">Cervical Mucus</Label>
              <select
                value={formData.cervical_mucus}
                onChange={(e) => setFormData(prev => ({ ...prev, cervical_mucus: e.target.value }))}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="none">None</option>
                <option value="sticky">Sticky</option>
                <option value="creamy">Creamy</option>
                <option value="watery">Watery</option>
                <option value="egg_white">Egg White (Fertile)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="How are you feeling today? Any other observations..."
              className="h-24 mt-2"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 py-6 text-lg"
            disabled={saveMutation.isPending}
          >
            <Heart className="w-5 h-5 mr-2" />
            {saveMutation.isPending ? 'Saving...' : 'Save Today\'s Log'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}