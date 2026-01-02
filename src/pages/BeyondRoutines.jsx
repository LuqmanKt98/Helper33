import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain,
  Heart,
  Zap,
  Moon,
  Wind,
  Shield,
  Sparkles,
  Target,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Clock,
  Lightbulb,
  Waves,
  CircleDot,
  RefreshCw,
  Battery,
  Flower2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BeyondRoutines() {
  const [selectedPath, setSelectedPath] = useState(null); // 'flex' or 'anchor'

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F0E8F5] via-[#E8F0F2] to-[#F5F0E8] relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 30, 0],
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 w-64 h-64 bg-[#C8A2C8]/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ 
            x: [0, -40, 0],
            y: [0, 30, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-10 w-80 h-80 bg-[#7AAE9E]/10 rounded-full blur-3xl"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-[#A6C48A] to-[#7AAE9E] rounded-3xl flex items-center justify-center mx-auto shadow-lg">
            <Waves className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#2E2E2E]">
            Beyond Routines
          </h1>
          <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
            Why strict schedules feel exhausting — and what to do instead
          </p>
        </motion.div>

        {/* Why Routines Feel Hard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Brain className="w-7 h-7 text-purple-500" />
                Why Consistent Routines Feel Pressuring
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-[#4A5568] leading-relaxed">
                If rigid routines make you feel <span className="font-semibold text-[#2E2E2E]">exhausted, pressured, or trapped</span>, 
                you're not broken — your brain just works differently. Here's what's really happening:
              </p>

              <div className="grid gap-4">
                {[
                  {
                    icon: Zap,
                    color: 'text-amber-500',
                    title: 'Executive Dysfunction',
                    description: 'Your brain struggles with task initiation, transitions, and time blindness. A rigid schedule feels like constant "should" pressure that depletes your energy faster than the actual tasks.'
                  },
                  {
                    icon: AlertCircle,
                    color: 'text-red-500',
                    title: 'Perfectionism Paralysis',
                    description: 'If you can\'t do the routine "perfectly," your brain says "why bother?" This all-or-nothing thinking makes you abandon the whole system when you miss one thing.'
                  },
                  {
                    icon: Battery,
                    color: 'text-blue-500',
                    title: 'Variable Energy Levels',
                    description: 'Your energy fluctuates daily (or hourly). A schedule built for "high energy you" becomes torture on low-energy days, creating shame and burnout.'
                  },
                  {
                    icon: RefreshCw,
                    color: 'text-green-500',
                    title: 'Transition Exhaustion',
                    description: 'Moving between tasks requires massive mental energy. Routines demand constant transitions on someone else\'s timeline, not yours.'
                  },
                  {
                    icon: Shield,
                    color: 'text-purple-500',
                    title: 'Autonomy Need',
                    description: 'Your brain rebels against external control — even if YOU made the schedule. It feels like being told what to do, triggering resistance and anxiety.'
                  }
                ].map((reason, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="flex gap-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200"
                  >
                    <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-white shadow-md flex items-center justify-center ${reason.color}`}>
                      <reason.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#2E2E2E] mb-1">{reason.title}</h3>
                      <p className="text-sm text-[#6B7280]">{reason.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Heart className="w-4 h-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>You're not lazy or undisciplined.</strong> Your brain needs a different approach — 
                  one that works WITH your natural rhythms, not against them.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.div>

        {/* The Alternative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-[#7AAE9E]/10 to-[#A6C48A]/10 backdrop-blur-sm border-2 border-[#7AAE9E]/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Flower2 className="w-7 h-7 text-[#7AAE9E]" />
                What Works Instead: Flow-Based Living
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg text-[#4A5568] leading-relaxed">
                Instead of rigid routines, embrace <span className="font-semibold text-[#2E2E2E]">flexible flow systems</span> that:
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { icon: Wind, title: 'Follow Your Energy', desc: 'Do tasks when you FEEL like it, not when a clock says so' },
                  { icon: CircleDot, title: 'Micro-Steps Only', desc: 'Break everything into 2-minute starts to overcome paralysis' },
                  { icon: CheckCircle, title: 'Good Enough Wins', desc: 'Celebrate any progress, no perfectionism allowed' },
                  { icon: Moon, title: 'Permission to Rest', desc: 'Rest is productive. Stopping is success, not failure' },
                  { icon: Lightbulb, title: 'Flexible Time Blocks', desc: 'Suggest activities, don\'t demand them' },
                  { icon: Heart, title: 'Compassionate Check-Ins', desc: 'How are you REALLY feeling today?' }
                ].map((principle, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="p-4 bg-white rounded-xl shadow-md"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-br from-[#7AAE9E] to-[#A6C48A] rounded-lg flex items-center justify-center">
                        <principle.icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-semibold text-[#2E2E2E]">{principle.title}</h3>
                    </div>
                    <p className="text-sm text-[#6B7280] pl-13">{principle.desc}</p>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Choose Your Path */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Target className="w-7 h-7 text-indigo-500" />
                Choose Your Path
              </CardTitle>
              <p className="text-[#6B7280]">
                Different life situations need different approaches
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                {/* Flexible Path */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedPath('flex')}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPath === 'flex' 
                      ? 'border-[#7AAE9E] bg-[#7AAE9E]/10 shadow-lg' 
                      : 'border-gray-200 bg-white hover:border-[#7AAE9E]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#2E2E2E]">Flexible / Creative</h3>
                      <p className="text-sm text-[#6B7280]">Self-employed, freelance, or creative work</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#4A5568] mb-4">
                    You control your own schedule but struggle with decision fatigue and "what should I do next?" paralysis.
                  </p>
                  <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                    Total flexibility, maximum overwhelm
                  </Badge>
                </motion.div>

                {/* Anchor Path */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedPath('anchor')}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    selectedPath === 'anchor' 
                      ? 'border-[#7AAE9E] bg-[#7AAE9E]/10 shadow-lg' 
                      : 'border-gray-200 bg-white hover:border-[#7AAE9E]/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-[#2E2E2E]">9-5 / Caregiving</h3>
                      <p className="text-sm text-[#6B7280]">Fixed schedule with family obligations</p>
                    </div>
                  </div>
                  <p className="text-sm text-[#4A5568] mb-4">
                    Your work hours are set, but you need gentle structure for mornings, evenings, and weekends without burning out.
                  </p>
                  <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                    Fixed anchors, flexible pockets
                  </Badge>
                </motion.div>
              </div>

              {/* Guidance for Selected Path */}
              {selectedPath && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-6 p-6 bg-gradient-to-r from-[#7AAE9E]/10 to-[#A6C48A]/10 rounded-2xl border-2 border-[#7AAE9E]/30"
                >
                  {selectedPath === 'flex' ? (
                    <div className="space-y-4">
                      <h3 className="font-bold text-xl text-[#2E2E2E] flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-500" />
                        Your Gentle Flow Approach
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#7AAE9E] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[#2E2E2E]">Start with "anchors" (non-negotiable self-care)</p>
                            <p className="text-sm text-[#6B7280]">Example: Morning coffee in silence, one meal outside your desk, evening wind-down</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#7AAE9E] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[#2E2E2E]">Use "flow blocks" instead of time slots</p>
                            <p className="text-sm text-[#6B7280]">"Morning creative work" not "9-11am writing." Do it when your brain lights up.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#7AAE9E] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[#2E2E2E]">Have a "menu" not a schedule</p>
                            <p className="text-sm text-[#6B7280]">3-5 things you COULD do today. Pick based on energy, not time.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#7AAE9E] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[#2E2E2E]">Micro-rituals for transitions</p>
                            <p className="text-sm text-[#6B7280]">2-minute grounding practices help you shift between tasks without exhaustion.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h3 className="font-bold text-xl text-[#2E2E2E] flex items-center gap-2">
                        <Clock className="w-6 h-6 text-blue-500" />
                        Your Gentle Flow Approach
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#7AAE9E] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[#2E2E2E]">Protect your "pocket time" fiercely</p>
                            <p className="text-sm text-[#6B7280]">Mornings before work and evenings after kids sleep. These are YOURS.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#7AAE9E] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[#2E2E2E]">Batch similar tasks</p>
                            <p className="text-sm text-[#6B7280]">Errands on Saturday, meal prep Sunday, admin Wednesday night. Less decision fatigue.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#7AAE9E] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[#2E2E2E]">One tiny thing per day for YOU</p>
                            <p className="text-sm text-[#6B7280]">5-minute journal, one song, hot tea. Non-negotiable self-care.</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[#7AAE9E] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-semibold text-[#2E2E2E]">Use "anchors" around fixed commitments</p>
                            <p className="text-sm text-[#6B7280]">Before work: stretch + coffee. After work: 10-min walk. Weekend: one thing that brings joy.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-6 flex justify-center">
                    <Link to={createPageUrl('GentleFlowPlanner')}>
                      <Button size="lg" className="bg-gradient-to-r from-[#7AAE9E] to-[#A6C48A] hover:from-[#7AAE9E]/90 hover:to-[#A6C48A]/90 text-white gap-2 shadow-lg">
                        <ArrowRight className="w-5 h-5" />
                        Create My Gentle Flow Plan
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Mindset Shifts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <Heart className="w-7 h-7 text-rose-500" />
                Essential Mindset Shifts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  {
                    from: '"I should be consistent"',
                    to: '"I show up when I can, and that\'s enough"',
                    color: 'from-blue-100 to-purple-100'
                  },
                  {
                    from: '"Rest is being lazy"',
                    to: '"Rest is how I stay productive long-term"',
                    color: 'from-green-100 to-teal-100'
                  },
                  {
                    from: '"If I can\'t do it perfectly, why bother?"',
                    to: '"Done messy is better than perfect-never-started"',
                    color: 'from-amber-100 to-orange-100'
                  },
                  {
                    from: '"Everyone else has routines"',
                    to: '"My brain needs its own system"',
                    color: 'from-pink-100 to-rose-100'
                  }
                ].map((shift, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    className={`p-4 rounded-xl bg-gradient-to-r ${shift.color}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">❌</div>
                      <p className="text-sm text-gray-700 line-through flex-1">{shift.from}</p>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="text-2xl">✅</div>
                      <p className="font-semibold text-[#2E2E2E] flex-1">{shift.to}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="text-center space-y-6 py-8"
        >
          <h2 className="text-3xl font-bold text-[#2E2E2E]">
            Ready to Try a Gentler Way?
          </h2>
          <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
            Our Gentle Flow Planner will create a personalized, flexible plan based on YOUR brain, 
            YOUR energy, and YOUR life situation — no rigid routines required.
          </p>
          <Link to={createPageUrl('GentleFlowPlanner')}>
            <Button size="lg" className="bg-gradient-to-r from-[#7AAE9E] to-[#A6C48A] hover:from-[#7AAE9E]/90 hover:to-[#A6C48A]/90 text-white gap-2 shadow-xl text-lg px-8 py-6">
              <Sparkles className="w-6 h-6" />
              Start Your Gentle Flow Plan
              <ArrowRight className="w-6 h-6" />
            </Button>
          </Link>
          <p className="text-sm text-[#6B7280]">
            Takes 60 seconds · Free to start · Designed for neurodivergent minds
          </p>
        </motion.div>

      </div>
    </div>
  );
}