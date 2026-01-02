
import React, { useState } from 'react';
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sparkles, 
  Quote, 
  BookHeart, 
  Eye, 
  BookOpen, 
  Mic,
  Plus,
  Link as LinkIcon,
  Paperclip,
  Trash2,
  Send,
  CheckCircle,
  Feather,
  Mail,
  Crown,
  PenSquare,
  Star,
  X,
  Loader2
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';
import { FeatureGate } from '@/components/PlanChecker';

const featuredStories = [
  {
    id: 'ruby-dobry',
    name: 'Ruby Dobry',
    bio: 'Founder of DobryLife',
    topic: 'The Morning I Knew',
    story_excerpt: 'He was pointing at the hospital room door, eyes wide with excitement. "Papa, Papa!" he shouted... I got up slowly, heart pounding, and opened the door. No one. Just the quiet hallway. That\'s when my soul caught up with what my body already knew.',
    image_url: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=800&h=600&fit=crop',
    category: 'Grief & Loss',
    readTime: '8 min read',
    gradient: 'from-rose-500/90 via-pink-500/90 to-purple-600/90'
  },
  {
    id: 'when-the-vibes-speak-first',
    name: 'Ruby Dobry',
    bio: 'Founder of DobryLife',
    topic: 'When the Vibes Speak First',
    story_excerpt: 'They say vibes don\'t lie. After everything I\'ve been through—after all the moments where logic whispered wait but my gut screamed run—I know that\'s true. It starts subtly, always. A flicker behind someone\'s smile.',
    image_url: 'https://images.unsplash.com/photo-1523540939399-141cbff6a8d7?w=800&h=600&fit=crop',
    category: 'Intuition',
    readTime: '6 min read',
    gradient: 'from-indigo-500/90 via-purple-500/90 to-pink-500/90'
  },
  {
    id: 'a-life-remembered',
    name: 'Ruby Dobry',
    bio: 'Founder of DobryLife',
    topic: 'A Life Remembered',
    story_excerpt: "He looked at me, his voice steady but soft. 'Just one regret,' he said... 'I wish I had tried harder... You don't want to end up like me… dying alone, wondering if anyone will even remember I existed.'",
    image_url: 'https://images.unsplash.com/photo-1477313372947-d68a7d410e9f?w=800&h=600&fit=crop',
    category: 'Legacy',
    readTime: '7 min read',
    gradient: 'from-amber-500/90 via-orange-500/90 to-red-500/90'
  },
  {
    id: 'the-weight-of-goodbye',
    name: 'Ruby Dobry',
    bio: 'Founder of DobryLife',
    topic: 'The Weight of Goodbye',
    story_excerpt: "Oh, I lost count. Was it five deaths this week? Maybe more... As I stood over her casket, I swore I saw her chest rise and fall... No, Ruby, not again. Just act normal. It was my eyes, deceiving me.",
    image_url: 'https://images.unsplash.com/photo-1513106580091-1d82408b8cd6?w=800&h=600&fit=crop',
    category: 'Healthcare',
    readTime: '9 min read',
    gradient: 'from-teal-500/90 via-cyan-500/90 to-blue-600/90'
  },
  {
    id: 'dear-yuriy',
    name: 'Ruby Dobry',
    bio: 'Founder of DobryLife',
    topic: 'Dear Yuriy,',
    story_excerpt: "Your 'friend' was an enemy in disguise, not the brother you thought you had. You told me once that if anything ever happened, I should call him first—and I did. But he didn't come to help; he came to hunt me and the kids.",
    image_url: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=800&h=600&fit=crop',
    category: 'Betrayal',
    readTime: '12 min read',
    gradient: 'from-slate-600/90 via-gray-600/90 to-zinc-700/90'
  },
  {
    id: 'the-mirror-he-broke',
    name: 'Ruby Dobry',
    bio: 'Founder of DobryLife',
    topic: 'The Mirror He Broke',
    story_excerpt: "This story isn't about a lawsuit. It's about legacy — about a wife defending her husband's name from the hands that helped bury it.",
    image_url: 'https://images.unsplash.com/photo-1507692049790-de58290a4334?w=800&h=600&fit=crop',
    category: 'Justice',
    readTime: '5 min read',
    gradient: 'from-emerald-600/90 via-teal-600/90 to-cyan-700/90'
  },
];

export default function StoryHub() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    bio: '',
    story_topic: '',
    story_submission: '',
    primary_link: '',
    supporting_links: [''],
    files: null,
  });

  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => base44.auth.me().catch(() => null),
  });

  const isExecutive = user?.plan_type === 'executive_monthly' || user?.plan_type === 'executive_yearly' || user?.role === 'admin' || user?.access_code === '6060';

  // Check for admin or code 6060 for full access
  const hasFullAccess = user?.role === 'admin' || user?.access_code === '6060';

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLinkChange = (index, value) => {
    const newLinks = [...formData.supporting_links];
    newLinks[index] = value;
    setFormData(prev => ({ ...prev, supporting_links: newLinks }));
  };

  const addLinkInput = () => {
    setFormData(prev => ({ ...prev, supporting_links: [...prev.supporting_links, ''] }));
  };

  const removeLinkInput = (index) => {
    const newLinks = formData.supporting_links.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, supporting_links: newLinks }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, files: e.target.files }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    let fileEvidence = [];
    if (formData.files && formData.files.length > 0) {
      try {
        for (const file of Array.from(formData.files)) {
          const { data } = await base44.integrations.Core.UploadFile({ file });
          fileEvidence.push({ url: data.file_url, filename: file.name });
        }
      } catch (error) {
        console.error('File upload failed:', error);
        toast.error('There was an error uploading your files. Please try again.');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const submissionData = {
        name: formData.name,
        email: formData.email,
        bio: formData.bio,
        story_topic: formData.story_topic,
        story_submission: formData.story_submission,
        primary_link: formData.primary_link,
        supporting_links: formData.supporting_links.filter(link => link.trim() !== ''),
        file_evidence: fileEvidence,
      };
      const newSubmission = await base44.entities.StorytellerApplication.create(submissionData);
      
      if (newSubmission && newSubmission.id) {
        base44.functions.invoke('notifyAdminOnStorySubmission', { submissionId: newSubmission.id }).catch(err => {
            console.warn("Admin notification failed, but submission was successful.", err);
        });
      }
      
      setIsSubmitted(true);
      toast.success('Your story has been submitted! ✨');
    } catch (error) {
      console.error('Submission failed:', error);
      toast.error('There was an error submitting your story. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-900 via-violet-900 to-pink-900 flex items-center justify-center">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-white/90">Loading Story Hub...</p>
        </div>
      </div>
    );
  }

  // Wrap the main content to conditionally bypass FeatureGate
  if (hasFullAccess) {
    return (
      <div className="min-h-screen relative overflow-hidden">
        {/* Aurora Background */}
        <div className="fixed inset-0 z-0">
          {/* Base Cosmic Gradient */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, #14b8a6 0%, #8b5cf6 25%, #ec4899 50%, #06b6d4 75%, #14b8a6 100%)',
                'radial-gradient(circle at 80% 50%, #06b6d4 0%, #ec4899 25%, #8b5cf6 50%, #14b8a6 75%, #06b6d4 100%)',
                'radial-gradient(circle at 50% 80%, #8b5cf6 0%, #14b8a6 25%, #06b6d4 50%, #ec4899 75%, #8b5cf6 100%)',
                'radial-gradient(circle at 20% 50%, #14b8a6 0%, #8b5cf6 25%, #ec4899 50%, #06b6d4 75%, #14b8a6 100%)',
              ]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Aurora Ribbons */}
          <motion.div
            className="absolute inset-0 opacity-40"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #14b8a6 20%, #8b5cf6 40%, #ec4899 60%, #06b6d4 80%, transparent 100%)',
              filter: 'blur(60px)'
            }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(45deg, transparent 0%, #06b6d4 25%, #ec4899 50%, #8b5cf6 75%, transparent 100%)',
              filter: 'blur(80px)'
            }}
            animate={{
              x: ['100%', '-100%'],
              y: ['-50%', '50%'],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Cosmic Dust Particles */}
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Floating Stars */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            >
              <Star className="w-3 h-3 text-cyan-300" fill="currentColor" />
            </motion.div>
          ))}

          {/* Overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/20 to-teal-950/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          <motion.div 
            className="max-w-7xl mx-auto space-y-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Header */}
            <motion.header
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-6 pt-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl"
              >
                <Sparkles className="w-7 h-7 text-cyan-400 animate-pulse" />
                <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                  The Dobry Dialogue
                </h1>
                <Sparkles className="w-7 h-7 text-pink-400 animate-pulse" />
              </motion.div>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto font-medium">
                A space for sharing personal experiences, life stories, and wisdom. Find connection in shared journeys and inspiration for your own path.
              </p>
            </motion.header>

            {/* Executive/Admin Badge for non-Executive/non-Admin users */}
            {!isExecutive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 border-amber-400/30 text-center shadow-2xl"
              >
                <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Preview Mode - Executive Members Get Full Access
                </h3>
                <p className="text-white/80 mb-4">
                  You can preview story excerpts below. Upgrade to Executive to read full stories, submit your own, and unlock premium storytelling features.
                </p>
                <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg">
                  <Link to={createPageUrl('Upgrade')}>
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Executive
                  </Link>
                </Button>
              </motion.div>
            )}

            {/* Admin Access Indicator */}
            {user?.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-4 border-2 border-amber-400 text-center shadow-2xl"
              >
                <div className="flex items-center justify-center gap-3">
                  <Crown className="w-6 h-6 text-amber-400" />
                  <p className="text-white font-bold text-lg">
                    🛡️ Admin Access Granted - Full Story Hub Features Unlocked
                  </p>
                  <Crown className="w-6 h-6 text-amber-400" />
                </div>
              </motion.div>
            )}

            {/* Hero Featured Story */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                  <BookHeart className="w-8 h-8 text-pink-400" />
                  Featured Story
                  <BookHeart className="w-8 h-8 text-pink-400" />
                </h2>
              </div>
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
              >
                <Link to={createPageUrl(`StoryDetail?id=${featuredStories[0].id}`)}>
                  <div className="absolute inset-0">
                    <img 
                      src={featuredStories[0].image_url} 
                      alt={featuredStories[0].topic}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${featuredStories[0].gradient}`}></div>
                    
                    {/* Aurora Glow Overlay */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        background: [
                          'radial-gradient(circle at 30% 50%, rgba(20,184,166,0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 70% 50%, rgba(139,92,246,0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 50% 70%, rgba(236,72,153,0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 30% 50%, rgba(20,184,166,0.3) 0%, transparent 50%)',
                        ]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
                    <Badge className="self-start mb-4 bg-white/20 backdrop-blur-md text-white border-white/30 px-4 py-1 text-sm">
                      {featuredStories[0].category}
                    </Badge>
                    <h3 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">{featuredStories[0].topic}</h3>
                    <p className="text-lg md:text-xl mb-4 opacity-90 line-clamp-3 drop-shadow-md">
                      <Quote className="inline w-6 h-6 mr-2" />
                      {featuredStories[0].story_excerpt}
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/9643390b5_16107019508644.jpg"
                        alt={featuredStories[0].name}
                        className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                      />
                      <div>
                        <p className="font-semibold text-lg">{featuredStories[0].name}</p>
                        <p className="text-sm opacity-90">{featuredStories[0].bio}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm opacity-90">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {featuredStories[0].readTime}
                      </span>
                    </div>
                    <motion.div
                      className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      initial={{ y: 10 }}
                      whileHover={{ y: 0 }}
                    >
                      <Button className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-semibold px-8 py-3 rounded-full shadow-xl border border-white/30">
                        Read Full Story
                        <Eye className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>

            {/* More Stories Grid */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-2">More Stories</h2>
                <p className="text-white/80">Explore more powerful narratives and shared experiences</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredStories.slice(1).map((story, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group cursor-pointer"
                  >
                    <Link to={createPageUrl(`StoryDetail?id=${story.id}`)}>
                      <Card className="h-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 overflow-hidden">
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={story.image_url} 
                            alt={story.topic}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${story.gradient}`}></div>
                          
                          {/* Aurora shimmer on hover */}
                          <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100"
                            animate={{
                              background: [
                                'radial-gradient(circle at 30% 30%, rgba(20,184,166,0.4) 0%, transparent 50%)',
                                'radial-gradient(circle at 70% 70%, rgba(236,72,153,0.4) 0%, transparent 50%)',
                                'radial-gradient(circle at 30% 30%, rgba(20,184,166,0.4) 0%, transparent 50%)',
                              ]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          
                          <Badge className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white border-white/30">
                            {story.category}
                          </Badge>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-2xl font-bold text-white drop-shadow-lg line-clamp-2">{story.topic}</h3>
                          </div>
                        </div>
                        <CardContent className="p-6 flex flex-col flex-grow">
                          <div className="flex items-center gap-3 mb-4">
                            <img 
                              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/9643390b5_16107019508644.jpg"
                              alt={story.name}
                              className="w-10 h-10 rounded-full border-2 border-cyan-300/50"
                            />
                            <div>
                              <p className="font-semibold text-white">{story.name}</p>
                              <p className="text-xs text-white/70">{story.bio}</p>
                            </div>
                          </div>
                          <p className="text-white/80 line-clamp-3 flex-grow mb-4 italic">
                            "{story.story_excerpt}"
                          </p>
                          <div className="flex items-center justify-between text-sm text-white/70 pt-4 border-t border-white/10">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {story.readTime}
                            </span>
                            <span className="text-cyan-400 font-medium group-hover:translate-x-2 transition-transform flex items-center gap-1">
                              Read More
                              <Eye className="w-4 h-4" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Podcast Section */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                <Mic className="w-8 h-8 text-violet-400" />
                From the Podcast
                <Mic className="w-8 h-8 text-violet-400" />
              </h2>
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="grid md:grid-cols-3">
                  <div className="md:col-span-1 p-8 bg-gradient-to-br from-violet-600/30 to-pink-600/30 rounded-t-xl md:rounded-tr-none md:rounded-l-xl flex flex-col items-center justify-center text-white text-center backdrop-blur-xl border-r border-white/10">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Mic className="w-24 h-24 mb-4 drop-shadow-lg" />
                    </motion.div>
                    <h3 className="text-3xl font-bold mb-2">Dobry Dialogue</h3>
                    <p className="text-lg opacity-90 mt-2">The Podcast</p>
                    <p className="opacity-80 mt-4 text-sm">Deeper conversations with our featured storytellers and experts.</p>
                    <Button variant="secondary" className="mt-6 bg-white/20 hover:bg-white/30 text-white border-white/30" disabled>Listen on Spotify</Button>
                  </div>
                  <div className="md:col-span-2 p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <h4 className="font-semibold text-2xl text-white">Coming Soon</h4>
                    <p className="text-white/80 text-lg max-w-md">New episodes are on the way. Stay tuned for inspiring conversations and powerful stories!</p>
                    <div className="mt-6 flex gap-4 text-5xl">
                      <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}>🎙️</motion.span>
                      <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}>🎧</motion.span>
                      <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>✨</motion.span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* Share Your Story CTA - Executive/Admin Only */}
            {isExecutive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16"
              >
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl relative overflow-hidden">
                  {/* Aurora Background */}
                  <div className="absolute inset-0">
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        background: [
                          'radial-gradient(circle at 20% 50%, rgba(20, 184, 166, 0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 20% 50%, rgba(20, 184, 166, 0.3) 0%, transparent 50%)',
                        ]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>

                  <CardContent className="relative z-10 py-12 px-8 text-center">
                    <Sparkles className="w-16 h-16 mx-auto mb-6 text-cyan-400" />
                    <h2 className="text-3xl font-bold mb-4 text-white">Your Story Matters</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                      Share your journey, inspire others, and become part of a healing community.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => setShowForm(true)}
                        className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 text-lg px-8 py-6 shadow-xl"
                      >
                        <PenSquare className="mr-2 w-5 h-5" />
                        Submit Your Story
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        className="text-white hover:bg-white/10 border border-white/20 text-lg px-8 py-6"
                      >
                        <a href="mailto:contact@dobrylife.com?subject=Story Inquiry">
                          <Mail className="w-5 h-5 mr-2" />
                          Questions? Email Us
                        </a>
                      </Button>
                    </div>
                    <p className="mt-6 text-sm text-white/70">
                      Email: <a href="mailto:contact@dobrylife.com" className="text-cyan-300 hover:underline">contact@dobrylife.com</a>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Share Your Story Form - Executive/Admin Only */}
            <AnimatePresence>
              {isExecutive && showForm && (
                <motion.section
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  id="share-story"
                >
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <AnimatePresence mode="wait">
                      {isSubmitted ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-12 text-center"
                        >
                          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                          <h2 className="text-3xl font-bold text-white mb-2">Thank You!</h2>
                          <p className="text-white/80 text-lg mt-4 max-w-xl mx-auto">Your story has been submitted for review. We appreciate you sharing your voice with our community.</p>
                        </motion.div>
                      ) : (
                        <motion.div key="form">
                          <CardHeader className="text-center border-b border-white/10">
                            <div className="flex items-center justify-center gap-3 mb-4">
                              <Feather className="w-8 h-8 text-cyan-400" />
                              <CardTitle className="text-4xl font-bold text-white">Share Your Story</CardTitle>
                              <Feather className="w-8 h-8 text-pink-400" />
                            </div>
                            <p className="text-white/80 text-lg max-w-2xl mx-auto">Have a story or experience you believe could help others? Apply to be featured on The Dobry Dialogue.</p>
                          </CardHeader>
                          <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="name" className="text-white">Your Name</Label>
                                  <Input 
                                    id="name" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleInputChange} 
                                    required 
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="email" className="text-white">Email Address</Label>
                                  <Input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleInputChange} 
                                    required 
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="bio" className="text-white">Short Bio (Who are you?)</Label>
                                <Input 
                                  id="bio" 
                                  name="bio" 
                                  value={formData.bio} 
                                  onChange={handleInputChange} 
                                  placeholder="e.g., Parent, Entrepreneur, Artist" 
                                  required 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="story_topic" className="text-white">Story Topic</Label>
                                <Input 
                                  id="story_topic" 
                                  name="story_topic" 
                                  value={formData.story_topic} 
                                  onChange={handleInputChange} 
                                  placeholder="e.g., Navigating Career Change, A Journey Through Grief" 
                                  required 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="story_submission" className="text-white">Your Story</Label>
                                <Textarea 
                                  id="story_submission" 
                                  name="story_submission" 
                                  value={formData.story_submission} 
                                  onChange={handleInputChange} 
                                  rows={8} 
                                  placeholder="Share your experience, what you learned, and any advice you have for others..." 
                                  required 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                                />
                              </div>

                              <div className="space-y-4 pt-4 border-t border-white/10">
                                  <h4 className="text-lg font-semibold text-white">Supporting Evidence (Optional)</h4>
                                  <p className="text-sm text-white/70">Provide links or files that support your story, such as articles, videos, or photos.</p>

                                  <div className="space-y-2">
                                      <Label htmlFor="primary_link" className="text-white">Primary Link</Label>
                                      <div className="flex items-center gap-2">
                                        <LinkIcon className="w-5 h-5 text-white/50"/>
                                        <Input 
                                          id="primary_link" 
                                          name="primary_link" 
                                          value={formData.primary_link} 
                                          onChange={handleInputChange} 
                                          placeholder="Website, portfolio, or social media" 
                                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                                        />
                                      </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-white">Supporting Links</Label>
                                    {formData.supporting_links.map((link, index) => (
                                      <div key={index} className="flex items-center gap-2">
                                        <LinkIcon className="w-5 h-5 text-white/50"/>
                                        <Input
                                          value={link}
                                          onChange={(e) => handleLinkChange(index, e.target.value)}
                                          placeholder="Article, video, or other relevant link"
                                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLinkInput(index)} disabled={formData.supporting_links.length === 1 && index === 0} className="text-white hover:bg-white/10">
                                          <Trash2 className="w-4 h-4 text-red-400"/>
                                        </Button>
                                      </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addLinkInput} className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                                      <Plus className="w-4 h-4 mr-2"/> Add another link
                                    </Button>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="files" className="text-white">Upload Files</Label>
                                    <div className="flex items-center gap-2">
                                        <Paperclip className="w-5 h-5 text-white/50"/>
                                        <Input 
                                          id="files" 
                                          type="file" 
                                          onChange={handleFileChange} 
                                          multiple 
                                          className="bg-white/10 border-white/20 text-white backdrop-blur-md file:bg-white/20 file:text-white file:border-0"
                                        />
                                    </div>
                                    <p className="text-xs text-white/60">Upload photos, documents, or other relevant files.</p>
                                  </div>
                              </div>

                              <div className="text-center pt-6 flex gap-4 justify-center">
                                <Button 
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowForm(false)}
                                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                                >
                                  <X className="w-5 h-5 mr-2" />
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit" 
                                  size="lg" 
                                  disabled={isSubmitting} 
                                  className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white shadow-xl px-10 py-6 text-lg border-0"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                        <Loader2 className="w-5 h-5 mr-2" />
                                      </motion.div>
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      Submit Your Story
                                      <Send className="w-5 h-5 ml-2" />
                                    </>
                                  )}
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Non-Executive/Non-Admin CTA */}
            {!isExecutive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16"
              >
                <Card className="bg-white/10 backdrop-blur-xl border-2 border-amber-400/30 shadow-2xl">
                  <CardContent className="py-12 px-8 text-center">
                    <Crown className="w-16 h-16 text-amber-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4 text-white">Want to Share Your Story?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto text-white/80">
                      Executive members can submit their own stories, read full articles, and access our complete story archive with AI preservation.
                    </p>
                    <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl px-8 py-6 text-lg">
                      <Link to={createPageUrl('Upgrade')}>
                        <Crown className="w-5 h-5 mr-2" />
                        Upgrade to Executive
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Copyright Notice */}
          <footer className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/10 relative z-10">
            <p className="text-center text-sm text-white/70">
              © {new Date().getFullYear()} Ruby Dobry — Creative works on this site are artistic expressions and not legal statements. All rights reserved.
            </p>
            <p className="text-center text-xs text-white/60 mt-2">
              Contact: <a href="mailto:contact@dobrylife.com" className="text-cyan-300 hover:underline">contact@dobrylife.com</a>
            </p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <FeatureGate
      featureKey="story_hub"
      featureName="Story Hub"
      featureDescription="Share, read, and preserve personal and family stories with our compassionate community."
    >
      <div className="min-h-screen relative overflow-hidden">
        {/* Aurora Background */}
        <div className="fixed inset-0 z-0">
          {/* Base Cosmic Gradient */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, #14b8a6 0%, #8b5cf6 25%, #ec4899 50%, #06b6d4 75%, #14b8a6 100%)',
                'radial-gradient(circle at 80% 50%, #06b6d4 0%, #ec4899 25%, #8b5cf6 50%, #14b8a6 75%, #06b6d4 100%)',
                'radial-gradient(circle at 50% 80%, #8b5cf6 0%, #14b8a6 25%, #06b6d4 50%, #ec4899 75%, #8b5cf6 100%)',
                'radial-gradient(circle at 20% 50%, #14b8a6 0%, #8b5cf6 25%, #ec4899 50%, #06b6d4 75%, #14b8a6 100%)',
              ]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear"
            }}
          />

          {/* Aurora Ribbons */}
          <motion.div
            className="absolute inset-0 opacity-40"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #14b8a6 20%, #8b5cf6 40%, #ec4899 60%, #06b6d4 80%, transparent 100%)',
              filter: 'blur(60px)'
            }}
            animate={{
              x: ['-100%', '100%'],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          <motion.div
            className="absolute inset-0 opacity-30"
            style={{
              background: 'linear-gradient(45deg, transparent 0%, #06b6d4 25%, #ec4899 50%, #8b5cf6 75%, transparent 100%)',
              filter: 'blur(80px)'
            }}
            animate={{
              x: ['100%', '-100%'],
              y: ['-50%', '50%'],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Cosmic Dust Particles */}
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: "easeInOut"
              }}
            />
          ))}

          {/* Floating Stars */}
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={`star-${i}`}
              className="absolute"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 1, 0.3],
              }}
              transition={{
                duration: 4 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            >
              <Star className="w-3 h-3 text-cyan-300" fill="currentColor" />
            </motion.div>
          ))}

          {/* Overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/20 to-teal-950/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 p-6">
          <motion.div 
            className="max-w-7xl mx-auto space-y-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
          >
            {/* Header */}
            <motion.header
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-center space-y-6 pt-8"
            >
              <motion.div
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 shadow-2xl"
              >
                <Sparkles className="w-7 h-7 text-cyan-400 animate-pulse" />
                <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-cyan-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
                  The Dobry Dialogue
                </h1>
                <Sparkles className="w-7 h-7 text-pink-400 animate-pulse" />
              </motion.div>
              <p className="text-xl text-white/90 leading-relaxed max-w-3xl mx-auto font-medium">
                A space for sharing personal experiences, life stories, and wisdom. Find connection in shared journeys and inspiration for your own path.
              </p>
            </motion.header>

            {/* Executive/Admin Badge for non-Executive/non-Admin users */}
            {!isExecutive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border-2 border-amber-400/30 text-center shadow-2xl"
              >
                <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">
                  Preview Mode - Executive Members Get Full Access
                </h3>
                <p className="text-white/80 mb-4">
                  You can preview story excerpts below. Upgrade to Executive to read full stories, submit your own, and unlock premium storytelling features.
                </p>
                <Button asChild className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg">
                  <Link to={createPageUrl('Upgrade')}>
                    <Crown className="w-5 h-5 mr-2" />
                    Upgrade to Executive
                  </Link>
                </Button>
              </motion.div>
            )}

            {/* Admin Access Indicator */}
            {user?.role === 'admin' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl rounded-2xl p-4 border-2 border-amber-400 text-center shadow-2xl"
              >
                <div className="flex items-center justify-center gap-3">
                  <Crown className="w-6 h-6 text-amber-400" />
                  <p className="text-white font-bold text-lg">
                    🛡️ Admin Access Granted - Full Story Hub Features Unlocked
                  </p>
                  <Crown className="w-6 h-6 text-amber-400" />
                </div>
              </motion.div>
            )}

            {/* Hero Featured Story */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                  <BookHeart className="w-8 h-8 text-pink-400" />
                  Featured Story
                  <BookHeart className="w-8 h-8 text-pink-400" />
                </h2>
              </div>
              <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="relative h-[500px] rounded-3xl overflow-hidden shadow-2xl group cursor-pointer"
              >
                <Link to={createPageUrl(`StoryDetail?id=${featuredStories[0].id}`)}>
                  <div className="absolute inset-0">
                    <img 
                      src={featuredStories[0].image_url} 
                      alt={featuredStories[0].topic}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${featuredStories[0].gradient}`}></div>
                    
                    {/* Aurora Glow Overlay */}
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        background: [
                          'radial-gradient(circle at 30% 50%, rgba(20,184,166,0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 70% 50%, rgba(139,92,246,0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 50% 70%, rgba(236,72,153,0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 30% 50%, rgba(20,184,166,0.3) 0%, transparent 50%)',
                        ]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
                    <Badge className="self-start mb-4 bg-white/20 backdrop-blur-md text-white border-white/30 px-4 py-1 text-sm">
                      {featuredStories[0].category}
                    </Badge>
                    <h3 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-lg">{featuredStories[0].topic}</h3>
                    <p className="text-lg md:text-xl mb-4 opacity-90 line-clamp-3 drop-shadow-md">
                      <Quote className="inline w-6 h-6 mr-2" />
                      {featuredStories[0].story_excerpt}
                    </p>
                    <div className="flex items-center gap-4 mb-4">
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/9643390b5_16107019508644.jpg"
                        alt={featuredStories[0].name}
                        className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
                      />
                      <div>
                        <p className="font-semibold text-lg">{featuredStories[0].name}</p>
                        <p className="text-sm opacity-90">{featuredStories[0].bio}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm opacity-90">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {featuredStories[0].readTime}
                      </span>
                    </div>
                    <motion.div
                      className="mt-6 opacity-0 group-hover:opacity-100 transition-all duration-300"
                      initial={{ y: 10 }}
                      whileHover={{ y: 0 }}
                    >
                      <Button className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white font-semibold px-8 py-3 rounded-full shadow-xl border border-white/30">
                        Read Full Story
                        <Eye className="w-5 h-5 ml-2" />
                      </Button>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            </motion.div>

            {/* More Stories Grid */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl font-bold text-white mb-2">More Stories</h2>
                <p className="text-white/80">Explore more powerful narratives and shared experiences</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredStories.slice(1).map((story, index) => (
                  <motion.div
                    key={index}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * index }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="group cursor-pointer"
                  >
                    <Link to={createPageUrl(`StoryDetail?id=${story.id}`)}>
                      <Card className="h-full bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 overflow-hidden">
                        <div className="relative h-48 overflow-hidden">
                          <img 
                            src={story.image_url} 
                            alt={story.topic}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className={`absolute inset-0 bg-gradient-to-t ${story.gradient}`}></div>
                          
                          {/* Aurora shimmer on hover */}
                          <motion.div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100"
                            animate={{
                              background: [
                                'radial-gradient(circle at 30% 30%, rgba(20,184,166,0.4) 0%, transparent 50%)',
                                'radial-gradient(circle at 70% 70%, rgba(236,72,153,0.4) 0%, transparent 50%)',
                                'radial-gradient(circle at 30% 30%, rgba(20,184,166,0.4) 0%, transparent 50%)',
                              ]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          
                          <Badge className="absolute top-4 left-4 bg-white/20 backdrop-blur-md text-white border-white/30">
                            {story.category}
                          </Badge>
                          <div className="absolute bottom-4 left-4 right-4">
                            <h3 className="text-2xl font-bold text-white drop-shadow-lg line-clamp-2">{story.topic}</h3>
                          </div>
                        </div>
                        <CardContent className="p-6 flex flex-col flex-grow">
                          <div className="flex items-center gap-3 mb-4">
                            <img 
                              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68dc9a503fbc55d47a5b91dd/9643390b5_16107019508644.jpg"
                              alt={story.name}
                              className="w-10 h-10 rounded-full border-2 border-cyan-300/50"
                            />
                            <div>
                              <p className="font-semibold text-white">{story.name}</p>
                              <p className="text-xs text-white/70">{story.bio}</p>
                            </div>
                          </div>
                          <p className="text-white/80 line-clamp-3 flex-grow mb-4 italic">
                            "{story.story_excerpt}"
                          </p>
                          <div className="flex items-center justify-between text-sm text-white/70 pt-4 border-t border-white/10">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-4 h-4" />
                              {story.readTime}
                            </span>
                            <span className="text-cyan-400 font-medium group-hover:translate-x-2 transition-transform flex items-center gap-1">
                              Read More
                              <Eye className="w-4 h-4" />
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Podcast Section */}
            <motion.section
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <h2 className="text-3xl font-bold text-white mb-8 text-center flex items-center justify-center gap-3">
                <Mic className="w-8 h-8 text-violet-400" />
                From the Podcast
                <Mic className="w-8 h-8 text-violet-400" />
              </h2>
              <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl overflow-hidden">
                <div className="grid md:grid-cols-3">
                  <div className="md:col-span-1 p-8 bg-gradient-to-br from-violet-600/30 to-pink-600/30 rounded-t-xl md:rounded-tr-none md:rounded-l-xl flex flex-col items-center justify-center text-white text-center backdrop-blur-xl border-r border-white/10">
                    <motion.div
                      animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    >
                      <Mic className="w-24 h-24 mb-4 drop-shadow-lg" />
                    </motion.div>
                    <h3 className="text-3xl font-bold mb-2">Dobry Dialogue</h3>
                    <p className="text-lg opacity-90 mt-2">The Podcast</p>
                    <p className="opacity-80 mt-4 text-sm">Deeper conversations with our featured storytellers and experts.</p>
                    <Button variant="secondary" className="mt-6 bg-white/20 hover:bg-white/30 text-white border-white/30" disabled>Listen on Spotify</Button>
                  </div>
                  <div className="md:col-span-2 p-8 flex flex-col items-center justify-center text-center space-y-4">
                    <h4 className="font-semibold text-2xl text-white">Coming Soon</h4>
                    <p className="text-white/80 text-lg max-w-md">New episodes are on the way. Stay tuned for inspiring conversations and powerful stories!</p>
                    <div className="mt-6 flex gap-4 text-5xl">
                      <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.1 }}>🎙️</motion.span>
                      <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}>🎧</motion.span>
                      <motion.span animate={{ y: [0, -10, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}>✨</motion.span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.section>

            {/* Share Your Story CTA - Executive/Admin Only */}
            {isExecutive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16"
              >
                <Card className="bg-white/10 backdrop-blur-xl border border-white/20 text-white shadow-2xl relative overflow-hidden">
                  {/* Aurora Background */}
                  <div className="absolute inset-0">
                    <motion.div
                      className="absolute inset-0"
                      animate={{
                        background: [
                          'radial-gradient(circle at 20% 50%, rgba(20, 184, 166, 0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 80% 50%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 50% 80%, rgba(236, 72, 153, 0.3) 0%, transparent 50%)',
                          'radial-gradient(circle at 20% 50%, rgba(20, 184, 166, 0.3) 0%, transparent 50%)',
                        ]
                      }}
                      transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </div>

                  <CardContent className="relative z-10 py-12 px-8 text-center">
                    <Sparkles className="w-16 h-16 mx-auto mb-6 text-cyan-400" />
                    <h2 className="text-3xl font-bold mb-4 text-white">Your Story Matters</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
                      Share your journey, inspire others, and become part of a healing community.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button
                        onClick={() => setShowForm(true)}
                        className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white border border-white/30 text-lg px-8 py-6 shadow-xl"
                      >
                        <PenSquare className="mr-2 w-5 h-5" />
                        Submit Your Story
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        className="text-white hover:bg-white/10 border border-white/20 text-lg px-8 py-6"
                      >
                        <a href="mailto:contact@dobrylife.com?subject=Story Inquiry">
                          <Mail className="w-5 h-5 mr-2" />
                          Questions? Email Us
                        </a>
                      </Button>
                    </div>
                    <p className="mt-6 text-sm text-white/70">
                      Email: <a href="mailto:contact@dobrylife.com" className="text-cyan-300 hover:underline">contact@dobrylife.com</a>
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Share Your Story Form - Executive/Admin Only */}
            <AnimatePresence>
              {isExecutive && showForm && (
                <motion.section
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  id="share-story"
                >
                  <Card className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl">
                    <AnimatePresence mode="wait">
                      {isSubmitted ? (
                        <motion.div
                          key="success"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="p-12 text-center"
                        >
                          <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                          <h2 className="text-3xl font-bold text-white mb-2">Thank You!</h2>
                          <p className="text-white/80 text-lg mt-4 max-w-xl mx-auto">Your story has been submitted for review. We appreciate you sharing your voice with our community.</p>
                        </motion.div>
                      ) : (
                        <motion.div key="form">
                          <CardHeader className="text-center border-b border-white/10">
                            <div className="flex items-center justify-center gap-3 mb-4">
                              <Feather className="w-8 h-8 text-cyan-400" />
                              <CardTitle className="text-4xl font-bold text-white">Share Your Story</CardTitle>
                              <Feather className="w-8 h-8 text-pink-400" />
                            </div>
                            <p className="text-white/80 text-lg max-w-2xl mx-auto">Have a story or experience you believe could help others? Apply to be featured on The Dobry Dialogue.</p>
                          </CardHeader>
                          <CardContent className="p-8">
                            <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
                              <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="name" className="text-white">Your Name</Label>
                                  <Input 
                                    id="name" 
                                    name="name" 
                                    value={formData.name} 
                                    onChange={handleInputChange} 
                                    required 
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="email" className="text-white">Email Address</Label>
                                  <Input 
                                    type="email" 
                                    id="email" 
                                    name="email" 
                                    value={formData.email} 
                                    onChange={handleInputChange} 
                                    required 
                                    className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                                  />
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="bio" className="text-white">Short Bio (Who are you?)</Label>
                                <Input 
                                  id="bio" 
                                  name="bio" 
                                  value={formData.bio} 
                                  onChange={handleInputChange} 
                                  placeholder="e.g., Parent, Entrepreneur, Artist" 
                                  required 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="story_topic" className="text-white">Story Topic</Label>
                                <Input 
                                  id="story_topic" 
                                  name="story_topic" 
                                  value={formData.story_topic} 
                                  onChange={handleInputChange} 
                                  placeholder="e.g., Navigating Career Change, A Journey Through Grief" 
                                  required 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="story_submission" className="text-white">Your Story</Label>
                                <Textarea 
                                  id="story_submission" 
                                  name="story_submission" 
                                  value={formData.story_submission} 
                                  onChange={handleInputChange} 
                                  rows={8} 
                                  placeholder="Share your experience, what you learned, and any advice you have for others..." 
                                  required 
                                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                                />
                              </div>

                              <div className="space-y-4 pt-4 border-t border-white/10">
                                  <h4 className="text-lg font-semibold text-white">Supporting Evidence (Optional)</h4>
                                  <p className="text-sm text-white/70">Provide links or files that support your story, such as articles, videos, or photos.</p>

                                  <div className="space-y-2">
                                      <Label htmlFor="primary_link" className="text-white">Primary Link</Label>
                                      <div className="flex items-center gap-2">
                                        <LinkIcon className="w-5 h-5 text-white/50"/>
                                        <Input 
                                          id="primary_link" 
                                          name="primary_link" 
                                          value={formData.primary_link} 
                                          onChange={handleInputChange} 
                                          placeholder="Website, portfolio, or social media" 
                                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                                        />
                                      </div>
                                  </div>

                                  <div className="space-y-2">
                                    <Label className="text-white">Supporting Links</Label>
                                    {formData.supporting_links.map((link, index) => (
                                      <div key={index} className="flex items-center gap-2">
                                        <LinkIcon className="w-5 h-5 text-white/50"/>
                                        <Input
                                          value={link}
                                          onChange={(e) => handleLinkChange(index, e.target.value)}
                                          placeholder="Article, video, or other relevant link"
                                          className="bg-white/10 border-white/20 text-white placeholder:text-white/50 backdrop-blur-md"
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLinkInput(index)} disabled={formData.supporting_links.length === 1 && index === 0} className="text-white hover:bg-white/10">
                                          <Trash2 className="w-4 h-4 text-red-400"/>
                                        </Button>
                                      </div>
                                    ))}
                                    <Button type="button" variant="outline" size="sm" onClick={addLinkInput} className="bg-white/10 hover:bg-white/20 text-white border-white/20">
                                      <Plus className="w-4 h-4 mr-2"/> Add another link
                                    </Button>
                                  </div>

                                  <div className="space-y-2">
                                    <Label htmlFor="files" className="text-white">Upload Files</Label>
                                    <div className="flex items-center gap-2">
                                        <Paperclip className="w-5 h-5 text-white/50"/>
                                        <Input 
                                          id="files" 
                                          type="file" 
                                          onChange={handleFileChange} 
                                          multiple 
                                          className="bg-white/10 border-white/20 text-white backdrop-blur-md file:bg-white/20 file:text-white file:border-0"
                                        />
                                    </div>
                                    <p className="text-xs text-white/60">Upload photos, documents, or other relevant files.</p>
                                  </div>
                              </div>

                              <div className="text-center pt-6 flex gap-4 justify-center">
                                <Button 
                                  type="button"
                                  variant="outline"
                                  onClick={() => setShowForm(false)}
                                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                                >
                                  <X className="w-5 h-5 mr-2" />
                                  Cancel
                                </Button>
                                <Button 
                                  type="submit" 
                                  size="lg" 
                                  disabled={isSubmitting} 
                                  className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white shadow-xl px-10 py-6 text-lg border-0"
                                >
                                  {isSubmitting ? (
                                    <>
                                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                        <Loader2 className="w-5 h-5 mr-2" />
                                      </motion.div>
                                      Submitting...
                                    </>
                                  ) : (
                                    <>
                                      Submit Your Story
                                      <Send className="w-5 h-5 ml-2" />
                                    </>
                                  )}
                                </Button>
                              </div>
                            </form>
                          </CardContent>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </Card>
                </motion.section>
              )}
            </AnimatePresence>

            {/* Non-Executive/Non-Admin CTA */}
            {!isExecutive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-16"
              >
                <Card className="bg-white/10 backdrop-blur-xl border-2 border-amber-400/30 shadow-2xl">
                  <CardContent className="py-12 px-8 text-center">
                    <Crown className="w-16 h-16 text-amber-400 mx-auto mb-6" />
                    <h2 className="text-3xl font-bold mb-4 text-white">Want to Share Your Story?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto text-white/80">
                      Executive members can submit their own stories, read full articles, and access our complete story archive with AI preservation.
                    </p>
                    <Button asChild size="lg" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-xl px-8 py-6 text-lg">
                      <Link to={createPageUrl('Upgrade')}>
                        <Crown className="w-5 h-5 mr-2" />
                        Upgrade to Executive
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Copyright Notice */}
          <footer className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/10 relative z-10">
            <p className="text-center text-sm text-white/70">
              © {new Date().getFullYear()} Ruby Dobry — Creative works on this site are artistic expressions and not legal statements. All rights reserved.
            </p>
            <p className="text-center text-xs text-white/60 mt-2">
              Contact: <a href="mailto:contact@dobrylife.com" className="text-cyan-300 hover:underline">contact@dobrylife.com</a>
            </p>
          </footer>
        </div>
      </div>
    </FeatureGate>
  );
}
