import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  FamilyMember
} from '@/entities/all';
import {
  GraduationCap,
  Award,
  MessageCircle,
  Heart,
  Sparkles,
  BookOpen,
  Palette,
  Hand,
  Target,
  Send,
  Users,
  BarChart3,
  Smile,
  Frown,
  Meh,
  FileText,
  Printer,
  Plus,
  Calendar,
  Flame
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useNotifications as useSounds } from '../SoundManager';

const teacherBadges = {
  focused_learner: { name: 'Focused Learner', icon: '🎯', color: '#3b82f6' },
  creative_thinker: { name: 'Creative Thinker', icon: '💡', color: '#ec4899' },
  kind_collaborator: { name: 'Kind Collaborator', icon: '🤝', color: '#10b981' },
  patient_worker: { name: 'Patient Worker', icon: '⏰', color: '#8b5cf6' },
  brave_tryer: { name: 'Brave Tryer', icon: '🦁', color: '#f59e0b' },
  helpful_friend: { name: 'Helpful Friend', icon: '💝', color: '#ec4899' },
  curious_explorer: { name: 'Curious Explorer', icon: '🔍', color: '#06b6d4' },
  neat_writer: { name: 'Neat Writer', icon: '✍️', color: '#6366f1' }
};

const skillCategories = [
  { id: 'fine_motor', name: 'Fine Motor Skills', icon: Hand, color: '#ec4899' },
  { id: 'focus', name: 'Focus & Attention', icon: Target, color: '#3b82f6' },
  { id: 'creativity', name: 'Creativity', icon: Palette, color: '#8b5cf6' },
  { id: 'letter_recognition', name: 'Letter Recognition', icon: BookOpen, color: '#10b981' }
];

const moodOptions = [
  { value: 'happy', label: 'Happy & Engaged', icon: Smile, color: '#10b981' },
  { value: 'calm', label: 'Calm & Focused', icon: Meh, color: '#3b82f6' },
  { value: 'distracted', label: 'Distracted', icon: Meh, color: '#f59e0b' },
  { value: 'frustrated', label: 'Frustrated', icon: Frown, color: '#ef4444' }
];

export default function TeacherMentorView() {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentProgress, setStudentProgress] = useState(null);
  const [showFeedbackDialog, setShowFeedbackDialog] = useState(false);
  const [showBadgeDialog, setShowBadgeDialog] = useState(false);
  const [showWellnessDialog, setShowWellnessDialog] = useState(false);
  const [showMessageParentDialog, setShowMessageParentDialog] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedBadge, setSelectedBadge] = useState(null);
  const [wellnessNote, setWellnessNote] = useState('');
  const [observedMood, setObservedMood] = useState('');
  const [parentMessage, setParentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { playSound } = useSounds();

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      loadStudentProgress(selectedStudent);
    }
  }, [selectedStudent]);

  const loadStudents = async () => {
    setIsLoading(true);
    try {
      const members = await FamilyMember.list();
      const children = members.filter(m => 
        m.role === 'ChildMember' || m.role === 'TeenMember'
      );
      setStudents(children);
      if (children.length > 0 && !selectedStudent) {
        setSelectedStudent(children[0]);
      }
    } catch (error) {
      console.error("Error loading students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStudentProgress = async (student) => {
    // Mock data - in real app, fetch from User entity by user_id
    const mockProgress = {
      hand_tracing_progress: {
        completed_letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
        letter_photos: {
          'A': [{ url: 'url1', date: new Date().toISOString() }],
          'B': [{ url: 'url2', date: new Date().toISOString() }],
          'C': [{ url: 'url3', date: new Date().toISOString() }]
        },
        teacher_feedback: [
          { letter: 'A', feedback: 'Great finger spacing!', teacher: 'Ms. Johnson', date: new Date().toISOString() },
          { letter: 'B', feedback: 'Beautiful color choices!', teacher: 'Ms. Johnson', date: new Date().toISOString() }
        ],
        earned_badges: ['focused_learner', 'creative_thinker']
      },
      learning_streak: 7,
      last_activity_date: new Date().toISOString(),
      skill_progress: {
        fine_motor: 75,
        focus: 80,
        creativity: 90,
        letter_recognition: 70
      },
      wellness_observations: [
        { date: new Date().toISOString(), mood: 'happy', note: 'Very engaged today, great focus!', teacher: 'Ms. Johnson' },
        { date: new Date(Date.now() - 86400000).toISOString(), mood: 'calm', note: 'Calm and methodical approach', teacher: 'Ms. Johnson' }
      ],
      recent_activities: [
        { type: 'hand_tracing', letter: 'G', date: new Date().toISOString(), completed: true },
        { type: 'coloring', activity: 'Flower', date: new Date(Date.now() - 86400000).toISOString(), completed: true },
        { type: 'hand_tracing', letter: 'F', date: new Date(Date.now() - 172800000).toISOString(), completed: true }
      ]
    };
    
    setStudentProgress(mockProgress);
  };

  const handleSendFeedback = async () => {
    if (!feedbackText.trim()) return;

    playSound('success');
    
    // In real app, save feedback to database
    console.log('Sending feedback:', feedbackText);
    
    setFeedbackText('');
    setShowFeedbackDialog(false);
    
    // Show success message
    alert('Feedback sent! The student and their family will be notified.');
  };

  const handleAwardBadge = async () => {
    if (!selectedBadge) return;

    playSound('complete');
    
    // In real app, award badge in database
    console.log('Awarding badge:', selectedBadge);
    
    setSelectedBadge(null);
    setShowBadgeDialog(false);
    
    alert(`Badge "${teacherBadges[selectedBadge].name}" awarded! 🎉`);
  };

  const handleSaveWellness = async () => {
    if (!observedMood || !wellnessNote.trim()) return;

    playSound('success');
    
    // In real app, save wellness observation
    console.log('Saving wellness observation:', { mood: observedMood, note: wellnessNote });
    
    setObservedMood('');
    setWellnessNote('');
    setShowWellnessDialog(false);
    
    alert('Wellness observation saved!');
  };

  const handleMessageParent = async () => {
    if (!parentMessage.trim()) return;

    playSound('success');
    
    // In real app, send message to parent
    console.log('Sending message to parent:', parentMessage);
    
    setParentMessage('');
    setShowMessageParentDialog(false);
    
    alert('Message sent to parent!');
  };

  const generateReport = () => {
    if (!selectedStudent || !studentProgress) return;

    const printWindow = window.open('', '_blank');
    const completionRate = (studentProgress.hand_tracing_progress.completed_letters.length / 26 * 100).toFixed(0);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Progress Report - ${selectedStudent.name}</title>
          <style>
            @media print {
              body { margin: 0.5in; }
            }
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 8.5in;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #3b82f6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .student-name {
              font-size: 28px;
              font-weight: bold;
              color: #1e40af;
              margin: 0;
            }
            .report-date {
              color: #64748b;
              font-size: 14px;
              margin-top: 10px;
            }
            .section {
              margin: 25px 0;
              padding: 20px;
              border: 2px solid #e2e8f0;
              border-radius: 8px;
              background: #f8fafc;
            }
            .section-title {
              font-size: 18px;
              font-weight: bold;
              color: #1e40af;
              margin-bottom: 15px;
              display: flex;
              align-items: center;
            }
            .skill-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-top: 15px;
            }
            .skill-item {
              background: white;
              padding: 15px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
            }
            .skill-name {
              font-weight: bold;
              margin-bottom: 8px;
            }
            .progress-bar {
              background: #e2e8f0;
              height: 8px;
              border-radius: 4px;
              overflow: hidden;
            }
            .progress-fill {
              background: linear-gradient(to right, #3b82f6, #8b5cf6);
              height: 100%;
            }
            .badge-list {
              display: flex;
              flex-wrap: wrap;
              gap: 10px;
              margin-top: 10px;
            }
            .badge {
              background: #fef3c7;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 14px;
              border: 2px solid #f59e0b;
            }
            .feedback-item {
              background: white;
              padding: 15px;
              margin: 10px 0;
              border-left: 4px solid #10b981;
              border-radius: 4px;
            }
            .feedback-letter {
              font-weight: bold;
              color: #059669;
              margin-bottom: 5px;
            }
            .feedback-text {
              color: #475569;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e2e8f0;
              text-align: center;
              color: #64748b;
              font-size: 12px;
            }
            .highlight-box {
              background: #ecfdf5;
              border: 2px solid #10b981;
              border-radius: 8px;
              padding: 15px;
              margin: 15px 0;
            }
            .stat-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 15px;
              margin: 15px 0;
            }
            .stat-box {
              background: white;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              border: 2px solid #e2e8f0;
            }
            .stat-value {
              font-size: 32px;
              font-weight: bold;
              color: #3b82f6;
            }
            .stat-label {
              color: #64748b;
              font-size: 14px;
              margin-top: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div style="font-size: 20px; color: #3b82f6; margin-bottom: 10px;">📚 Learning Progress Report</div>
            <h1 class="student-name">${selectedStudent.name}</h1>
            <div class="report-date">Generated on ${new Date().toLocaleDateString()}</div>
          </div>

          <div class="highlight-box">
            <div style="font-weight: bold; color: #059669; margin-bottom: 10px;">🌟 Progress Highlights</div>
            <div class="stat-grid">
              <div class="stat-box">
                <div class="stat-value">${studentProgress.hand_tracing_progress.completed_letters.length}</div>
                <div class="stat-label">Letters Completed</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${completionRate}%</div>
                <div class="stat-label">Alphabet Progress</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${studentProgress.learning_streak}</div>
                <div class="stat-label">Day Streak 🔥</div>
              </div>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📊 Skill Development</div>
            <div class="skill-grid">
              ${skillCategories.map(skill => `
                <div class="skill-item">
                  <div class="skill-name">${skill.name}</div>
                  <div class="progress-bar">
                    <div class="progress-fill" style="width: ${studentProgress.skill_progress[skill.id]}%"></div>
                  </div>
                  <div style="text-align: right; font-size: 12px; color: #64748b; margin-top: 5px;">${studentProgress.skill_progress[skill.id]}%</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="section">
            <div class="section-title">🏅 Earned Badges</div>
            <div class="badge-list">
              ${studentProgress.hand_tracing_progress.earned_badges.map(badgeId => {
                const badge = teacherBadges[badgeId];
                return `<div class="badge">${badge.icon} ${badge.name}</div>`;
              }).join('')}
            </div>
          </div>

          <div class="section">
            <div class="section-title">💬 Teacher Feedback</div>
            ${studentProgress.hand_tracing_progress.teacher_feedback.map(feedback => `
              <div class="feedback-item">
                <div class="feedback-letter">Letter ${feedback.letter}</div>
                <div class="feedback-text">${feedback.feedback}</div>
                <div style="font-size: 12px; color: #94a3b8; margin-top: 5px;">
                  ${feedback.teacher} • ${new Date(feedback.date).toLocaleDateString()}
                </div>
              </div>
            `).join('')}
          </div>

          <div class="section">
            <div class="section-title">🧠 Wellness Observations</div>
            ${studentProgress.wellness_observations.map(obs => {
              const mood = moodOptions.find(m => m.value === obs.mood);
              return `
                <div class="feedback-item">
                  <div style="font-weight: bold; margin-bottom: 5px;">
                    ${mood.label} • ${new Date(obs.date).toLocaleDateString()}
                  </div>
                  <div class="feedback-text">${obs.note}</div>
                </div>
              `;
            }).join('')}
          </div>

          <div class="section">
            <div class="section-title">📘 Completed Letters</div>
            <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
              ${studentProgress.hand_tracing_progress.completed_letters.map(letter => `
                <div style="background: white; padding: 10px 15px; border-radius: 8px; border: 2px solid #3b82f6; font-weight: bold; color: #1e40af;">
                  ${letter}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="footer">
            <p><strong>DobryLife Kids Studio</strong></p>
            <p>Teacher & Mentor View • www.dobrylife.com</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };

    playSound('success');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <GraduationCap className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading students...</p>
        </div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <Card className="bg-white/80">
        <CardContent className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Students Yet</h3>
          <p className="text-gray-600">Students will appear here when families add you as a teacher or mentor.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Teacher & Mentor View</h2>
                <p className="text-gray-600">Track progress, provide feedback, and celebrate growth</p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
              <Users className="w-4 h-4 mr-2" />
              {students.length} Students
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Student Selector */}
      <Card className="bg-white/80">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Select Student:</span>
            <Select
              value={selectedStudent?.id}
              onValueChange={(value) => {
                const student = students.find(s => s.id === value);
                setSelectedStudent(student);
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedStudent && studentProgress && (
        <>
          {/* Quick Actions */}
          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Quick Actions for {selectedStudent.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Button
                  onClick={() => setShowFeedbackDialog(true)}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white h-auto py-4 flex-col gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm">Give Feedback</span>
                </Button>
                <Button
                  onClick={() => setShowBadgeDialog(true)}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white h-auto py-4 flex-col gap-2"
                >
                  <Award className="w-5 h-5" />
                  <span className="text-sm">Award Badge</span>
                </Button>
                <Button
                  onClick={() => setShowWellnessDialog(true)}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-auto py-4 flex-col gap-2"
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">Wellness Check</span>
                </Button>
                <Button
                  onClick={() => setShowMessageParentDialog(true)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-auto py-4 flex-col gap-2"
                >
                  <Users className="w-5 h-5" />
                  <span className="text-sm">Message Parent</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Progress Overview */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
              <CardContent className="p-6 text-center">
                <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-blue-600">
                  {studentProgress.hand_tracing_progress.completed_letters.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Letters Completed</div>
                <Progress 
                  value={(studentProgress.hand_tracing_progress.completed_letters.length / 26) * 100} 
                  className="mt-3 h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {Math.round((studentProgress.hand_tracing_progress.completed_letters.length / 26) * 100)}% of alphabet
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200">
              <CardContent className="p-6 text-center">
                <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-orange-600">
                  {studentProgress.learning_streak}
                </div>
                <div className="text-sm text-gray-600 mt-1">Day Streak</div>
                <div className="text-xs text-gray-500 mt-3">
                  Last active: {new Date(studentProgress.last_activity_date).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-3xl font-bold text-purple-600">
                  {studentProgress.hand_tracing_progress.earned_badges.length}
                </div>
                <div className="text-sm text-gray-600 mt-1">Badges Earned</div>
                <div className="flex justify-center gap-1 mt-3">
                  {studentProgress.hand_tracing_progress.earned_badges.slice(0, 3).map((badgeId, idx) => (
                    <span key={idx} className="text-2xl">
                      {teacherBadges[badgeId]?.icon || '⭐'}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed View Tabs */}
          <Card className="bg-white/80">
            <CardContent className="p-6">
              <Tabs defaultValue="skills" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="skills" className="gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Skills
                  </TabsTrigger>
                  <TabsTrigger value="feedback" className="gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Feedback
                  </TabsTrigger>
                  <TabsTrigger value="wellness" className="gap-2">
                    <Heart className="w-4 h-4" />
                    Wellness
                  </TabsTrigger>
                  <TabsTrigger value="report" className="gap-2">
                    <FileText className="w-4 h-4" />
                    Report
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="skills" className="space-y-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Skill Development Progress</h3>
                  {skillCategories.map(skill => {
                    const SkillIcon = skill.icon;
                    const progress = studentProgress.skill_progress[skill.id];
                    return (
                      <div key={skill.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <SkillIcon className="w-5 h-5" style={{ color: skill.color }} />
                            <span className="font-medium text-gray-700">{skill.name}</span>
                          </div>
                          <span className="font-bold text-gray-800">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-3" />
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="feedback" className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Previous Feedback</h3>
                    <Button
                      onClick={() => setShowFeedbackDialog(true)}
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Feedback
                    </Button>
                  </div>
                  {studentProgress.hand_tracing_progress.teacher_feedback.map((feedback, idx) => (
                    <Card key={idx} className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <Badge className="bg-green-100 text-green-800 mb-2">
                              Letter {feedback.letter}
                            </Badge>
                            <p className="text-gray-700">{feedback.feedback}</p>
                            <p className="text-sm text-gray-500 mt-2">
                              {feedback.teacher} • {new Date(feedback.date).toLocaleDateString()}
                            </p>
                          </div>
                          <MessageCircle className="w-5 h-5 text-green-600" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </TabsContent>

                <TabsContent value="wellness" className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Wellness Observations</h3>
                    <Button
                      onClick={() => setShowWellnessDialog(true)}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      New Observation
                    </Button>
                  </div>
                  {studentProgress.wellness_observations.map((obs, idx) => {
                    const mood = moodOptions.find(m => m.value === obs.mood);
                    const MoodIcon = mood.icon;
                    return (
                      <Card key={idx} className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <MoodIcon className="w-6 h-6 mt-1" style={{ color: mood.color }} />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge style={{ backgroundColor: mood.color, color: 'white' }}>
                                  {mood.label}
                                </Badge>
                                <span className="text-sm text-gray-500">
                                  {new Date(obs.date).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700">{obs.note}</p>
                              <p className="text-sm text-gray-500 mt-2">{obs.teacher}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </TabsContent>

                <TabsContent value="report" className="space-y-4">
                  <div className="text-center py-8">
                    <FileText className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Generate Progress Report</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Create a comprehensive report with artwork samples, skill progress, feedback, and wellness observations.
                    </p>
                    <Button
                      onClick={generateReport}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white"
                    >
                      <Printer className="w-5 h-5 mr-2" />
                      Generate & Print Report
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </>
      )}

      {/* Feedback Dialog */}
      <Dialog open={showFeedbackDialog} onOpenChange={setShowFeedbackDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              Send Feedback to {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Your encouraging feedback:
              </label>
              <Textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Example: Great finger spacing on your letter A! I love the colors you chose — that shows focus and creativity!"
                className="min-h-[120px]"
              />
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 This feedback will be visible to both the student and their parent.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowFeedbackDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSendFeedback}
                disabled={!feedbackText.trim()}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Feedback
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Badge Award Dialog */}
      <Dialog open={showBadgeDialog} onOpenChange={setShowBadgeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Award Badge to {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(teacherBadges).map(([id, badge]) => (
                <button
                  key={id}
                  onClick={() => setSelectedBadge(id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    selectedBadge === id
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-gray-200 hover:border-yellow-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className="text-sm font-medium text-gray-700">{badge.name}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowBadgeDialog(false);
                  setSelectedBadge(null);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleAwardBadge}
                disabled={!selectedBadge}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <Award className="w-4 h-4 mr-2" />
                Award Badge
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Wellness Dialog */}
      <Dialog open={showWellnessDialog} onOpenChange={setShowWellnessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-green-600" />
              Wellness Check-In for {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Observed Mood:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {moodOptions.map(mood => {
                  const MoodIcon = mood.icon;
                  return (
                    <button
                      key={mood.value}
                      onClick={() => setObservedMood(mood.value)}
                      className={`p-3 rounded-lg border-2 transition-all flex items-center gap-2 ${
                        observedMood === mood.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-green-300'
                      }`}
                    >
                      <MoodIcon className="w-5 h-5" style={{ color: mood.color }} />
                      <span className="text-sm">{mood.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Observation Notes:
              </label>
              <Textarea
                value={wellnessNote}
                onChange={(e) => setWellnessNote(e.target.value)}
                placeholder="Example: Very engaged today, great focus! Showed patience when working on challenging parts."
                className="min-h-[100px]"
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowWellnessDialog(false);
                  setObservedMood('');
                  setWellnessNote('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveWellness}
                disabled={!observedMood || !wellnessNote.trim()}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              >
                <Heart className="w-4 h-4 mr-2" />
                Save Observation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Parent Dialog */}
      <Dialog open={showMessageParentDialog} onOpenChange={setShowMessageParentDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Message {selectedStudent?.name}'s Parent
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Your message:
              </label>
              <Textarea
                value={parentMessage}
                onChange={(e) => setParentMessage(e.target.value)}
                placeholder="Example: I wanted to share that [child's name] has shown wonderful progress this week! They're really developing their fine motor skills..."
                className="min-h-[120px]"
              />
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="text-sm text-purple-800">
                📧 This message will be sent privately to the parent.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowMessageParentDialog(false);
                  setParentMessage('');
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleMessageParent}
                disabled={!parentMessage.trim()}
                className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}