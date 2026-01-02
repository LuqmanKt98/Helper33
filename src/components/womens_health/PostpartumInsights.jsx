import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Baby, Heart, Sparkles, AlertCircle, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PostpartumInsights({ weeksPostpartum, milestones, babyName }) {
  const getDefaultInsights = (week) => {
    if (week <= 6) {
      return {
        title: 'Early Postpartum Recovery',
        babyDevelopment: 'Your newborn is adjusting to life outside the womb. Focus on feeding, sleeping, and bonding.',
        momRecovery: 'Your body is healing. Rest is critical. Bleeding (lochia) is normal for 4-6 weeks.',
        careTips: [
          'Rest when baby sleeps - seriously!',
          'Accept help from family and friends',
          'Stay hydrated, especially if breastfeeding',
          'Gentle pelvic floor exercises (after doctor approval)',
          'Watch for signs of postpartum depression'
        ],
        expectations: [
          'Baby sleeps 16-20 hours/day in short bursts',
          'Feeds every 2-3 hours (8-12 times/day)',
          'Frequent diaper changes (8-12/day)',
          'Emotional ups and downs are normal',
          'Your body is still healing - be patient'
        ],
        babyBehaviors: [
          'Cluster feeding in evenings',
          'Startle reflex to sudden sounds',
          'Rooting and sucking reflexes',
          'Crying peaks around 6 weeks',
          'Sleeps in 2-4 hour stretches'
        ]
      };
    } else if (week <= 12) {
      return {
        title: 'Building Routines',
        babyDevelopment: 'Baby is becoming more alert and may start smiling! Vision and hearing are developing.',
        momRecovery: '6-week checkup is key. You may be cleared for exercise. Hormones are stabilizing.',
        careTips: [
          'Start gentle exercise if cleared by doctor',
          'Establish a loose routine (not rigid schedule)',
          'Take care of your mental health',
          'Connect with other new moms',
          'Consider pelvic floor physical therapy'
        ],
        expectations: [
          'First social smiles around 6-8 weeks',
          'Slightly longer sleep stretches at night',
          'More alert and responsive during day',
          'Feeding may space out slightly',
          'You might feel more like yourself'
        ],
        babyBehaviors: [
          'Social smiling and cooing',
          'Better head control',
          'Tracking objects with eyes',
          'Responding to voices',
          'Developing sleep-wake patterns'
        ]
      };
    } else if (week <= 26) {
      return {
        title: 'Growing & Developing',
        babyDevelopment: 'Rapid physical and cognitive development! Rolling, reaching, laughing, and exploring.',
        momRecovery: 'You\'re likely feeling more energized. Focus on nutrition and self-care.',
        careTips: [
          'Enjoy tummy time with baby',
          'Read and sing to encourage language',
          'Babyproof your home',
          'Maintain your own wellness routine',
          'Consider returning to hobbies you enjoy'
        ],
        expectations: [
          'Baby may roll over (4-6 months)',
          'Starting solid foods around 6 months',
          'Longer nighttime sleep (hopefully!)',
          'Teething may begin',
          'More interactive and playful'
        ],
        babyBehaviors: [
          'Laughing and squealing',
          'Reaching for toys',
          'Putting everything in mouth',
          'Babbling and cooing',
          'Recognizing familiar faces'
        ]
      };
    } else if (week <= 52) {
      return {
        title: 'First Year Milestones',
        babyDevelopment: 'So much growth! Crawling, maybe cruising, first words, and strong personality emerging.',
        momRecovery: 'You\'ve survived the first year! Celebrate yourself, mama.',
        careTips: [
          'Encourage safe exploration',
          'Maintain consistent sleep routines',
          'Introduce variety in solid foods',
          'Take time for yourself - you deserve it!',
          'Celebrate every milestone, big and small'
        ],
        expectations: [
          'Increased mobility (crawling/walking)',
          'First words may emerge',
          'Strong attachment to parents',
          '2-3 naps reducing to 1-2',
          'More independent eating'
        ],
        babyBehaviors: [
          'Separation anxiety is normal',
          'Stranger danger phase',
          'Testing boundaries',
          'Copying your actions',
          'Showing preferences and personality'
        ]
      };
    }

    return null;
  };

  const insight = milestones[0] || getDefaultInsights(weeksPostpartum);

  if (!insight) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
        <CardContent className="p-8 text-center">
          <Heart className="w-12 h-12 text-pink-500 mx-auto mb-4" />
          <p className="text-gray-600">No insights available for this week</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Card */}
      <Card className="bg-gradient-to-r from-rose-100 to-pink-100 border-2 border-rose-200">
        <CardContent className="p-6 text-center">
          <h2 className="text-2xl font-bold text-rose-900">
            {insight.title || `Week ${weeksPostpartum} Postpartum`}
          </h2>
        </CardContent>
      </Card>

      {/* Baby Development */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Baby className="w-5 h-5 text-blue-500" />
            {babyName ? `${babyName}'s Development` : 'Baby Development'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700">{insight.baby_development || insight.description}</p>
          
          {insight.babyBehaviors && insight.babyBehaviors.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">👶 Common Behaviors</h4>
              <div className="space-y-2">
                {insight.babyBehaviors.map((behavior, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <span className="text-blue-600 font-bold">•</span>
                    <p className="text-sm text-gray-700">{behavior}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mom Recovery */}
      {insight.momRecovery && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-500" />
              Your Recovery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{insight.momRecovery || insight.mom_body_changes}</p>
          </CardContent>
        </Card>
      )}

      {/* Care Tips */}
      {insight.careTips && insight.careTips.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Care Tips for This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(insight.careTips || insight.care_tips || []).map((tip, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg"
                >
                  <Sparkles className="w-4 h-4 text-purple-600 flex-shrink-0 mt-1" />
                  <p className="text-sm text-gray-700">{tip}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* What to Expect */}
      {insight.expectations && insight.expectations.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              What to Expect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(insight.expectations || insight.what_to_expect || []).map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                  <span className="text-green-600">✓</span>
                  <p className="text-sm text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Red Flags */}
      {insight.red_flags && insight.red_flags.length > 0 && (
        <Card className="bg-red-50 border-2 border-red-300 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-5 h-5 text-red-600" />
              When to Call Your Doctor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {insight.red_flags.map((flag, idx) => (
                <li key={idx} className="text-sm text-red-800 flex items-start gap-2">
                  <span className="text-red-600 font-bold">⚠️</span>
                  {flag}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Support Message */}
      <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Heart className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
            <div className="text-sm text-purple-900">
              <p className="font-semibold mb-2">💜 You're Doing Amazing</p>
              <p>
                Motherhood is a journey, not a destination. Every baby is different, and you're learning together. 
                Be gentle with yourself, ask for help when you need it, and trust your instincts. You've got this! 💪
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}