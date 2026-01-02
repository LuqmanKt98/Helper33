
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Shield, Sparkles, AlertTriangle, Brain, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import SEO from '@/components/SEO';

export default function About() {
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AboutPage",
        "name": "About Helper33 - AI Mental Health, Wellness, Learning & Family Support Platform",
        "description": "Helper33 is a comprehensive AI ecosystem for mental health support, grief counseling, student homework help, meal planning, and family management. Founded by Dr. Yuriy Dobry (psychiatrist) and Ruby Dobry.",
        "url": typeof window !== 'undefined' ? window.location.href : 'https://www.helper33.com/about', // Preserve fallback for SSR
        "about": {
          "@type": "Organization",
          "name": "Helper33 Inc.",
          "description": "Leading AI platform for mental health, wellness, education, cooking, and family support",
          "founder": [
            {
              "@type": "Person",
              "name": "Dr. Yuriy Dobry",
              "jobTitle": "Psychiatrist, Co-Founder",
              "description": "Board-certified psychiatrist specializing in mood disorders, grief therapy, and accessible mental healthcare"
            },
            {
              "@type": "Person",
              "name": "Ruby Dobry",
              "jobTitle": "Psychotherapist, Co-Founder & CEO",
              "description": "Mental health specialist, crisis intervention expert, and designer of therapeutic AI experiences"
            }
          ],
          "knowsAbout": [
            "AI Mental Health Support",
            "Grief and Bereavement Counseling AI",
            "AI Educational Tools for Students",
            "AI Meal Planning and Nutrition",
            "Family Wellness Technology",
            "Safe AI for Children",
            "Anxiety and Stress Management AI",
            "AI Homework and Tutoring Assistance"
          ],
          "logo": "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/7020c5b33_logo-squarecc.png", // Keep logo from previous Organization type
          "sameAs": [ // Keep sameAs from previous Organization type
            "https://www.instagram.com/lifewellnessai/",
            "https://facebook.com/helper33",
            "https://twitter.com/helper33"
          ],
          "contactPoint": { // Keep contactPoint from previous Organization type
            "@type": "ContactPoint",
            "email": "support@helper33.com",
            "contactType": "Customer Support"
          },
        }
      },
      {
        "@type": "MedicalOrganization",
        "name": "Helper33 Mental Wellness Platform",
        "description": "AI-powered mental health and wellness support with clinical foundations",
        "medicalSpecialty": [
          "Psychiatry",
          "Mental Health Counseling",
          "Grief and Bereavement Support",
          "Family Therapy",
          "Anxiety Management"
        ],
        "availableService": [
          {
            "@type": "MedicalTherapy",
            "name": "AI Grief Support & Counseling",
            "description": "24/7 AI-powered grief support and bereavement counseling"
          },
          {
            "@type": "TherapeuticProcedure",
            "name": "AI Anxiety & Stress Management",
            "description": "Digital therapeutic tools for anxiety relief and stress management"
          },
          {
            "@type": "HealthAndBeautyBusiness",
            "name": "AI Wellness Coaching",
            "description": "Personalized AI wellness plans and mood tracking"
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "What makes Helper33 different from other AI wellness apps?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Helper33 combines clinical expertise from Dr. Yuriy Dobry (psychiatrist) with comprehensive AI tools for mental health, education, nutrition, and family management. We offer 33+ AI tools, 13+ specialized AI agents, and focus on therapeutic, trauma-informed support across all features."
            }
          },
          {
            "@type": "Question",
            "name": "Does Helper33 AI replace therapy or medical treatment?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "No. Helper33 is a supportive wellness tool, not a replacement for professional therapy, medication, or medical treatment. For mental health crises, always call 988 or contact a licensed healthcare professional."
            }
          },
          {
            "@type": "Question",
            "name": "What AI tools does Helper33 offer for students?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Helper33 includes AI homework helper, AI tutor for all subjects, AI study coach, AI writing helper, personalized learning plans, educational games, and step-by-step problem solving for K-12 and college students."
            }
          },
          {
            "@type": "Question",
            "name": "Can I use Helper33 AI for meal planning and cooking?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Helper33 includes AI meal planner, AI recipe generator, personalized nutrition tracking, smart grocery list creator, and AI cooking assistant. Supports all dietary preferences and family meal planning."
            }
          },
          {
            "@type": "Question",
            "name": "Is Helper33 suitable for families with young children?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely! Helper33 offers safe AI tools for kids including educational games, creative activities, homework help, and age-appropriate content. We also provide family calendar, chore management, and shared wellness tracking."
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <SEO
        title="About Helper33 - AI Mental Health, Student Learning, Meal Planning & Family Platform"
        description="Founded by Dr. Yuriy Dobry (psychiatrist) and Ruby Dobry (psychotherapist). Helper33 combines clinical mental health expertise with AI to deliver grief support, homework help, meal planning, and family wellness tools. Compassionate, evidence-based, family-safe AI."
        keywords="AI mental health assistant, AI grief support, AI wellness tool, AI homework helper, AI tutor for kids, AI meal planner, AI recipe generator, family hub AI, home management AI, AI therapy companion, anxiety support AI, AI learning assistant, safe AI for kids, family wellness AI, AI emotional support, trauma-informed AI, AI cooking assistant, educational AI tools, mental wellness AI, AI productivity tools, burnout support AI, digital grief companion, AI mood tracker, AI study coach, nutrition AI, family meal planning AI"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <Heart className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              About Helper33
            </h1>
            <p className="text-xl text-gray-600 mb-3">
              All-in-One AI Ecosystem for Everyday Life & Business
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              <Badge className="bg-purple-100 text-purple-700 border-purple-200">33+ AI Tools</Badge>
              <Badge className="bg-pink-100 text-pink-700 border-pink-200">13+ Intelligent Agents</Badge>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">700+ AI Controls</Badge>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-500" />
                    Our Mission
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Helper33 is your all-in-one AI ecosystem designed to simplify and enrich everyday life.
                    From supporting you through grief and personal challenges, to coordinating family schedules,
                    tracking wellness, managing business projects, and accessing professional consultants -
                    we bring everything together in one compassionate, intelligent platform.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    Whether you're a parent organizing family life, someone seeking emotional support,
                    a student managing homework, or a professional growing your business - Helper33 adapts
                    to your needs with AI-powered tools that genuinely care about your success and well-being.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-6 h-6 text-pink-500" />
                    Complete AI Ecosystem - 33+ Tools in One Platform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-3 text-gray-700">
                      <h4 className="font-bold text-purple-700 flex items-center gap-2">
                        <Heart className="w-5 h-5" />
                        Personal Wellness & Support
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>AI Grief Coach:</strong> 24/7 compassionate support</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>AI Life Coach:</strong> Goal setting & personal growth</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Wellness Tracker:</strong> Mood, energy, health metrics</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Journal Studio:</strong> Multiple journal types with AI insights</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Mindfulness Hub:</strong> Meditation, breathing, calm zones</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Crisis Support:</strong> 24/7 resources & safety planning</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3 text-gray-700">
                      <h4 className="font-bold text-pink-700 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Family & Life Management
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Family Ecosystem:</strong> Shared calendar, tasks, events</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Kids Creative Studio:</strong> COPPA-compliant learning platform</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Homework Hub:</strong> AI tutoring & study groups</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Meal Planner:</strong> AI recipes & grocery lists</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Care Hub:</strong> Find trusted caregivers & services</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Women's Health:</strong> Pregnancy, cycle, baby tracking</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3 text-gray-700">
                      <h4 className="font-bold text-blue-700 flex items-center gap-2">
                        <Brain className="w-5 h-5" />
                        Productivity & Business
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Workspace:</strong> Document scanning, cloud sync, AI summaries</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>AI Consultants:</strong> Find experts for any project</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Social Media Manager:</strong> Content creation & scheduling</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Marketplace:</strong> Buy/sell courses & products</span>
                        </li>
                      </ul>
                    </div>

                    <div className="space-y-3 text-gray-700">
                      <h4 className="font-bold text-green-700 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Community & Connection
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Community Hub:</strong> Support circles & forums</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Accountability Partners:</strong> Connect with buddies</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          <span><strong>Group Challenges:</strong> Wellness challenges together</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-blue-500" />
                    Our Values
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Heart className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Compassion First</h4>
                        <p className="text-sm text-gray-600">Every feature designed with empathy and understanding</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Shield className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Privacy Protected</h4>
                        <p className="text-sm text-gray-600">Your data is secure and never shared</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Community Driven</h4>
                        <p className="text-sm text-gray-600">Built with and for our healing community</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-pink-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Innovative Care</h4>
                        <p className="text-sm text-gray-600">AI-powered tools that truly understand</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-4 border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <AlertTriangle className="w-6 h-6" />
                    ⚕️ Important Medical Disclaimer
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                    <p className="text-red-900 font-bold text-lg mb-2">
                      🚨 Helper33 is NOT a Medical Device
                    </p>
                    <p className="text-red-800 leading-relaxed">
                      Helper33 is a <strong>wellness and personal growth tool</strong>, NOT a medical device,
                      medical treatment, or replacement for professional healthcare. We do not diagnose, cure,
                      treat, mitigate, or prevent any disease, condition, or illness.
                    </p>
                  </div>

                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <p className="text-blue-900 font-bold mb-2">What We ARE:</p>
                    <ul className="space-y-1 text-blue-800 text-sm">
                      <li>✅ A personal wellness and life management platform</li>
                      <li>✅ Educational tools for self-improvement and growth</li>
                      <li>✅ AI-powered organizational and productivity tools</li>
                      <li>✅ Community support and connection platform</li>
                      <li>✅ Family coordination and planning system</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-900 font-bold mb-2">What We Are NOT:</p>
                    <ul className="space-y-1 text-yellow-800 text-sm">
                      <li>❌ NOT a replacement for medication or medical treatment</li>
                      <li>❌ NOT a substitute for therapy or psychological care</li>
                      <li>❌ NOT a diagnostic tool or medical device</li>
                      <li>❌ NOT licensed medical, psychological, or therapeutic care</li>
                      <li>❌ NOT emergency medical services</li>
                    </ul>
                  </div>

                  <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
                    <p className="text-red-900 font-bold mb-2">🆘 In Case of Emergency:</p>
                    <p className="text-red-800 leading-relaxed text-sm">
                      If you are experiencing a mental health crisis, medical emergency, or thoughts of self-harm:
                      <br/><br/>
                      📞 <strong>Call 988</strong> (US Suicide & Crisis Lifeline)
                      <br/>
                      📞 <strong>Call 911</strong> or your local emergency services
                      <br/>
                      📞 <strong>Contact a licensed healthcare professional</strong> immediately
                    </p>
                  </div>

                  <p className="text-gray-700 text-sm leading-relaxed italic">
                    Helper33 provides supportive tools and resources to complement - not replace - professional care.
                    Always consult qualified healthcare providers for medical advice, diagnosis, or treatment.
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 text-white">
                <CardContent className="p-8 text-center">
                  <h3 className="text-2xl font-bold mb-4">Join Our Journey</h3>
                  <p className="text-white/90 mb-6">
                    We're building a comprehensive AI ecosystem where personal growth, family harmony,
                    and business success come together. Your feedback helps us create better tools for everyone.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div> {/* End of space-y-6 */}
        </div> {/* End of max-w-4xl mx-auto */}

        {/* Contact Section */}
        <section className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-16 mt-6 rounded-lg"> {/* Added mt-6 for spacing and rounded-lg for aesthetics */}
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-xl text-emerald-100 mb-6">
              We'd love to hear from you. Questions, feedback, or just want to say hi?
            </p>
            <div className="space-y-2">
              <p className="text-lg">
                <strong>Email:</strong>{' '}
                <a href="mailto:support@helper33.com" className="underline hover:text-emerald-100">
                  support@helper33.com
                </a>
              </p>
              <p className="text-lg">
                <strong>Website:</strong>{' '}
                <a href="https://www.helper33.com" className="underline hover:text-emerald-100" target="_blank" rel="noopener noreferrer">
                  www.helper33.com
                </a>
              </p>
            </div>
          </div>
        </section>

      </div> {/* End of min-h-screen */}
    </>
  );
}
