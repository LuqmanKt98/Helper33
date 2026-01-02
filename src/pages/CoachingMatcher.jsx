import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CoachingApproach } from '@/entities/all';
import SurveyWizard from '@/components/coaching/SurveyWizard';
import ResultsDisplay from '@/components/coaching/ResultsDisplay';
import { Loader2 } from 'lucide-react';

const CoachingMatcherPage = () => {
  const [answers, setAnswers] = useState(null);
  const [results, setResults] = useState(null);

  const { data: approaches, isLoading: approachesLoading } = useQuery({
    queryKey: ['coachingApproaches'],
    queryFn: () => CoachingApproach.list(),
  });

  const runMatcherLogic = (userAnswers) => {
    let reco = null;
    let alt = [];
    let boost = [];
    let why = "";

    // Logic from spec
    if (userAnswers.goals === 'reduce_symptoms' && userAnswers.preferences === 'structured') {
      reco = 'CBT';
      alt = ['ACT', 'MBCT', 'REBT', 'RTT'];
      why = "You prefer a structured, skills-based approach to tackle specific symptoms, which is the core strength of CBT."
    } else if (userAnswers.preferences === 'exploratory') {
      reco = 'Person_Centered';
      alt = ['Psychodynamic', 'Existential', 'Narrative'];
      why = "Your desire for reflective exploration is a perfect match for Person-Centered coaching, which lets you lead the way."
    } else if (userAnswers.preferences === 'body_based' || userAnswers.format?.includes('movement')) {
      reco = 'Somatic_Experiencing';
      alt = ['Sensorimotor', 'Breathwork_Yoga', 'MBCT'];
       why = "You're attuned to the mind-body connection. Somatic approaches directly address this link to promote healing."
    } else if (userAnswers.preferences === 'brief_hypno') {
      reco = 'RTT';
      alt = ['ACT', 'MBCT', 'Integrative'];
      why = "You're looking for rapid, transformational change, and RTT is designed for exactly that by working with the subconscious."
    }

    if (userAnswers.goals === 'emotion_reg') boost.push('Emotion_Focused', 'DBT');
    if (userAnswers.goals === 'meaning') boost.push('Existential', 'Meaning_Reconstruction', 'Holistic');
    if (userAnswers.goals === 'relationship') boost.push('Couples_Gottman', 'Family_Systems');
    if (userAnswers.grief_context === 'recent') boost.push('Continuing_Bonds', 'Meaning_Reconstruction', 'Person_Centered');
    if (userAnswers.grief_context === 'prolonged') boost.push('CGT', 'TF_CBT', 'EMDR');
    
    // Fallback if no primary recommendation was set
    if (!reco) {
        if(userAnswers.grief_context !== 'none') reco = 'Continuing_Bonds';
        else if (userAnswers.goals === 'emotion_reg') reco = 'DBT';
        else reco = 'Integrative';
        why = "Your answers suggest a unique blend of needs. An integrative or person-centered approach can be tailored specifically to you."
    }

    // Combine and find from DB
    const primary = approaches.find(a => a.key === reco);
    const alternatives = [...new Set([...alt, ...boost])]
      .map(key => approaches.find(a => a.key === key))
      .filter(Boolean) // Remove undefined
      .filter(a => a.key !== reco) // Remove primary from alts
      .slice(0, 3); // Limit to 3 alternatives

    setResults({ primary, alternatives, why });
  };
  
  useEffect(() => {
    if (answers && approaches) {
      runMatcherLogic(answers);
    }
  }, [answers, approaches]);

  const handleSurveyComplete = (submittedAnswers) => {
    setAnswers(submittedAnswers);
  };

  const handleReset = () => {
    setAnswers(null);
    setResults(null);
  };

  if (approachesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        <p className="ml-4 text-lg text-gray-600">Loading coaching styles...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 sm:p-10 border border-gray-200">
        {!results ? (
            <>
            <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">Find Your Coaching Style</h1>
                <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">Answer a few questions to find the therapeutic approaches that best fit your needs and preferences.</p>
            </div>
            <SurveyWizard onComplete={handleSurveyComplete} />
            </>
        ) : (
          <ResultsDisplay results={results} onReset={handleReset} />
        )}
      </div>
    </div>
  );
};

export default CoachingMatcherPage;