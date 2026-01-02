
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  GraduationCap,
  Plus,
  Upload,
  FileText,
  Video,
  Edit,
  Trash2,
  Eye,
  Sparkles,
  Brain,
  Wand2,
  BookOpen,
  FileStack,
  ClipboardList,
  Package, // Added Package icon
  Megaphone // Added Megaphone icon
} from 'lucide-react';
import { toast } from 'sonner';

import AICourseOutlineGenerator from './AICourseOutlineGenerator';
import AIQuizGenerator from './AIQuizGenerator';
import AILessonRefiner from './AILessonRefiner';
import AILessonContentGenerator from './AILessonContentGenerator';
import AISupplementalMaterialsGenerator from './AISupplementalMaterialsGenerator';
import AIAssignmentGenerator from './AIAssignmentGenerator';
import AIProductDescriptionGenerator from './AIProductDescriptionGenerator'; // Added import
import AIMarketingCopyGenerator from './AIMarketingCopyGenerator'; // Added import

export default function CourseCreator({ sellerProfile, existingCourses = [] }) {
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  
  const [courseData, setCourseData] = useState({
    title: '',
    tagline: '',
    description: '',
    category: 'wellness',
    difficulty_level: 'all_levels',
    price: 0,
    pricing_type: 'one_time',
    learning_outcomes: [''],
    course_materials: []
  });

  const createCourseMutation = useMutation({
    mutationFn: (data) => base44.entities.Course.create({
      ...data,
      seller_id: sellerProfile.id,
      seller_name: sellerProfile.shop_name,
      slug: data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status: 'draft'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-courses']);
      setShowCreateModal(false);
      setCourseData({
        title: '',
        tagline: '',
        description: '',
        category: 'wellness',
        difficulty_level: 'all_levels',
        price: 0,
        pricing_type: 'one_time',
        learning_outcomes: [''],
        course_materials: []
      });
      toast.success('Course created! Add modules next.');
    }
  });

  const handleFileUpload = async (file, type = 'material') => {
    try {
      if (type === 'video') setUploadingVideo(true);
      else setUploadingFile(true);

      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      
      if (type === 'video') {
        setCourseData({ ...courseData, preview_video_url: file_url });
        toast.success('Video uploaded!');
      } else if (type === 'cover') {
        setCourseData({ ...courseData, cover_image_url: file_url });
        toast.success('Cover image uploaded!');
      } else {
        const materials = courseData.course_materials || [];
        materials.push({
          title: file.name,
          description: '',
          file_url,
          file_type: file.type.includes('pdf') ? 'pdf' : 
                     file.type.includes('video') ? 'video' :
                     file.type.includes('audio') ? 'audio' : 'document'
        });
        
        setCourseData({ ...courseData, course_materials: materials });
        toast.success('Material uploaded!');
      }
    } catch (error) {
      toast.error('Upload failed');
    } finally {
      setUploadingFile(false);
      setUploadingVideo(false);
    }
  };

  const handleCreateCourse = () => {
    if (!courseData.title || !courseData.description || !courseData.price) {
      toast.error('Please fill in required fields');
      return;
    }
    createCourseMutation.mutate(courseData);
  };

  const handleUseOutline = (outline) => {
    // Parse the outline and update course data
    toast.info('You can now manually copy the outline details to your course');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">My Courses</h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Course
        </Button>
      </div>

      {existingCourses.length === 0 ? (
        <Card className="bg-white">
          <CardContent className="p-12 text-center">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Courses Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first course and start sharing your expertise!
            </p>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Course
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {existingCourses.map(course => (
            <Card key={course.id} className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {course.cover_image_url && (
                  <div className="w-full h-32 rounded-lg overflow-hidden mb-3">
                    <img
                      src={course.cover_image_url}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <h3 className="font-bold text-lg mb-2">{course.title}</h3>
                <p className="text-sm text-gray-600 line-clamp-2 mb-3">{course.tagline}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <Badge className={
                    course.status === 'published' ? 'bg-green-100 text-green-800' :
                    course.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }>
                    {course.status}
                  </Badge>
                  <span className="font-bold text-purple-600">${course.price}</span>
                </div>

                <div className="text-xs text-gray-500 mb-3">
                  {course.enrollment_count || 0} students • {course.total_modules || 0} modules
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Eye className="w-3 h-3 mr-1" />
                    Preview
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Course Modal with AI Tools */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-purple-600" />
              Create New Course
            </DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="basics" className="w-full">
            <TabsList className="grid w-full grid-cols-9 bg-white mb-4">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="ai-outline" className="flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Outline
              </TabsTrigger>
              <TabsTrigger value="ai-lesson" className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                Lesson
              </TabsTrigger>
              <TabsTrigger value="ai-materials" className="flex items-center gap-1">
                <FileStack className="w-3 h-3" />
                Materials
              </TabsTrigger>
              <TabsTrigger value="ai-assignments" className="flex items-center gap-1">
                <ClipboardList className="w-3 h-3" />
                Assignments
              </TabsTrigger>
              <TabsTrigger value="ai-quiz" className="flex items-center gap-1">
                <Brain className="w-3 h-3" />
                Quiz
              </TabsTrigger>
              <TabsTrigger value="ai-refine" className="flex items-center gap-1">
                <Wand2 className="w-3 h-3" />
                Refine
              </TabsTrigger>
              <TabsTrigger value="ai-description" className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                Description
              </TabsTrigger>
              <TabsTrigger value="ai-marketing" className="flex items-center gap-1">
                <Megaphone className="w-3 h-3" />
                Marketing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Course Title *</label>
                <Input
                  value={courseData.title}
                  onChange={(e) => setCourseData({ ...courseData, title: e.target.value })}
                  placeholder="Complete Guide to Mindfulness"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tagline</label>
                <Input
                  value={courseData.tagline}
                  onChange={(e) => setCourseData({ ...courseData, tagline: e.target.value })}
                  placeholder="Transform your life through daily mindfulness practice"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description *</label>
                <Textarea
                  value={courseData.description}
                  onChange={(e) => setCourseData({ ...courseData, description: e.target.value })}
                  placeholder="Detailed course description..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={courseData.category}
                    onChange={(e) => setCourseData({ ...courseData, category: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="wellness">Wellness</option>
                    <option value="mindfulness">Mindfulness</option>
                    <option value="grief_support">Grief Support</option>
                    <option value="parenting">Parenting</option>
                    <option value="productivity">Productivity</option>
                    <option value="mental_health">Mental Health</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    value={courseData.difficulty_level}
                    onChange={(e) => setCourseData({ ...courseData, difficulty_level: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all_levels">All Levels</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (USD) *</label>
                  <Input
                    type="number"
                    value={courseData.price}
                    onChange={(e) => setCourseData({ ...courseData, price: parseFloat(e.target.value) })}
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Pricing Type</label>
                  <select
                    value={courseData.pricing_type}
                    onChange={(e) => setCourseData({ ...courseData, pricing_type: e.target.value })}
                    className="w-full p-3 border rounded-lg"
                  >
                    <option value="one_time">One-time Payment</option>
                    <option value="subscription_monthly">Monthly Subscription</option>
                    <option value="subscription_yearly">Yearly Subscription</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Cover Image</label>
                <div className="flex items-center gap-4">
                  {courseData.cover_image_url && (
                    <img src={courseData.cover_image_url} alt="Cover" className="w-24 h-24 rounded-lg object-cover" />
                  )}
                  <Button
                    onClick={() => document.getElementById('cover-upload').click()}
                    variant="outline"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Cover
                  </Button>
                  <input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'cover')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preview Video (Optional)</label>
                <div className="flex items-center gap-4">
                  {courseData.preview_video_url && (
                    <Badge className="bg-green-100 text-green-800">
                      <Video className="w-3 h-3 mr-1" />
                      Video uploaded
                    </Badge>
                  )}
                  <Button
                    onClick={() => document.getElementById('video-upload').click()}
                    variant="outline"
                    disabled={uploadingVideo}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    {uploadingVideo ? 'Uploading...' : 'Upload Video'}
                  </Button>
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0], 'video')}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Upload a promo video to showcase your course
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Course Materials (PDFs, Documents, Videos)</label>
                <div className="space-y-2">
                  {courseData.course_materials?.map((material, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg">
                      {material.file_type === 'video' ? (
                        <Video className="w-4 h-4 text-blue-600" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-600" />
                      )}
                      <span className="text-sm text-blue-900 flex-1">{material.title}</span>
                      <Badge className="text-xs">{material.file_type}</Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const materials = [...courseData.course_materials];
                          materials.splice(idx, 1);
                          setCourseData({ ...courseData, course_materials: materials });
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                  
                  <Button
                    onClick={() => document.getElementById('material-upload').click()}
                    variant="outline"
                    disabled={uploadingFile}
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {uploadingFile ? 'Uploading...' : 'Upload Material'}
                  </Button>
                  <input
                    id="material-upload"
                    type="file"
                    accept=".pdf,.doc,.docx,video/*,audio/*"
                    className="hidden"
                    onChange={(e) => e.target.files[0] && handleFileUpload(e.target.files[0])}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai-outline">
              <AICourseOutlineGenerator onUseOutline={handleUseOutline} />
            </TabsContent>

            <TabsContent value="ai-lesson">
              <AILessonContentGenerator />
            </TabsContent>

            <TabsContent value="ai-materials">
              <AISupplementalMaterialsGenerator />
            </TabsContent>

            <TabsContent value="ai-assignments">
              <AIAssignmentGenerator />
            </TabsContent>

            <TabsContent value="ai-quiz">
              <AIQuizGenerator />
            </TabsContent>

            <TabsContent value="ai-refine">
              <AILessonRefiner />
            </TabsContent>

            <TabsContent value="ai-description">
              <AIProductDescriptionGenerator />
            </TabsContent>

            <TabsContent value="ai-marketing">
              <AIMarketingCopyGenerator />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button onClick={() => setShowCreateModal(false)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={handleCreateCourse}
              disabled={createCourseMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
