
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Video, Link as LinkIcon, Image as ImageIcon,
  Mic, File, Loader2, BookOpen, Brain, Sparkles, Star,
  CheckCircle, Clock, Trophy, GraduationCap, X,
  ChevronRight, AlertCircle, Tag, MessageSquare, Users, Share2,
  UserPlus, Globe, MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import { getSEOForPage } from '@/components/SEODefaults';
import StudyGroupCard from '@/components/homework/StudyGroupCard';
import ShareMaterialModal from '@/components/homework/ShareMaterialModal';
import GroupStudyRoom from '@/components/homework/GroupStudyRoom';
import CreateGroupModal from '@/components/homework/CreateGroupModal';
import AITutorAssistant from '@/components/homework/AITutorAssistant';
import PersonalizedFeedback from '@/components/homework/PersonalizedFeedback';
import AdaptiveDifficulty from '@/components/homework/AdaptiveDifficulty';
import MaterialSummary from '@/components/homework/MaterialSummary';
import DiscussionsList from '@/components/homework/DiscussionsList';
import DiscussionThread from '@/components/homework/DiscussionThread';
import CreateDiscussionModal from '@/components/homework/CreateDiscussionModal';
import PublicGroupsDirectory from '@/components/homework/PublicGroupsDirectory';
import PracticeQuestionGenerator from '@/components/homework/PracticeQuestionGenerator';
import LessonPlanGenerator from '@/components/homework/LessonPlanGenerator'; // New import

export default function HomeworkHub() {
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [studyMode, setStudyMode] = useState(false);
  const [filterSubject, setFilterSubject] = useState('all');
  const [activeTab, setActiveTab] = useState('materials');
  const [showShareModal, setShowShareModal] = useState(false);
  const [materialToShare, setMaterialToShare] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [showDiscussionModal, setShowDiscussionModal] = useState(false);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  // const [showPublicGroups, setShowPublicGroups] = useState(false); // Removed, now handled by tab
  const [practiceMode, setPracticeMode] = useState(false);
  const [selectedMaterialForPractice, setSelectedMaterialForPractice] = useState(null);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['homeworkMaterials'],
    queryFn: () => base44.entities.HomeworkMaterial.list('-created_date'),
    initialData: []
  });

  const { data: studyGroups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['myStudyGroups'],
    queryFn: async () => {
      const groups = await base44.entities.StudyGroup.list('-updated_date');
      return groups;
    },
    initialData: [],
    staleTime: 0,
    refetchOnMount: true
  });

  const joinGroupMutation = useMutation({
    mutationFn: async (code) => {
      if (!user?.email) {
        throw new Error('You must be logged in to join a group.');
      }
      const groups = await base44.entities.StudyGroup.filter({ invite_code: code.toUpperCase() });
      if (groups.length === 0) {
        throw new Error('Invalid invite code');
      }

      const group = groups[0];

      if (group.member_emails?.includes(user.email)) {
        throw new Error('You are already a member of this group.');
      }

      if (group.member_count >= group.max_members) {
        throw new Error('Group is full');
      }

      return await base44.entities.StudyGroup.update(group.id, {
        member_emails: [...(group.member_emails || []), user.email],
        member_count: (group.member_count || 0) + 1
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myStudyGroups'] });
      toast.success('🎉 Joined study group!');
      setJoinCode('');
      setActiveTab('groups');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to join group');
    }
  });

  const filteredMaterials = materials.filter(m =>
    filterSubject === 'all' || m.subject === filterSubject
  );

  const stats = {
    total: materials.length,
    completed: materials.filter(m => m.study_progress === 100).length,
    inProgress: materials.filter(m => m.study_progress > 0 && m.study_progress < 100).length,
    totalQuestions: materials.reduce((sum, m) => sum + (m.total_questions_generated || 0), 0),
    avgScore: materials.length > 0
      ? Math.round(materials.reduce((sum, m) => sum + (m.average_score || 0), 0) / materials.filter(m => m.average_score).length)
      : 0
  };

  const subjects = [
    { value: 'all', label: 'All Subjects', icon: '📚', color: 'from-purple-500 to-pink-500' },
    { value: 'math', label: 'Math', icon: '🔢', color: 'from-blue-500 to-cyan-500' },
    { value: 'science', label: 'Science', icon: '🔬', color: 'from-green-500 to-emerald-500' },
    { value: 'english', label: 'English', icon: '📖', color: 'from-amber-500 to-orange-500' },
    { value: 'history', label: 'History', icon: '🏛️', color: 'from-rose-500 to-pink-500' },
    { value: 'languages', label: 'Languages', icon: '🌍', color: 'from-indigo-500 to-purple-500' },
    { value: 'computer_science', label: 'Computer Science', icon: '💻', color: 'from-teal-500 to-cyan-500' },
    { value: 'other', label: 'Other', icon: '📝', color: 'from-gray-500 to-slate-500' }
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'pdf': return <FileText className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      case 'audio': return <Mic className="w-6 h-6" />;
      case 'url': return <LinkIcon className="w-6 h-6" />;
      case 'scanned_image': return <ImageIcon className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  const getSubjectColor = (subject) => {
    const colors = {
      math: 'from-blue-500 to-cyan-500',
      science: 'from-green-500 to-emerald-500',
      english: 'from-amber-500 to-orange-500',
      history: 'from-rose-500 to-pink-500',
      languages: 'from-indigo-500 to-purple-500',
      computer_science: 'from-teal-500 to-cyan-500',
      chemistry: 'from-blue-400 to-cyan-400',
      physics: 'from-red-400 to-orange-400',
      biology: 'from-green-400 to-lime-400',
      geography: 'from-sky-400 to-blue-400',
      default: 'from-gray-500 to-slate-500'
    };
    return colors[subject] || colors.default;
  };

  const startPracticeMode = (material) => {
    setSelectedMaterialForPractice(material);
    setPracticeMode(true);
  };

  const handlePracticeComplete = async (stats) => {
    if (selectedMaterialForPractice) {
      await base44.entities.HomeworkMaterial.update(selectedMaterialForPractice.id, {
        questions_answered: (selectedMaterialForPractice.questions_answered || 0) + stats.totalGenerated,
        average_score: stats.accuracy,
        study_progress: Math.min(100, (selectedMaterialForPractice.study_progress || 0) + 15)
      });
      queryClient.invalidateQueries({ queryKey: ['homeworkMaterials'] });
    }

    setPracticeMode(false);
    setSelectedMaterialForPractice(null);
    toast.success(`Great work! You answered ${stats.totalGenerated} questions with ${stats.accuracy}% accuracy!`);
  };

  if (selectedGroup) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <GroupStudyRoom group={selectedGroup} onBack={() => setSelectedGroup(null)} />
        </div>
      </div>
    );
  }

  const seo = getSEOForPage('HomeworkHub');

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        url="https://www.helper33.com/HomeworkHub"
        structuredData={seo.structuredData}
      />

      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.15, 1],
                y: [0, -5, 0]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
            >
              <GraduationCap className="w-14 h-14 text-white" />
            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">
              🎓 Homework Hub
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI tutoring, collaborative study groups, and threaded discussions for better learning!
            </p>
          </motion.div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: BookOpen, label: 'Materials', value: stats.total, color: 'from-blue-500 to-cyan-500', emoji: '📚' },
              { icon: CheckCircle, label: 'Completed', value: stats.completed, color: 'from-green-500 to-emerald-500', emoji: '✅' },
              { icon: Clock, label: 'In Progress', value: stats.inProgress, color: 'from-orange-500 to-amber-500', emoji: '⏳' },
              { icon: Brain, label: 'Questions', value: stats.totalQuestions, color: 'from-purple-500 to-pink-500', emoji: '❓' },
              { icon: Users, label: 'Groups', value: studyGroups.length, color: 'from-indigo-500 to-blue-500', emoji: '👥' }
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <Card className={`bg-gradient-to-br ${stat.color} text-white border-0 shadow-xl`}>
                  <CardContent className="p-4 text-center">
                    <motion.div
                      animate={{ rotate: [0, 10, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-3xl mb-2"
                    >
                      {stat.emoji}
                    </motion.div>
                    <p className="text-3xl font-black mb-1">{stat.value}</p>
                    <p className="text-sm opacity-90 font-semibold">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Tabs */}
        <AnimatePresence mode="wait">
          {practiceMode && selectedMaterialForPractice ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 overflow-y-auto p-4"
            >
              <div className="min-h-screen flex items-center justify-center py-8">
                <div className="w-full max-w-5xl">
                  <Button
                    onClick={() => {
                      setPracticeMode(false);
                      setSelectedMaterialForPractice(null);
                    }}
                    variant="ghost"
                    className="mb-4 text-white hover:bg-white/10"
                  >
                    ← Back to Materials
                  </Button>
                  <PracticeQuestionGenerator
                    materialId={selectedMaterialForPractice.id}
                    materialTitle={selectedMaterialForPractice.title}
                    fileUrls={selectedMaterialForPractice.file_url ? [selectedMaterialForPractice.file_url] : []}
                    externalUrl={selectedMaterialForPractice.external_url}
                    extractedText={selectedMaterialForPractice.extracted_text || selectedMaterialForPractice.ai_summary}
                    keyTopics={selectedMaterialForPractice.key_topics || []}
                    subject={selectedMaterialForPractice.subject}
                    onComplete={handlePracticeComplete}
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-7xl mx-auto px-4 pb-12">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto mb-8 bg-white/80 backdrop-blur-lg p-2 rounded-xl shadow-xl">
                <TabsTrigger value="materials" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all">
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">My Materials</span>
                  <span className="sm:hidden">Materials</span>
                </TabsTrigger>
                <TabsTrigger value="groups" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Study Groups</span>
                  <span className="sm:hidden">Groups</span>
                </TabsTrigger>
                <TabsTrigger value="discussions" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:to-rose-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all">
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Discussions</span>
                  <span className="sm:hidden">Talk</span>
                </TabsTrigger>
                <TabsTrigger value="public" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-600 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all">
                  <Globe className="w-4 h-4" />
                  <span className="hidden sm:inline">Discover</span>
                  <span className="sm:hidden">Find</span>
                </TabsTrigger>
                <TabsTrigger value="lesson-plans" className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-600 data-[state=active]:to-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all">
                  <GraduationCap className="w-4 h-4" />
                  <span className="hidden sm:inline">Lesson Plans</span>
                  <span className="sm:hidden">Plans</span>
                </TabsTrigger>
              </TabsList>

              {/* Materials Tab */}
              <TabsContent value="materials" className="mt-6 space-y-6">
                <Card className="border-2 border-purple-300 shadow-xl bg-white/90 backdrop-blur-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Tag className="w-5 h-5 text-purple-600" />
                      <h3 className="font-bold text-gray-900">Filter by Subject</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {subjects.map((subject, idx) => (
                        <motion.button
                          key={subject.value}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.1, y: -3 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setFilterSubject(subject.value)}
                          className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                            filterSubject === subject.value
                              ? `bg-gradient-to-r ${subject.color} text-white shadow-lg`
                              : 'bg-white border-2 border-purple-200 text-gray-700 hover:border-purple-400'
                          }`}
                        >
                          <span className="mr-2">{subject.icon}</span>
                          {subject.label}
                        </motion.button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl py-8 text-xl touch-manipulation relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-white/20"
                      animate={{ x: ['-100%', '200%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    />
                    <Upload className="w-6 h-6 mr-3 relative z-10" />
                    <span className="relative z-10">Upload New Study Material</span>
                    <Sparkles className="w-6 h-6 ml-3 relative z-10" />
                  </Button>
                </motion.div>

                {isLoading ? (
                  <div className="text-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your study materials...</p>
                  </div>
                ) : filteredMaterials.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-purple-300"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-8xl mb-6"
                    >
                      📚
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">
                      {filterSubject === 'all' ? 'No Study Materials Yet' : `No ${subjects.find(s => s.value === filterSubject)?.label} Materials`}
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Upload your first homework or study material to get started with AI-powered learning!
                    </p>
                    <Button
                      onClick={() => setShowUploadModal(true)}
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      Upload Now
                    </Button>
                  </motion.div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMaterials.map((material, idx) => {
                      const daysUntilDue = material.due_date
                        ? Math.ceil((new Date(material.due_date) - new Date()) / (1000 * 60 * 60 * 24))
                        : null;

                      return (
                        <motion.div
                          key={material.id}
                          initial={{ opacity: 0, y: 30, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: idx * 0.1 }}
                          whileHover={{ y: -10, scale: 1.03 }}
                        >
                          <Card className="h-full hover:shadow-2xl transition-all border-2 border-purple-200 bg-white/90 backdrop-blur-sm group cursor-pointer relative overflow-hidden">
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity"
                              animate={{ rotate: [0, 360] }}
                              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                            />

                            <CardHeader className="relative z-10">
                              <div className="flex items-start justify-between mb-3">
                                <motion.div
                                  whileHover={{ rotate: 360 }}
                                  transition={{ duration: 0.6 }}
                                  className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getSubjectColor(material.subject)} flex items-center justify-center shadow-lg text-white`}
                                >
                                  {getTypeIcon(material.material_type)}
                                </motion.div>

                                <div className="flex gap-2">
                                  {material.is_favorite && (
                                    <motion.div
                                      animate={{ scale: [1, 1.2, 1], rotate: [0, 20, 0] }}
                                      transition={{ duration: 2, repeat: Infinity }}
                                    >
                                      <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                                    </motion.div>
                                  )}
                                  <motion.button
                                    whileHover={{ scale: 1.2, rotate: 10 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMaterialToShare(material);
                                      setShowShareModal(true);
                                    }}
                                    className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl"
                                  >
                                    <Share2 className="w-4 h-4 text-white" />
                                  </motion.button>
                                </div>
                              </div>

                              <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                {material.title}
                              </CardTitle>

                              <div className="flex flex-wrap gap-2">
                                <Badge className={`bg-gradient-to-r ${getSubjectColor(material.subject)} text-white`}>
                                  {material.subject}
                                </Badge>
                                {material.difficulty_level && (
                                  <Badge variant="outline">
                                    {material.difficulty_level}
                                  </Badge>
                                )}
                                {material.ai_summary && (
                                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                                    <Sparkles className="w-3 h-3 mr-1" />
                                    AI Summary
                                  </Badge>
                                )}
                              </div>
                            </CardHeader>

                            <CardContent className="relative z-10">
                              <div className="mb-4">
                                <div className="flex justify-between items-center mb-2">
                                  <span className="text-xs font-semibold text-gray-600">Study Progress</span>
                                  <span className="text-xs font-bold text-purple-600">{material.study_progress || 0}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${material.study_progress || 0}%` }}
                                    transition={{ duration: 1, delay: idx * 0.1 }}
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="text-center p-2 bg-purple-50 rounded-lg">
                                  <p className="text-xs text-gray-600">Questions</p>
                                  <p className="text-lg font-bold text-purple-600">{material.total_questions_generated || 0}</p>
                                </div>
                                <div className="text-center p-2 bg-green-50 rounded-lg">
                                  <p className="text-xs text-gray-600">Score</p>
                                  <p className="text-lg font-bold text-green-600">{material.average_score || 0}%</p>
                                </div>
                              </div>

                              {daysUntilDue !== null && daysUntilDue <= 7 && (
                                <motion.div
                                  animate={{ scale: [1, 1.05, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className={`flex items-center gap-2 p-2 rounded-lg mb-4 ${
                                    daysUntilDue <= 2 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                                  }`}
                                >
                                  <AlertCircle className="w-4 h-4" />
                                  <span className="text-xs font-semibold">
                                    Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
                                  </span>
                                </motion.div>
                              )}

                              <div className="flex gap-2">
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMaterial(material);
                                    setStudyMode(true);
                                  }}
                                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white touch-manipulation"
                                >
                                  <Brain className="w-4 h-4 mr-2" />
                                  Study
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedMaterial(material);
                                  }}
                                  variant="outline"
                                  className="border-2 border-purple-300 hover:bg-purple-50 touch-manipulation"
                                >
                                  <ChevronRight className="w-5 h-5" />
                                </Button>
                                <Button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    startPracticeMode(material);
                                  }}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1 border-purple-400 text-purple-700 hover:bg-purple-50"
                                  disabled={!material.extracted_text && !material.ai_summary}
                                >
                                  <Brain className="w-4 h-4 mr-1" />
                                  Practice
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* Study Groups Tab */}
              <TabsContent value="groups" className="mt-6 space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => setShowCreateGroupModal(true)}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl py-6 text-lg touch-manipulation"
                    >
                      <UserPlus className="w-5 h-5 mr-2" />
                      Create Group
                    </Button>
                  </motion.div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={() => setActiveTab('public')}
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-xl py-6 text-lg touch-manipulation"
                    >
                      <Globe className="w-5 h-5 mr-2" />
                      Browse Public Groups
                    </Button>
                  </motion.div>

                  <div className="flex gap-2">
                    <Input
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      placeholder="Invite code..."
                      className="flex-1 border-2 border-indigo-300 text-center font-bold text-lg"
                      maxLength={6}
                    />
                    <Button
                      onClick={() => joinGroupMutation.mutate(joinCode)}
                      disabled={joinCode.length < 6 || joinGroupMutation.isPending}
                      className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white"
                    >
                      {joinGroupMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Join'
                      )}
                    </Button>
                  </div>
                </div>

                {groupsLoading ? (
                  <div className="text-center py-20">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading study groups...</p>
                  </div>
                ) : studyGroups.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-20 bg-white/80 backdrop-blur-sm rounded-3xl border-2 border-dashed border-indigo-300"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="text-8xl mb-6"
                    >
                      👥
                    </motion.div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-3">No Study Groups Yet</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Create a group, join a public one, or use an invite code!
                    </p>
                    <div className="flex gap-3 justify-center">
                      <Button
                        onClick={() => setShowCreateGroupModal(true)}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                      >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Create Group
                      </Button>
                      <Button
                        onClick={() => setActiveTab('public')}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
                      >
                        <Globe className="w-5 h-5 mr-2" />
                        Browse Public
                      </Button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {studyGroups.map((group, idx) => (
                      <StudyGroupCard
                        key={group.id}
                        group={group}
                        index={idx}
                        onSelect={setSelectedGroup}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Public Groups Tab */}
              <TabsContent value="public" className="mt-6 space-y-6">
                <PublicGroupsDirectory onJoinSuccess={() => {
                  setActiveTab('groups'); // Go back to my groups after joining
                }} />
              </TabsContent>

              {/* Discussions Tab */}
              <TabsContent value="discussions" className="mt-6 space-y-6">
                <div className="text-center mb-6">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl"
                  >
                    <MessageSquare className="w-9 h-9 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent mb-2">
                    Study Discussions
                  </h2>
                  <p className="text-gray-600">Ask questions and help classmates learn!</p>
                </div>

                {materials.length === 0 ? (
                  <div className="text-center py-12 bg-white/80 rounded-3xl border-2 border-dashed border-pink-300">
                    <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600">Upload study materials first to start discussions!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {materials.map((material, idx) => (
                      <MaterialDiscussionSection
                        key={material.id}
                        material={material}
                        index={idx}
                        onCreateDiscussion={() => {
                          setSelectedMaterial(material);
                          setShowDiscussionModal(true);
                        }}
                        onSelectDiscussion={setSelectedDiscussion}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Lesson Plans Tab */}
              <TabsContent value="lesson-plans" className="mt-6">
                <LessonPlanGenerator />
              </TabsContent>
            </Tabs>
          )}
        </AnimatePresence>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showUploadModal && (
          <UploadMaterialModal onClose={() => setShowUploadModal(false)} />
        )}
        {studyMode && selectedMaterial && (
          <StudyModeModal
            material={selectedMaterial}
            onClose={() => {
              setStudyMode(false);
              setSelectedMaterial(null);
            }}
          />
        )}
        {selectedMaterial && !studyMode && (
          <MaterialDetailModal
            material={selectedMaterial}
            onClose={() => setSelectedMaterial(null)}
            onStudy={() => setStudyMode(true)}
          />
        )}
        {showShareModal && materialToShare && (
          <ShareMaterialModal
            material={materialToShare}
            onClose={() => {
              setShowShareModal(false);
              setMaterialToShare(null);
            }}
          />
        )}
        {showCreateGroupModal && (
          <CreateGroupModal
            onClose={() => setShowCreateGroupModal(false)}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['myStudyGroups'] });
              setActiveTab('groups');
            }}
          />
        )}
        {showDiscussionModal && selectedMaterial && (
          <CreateDiscussionModal
            material={selectedMaterial}
            onClose={() => {
              setShowDiscussionModal(false);
              setSelectedMaterial(null);
            }}
            onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: ['materialDiscussions'] });
            }}
          />
        )}
        {selectedDiscussion && (
          <DiscussionThread
            discussion={selectedDiscussion}
            onClose={() => setSelectedDiscussion(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}

// Material Discussion Section Component
function MaterialDiscussionSection({ material, index, onCreateDiscussion, onSelectDiscussion }) {
  const [expanded, setExpanded] = useState(false);

  const { data: discussions = [] } = useQuery({
    queryKey: ['materialDiscussions', material.id],
    queryFn: () => base44.entities.StudyDiscussion.filter({ material_id: material.id }, '-created_date', 5),
    initialData: [],
    enabled: expanded
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-2 border-pink-200 bg-white/90 backdrop-blur-sm hover:shadow-xl transition-all">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{material.title}</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  {material.subject}
                </Badge>
                <Badge variant="outline">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {discussions.length} discussions
                </Badge>
              </div>
            </div>
            <Button
              onClick={onCreateDiscussion}
              className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              New Discussion
            </Button>
          </div>
        </CardHeader>

        {expanded && (
          <CardContent>
            <DiscussionsList
              materialId={material.id}
              onSelectDiscussion={onSelectDiscussion}
            />
          </CardContent>
        )}

        <div className="px-6 pb-4">
          <Button
            onClick={() => setExpanded(!expanded)}
            variant="ghost"
            className="w-full text-purple-600 hover:bg-purple-50"
          >
            {expanded ? 'Hide Discussions' : `View ${discussions.length} Discussion${discussions.length !== 1 ? 's' : ''}`}
            <ChevronRight className={`w-4 h-4 ml-2 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

// Material Card Component (The MaterialCard component itself is not used directly in HomeworkHub anymore
// as its rendering logic was moved inline to accommodate the new "Practice" button within the materials map.
// However, it's kept here as the outline did not specify its removal.)
function MaterialCard({ material, index, onSelect, onStudy, onShare }) {
  const getTypeIcon = (type) => {
    switch(type) {
      case 'pdf': return <FileText className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      case 'audio': return <Mic className="w-6 h-6" />;
      case 'url': return <LinkIcon className="w-6 h-6" />;
      case 'scanned_image': return <ImageIcon className="w-6 h-6" />;
      default: return <File className="w-6 h-6" />;
    }
  };

  const getSubjectColor = (subject) => {
    const colors = {
      math: 'from-blue-500 to-cyan-500',
      science: 'from-green-500 to-emerald-500',
      english: 'from-amber-500 to-orange-500',
      history: 'from-rose-500 to-pink-500',
      languages: 'from-indigo-500 to-purple-500',
      computer_science: 'from-teal-500 to-cyan-500',
      default: 'from-gray-500 to-slate-500'
    };
    return colors[subject] || colors.default;
  };

  const daysUntilDue = material.due_date
    ? Math.ceil((new Date(material.due_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -10, scale: 1.03 }}
    >
      <Card className="h-full hover:shadow-2xl transition-all border-2 border-purple-200 bg-white/90 backdrop-blur-sm group cursor-pointer relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />

        <CardHeader className="relative z-10">
          <div className="flex items-start justify-between mb-3">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getSubjectColor(material.subject)} flex items-center justify-center shadow-lg text-white`}
            >
              {getTypeIcon(material.material_type)}
            </motion.div>

            <div className="flex gap-2">
              {material.is_favorite && (
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 20, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
                </motion.div>
              )}
              <motion.button
                whileHover={{ scale: 1.2, rotate: 10 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onShare();
                }}
                className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                <Share2 className="w-4 h-4 text-white" />
              </motion.button>
            </div>
          </div>

          <CardTitle className="text-lg mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
            {material.title}
          </CardTitle>

          <div className="flex flex-wrap gap-2">
            <Badge className={`bg-gradient-to-r ${getSubjectColor(material.subject)} text-white`}>
              {material.subject}
            </Badge>
            {material.difficulty_level && (
              <Badge variant="outline">
                {material.difficulty_level}
              </Badge>
            )}
            {material.ai_summary && (
              <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Summary
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="relative z-10">
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold text-gray-600">Study Progress</span>
              <span className="text-xs font-bold text-purple-600">{material.study_progress || 0}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${material.study_progress || 0}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-2 bg-purple-50 rounded-lg">
              <p className="text-xs text-gray-600">Questions</p>
              <p className="text-lg font-bold text-purple-600">{material.total_questions_generated || 0}</p>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg">
              <p className="text-xs text-gray-600">Score</p>
              <p className="text-lg font-bold text-green-600">{material.average_score || 0}%</p>
            </div>
          </div>

          {daysUntilDue !== null && daysUntilDue <= 7 && (
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className={`flex items-center gap-2 p-2 rounded-lg mb-4 ${
                daysUntilDue <= 2 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
              }`}
            >
              <AlertCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">
                Due in {daysUntilDue} day{daysUntilDue !== 1 ? 's' : ''}
              </span>
            </motion.div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onStudy();
              }}
              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white touch-manipulation"
            >
              <Brain className="w-4 h-4 mr-2" />
              Study
            </Button>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
              variant="outline"
              className="border-2 border-purple-300 hover:bg-purple-50 touch-manipulation"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Continue with remaining components in the file...
function UploadMaterialModal({ onClose }) {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: 'math',
    material_type: 'pdf',
    file_url: '',
    external_url: '',
    due_date: '',
    teacher_name: '',
    class_name: '',
    difficulty_level: 'intermediate',
    notes: ''
  });

  const handleFileUpload = async (file) => {
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, file_url });
      toast.success('📎 File uploaded successfully!');

      if (file.type === 'application/pdf' || file.type.startsWith('image/')) {
        setExtracting(true);
        try {
          const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
            file_url,
            json_schema: {
              type: "object",
              properties: {
                text_content: { type: "string" },
                main_topics: { type: "array", items: { type: "string" } }
              }
            }
          });

          if (extractResult.status === 'success' && extractResult.text_content) {
            toast.success('✨ Content extracted! Generating summary...');
            // No direct update to formData with extractedTextContent here as it's handled in the mutation
          }
        } catch (error) {
          console.error('Extraction error:', error);
          toast.error('Failed to extract content from file.');
        } finally {
          setExtracting(false);
        }
      }
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const createMaterialMutation = useMutation({
    mutationFn: async (data) => {
      let aiSummary = '';
      let keyTopics = [];
      let extractedTextContent = ''; // Variable to store extracted text

      // Attempt to extract text content first if file_url exists
      if (data.file_url && (data.material_type === 'pdf' || data.material_type === 'scanned_image' || data.material_type === 'word_doc')) {
        try {
          const extractResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
            file_url: data.file_url,
            json_schema: {
              type: "object",
              properties: {
                text_content: { type: "string" }
              }
            }
          });
          if (extractResult.status === 'success' && extractResult.text_content) {
            extractedTextContent = extractResult.text_content;
          }
        } catch (error) {
          console.error('Initial text extraction error:', error);
          // Don't fail the entire mutation, just proceed without extracted text
        }
      }

      if (data.file_url || data.external_url || data.notes || extractedTextContent) {
        try {
          let content = '';
          if (data.notes) {
            content = `User notes: ${data.notes}`;
          } else if (data.title && data.subject) {
            content = `Material title: ${data.title}, Subject: ${data.subject}`;
          }

          // Use extractedTextContent if available, otherwise rely on file_urls or add_context_from_internet
          const summaryPrompt = `Analyze this study material and provide: 1) A concise summary (2-3 sentences) 2) List of main topics covered. ${content}`;
          const summaryResult = await base44.integrations.Core.InvokeLLM({
            prompt: summaryPrompt,
            add_context_from_internet: data.external_url ? true : false,
            file_urls: data.file_url ? [data.file_url] : undefined,
            context: extractedTextContent ? extractedTextContent : undefined // Pass extracted text as context
          });

          // Assuming summaryResult is a string, truncate it
          aiSummary = summaryResult.substring(0, 500);

          const topicsPrompt = `List 5-7 main topics from this ${data.subject} material: ${data.title}.`;
          const topicsResult = await base44.integrations.Core.InvokeLLM({
            prompt: topicsPrompt,
            response_json_schema: {
              type: "object",
              properties: {
                topics: { type: "array", items: { type: "string" } }
              }
            },
            context: extractedTextContent ? extractedTextContent : undefined
          });

          keyTopics = topicsResult?.topics || [];
        } catch (error) {
          console.error('AI processing error:', error);
          // Continue even if AI processing fails
        }
      }

      return await base44.entities.HomeworkMaterial.create({
        ...data,
        ai_summary: aiSummary,
        key_topics: keyTopics,
        extracted_text: extractedTextContent, // Store the extracted text
        study_progress: 0,
        total_questions_generated: 0
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homeworkMaterials'] });
      toast.success('🎉 Study material added successfully!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to create material');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Please enter a title');
      return;
    }
    createMaterialMutation.mutate(formData);
  };

  const uploadTypes = [
    { type: 'pdf', icon: FileText, label: 'PDF Document', color: 'from-red-500 to-rose-500' },
    { type: 'word_doc', icon: File, label: 'Word Doc', color: 'from-blue-500 to-cyan-500' },
    { type: 'video', icon: Video, label: 'Video', color: 'from-purple-500 to-pink-500' },
    { type: 'audio', icon: Mic, label: 'Audio', color: 'from-green-500 to-emerald-500' },
    { type: 'url', icon: LinkIcon, label: 'Web Link', color: 'from-orange-500 to-amber-500' },
    { type: 'scanned_image', icon: ImageIcon, label: 'Scanned Image', color: 'from-indigo-500 to-purple-500' },
    { type: 'text_notes', icon: FileText, label: 'Text Notes', color: 'from-teal-500 to-cyan-500' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-4 border-purple-300"
      >
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Upload className="w-8 h-8" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-bold">Upload Study Material</h2>
              <p className="text-purple-100 text-sm">Add homework, notes, or any learning resource</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <Label className="text-sm font-bold text-gray-700 mb-3 block">Material Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {uploadTypes.map((type, idx) => (
                <motion.button
                  key={type.type}
                  type="button"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormData({ ...formData, material_type: type.type })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.material_type === type.type
                      ? `bg-gradient-to-br ${type.color} text-white border-white shadow-xl`
                      : 'bg-white border-gray-200 hover:border-purple-400'
                  }`}
                >
                  <type.icon className={`w-6 h-6 mx-auto mb-2 ${formData.material_type === type.type ? 'text-white' : 'text-gray-600'}`} />
                  <p className={`text-xs font-semibold ${formData.material_type === type.type ? 'text-white' : 'text-gray-700'}`}>
                    {type.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {formData.material_type === 'url' ? (
            <div>
              <Label htmlFor="external-url" className="text-sm font-semibold text-gray-700">Web URL</Label>
              <Input
                id="external-url"
                value={formData.external_url}
                onChange={(e) => setFormData({ ...formData, external_url: e.target.value })}
                placeholder="https://example.com/article"
                className="mt-2"
              />
            </div>
          ) : formData.material_type === 'text_notes' ? (
            <div>
              <Label htmlFor="notes-text" className="text-sm font-semibold text-gray-700">Your Notes</Label>
              <Textarea
                id="notes-text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Paste or type your study notes here..."
                rows={6}
                className="mt-2"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-purple-300 rounded-xl p-6 bg-purple-50/50 hover:bg-purple-50 transition-colors">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) handleFileUpload(file);
                }}
                accept={
                  formData.material_type === 'pdf' ? '.pdf' :
                  formData.material_type === 'video' ? 'video/*' :
                  formData.material_type === 'audio' ? 'audio/*' :
                  formData.material_type === 'scanned_image' ? 'image/*' :
                  '.pdf,.doc,.docx' // For word_doc and others
                }
              />
              <label htmlFor="file-upload" className="cursor-pointer block text-center">
                {uploading || extracting ? (
                  <div>
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-3" />
                    <p className="font-semibold text-purple-700">
                      {uploading ? 'Uploading...' : 'Extracting content...'}
                    </p>
                  </div>
                ) : formData.file_url ? (
                  <div>
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-3" />
                    <p className="font-semibold text-green-700">File uploaded! ✅</p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={(e) => {
                        e.preventDefault();
                        setFormData({ ...formData, file_url: '' });
                      }}
                    >
                      Change File
                    </Button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-purple-400 mx-auto mb-3" />
                    <p className="font-semibold text-gray-700 mb-1">Click to upload file</p>
                    <p className="text-xs text-gray-500">or drag and drop</p>
                  </div>
                )}
              </label>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title" className="text-sm font-semibold text-gray-700">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Chapter 5 - Algebra"
                className="mt-2"
                required
              />
            </div>
            <div>
              <Label htmlFor="subject" className="text-sm font-semibold text-gray-700">Subject *</Label>
              <select
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full p-2 border-2 border-gray-200 rounded-lg mt-2 focus:border-purple-400 focus:outline-none"
              >
                <option value="math">Math 🔢</option>
                <option value="science">Science 🔬</option>
                <option value="english">English 📖</option>
                <option value="history">History 🏛️</option>
                <option value="geography">Geography 🌍</option>
                <option value="languages">Languages 🗣️</option>
                <option value="computer_science">Computer Science 💻</option>
                <option value="chemistry">Chemistry ⚗️</option>
                <option value="physics">Physics ⚛️</option>
                <option value="biology">Biology 🧬</option>
                <option value="other">Other 📝</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teacher" className="text-sm font-semibold text-gray-700">Teacher/Professor</Label>
              <Input
                id="teacher"
                value={formData.teacher_name}
                onChange={(e) => setFormData({ ...formData, teacher_name: e.target.value })}
                placeholder="Dr. Smith"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="class" className="text-sm font-semibold text-gray-700">Class Name</Label>
              <Input
                id="class"
                value={formData.class_name}
                onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                placeholder="Algebra 2"
                className="mt-2"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="due-date" className="text-sm font-semibold text-gray-700">Due Date</Label>
              <Input
                id="due-date"
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="difficulty" className="text-sm font-semibold text-gray-700">Difficulty</Label>
              <select
                id="difficulty"
                value={formData.difficulty_level}
                onChange={(e) => setFormData({ ...formData, difficulty_level: e.target.value })}
                className="w-full p-2 border-2 border-gray-200 rounded-lg mt-2 focus:border-purple-400 focus:outline-none"
              >
                <option value="beginner">Beginner 🌱</option>
                <option value="intermediate">Intermediate ⭐</option>
                <option value="advanced">Advanced 🔥</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMaterialMutation.isPending || uploading || extracting}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white touch-manipulation"
            >
              {createMaterialMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Material
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function MaterialDetailModal({ material, onClose, onStudy }) {
  const queryClient = useQueryClient();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-4 border-purple-300"
      >
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white p-6 flex items-center justify-between z-10 rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold mb-1">{material.title}</h2>
            <Badge className="bg-white/20 text-white">
              {material.subject}
            </Badge>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <MaterialSummary
            material={material}
            onUpdate={() => queryClient.invalidateQueries({ queryKey: ['homeworkMaterials'] })}
          />

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              onClick={onStudy}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-6 text-lg touch-manipulation"
            >
              <Brain className="w-5 h-5 mr-2" />
              Start Studying with AI Tutor
              <Sparkles className="w-5 h-5 ml-2" />
            </Button>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StudyModeModal({ material, onClose }) {
  const queryClient = useQueryClient();
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [focusTopic, setFocusTopic] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(material.difficulty_level || 'medium');
  const [performance, setPerformance] = useState([]);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: pastPerformance = [] } = useQuery({
    queryKey: ['studyPerformance', material.id],
    queryFn: () => base44.entities.StudyPerformance.filter({ material_id: material.id }, '-created_date', 10),
    initialData: []
  });

  const recordPerformanceMutation = useMutation({
    mutationFn: async (perfData) => {
      return await base44.entities.StudyPerformance.create(perfData);
    }
  });

  const generateQuestions = async () => {
    setGeneratingQuestions(true);
    try {
      const safeQuestionCount = Math.min(questionCount, 10);

      let prompt = `Generate exactly ${safeQuestionCount} ${adaptiveDifficulty} difficulty study questions for this ${material.subject} material titled "${material.title}".`;

      if (focusTopic) {
        prompt += ` Focus on the topic: ${focusTopic}.`;
      }

      prompt += ` Include multiple choice and short answer questions. For each question provide: question text, type, options (for MC), correct answer, brief explanation (1-2 sentences), and the topic.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        file_urls: material.file_url ? [material.file_url] : undefined,
        add_context_from_internet: material.external_url ? true : false,
        response_json_schema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  type: { type: "string" },
                  options: { type: "array", items: { type: "string" } },
                  correct_answer: { type: "string" },
                  explanation: { type: "string" },
                  topic: { type: "string" }
                }
              }
            }
          }
        }
      });

      if (result?.questions && result.questions.length > 0) {
        setQuestions(result.questions);
        setQuestionStartTime(Date.now());
        toast.success(`✨ Generated ${result.questions.length} ${adaptiveDifficulty} questions!`);

        await base44.entities.HomeworkMaterial.update(material.id, {
          total_questions_generated: (material.total_questions_generated || 0) + result.questions.length,
          last_studied: new Date().toISOString()
        });

        queryClient.invalidateQueries({ queryKey: ['homeworkMaterials'] });
      } else {
        toast.error('AI generated no questions. Please try again.');
      }
    } catch (error) {
      console.error('Question generation error:', error);
      toast.error('Failed to generate questions. Try with fewer questions or a more specific topic.');
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const handleCheckAnswer = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = currentQuestion?.type === 'multiple_choice'
      ? userAnswer === currentQuestion?.correct_answer
      : userAnswer.toLowerCase().trim().includes(currentQuestion?.correct_answer?.toLowerCase().trim());

    const timeSpent = questionStartTime ? Math.floor((Date.now() - questionStartTime) / 1000) : 0;

    const perfRecord = {
      material_id: material.id,
      question_topic: currentQuestion?.topic || material.subject,
      question_difficulty: adaptiveDifficulty,
      user_answer: userAnswer,
      correct_answer: currentQuestion?.correct_answer,
      is_correct: isCorrect,
      time_spent_seconds: timeSpent,
      hints_used: hintsUsed,
      next_recommended_difficulty: isCorrect && hintsUsed === 0 && adaptiveDifficulty !== 'hard'
        ? (adaptiveDifficulty === 'easy' ? 'medium' : 'hard')
        : (!isCorrect && adaptiveDifficulty !== 'easy' ? (adaptiveDifficulty === 'hard' ? 'medium' : 'easy') : adaptiveDifficulty)
    };

    recordPerformanceMutation.mutate(perfRecord);
    setPerformance([...performance, perfRecord]);

    if (isCorrect) setScore(score + 1);
    setShowAnswer(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserAnswer('');
      setShowAnswer(false);
      setQuestionStartTime(Date.now());
      setHintsUsed(0);
    } else {
      const finalScore = score;
      const percentage = Math.round((finalScore / questions.length) * 100);
      toast.success(`🎉 Quiz Complete! Score: ${finalScore}/${questions.length} (${percentage}%)`);

      base44.entities.HomeworkMaterial.update(material.id, {
        questions_answered: (material.questions_answered || 0) + questions.length,
        average_score: percentage,
        study_progress: Math.min(100, (material.study_progress || 0) + 10)
      }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['homeworkMaterials'] });
      });

      setTimeout(() => onClose(), 2000);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-50 overflow-y-auto"
    >
      <div className="min-h-screen p-4 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl"
              >
                <Brain className="w-7 h-7 text-purple-600" />
              </motion.div>
              <div>
                <h2 className="text-2xl font-bold text-white">{material.title}</h2>
                <p className="text-purple-200 text-sm">AI Tutor - {adaptiveDifficulty} difficulty</p>
              </div>
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              className="text-white hover:bg-white/20 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {questions.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
              <Card className="border-4 border-purple-400 bg-white/95 backdrop-blur-xl shadow-2xl">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    Generate Practice Questions
                  </CardTitle>
                  <CardDescription className="text-purple-100">
                    Customize your AI tutoring session
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-2 block">Adaptive Difficulty</Label>
                    <div className="flex flex-wrap gap-2">
                      {['easy', 'medium', 'hard'].map((level) => (
                        <Button
                          key={level}
                          type="button"
                          onClick={() => setAdaptiveDifficulty(level)}
                          variant={adaptiveDifficulty === level ? 'default' : 'outline'}
                          className={adaptiveDifficulty === level ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''}
                        >
                          {level === 'easy' && '🌱'} {level === 'medium' && '⭐'} {level === 'hard' && '🔥'}
                          <span className="ml-2 capitalize">{level}</span>
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Difficulty adapts based on your performance
                    </p>
                  </div>

                  <div>
                    <Label className="text-sm font-bold text-gray-700 mb-2 block">Number of Questions (Max 10)</Label>
                    <div className="flex flex-wrap gap-2">
                      {[3, 5, 7, 10].map((count) => (
                        <Button
                          key={count}
                          type="button"
                          onClick={() => setQuestionCount(count)}
                          variant={questionCount === count ? 'default' : 'outline'}
                          className={questionCount === count ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : ''}
                        >
                          {count}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="focus-topic" className="text-sm font-bold text-gray-700">
                      Focus on Specific Topic (Optional)
                    </Label>
                    <Input
                      id="focus-topic"
                      value={focusTopic}
                      onChange={(e) => setFocusTopic(e.target.value)}
                      placeholder="e.g., Quadratic Equations, Cell Division..."
                      className="mt-2"
                    />
                  </div>

                  {material.key_topics && material.key_topics.length > 0 && (
                    <div>
                      <Label className="text-sm font-bold text-gray-700 mb-2 block">Quick Topic Select</Label>
                      <div className="flex flex-wrap gap-2">
                        {material.key_topics.map((topic, idx) => (
                          <motion.div
                            key={idx}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Badge
                              onClick={() => setFocusTopic(topic)}
                              className={`cursor-pointer transition-all ${
                                focusTopic === topic
                                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                              }`}
                            >
                              {topic}
                            </Badge>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={generateQuestions}
                      disabled={generatingQuestions}
                      className="w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-white shadow-2xl py-6 text-lg touch-manipulation relative overflow-hidden group"
                    >
                      <motion.div
                        className="absolute inset-0 bg-white/20"
                        animate={{ x: generatingQuestions ? ['-100%', '200%'] : '-100%' }}
                        transition={{ duration: 2, repeat: generatingQuestions ? Infinity : 0, ease: "linear" }}
                      />
                      {generatingQuestions ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin relative z-10" />
                          <span className="relative z-10">AI Tutor is preparing questions...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-5 h-5 mr-2 relative z-10" />
                          <span className="relative z-10">Start AI Tutoring Session</span>
                          <Sparkles className="w-5 h-5 ml-2 relative z-10" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <div className="space-y-6">
              <AdaptiveDifficulty
                currentDifficulty={adaptiveDifficulty}
                performance={[...pastPerformance, ...performance]}
                onDifficultyChange={setAdaptiveDifficulty}
              />

              <Card className="bg-white/95 backdrop-blur-xl border-2 border-purple-300">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">
                      Question {currentQuestionIndex + 1} of {questions.length}
                    </span>
                    <div className="flex items-center gap-3">
                      <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                        <Trophy className="w-3 h-3 mr-1" />
                        Score: {score}/{currentQuestionIndex + (showAnswer ? 1 : 0)}
                      </Badge>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
                    />
                  </div>
                </CardContent>
              </Card>

              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
              >
                <Card className="bg-white/95 backdrop-blur-xl border-4 border-purple-400 shadow-2xl">
                  <CardHeader className="bg-gradient-to-r from-indigo-100 to-purple-100 border-b-4 border-purple-200">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <Badge className="mb-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          {currentQuestion?.topic || material.subject}
                        </Badge>
                        <CardTitle className="text-xl leading-relaxed">
                          {currentQuestion?.question}
                        </CardTitle>
                      </div>
                      <Badge variant="outline" className="border-2">
                        {currentQuestion?.type === 'multiple_choice' ? 'Multiple Choice' : 'Short Answer'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    {currentQuestion?.type === 'multiple_choice' && currentQuestion?.options ? (
                      <div className="space-y-3">
                        {currentQuestion.options.map((option, idx) => (
                          <motion.button
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.02, x: 10 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => !showAnswer && setUserAnswer(option)}
                            disabled={showAnswer}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                              showAnswer && option === currentQuestion.correct_answer
                                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white border-green-400 shadow-lg'
                                : userAnswer === option
                                ? showAnswer && option !== currentQuestion.correct_answer
                                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white border-red-400 shadow-lg'
                                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400 shadow-lg'
                                : 'bg-white border-gray-200 hover:border-purple-400 disabled:opacity-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                showAnswer && option === currentQuestion.correct_answer
                                  ? 'bg-white/20'
                                  : userAnswer === option
                                  ? 'bg-white/20'
                                  : 'bg-purple-100 text-purple-600'
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </div>
                              <span className="font-medium flex-1">{option}</span>
                              {showAnswer && option === currentQuestion.correct_answer && (
                                <CheckCircle className="w-5 h-5" />
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <Textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        rows={5}
                        disabled={showAnswer}
                        className="border-2 border-purple-200 focus:border-purple-400"
                      />
                    )}

                    {!showAnswer ? (
                      <>
                        <AITutorAssistant
                          question={currentQuestion}
                          userAnswer={userAnswer}
                          onHintUsed={(count) => setHintsUsed(count)}
                        />

                        <Button
                          onClick={handleCheckAnswer}
                          disabled={!userAnswer}
                          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 text-lg touch-manipulation"
                        >
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Check Answer
                        </Button>
                      </>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                      >
                        <PersonalizedFeedback
                          isCorrect={
                            currentQuestion?.type === 'multiple_choice'
                              ? userAnswer === currentQuestion?.correct_answer
                              : userAnswer.toLowerCase().trim().includes(currentQuestion?.correct_answer?.toLowerCase().trim())
                          }
                          userAnswer={userAnswer}
                          correctAnswer={currentQuestion?.correct_answer}
                          question={currentQuestion}
                          performance={[...pastPerformance, ...performance]}
                        />

                        <Button
                          onClick={handleNextQuestion}
                          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 text-lg touch-manipulation"
                        >
                          {currentQuestionIndex < questions.length - 1 ? (
                            <>
                              Next Question
                              <ChevronRight className="w-5 h-5 ml-2" />
                            </>
                          ) : (
                            <>
                              <Trophy className="w-5 h-5 mr-2" />
                              Finish Quiz
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
