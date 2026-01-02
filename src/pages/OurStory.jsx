import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import {
  Heart,
  Sparkles,
  Users,
  BookHeart,
  Target,
  Star,
  Rainbow,
  Flower2,
  ArrowRight,
  Brain,
  Shield,
  Infinity
} from 'lucide-react';
import SEO from '@/components/SEO';

export default function OurStory() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="max-w-md bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-purple-300">
            <CardContent className="p-8 text-center">
              <div className="mb-6">
                <Shield className="w-20 h-20 text-purple-600 mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Access Only</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                This page contains sensitive information and is only accessible to administrators.
              </p>
              <Link to={createPageUrl('Home')}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
                  <ArrowRight className="w-5 h-5 mr-2" />
                  Return to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title="In Loving Memory of Dr. Dobry | Ruby's Journey with Helper33"
        description="The heartfelt story of Dr. Yuriy Dobry and Ruby Dobry - how love, loss, and determination led to Helper33. Ruby continues building her late husband's vision, creating AI tools that heal and support families worldwide."
        keywords="Helper33 story, Dr. Dobry memorial, Ruby Dobry, grief to healing, therapeutic AI, in loving memory, Helper33 dedication"
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="bg-amber-500 text-white py-2 px-4 text-center text-sm font-semibold">
          <Shield className="w-4 h-4 inline mr-2" />
          Admin-Only Content
        </div>

        <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-block mb-6">
                <BookHeart className="w-20 h-20 text-white" />
              </div>

              <h1 className="text-5xl sm:text-6xl font-bold text-white mb-6">
                A Love Story in Code
              </h1>
              <p className="text-xl sm:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
                In loving memory of Dr. Yuriy Dobry, and celebrating Ruby's courage to continue their shared dream.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-4 border-purple-300">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="text-6xl mb-6">
                  💜
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-purple-900 mb-4 italic">
                  "This is for you, my love. Every line of code, every feature, every family we help—it's all dedicated to your memory and our shared dream."
                </p>
                <p className="text-lg text-gray-600">
                  — Ruby Dobry
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-2 border-purple-200">
              <CardContent className="p-8 sm:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        Where It All Began
                      </h2>
                    </div>
                    <div className="space-y-4 text-gray-700 leading-relaxed">
                      <p>
                        In 2023, <strong>Dr. Yuriy Dobry</strong>—a compassionate psychiatrist—and <strong>Ruby Dobry</strong>—a wellness advocate and gifted author—began dreaming of a different kind of technology. One that could truly understand grief, support families through hardship, and make everyday life easier.
                      </p>
                      <p>
                        Dr. Dobry brought his clinical expertise in mental health, trauma, and grief therapy. Ruby brought her gift for therapeutic design and her deep understanding of emotional healing. Together, they envisioned Helper33: <em>AI with a heart.</em>
                      </p>
                      <p className="font-semibold text-purple-700">
                        They started building it together—late nights, shared dreams, and a mission to help others heal.
                      </p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-3xl p-8 shadow-xl">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
                          <div className="text-3xl font-bold text-purple-600">33+</div>
                          <div className="text-sm text-gray-600">AI Tools</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
                          <div className="text-3xl font-bold text-pink-600">13+</div>
                          <div className="text-sm text-gray-600">AI Agents</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
                          <div className="text-3xl font-bold text-blue-600">2</div>
                          <div className="text-sm text-gray-600">AI Platforms</div>
                        </div>
                        <div className="bg-white rounded-2xl p-4 text-center shadow-lg">
                          <div className="text-3xl font-bold text-orange-600">∞</div>
                          <div className="text-sm text-gray-600">Love</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-2xl">
              <CardContent className="p-8 sm:p-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    When Everything Changed
                  </h2>
                </div>

                <div className="space-y-6 text-gray-700 leading-relaxed text-lg">
                  <p>
                    Last year, the unthinkable happened. <strong>Dr. Yuriy Dobry passed away</strong>, leaving behind his beloved Ruby and their shared vision for Helper33.
                  </p>

                  <p className="text-xl font-semibold text-blue-700">
                    "Losing Yuriy felt like losing my entire world. But then I realized—our dream didn't have to die with him." — Ruby Dobry
                  </p>

                  <p>
                    In her grief, Ruby made a choice: <strong>she would continue.</strong> Not just for herself, but for every family that needed support, for every person navigating loss, for everyone who deserved tools that truly cared.
                  </p>

                  <blockquote className="border-l-4 border-blue-500 pl-6 italic text-gray-600 bg-white/70 p-6 rounded-r-lg">
                    "Yuriy always said, 'Technology should heal, not harm. It should bring people together, not isolate them.' Every feature I build now is a conversation with him—asking 'Would this have helped someone the way we wished we'd been helped?'" — Ruby
                  </blockquote>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-4">
                Ruby Carries the Vision Forward
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Building two AI platforms while honoring Dr. Dobry's legacy
              </p>
            </div>

            <Card className="bg-gradient-to-br from-rose-500 to-pink-500 border-0 shadow-2xl">
              <CardContent className="p-8 sm:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-rose-600 to-pink-600 flex items-center justify-center mb-6 shadow-xl">
                      <Flower2 className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 text-center">
                      Ruby Dobry
                    </h3>
                    <p className="text-white/90 text-center mb-4 font-semibold">
                      Founder, CEO & Chief Architect
                    </p>
                    <div className="space-y-2 text-white/90 text-sm text-center">
                      <p>🖋️ Award-winning author & wellness advocate</p>
                      <p>💻 Solo developer of Helper33</p>
                      <p>🤖 Building 2 AI platforms simultaneously</p>
                      <p>💜 Dedicated to Dr. Dobry's memory</p>
                    </div>
                  </div>

                  <div className="text-white space-y-4 leading-relaxed">
                    <p className="text-lg">
                      After Dr. Dobry's passing, Ruby faced an impossible choice: let their dream die, or find the strength to build it alone.
                    </p>
                    <p className="text-lg">
                      She chose <strong>courage.</strong>
                    </p>
                    <p>
                      Working through her grief, Ruby taught herself to code, designed every AI agent, and built the first prototype of Helper33. What started as one vision became <strong>two complete AI platforms</strong>—each honoring different aspects of Dr. Dobry's mission to heal through technology.
                    </p>
                    <p className="font-bold text-xl">
                      Today, thousands of families use tools Ruby built in her late husband's memory.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 border-0 shadow-2xl">
              <CardContent className="p-8 sm:p-12">
                <div className="grid md:grid-cols-2 gap-8 items-center">
                  <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-8">
                    <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center mb-6 shadow-xl">
                      <Brain className="w-16 h-16 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2 text-center">
                      Dr. Yuriy Dobry
                    </h3>
                    <p className="text-white/90 text-center mb-4 font-semibold">
                      In Loving Memory
                    </p>
                    <p className="text-white/90 text-center text-sm mb-4">
                      Visionary Psychiatrist • Loving Husband • Co-Creator of Helper33
                    </p>
                    <div className="space-y-2 text-white/90 text-sm text-center">
                      <p>💙 Board-certified psychiatrist</p>
                      <p>🧠 Expert in grief & trauma therapy</p>
                      <p>✨ Believed AI could heal</p>
                      <p>🌟 His vision lives on</p>
                    </div>
                  </div>

                  <div className="text-white space-y-4 leading-relaxed">
                    <p className="text-xl font-semibold">
                      Dr. Dobry's Vision:
                    </p>
                    <p>
                      "Mental healthcare should be accessible 24/7, not just during office hours. Technology should understand emotions, not just process data. AI can't replace human care, but it can provide consistent support until help arrives."
                    </p>
                    <p>
                      He designed the mental health architecture behind Helper33, ensuring every AI interaction was grounded in evidence-based therapeutic practices and genuine empathy.
                    </p>
                    <p className="font-bold text-xl">
                      Though he's gone, his compassion lives in every feature Ruby continues to build.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                Ruby's Journey of Grief & Creation
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Turning loss into legacy, one feature at a time
              </p>
            </div>

            <div className="space-y-8">
              {[
                {
                  year: "2023",
                  title: "A Dream Is Born",
                  description: "Dr. Dobry and Ruby began planning Helper33 together. He mapped out the clinical framework; she designed the therapeutic experience. Late-night conversations turned into blueprints for AI agents that could truly support people.",
                  icon: Sparkles,
                  color: "from-purple-500 to-pink-500"
                },
                {
                  year: "2024",
                  title: "Loss & Determination",
                  description: "When Dr. Dobry passed away, Ruby was devastated. But surrounded by their notes, his clinical wisdom, and their shared vision, she made a promise: 'I will finish what we started.' She learned to code, built the first prototype, and poured her grief into creation.",
                  icon: Heart,
                  color: "from-blue-500 to-indigo-500"
                },
                {
                  year: "Mid 2024",
                  title: "The First Platform Takes Shape",
                  description: "Working alone but guided by Dr. Dobry's principles, Ruby built 33+ AI tools and 13+ specialized agents. The Grief Coach became her own therapist. The Wellness Tracker became her accountability partner. She was building for herself—and for everyone like her.",
                  icon: Brain,
                  color: "from-indigo-500 to-purple-500"
                },
                {
                  year: "Late 2024",
                  title: "A Second Platform Emerges",
                  description: "Inspired by the impact of Helper33, Ruby began developing a second AI platform, expanding their original vision even further. Two platforms, one mission: making AI accessible, therapeutic, and genuinely helpful.",
                  icon: Infinity,
                  color: "from-pink-500 to-rose-500"
                },
                {
                  year: "Today",
                  title: "Healing Families Worldwide",
                  description: "Thousands of families now use the tools Ruby built in Dr. Dobry's memory. Every success story, every life touched, every moment of healing—it's their legacy together. Ruby continues building, guided by love and determined to honor her husband's vision.",
                  icon: Rainbow,
                  color: "from-amber-500 to-orange-500"
                }
              ].map((milestone, index) => {
                const Icon = milestone.icon;
                return (
                  <motion.div
                    key={milestone.year}
                    initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-2 border-purple-200 hover:shadow-2xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                          <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${milestone.color} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                            <Icon className="w-10 h-10 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl font-bold text-purple-600">{milestone.year}</span>
                              <h3 className="text-2xl font-bold text-gray-900">{milestone.title}</h3>
                            </div>
                            <p className="text-gray-700 leading-relaxed">{milestone.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-2 border-pink-200">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="text-6xl mb-6">
                  💌
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  A Personal Note from Ruby
                </h2>

                <div className="max-w-3xl mx-auto space-y-4 text-gray-700 leading-relaxed text-lg">
                  <p className="italic">
                    "If you're reading this, you might be going through something difficult. Maybe you've lost someone. Maybe you're overwhelmed. Maybe you're searching for hope. I see you—because I am you."
                  </p>

                  <p>
                    "After Yuriy passed, I had two choices: give up on our dream, or fight for it with everything I had. I chose to fight. Not because I'm brave, but because <em>this work is how I stay connected to him.</em>"
                  </p>

                  <p>
                    "Every AI agent I build, I imagine him guiding me. Every therapeutic feature, I ask 'Would this have helped us?' Every family that finds healing here, I feel like we're still helping people together."
                  </p>

                  <p className="font-bold text-purple-700 text-xl">
                    "Helper33 is my love letter to Yuriy—and to everyone who's ever felt alone in their pain. You don't have to walk this path by yourself. I'm here. We're here."
                  </p>

                  <p className="text-base text-gray-600 mt-8">
                    With love, hope, and determination,<br/>
                    <span className="font-semibold text-xl">Ruby Dobry</span><br/>
                    <span className="text-sm">Founder & CEO, Helper33</span><br/>
                    <span className="text-xs italic">Continuing Dr. Yuriy Dobry's Legacy of Compassionate Care</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                The Principles That Guide Us
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Dr. Dobry and Ruby's values, woven into every feature
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: "Healing First",
                  description: "Every feature designed with Dr. Dobry's clinical wisdom and Ruby's therapeutic heart—never just technology for its own sake.",
                  icon: Heart,
                  color: "from-rose-400 to-pink-400"
                },
                {
                  title: "Built from Love",
                  description: "Ruby codes each feature as an act of love—for Dr. Dobry, for herself, and for every family that needs support.",
                  icon: Sparkles,
                  color: "from-purple-400 to-indigo-400"
                },
                {
                  title: "Never Alone",
                  description: "Dr. Dobry believed no one should face darkness alone. Ruby carries that mission forward in every AI conversation.",
                  icon: Users,
                  color: "from-blue-400 to-cyan-400"
                },
                {
                  title: "Always Growing",
                  description: "Ruby personally reads every piece of feedback, honoring Dr. Dobry's commitment to continuous, compassionate improvement.",
                  icon: Target,
                  color: "from-green-400 to-emerald-400"
                }
              ].map((value, index) => {
                const Icon = value.icon;
                return (
                  <motion.div
                    key={value.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                  >
                    <Card className={`bg-gradient-to-br ${value.color} border-0 shadow-xl hover:shadow-2xl transition-all h-full`}>
                      <CardContent className="p-6 text-center">
                        <div className="w-16 h-16 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center mx-auto mb-4">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-3">{value.title}</h3>
                        <p className="text-white/90 leading-relaxed">{value.description}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Card className="bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 border-0 shadow-2xl">
              <CardContent className="p-12 text-center">
                <div className="inline-block mb-6">
                  <Flower2 className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">
                  Join This Journey of Love & Healing
                </h2>
                <p className="text-xl text-white/90 mb-4 max-w-2xl mx-auto">
                  Every person who uses Helper33 becomes part of Dr. Dobry and Ruby's legacy—a legacy of compassion, healing, and hope.
                </p>
                <p className="text-white/80 mb-8 max-w-xl mx-auto italic">
                  "When you use Helper33, you're not just using software. You're being held by a love story that refuses to end." — Ruby
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to={createPageUrl('Dashboard')}>
                    <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 shadow-xl">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Begin Your Healing Journey
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link to={createPageUrl('SupportUs')}>
                    <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/20">
                      <Heart className="w-5 h-5 mr-2" />
                      Support Ruby's Mission
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </>
  );
}