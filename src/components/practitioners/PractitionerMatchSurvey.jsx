import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const CONCERNS = [
  'Anxiety', 'Depression', 'Trauma/PTSD', 'Grief & Loss', 'Stress Management',
  'Relationship Issues', 'Life Transitions', 'Self-Esteem', 'Family Conflict',
  'Addiction Recovery', 'Eating Disorders', 'Sleep Issues', 'Work-Life Balance',
  'Parenting Support', 'Chronic Illness', 'Other'
];

const TREATMENT_APPROACHES = [
  'Cognitive Behavioral Therapy (CBT)', 'Dialectical Behavior Therapy (DBT)',
  'EMDR', 'Mindfulness-Based', 'Psychodynamic', 'Solution-Focused',
  'Family Systems', 'Trauma-Informed', 'Holistic/Integrative', 'Art Therapy',
  'Play Therapy', 'No Preference'
];

export default function PractitionerMatchSurvey({ practitioners, onMatch }) {
  const [step, setStep] = useState(1);
  const [surveyData, setSurveyData] = useState({
    primary_concerns: [],
    preferred_treatment_approach: [],
    age_group: '',
    session_preference: '',
    budget_per_session: '',
    has_insurance: false,
    insurance_provider: '',
    preferred_language: 'English',
    availability_preference: ''
  });

  const toggleConcern = (concern) => {
    setSurveyData(prev => ({
      ...prev,
      primary_concerns: prev.primary_concerns.includes(concern)
        ? prev.primary_concerns.filter(c => c !== concern)
        : [...prev.primary_concerns, concern]
    }));
  };

  const toggleApproach = (approach) => {
    setSurveyData(prev => ({
      ...prev,
      preferred_treatment_approach: prev.preferred_treatment_approach.includes(approach)
        ? prev.preferred_treatment_approach.filter(a => a !== approach)
        : [...prev.preferred_treatment_approach, approach]
    }));
  };

  const handleSubmit = async () => {
    try {
      const matched = practitioners.filter(p => {
        let score = 0;

        surveyData.primary_concerns.forEach(concern => {
          if (p.specializations?.some(s => s.toLowerCase().includes(concern.toLowerCase()))) {
            score += 3;
          }
        });

        surveyData.preferred_treatment_approach.forEach(approach => {
          if (p.treatment_approaches?.includes(approach)) {
            score += 2;
          }
        });

        if (surveyData.age_group && p.age_groups_served?.includes(surveyData.age_group)) {
          score += 2;
        }

        if (surveyData.session_preference === 'telehealth' && p.accepts_telehealth) {
          score += 1;
        }
        if (surveyData.session_preference === 'in_person' && p.accepts_in_person) {
          score += 1;
        }
        if (surveyData.session_preference === 'both' && p.accepts_telehealth && p.accepts_in_person) {
          score += 2;
        }

        if (surveyData.preferred_language && p.languages_spoken?.includes(surveyData.preferred_language)) {
          score += 1;
        }

        return score > 0;
      }).sort((a, b) => b.average_rating - a.average_rating);

      const matchedIds = matched.map(p => p.id);

      await base44.entities.PractitionerMatchSurvey.create({
        ...surveyData,
        budget_per_session: surveyData.budget_per_session ? parseFloat(surveyData.budget_per_session) : 0,
        matched_practitioners: matchedIds
      });

      onMatch(matchedIds);
    } catch (error) {
      console.error('Error saving survey:', error);
      toast.error('Failed to save survey');
    }
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-2 border-purple-300 shadow-2xl">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Find Your Perfect Match
        </CardTitle>
        <p className="text-sm text-white/90">Step {step} of 4</p>
      </CardHeader>

      <CardContent className="p-6">
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="font-bold text-lg mb-4">What brings you here today?</h3>
            <p className="text-sm text-gray-600 mb-4">Select all that apply</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {CONCERNS.map(concern => (
                <button
                  key={concern}
                  onClick={() => toggleConcern(concern)}
                  className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    surveyData.primary_concerns.includes(concern)
                      ? 'bg-purple-100 border-purple-500 text-purple-900'
                      : 'bg-white border-purple-200 hover:border-purple-400'
                  }`}
                >
                  {surveyData.primary_concerns.includes(concern) && (
                    <CheckCircle className="w-4 h-4 inline mr-1 text-purple-600" />
                  )}
                  {concern}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="font-bold text-lg mb-4">Treatment Preferences</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block font-semibold">Preferred Approaches (optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {TREATMENT_APPROACHES.map(approach => (
                    <button
                      key={approach}
                      onClick={() => toggleApproach(approach)}
                      className={`p-2 rounded-lg border-2 text-xs transition-all ${
                        surveyData.preferred_treatment_approach.includes(approach)
                          ? 'bg-purple-100 border-purple-500 text-purple-900'
                          : 'bg-white border-purple-200 hover:border-purple-400'
                      }`}
                    >
                      {approach}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block font-semibold">Age Group</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['child', 'teen', 'adult', 'senior'].map(age => (
                    <button
                      key={age}
                      onClick={() => setSurveyData(prev => ({ ...prev, age_group: age }))}
                      className={`p-3 rounded-xl border-2 capitalize ${
                        surveyData.age_group === age
                          ? 'bg-purple-100 border-purple-500 text-purple-900 font-semibold'
                          : 'bg-white border-purple-200 hover:border-purple-400'
                      }`}
                    >
                      {age}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="font-bold text-lg mb-4">Session Preferences</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block font-semibold">Session Type</Label>
                <div className="grid grid-cols-3 gap-3">
                  {['telehealth', 'in_person', 'both'].map(type => (
                    <button
                      key={type}
                      onClick={() => setSurveyData(prev => ({ ...prev, session_preference: type }))}
                      className={`p-3 rounded-xl border-2 capitalize ${
                        surveyData.session_preference === type
                          ? 'bg-purple-100 border-purple-500 text-purple-900 font-semibold'
                          : 'bg-white border-purple-200 hover:border-purple-400'
                      }`}
                    >
                      {type.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="mb-2 block font-semibold">Budget per Session (USD)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 150"
                  value={surveyData.budget_per_session}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, budget_per_session: e.target.value }))}
                  className="border-2 border-purple-300"
                />
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={surveyData.has_insurance}
                  onCheckedChange={(checked) => setSurveyData(prev => ({ ...prev, has_insurance: checked }))}
                />
                <Label>I have health insurance</Label>
              </div>

              {surveyData.has_insurance && (
                <Input
                  placeholder="Insurance Provider (e.g., Blue Cross)"
                  value={surveyData.insurance_provider}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, insurance_provider: e.target.value }))}
                  className="border-2 border-purple-300"
                />
              )}
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h3 className="font-bold text-lg mb-4">Final Preferences</h3>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block font-semibold">Preferred Language</Label>
                <Input
                  placeholder="e.g., English, Spanish"
                  value={surveyData.preferred_language}
                  onChange={(e) => setSurveyData(prev => ({ ...prev, preferred_language: e.target.value }))}
                  className="border-2 border-purple-300"
                />
              </div>

              <div>
                <Label className="mb-2 block font-semibold">Availability Preference</Label>
                <div className="grid grid-cols-2 gap-3">
                  {['Morning', 'Afternoon', 'Evening', 'Weekends'].map(time => (
                    <button
                      key={time}
                      onClick={() => setSurveyData(prev => ({ ...prev, availability_preference: time }))}
                      className={`p-3 rounded-xl border-2 ${
                        surveyData.availability_preference === time
                          ? 'bg-purple-100 border-purple-500 text-purple-900 font-semibold'
                          : 'bg-white border-purple-200 hover:border-purple-400'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <Button
              onClick={() => setStep(step - 1)}
              variant="outline"
              className="flex-1 border-2 border-purple-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          
          {step < 4 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && surveyData.primary_concerns.length === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!surveyData.age_group || !surveyData.session_preference}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Find My Matches
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}