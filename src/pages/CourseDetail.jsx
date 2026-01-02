
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen,
  Users,
  Clock,
  Star,
  Award,
  PlayCircle,
  CheckCircle,
  ArrowLeft,
  ShoppingCart,
  Lock,
  Unlock,
  Target,
  GraduationCap,
  Store,
  FileText,
  Download,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import SEO from '@/components/SEO';
import ReviewForm from '@/components/marketplace/ReviewForm';
import BuyerSellerMessaging from '@/components/marketplace/BuyerSellerMessaging';

export default function CourseDetail() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('id');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModule, setSelectedModule] = useState(null);
  const [showMessaging, setShowMessaging] = useState(false);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (error) {
        return null;
      }
    }
  });

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', courseId],
    queryFn: async () => {
      const courses = await base44.entities.Course.filter({ id: courseId });
      return courses[0];
    },
    enabled: !!courseId
  });

  const { data: modules = [] } = useQuery({
    queryKey: ['courseModules', courseId],
    queryFn: () => base44.entities.CourseModule.filter({ course_id: courseId }),
    enabled: !!courseId
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', courseId, user?.email],
    queryFn: async () => {
      const enrollments = await base44.entities.CourseEnrollment.filter({
        course_id: courseId,
        student_email: user.email
      });
      return enrollments[0];
    },
    enabled: !!courseId && !!user
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['courseReviews', courseId],
    queryFn: () => base44.entities.MarketplaceReview.filter({
      item_id: courseId,
      item_type: 'course',
      status: 'approved'
    }),
    enabled: !!courseId
  });

  const { data: sellerProfile } = useQuery({
    queryKey: ['sellerProfile', course?.seller_id],
    queryFn: async () => {
      const sellers = await base44.entities.SellerProfile.filter({ id: course.seller_id });
      return sellers[0];
    },
    enabled: !!course?.seller_id
  });

  const { data: userReview } = useQuery({
    queryKey: ['userCourseReview', courseId, user?.email],
    queryFn: async () => {
      if (!user) return null;
      const reviews = await base44.entities.MarketplaceReview.filter({
        item_id: courseId,
        item_type: 'course',
        reviewer_email: user.email
      });
      return reviews[0];
    },
    enabled: !!courseId && !!user
  });

  const { data: existingConversation } = useQuery({
    queryKey: ['existingConversation', courseId, user?.email],
    queryFn: async () => {
      if (!user) return null;
      const convs = await base44.entities.MarketplaceConversation.filter({
        buyer_email: user.email,
        item_id: courseId,
        item_type: 'course'
      });
      return convs[0];
    },
    enabled: !!courseId && !!user
  });

  const addToCartMutation = useMutation({
    mutationFn: async (courseData) => {
      const cart = await base44.entities.ShoppingCart.filter({ created_by: user.email }).then(carts => carts[0]);
      
      const newItem = {
        item_id: courseData.id,
        item_type: 'course',
        item_name: courseData.title,
        item_image: courseData.cover_image_url,
        seller_id: courseData.seller_id,
        seller_name: courseData.seller_name, // Assuming courseData includes seller_name or will be derived
        quantity: 1,
        price: courseData.price,
        added_at: new Date().toISOString()
      };

      if (cart) {
        const existingItems = cart.items || [];
        const itemExists = existingItems.some(item => item.item_id === courseData.id && item.item_type === 'course');
        
        if (!itemExists) {
          await base44.entities.ShoppingCart.update(cart.id, {
            items: [...existingItems, newItem],
            subtotal: (cart.subtotal || 0) + courseData.price,
            total: (cart.total || 0) + courseData.price
          });
        }
      } else {
        await base44.entities.ShoppingCart.create({
          items: [newItem],
          subtotal: courseData.price,
          total: courseData.price
        });
      }
      
      toast.success('Added to cart!');
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shoppingCart']);
      navigate(createPageUrl('Checkout'));
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <BookOpen className="w-8 h-8 text-blue-600" />
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
        <div className="max-w-2xl mx-auto text-center py-20">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">This course doesn't exist or is no longer available.</p>
          <Button onClick={() => navigate(createPageUrl('Marketplace'))}>
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const sortedModules = [...modules].sort((a, b) => a.module_number - b.module_number);
  const isEnrolled = !!enrollment;

  return (
    <>
      <SEO 
        title={`${course.title} - DobryLife Marketplace`}
        description={course.description}
        keywords={`wellness course, ${course.category}, online learning, ${course.title}`}
      />

      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <Button
            onClick={() => navigate(createPageUrl('Marketplace'))}
            variant="outline"
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Marketplace
          </Button>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Preview Video or Cover Image */}
              {course.preview_video_url ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-black"
                >
                  <video 
                    src={course.preview_video_url}
                    controls
                    className="w-full h-full"
                    poster={course.cover_image_url}
                  />
                </motion.div>
              ) : course.cover_image_url && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="aspect-video rounded-2xl overflow-hidden shadow-2xl"
                >
                  <img 
                    src={course.cover_image_url} 
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </motion.div>
              )}

              {/* Course Header */}
              <Card className="border-t-4 border-blue-500">
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className="bg-blue-100 text-blue-800 text-sm">
                          {course.category.replace(/_/g, ' ').toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                          {course.difficulty_level.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <CardTitle className="text-3xl sm:text-4xl mb-3">{course.title}</CardTitle>
                      {course.tagline && (
                        <CardDescription className="text-lg text-gray-700">{course.tagline}</CardDescription>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-6 flex-wrap">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="font-semibold text-lg">{course.average_rating > 0 ? course.average_rating.toFixed(1) : 'New'}</span>
                      <span className="text-gray-600">({course.review_count} reviews)</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Users className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">{course.enrollment_count || 0} students enrolled</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <span className="font-medium">
                        {Math.floor((course.total_duration_minutes || 0) / 60)}h {(course.total_duration_minutes || 0) % 60}m
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Tabs Navigation */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm p-1 shadow-lg">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="curriculum" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Curriculum
                  </TabsTrigger>
                  <TabsTrigger value="instructor" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Instructor
                  </TabsTrigger>
                  <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Reviews
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>About This Course</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line">
                        {course.description}
                      </p>
                    </CardContent>
                  </Card>

                  {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                    <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                          What You'll Learn
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {course.learning_outcomes.map((outcome, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.05 }}
                              className="flex items-start gap-3 p-3 bg-white rounded-lg"
                            >
                              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <span className="text-gray-800">{outcome}</span>
                            </motion.div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {course.target_audience && (
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Target className="w-6 h-6 text-purple-600" />
                          Who This Course Is For
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-800 text-lg leading-relaxed">{course.target_audience}</p>
                      </CardContent>
                    </Card>
                  )}

                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <AlertCircle className="w-6 h-6 text-amber-600" />
                          Prerequisites
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {course.prerequisites.map((prereq, idx) => (
                            <div key={idx} className="flex items-start gap-2 p-2 bg-white rounded-lg">
                              <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-sm font-bold flex-shrink-0">
                                {idx + 1}
                              </span>
                              <span className="text-gray-800">{prereq}</span>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {course.course_materials && course.course_materials.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Download className="w-6 h-6 text-blue-600" />
                          Course Materials
                        </CardTitle>
                        <CardDescription>Included resources you can download</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {course.course_materials.map((material, idx) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                              <FileText className="w-5 h-5 text-blue-600" />
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{material.title}</p>
                                {material.description && (
                                  <p className="text-sm text-gray-600">{material.description}</p>
                                )}
                              </div>
                              <Badge className="bg-blue-200 text-blue-800">
                                {material.file_type?.toUpperCase()}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {course.faq && course.faq.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <MessageCircle className="w-6 h-6 text-purple-600" />
                          Frequently Asked Questions
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {course.faq.map((item, idx) => (
                            <div key={idx} className="border-b pb-4 last:border-0">
                              <h4 className="font-semibold text-gray-900 mb-2">{item.question}</h4>
                              <p className="text-gray-700">{item.answer}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Curriculum Tab */}
                <TabsContent value="curriculum" className="space-y-4 mt-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Course Content</CardTitle>
                      <CardDescription>
                        {course.total_modules} modules • {course.total_lessons} lessons • {Math.floor((course.total_duration_minutes || 0) / 60)}h {(course.total_duration_minutes || 0) % 60}m total
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <AnimatePresence>
                        {sortedModules.map((module, idx) => (
                          <motion.div
                            key={module.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <div className="border-2 rounded-xl overflow-hidden hover:border-blue-300 transition-all">
                              <button
                                onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                                className="w-full p-4 hover:bg-blue-50 transition-colors text-left"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                                      {module.module_number}
                                    </div>
                                    <div className="flex-1">
                                      <h4 className="font-bold text-gray-900 text-lg">{module.title}</h4>
                                      {module.description && (
                                        <p className="text-sm text-gray-600 mt-1">{module.description}</p>
                                      )}
                                      <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                                        <span>{module.lessons?.length || 0} lessons</span>
                                        {module.duration_minutes > 0 && (
                                          <span>• {module.duration_minutes} min</span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  {module.is_free_preview ? (
                                    <Badge className="bg-green-100 text-green-800">
                                      <Unlock className="w-3 h-3 mr-1" />
                                      Free Preview
                                    </Badge>
                                  ) : !isEnrolled && (
                                    <Lock className="w-5 h-5 text-gray-400" />
                                  )}
                                </div>
                              </button>

                              {/* Expanded Module Content */}
                              {selectedModule === module.id && module.lessons && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="border-t bg-gray-50"
                                >
                                  <div className="p-4 space-y-2">
                                    {module.lessons.map((lesson, lessonIdx) => (
                                      <div key={lessonIdx} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                                        <PlayCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
                                        <div className="flex-1">
                                          <p className="font-medium text-gray-900">{lesson.title}</p>
                                          {lesson.description && (
                                            <p className="text-xs text-gray-600">{lesson.description}</p>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {lesson.duration_minutes > 0 && (
                                            <span className="text-xs text-gray-600">{lesson.duration_minutes}min</span>
                                          )}
                                          <Badge className="text-xs bg-gray-100 text-gray-700">
                                            {lesson.content_type}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Instructor Tab */}
                <TabsContent value="instructor" className="space-y-6 mt-6">
                  {sellerProfile && (
                    <>
                      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200">
                        <CardContent className="p-8">
                          <div className="flex items-start gap-6 mb-6">
                            {sellerProfile.shop_logo_url ? (
                              <img 
                                src={sellerProfile.shop_logo_url} 
                                alt={sellerProfile.shop_name}
                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                              />
                            ) : (
                              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                                <Store className="w-12 h-12 text-white" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h3 className="text-2xl font-bold text-gray-900 mb-2">{sellerProfile.shop_name}</h3>
                              {sellerProfile.shop_bio && (
                                <p className="text-gray-700 leading-relaxed mb-4">{sellerProfile.shop_bio}</p>
                              )}
                              <div className="flex items-center gap-4 mb-4">
                                {sellerProfile.average_rating > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                    <span className="font-bold">{sellerProfile.average_rating.toFixed(1)}</span>
                                    <span className="text-gray-600">({sellerProfile.total_reviews} reviews)</span>
                                  </div>
                                )}
                                {sellerProfile.seller_level && sellerProfile.seller_level !== 'new' && (
                                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                                    <Award className="w-3 h-3 mr-1" />
                                    {sellerProfile.seller_level.toUpperCase()} SELLER
                                  </Badge>
                                )}
                              </div>
                              <Button 
                                onClick={() => navigate(createPageUrl('SellerProfile') + `?id=${sellerProfile.id}`)}
                                variant="outline" 
                                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50"
                              >
                                <Store className="w-4 h-4 mr-2" />
                                View All Courses by {sellerProfile.shop_name}
                              </Button>
                            </div>
                          </div>

                          {sellerProfile.expertise_areas && sellerProfile.expertise_areas.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-gray-900 mb-3">Expertise Areas</h4>
                              <div className="flex flex-wrap gap-2">
                                {sellerProfile.expertise_areas.map((area, idx) => (
                                  <Badge key={idx} className="bg-blue-100 text-blue-800">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      {sellerProfile.policies && (
                        <Card>
                          <CardHeader>
                            <CardTitle>Instructor Policies</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {sellerProfile.policies.refund_policy && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                  Refund Policy
                                </h4>
                                <p className="text-gray-700 pl-6">{sellerProfile.policies.refund_policy}</p>
                              </div>
                            )}
                            {sellerProfile.policies.course_access_policy && (
                              <div>
                                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4 text-blue-600" />
                                  Course Access
                                </h4>
                                <p className="text-gray-700 pl-6">{sellerProfile.policies.course_access_policy}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </TabsContent>

                {/* Reviews Tab */}
                <TabsContent value="reviews" className="space-y-6 mt-6">
                  {/* Review Form for Enrolled Students */}
                  {isEnrolled && !userReview && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <ReviewForm
                        itemId={courseId}
                        itemType="course"
                        itemTitle={course.title}
                        sellerId={course.seller_id}
                        orderId={enrollment.order_id}
                        onSuccess={() => {
                          queryClient.invalidateQueries(['userCourseReview', courseId, user?.email]); // Invalidate user's review to update state
                          queryClient.invalidateQueries(['courseReviews', courseId]); // Invalidate public reviews to potentially show the new review (after moderation)
                        }}
                      />
                    </motion.div>
                  )}

                  {/* User's Existing Review */}
                  {userReview && (
                    <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-gray-900">Your Review</h4>
                          <Badge className="bg-blue-100 text-blue-800 text-xs ml-auto">
                            {userReview.status === 'approved' ? 'Published' : 'Pending Moderation'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < userReview.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        {userReview.title && (
                          <h5 className="font-semibold text-gray-900 mb-2">{userReview.title}</h5>
                        )}
                        <p className="text-gray-700 leading-relaxed">{userReview.content}</p>
                        {userReview.images && userReview.images.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {userReview.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                alt=""
                                className="w-20 h-20 rounded-lg object-cover"
                              />
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* Not Enrolled Message */}
                  {!isEnrolled && !userReview && user && (
                    <Card className="bg-blue-50 border-2 border-blue-200">
                      <CardContent className="text-center py-12">
                        <Star className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Enroll to Leave a Review</h3>
                        <p className="text-gray-700 mb-4">
                          Only enrolled students can write reviews for this course
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {!user && (
                    <Card className="bg-purple-50 border-2 border-purple-200">
                      <CardContent className="text-center py-12">
                        <Star className="w-16 h-16 text-purple-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Sign In to Review</h3>
                        <p className="text-gray-700 mb-4">
                          Please sign in and enroll to leave a review
                        </p>
                        <Button
                          onClick={() => base44.auth.redirectToLogin()}
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          Sign In
                        </Button>
                      </CardContent>
                    </Card>
                  )}

                  {/* Existing Reviews */}
                  {reviews.length === 0 ? (
                    <Card>
                      <CardContent className="text-center py-20">
                        <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No Reviews Yet</h3>
                        <p className="text-gray-600">
                          {isEnrolled ? 'Be the first to review this course!' : 'Enroll to see and write reviews'}
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      {/* Rating Summary */}
                      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200">
                        <CardContent className="p-8">
                          <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="text-center">
                              <div className="text-6xl font-bold text-gray-900 mb-2">
                                {course.average_rating.toFixed(1)}
                              </div>
                              <div className="flex items-center justify-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-6 h-6 ${i < Math.round(course.average_rating) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                  />
                                ))}
                              </div>
                              <p className="text-gray-600">{course.review_count} reviews</p>
                            </div>

                            <div className="flex-1 w-full">
                              {[5, 4, 3, 2, 1].map(rating => {
                                const count = reviews.filter(r => r.rating === rating).length;
                                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                                return (
                                  <div key={rating} className="flex items-center gap-3 mb-2">
                                    <div className="flex items-center gap-1 w-20">
                                      <span className="text-sm font-medium">{rating}</span>
                                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    </div>
                                    <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                                      <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${percentage}%` }}
                                        transition={{ delay: rating * 0.1 }}
                                        className="h-full bg-gradient-to-r from-yellow-400 to-amber-500"
                                      />
                                    </div>
                                    <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Individual Reviews */}
                      <div className="space-y-4">
                        {reviews.map((review, idx) => (
                          <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <Card>
                              <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                    {review.reviewer_name?.[0]?.toUpperCase() || '?'}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                      <div>
                                        <div className="font-semibold text-gray-900">{review.reviewer_name}</div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <div className="flex items-center">
                                            {[...Array(5)].map((_, i) => (
                                              <Star
                                                key={i}
                                                className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                                              />
                                            ))}
                                          </div>
                                          {review.verified_purchase && (
                                            <Badge className="bg-green-100 text-green-800 text-xs">
                                              <CheckCircle className="w-3 h-3 mr-1" />
                                              Verified Enrollment
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <span className="text-sm text-gray-500">
                                        {new Date(review.created_date).toLocaleDateString()}
                                      </span>
                                    </div>

                                    {review.title && (
                                      <h5 className="font-semibold text-gray-900 mb-2">{review.title}</h5>
                                    )}
                                    <p className="text-gray-700 leading-relaxed mb-3">{review.content}</p>

                                    {review.images && review.images.length > 0 && (
                                      <div className="flex gap-2 mb-3">
                                        {review.images.map((img, imgIdx) => (
                                          <img
                                            key={imgIdx}
                                            src={img}
                                            alt=""
                                            className="w-20 h-20 rounded-lg object-cover"
                                          />
                                        ))}
                                      </div>
                                    )}

                                    {review.seller_response && (
                                      <div className="mt-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Store className="w-4 h-4 text-blue-600" />
                                          <span className="font-semibold text-blue-900">Instructor Response</span>
                                          <span className="text-xs text-gray-500">
                                            {new Date(review.seller_responded_at).toLocaleDateString()}
                                          </span>
                                        </div>
                                        <p className="text-gray-700">{review.seller_response}</p>
                                      </div>
                                    )}

                                    {review.helpful_count > 0 && (
                                      <p className="text-xs text-gray-500 mt-3">
                                        {review.helpful_count} {review.helpful_count === 1 ? 'person' : 'people'} found this helpful
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6 shadow-2xl border-t-4 border-blue-500">
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      ${course.price}
                    </div>
                    {course.pricing_type !== 'one_time' && (
                      <p className="text-gray-600">{course.pricing_type.replace('subscription_', 'per ')}</p>
                    )}
                  </div>

                  {isEnrolled ? (
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-lg py-6 mb-4">
                      <PlayCircle className="w-5 h-5 mr-2" />
                      Continue Learning
                    </Button>
                  ) : user ? (
                    <>
                      <Button 
                        onClick={() => addToCartMutation.mutate(course)}
                        disabled={addToCartMutation.isPending}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-lg py-6 mb-3"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                      </Button>

                      <Button
                        onClick={() => setShowMessaging(true)}
                        variant="outline"
                        className="w-full mb-4 border-2"
                      >
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Ask Instructor
                      </Button>
                    </>
                  ) : (
                    <Button 
                      onClick={() => base44.auth.redirectToLogin()}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-lg py-6 mb-4"
                    >
                      Sign In to Enroll
                    </Button>
                  )}

                  <div className="space-y-4 border-t pt-6">
                    <h4 className="font-bold text-gray-900 mb-3">This course includes:</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <span>{Math.floor((course.total_duration_minutes || 0) / 60)}h {(course.total_duration_minutes || 0) % 60}m on-demand video</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <BookOpen className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span>{course.total_modules} comprehensive modules</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <Users className="w-5 h-5 text-purple-600 flex-shrink-0" />
                        <span>Join {course.enrollment_count} other students</span>
                      </div>
                      {course.certification_offered && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <Award className="w-5 h-5 text-amber-600 flex-shrink-0" />
                          <span>Certificate of completion</span>
                        </div>
                      )}
                      {course.course_materials && course.course_materials.length > 0 && (
                        <div className="flex items-center gap-3 text-gray-700">
                          <Download className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                          <span>{course.course_materials.length} downloadable resources</span>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-gray-700">
                        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        <span>Lifetime access</span>
                      </div>
                    </div>
                  </div>

                  {course.has_free_preview && (
                    <div className="mt-6 p-4 bg-green-50 rounded-lg text-sm text-green-900 text-center border-2 border-green-200">
                      <Unlock className="w-5 h-5 inline mr-2" />
                      <strong>Free Preview Available!</strong>
                      <p className="text-xs mt-1">Try the first module before purchasing</p>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t">
                    <div className="text-xs text-gray-500 space-y-2">
                      <p className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        30-day money-back guarantee
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Instant access after purchase
                      </p>
                      <p className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        Learn at your own pace
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Messaging Modal */}
      <AnimatePresence>
        {showMessaging && user && course && sellerProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-xl shadow-2xl"
            >
              <BuyerSellerMessaging
                conversationId={existingConversation?.id}
                sellerId={course.seller_id}
                sellerName={sellerProfile.shop_name}
                itemId={courseId}
                itemType="course"
                itemName={course.title}
                itemImage={course.cover_image_url}
                onClose={() => setShowMessaging(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
