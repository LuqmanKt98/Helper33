
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  Star,
  Briefcase,
  CheckCircle,
  DollarSign,
  Globe,
  Loader2,
  ArrowLeft,
  MessageSquare, // New icon
  Image,         // New icon
  User,          // New icon
  ExternalLink   // New icon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import BookingForm from '@/components/appointments/BookingForm';
import { Input } from '@/components/ui/input'; // New import for Input component

export default function ConsultantProfile() {
  const { consultantId } = useParams();
  const [showBooking, setShowBooking] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const { data: consultant, isLoading } = useQuery({
    queryKey: ['consultant', consultantId],
    queryFn: async () => {
      const consultants = await base44.entities.ConsultantProfile.filter({ id: consultantId });
      return consultants[0];
    }
  });

  const { data: appointmentType } = useQuery({
    queryKey: ['appointmentType', consultant?.id],
    queryFn: async () => {
      if (!consultant) return null;
      const types = await base44.entities.AppointmentType.filter({
        provider_email: consultant.created_by || '',
        is_active: true
      });
      return types[0] || null;
    },
    enabled: !!consultant
  });

  const { data: zoomConnected } = useQuery({
    queryKey: ['consultantZoom', consultant?.created_by],
    queryFn: async () => {
      if (!consultant?.created_by) return false;
      const integrations = await base44.entities.PlatformIntegration.filter({
        platform_name: 'zoom',
        is_connected: true,
        created_by: consultant.created_by
      });
      return integrations.length > 0;
    },
    enabled: !!consultant
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  if (!consultant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <p className="text-gray-600 mb-4">Consultant not found</p>
            <Link to={createPageUrl('FindConsultants')}>
              <Button>Back to Consultants</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Generate available times (example - would be based on provider schedule)
  const availableTimes = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link to={createPageUrl('FindConsultants')}>
          <Button variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Consultants
          </Button>
        </Link>

        {/* Consultant Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="border-4 border-purple-400 shadow-2xl mb-8 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <div className="flex items-start gap-6">
                {consultant.profile_picture_url && (
                  <motion.img
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    src={consultant.profile_picture_url}
                    alt={consultant.full_name}
                    className="w-24 h-24 rounded-full border-4 border-white shadow-xl object-cover"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl mb-2">{consultant.full_name}</CardTitle>
                      <CardDescription className="text-white/90 text-lg mb-3">
                        {consultant.title}
                      </CardDescription>
                    </div>
                    {consultant.verified_professional && (
                      <Badge className="bg-green-500 text-white shadow-lg">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {consultant.expertise?.map((skill, idx) => (
                      <Badge key={idx} className="bg-white/20 text-white backdrop-blur-sm">
                        {skill}
                      </Badge>
                    ))}
                    {zoomConnected && (
                      <Badge className="bg-blue-500 text-white">
                        <Video className="w-3 h-3 mr-1" />
                        Zoom Available
                      </Badge>
                    )}
                    {consultant.years_of_experience && (
                      <Badge className="bg-amber-500 text-white">
                        {consultant.years_of_experience}+ Years Experience
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-8">
              {/* Quick Stats */}
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 border-2 border-green-300 text-center"
                >
                  <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-900">${consultant.consultation_rate}</p>
                  <p className="text-sm text-gray-600">per hour</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl p-4 border-2 border-blue-300 text-center"
                >
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-900">{appointmentType?.duration_minutes || 60}</p>
                  <p className="text-sm text-gray-600">minutes</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl p-4 border-2 border-amber-300 text-center"
                >
                  <Star className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-900">{consultant.average_rating?.toFixed(1) || 'New'}</p>
                  <p className="text-sm text-gray-600">{consultant.total_reviews || 0} reviews</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-300 text-center"
                >
                  <Video className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-xl font-bold text-purple-900">
                    {zoomConnected ? 'Zoom Ready' : 'Virtual'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {zoomConnected ? 'Auto-created' : 'Video call'}
                  </p>
                </motion.div>
              </div>

              {/* Tabs Navigation */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {[
                  { id: 'overview', label: '📋 Overview', icon: Briefcase },
                  { id: 'video', label: '🎥 Video Intro', icon: Video },
                  { id: 'credentials', label: '🎓 Credentials', icon: CheckCircle },
                  { id: 'case-studies', label: '💼 Case Studies', icon: Star },
                  { id: 'testimonials', label: '💬 Testimonials', icon: MessageSquare },
                  { id: 'media', label: '📸 Media', icon: Image }
                ].map(tab => (
                  <Button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    variant={activeTab === tab.id ? 'default' : 'outline'}
                    className={`${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg' 
                        : 'border-2 border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    {tab.label}
                  </Button>
                ))}
              </div>

              {/* Tab Content */}
              <AnimatePresence mode="wait">
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Bio */}
                    {consultant.bio && (
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-3 flex items-center gap-2">
                          <Briefcase className="w-5 h-5 text-purple-600" />
                          About
                        </h3>
                        <p className="text-gray-700 leading-relaxed bg-white/60 p-4 rounded-lg border-2 border-gray-200">
                          {consultant.bio}
                        </p>
                      </div>
                    )}

                    {/* Specializations */}
                    {consultant.specializations && consultant.specializations.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-3">🎯 Specializations</h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          {consultant.specializations.map((spec, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="bg-white p-4 rounded-lg border-2 border-purple-200"
                            >
                              <h4 className="font-semibold text-purple-900 mb-1">{spec.area}</h4>
                              {spec.description && <p className="text-sm text-gray-600">{spec.description}</p>}
                              {spec.years_specialized && (
                                <p className="text-xs text-purple-600 mt-2">{spec.years_specialized} years experience</p>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Education */}
                    {consultant.education && consultant.education.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-3">🎓 Education</h3>
                        <div className="space-y-2">
                          {consultant.education.map((edu, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-lg border-2 border-blue-200">
                              <p className="font-semibold text-gray-900">{edu.degree} in {edu.field_of_study}</p>
                              <p className="text-sm text-gray-600">{edu.institution} • {edu.graduation_year}</p>
                              {edu.honors && <Badge className="mt-2 bg-blue-100 text-blue-800">{edu.honors}</Badge>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {consultant.languages_spoken && consultant.languages_spoken.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-3">🗣️ Languages</h3>
                        <div className="flex flex-wrap gap-2">
                          {consultant.languages_spoken.map((lang, idx) => (
                            <Badge key={idx} className="bg-purple-100 text-purple-800 border-2 border-purple-300">
                              {lang.language} ({lang.proficiency})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'video' && (
                  <motion.div
                    key="video"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {consultant.video_introduction_url ? (
                      <div className="aspect-video rounded-xl overflow-hidden border-4 border-purple-300 shadow-2xl">
                        <video
                          src={consultant.video_introduction_url}
                          controls
                          className="w-full h-full"
                          poster={consultant.profile_picture_url}
                        >
                          Your browser does not support video playback.
                        </video>
                      </div>
                    ) : (
                      <Card className="border-2 border-dashed border-gray-300">
                        <CardContent className="p-12 text-center">
                          <Video className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No video introduction available</p>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}

                {activeTab === 'credentials' && (
                  <motion.div
                    key="credentials"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Certifications */}
                    {consultant.certifications && consultant.certifications.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-4">🏅 Certifications</h3>
                        <div className="space-y-3">
                          {consultant.certifications.map((cert, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="bg-white p-4 rounded-lg border-2 border-green-300 hover:shadow-lg transition-all"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <h4 className="font-bold text-green-900 mb-1">{cert.certification_name}</h4>
                                  <p className="text-sm text-gray-600 mb-2">{cert.issuing_organization}</p>
                                  {cert.issue_date && (
                                    <p className="text-xs text-gray-500">
                                      Issued: {new Date(cert.issue_date).toLocaleDateString()}
                                      {cert.expiry_date && ` • Expires: ${new Date(cert.expiry_date).toLocaleDateString()}`}
                                    </p>
                                  )}
                                  {cert.credential_id && (
                                    <p className="text-xs text-gray-500 mt-1">ID: {cert.credential_id}</p>
                                  )}
                                </div>
                                {cert.verification_url && (
                                  <a href={cert.verification_url} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="outline" className="border-green-300">
                                      <ExternalLink className="w-4 h-4 mr-1" />
                                      Verify
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Achievements */}
                    {consultant.achievements && consultant.achievements.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-4">🏆 Achievements & Awards</h3>
                        <div className="space-y-2">
                          {consultant.achievements.map((achievement, idx) => (
                            <div key={idx} className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border-2 border-amber-300">
                              <h4 className="font-semibold text-amber-900">{achievement.achievement_title}</h4>
                              <p className="text-sm text-gray-700 mt-1">{achievement.description}</p>
                              <p className="text-xs text-gray-500 mt-2">
                                {achievement.awarding_organization} • {new Date(achievement.date).getFullYear()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Publications */}
                    {consultant.publications && consultant.publications.length > 0 && (
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 mb-4">📚 Publications</h3>
                        <div className="space-y-3">
                          {consultant.publications.map((pub, idx) => (
                            <div key={idx} className="bg-white p-4 rounded-lg border-2 border-indigo-200 hover:shadow-lg transition-all">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <Badge className="bg-indigo-100 text-indigo-800 mb-2">{pub.publication_type}</Badge>
                                  <h4 className="font-semibold text-gray-900 mb-1">{pub.title}</h4>
                                  {pub.summary && <p className="text-sm text-gray-600 mb-2">{pub.summary}</p>}
                                  <p className="text-xs text-gray-500">
                                    {pub.publisher} • {new Date(pub.publication_date).toLocaleDateString()}
                                  </p>
                                </div>
                                {pub.url && (
                                  <a href={pub.url} target="_blank" rel="noopener noreferrer">
                                    <Button size="sm" variant="outline">
                                      <ExternalLink className="w-4 h-4 mr-1" />
                                      Read
                                    </Button>
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {(!consultant.certifications?.length && !consultant.achievements?.length && !consultant.publications?.length) && (
                      <Card className="border-2 border-dashed border-gray-300">
                        <CardContent className="p-8 text-center">
                          <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                          <p className="text-gray-500">No credentials listed yet</p>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}

                {activeTab === 'case-studies' && (
                  <motion.div
                    key="case-studies"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {consultant.case_studies && consultant.case_studies.length > 0 ? (
                      <div className="space-y-6">
                        {consultant.case_studies.map((study, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <Card className={`border-4 ${study.is_featured ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50' : 'border-purple-300'} shadow-xl`}>
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div>
                                    <CardTitle className="text-xl mb-2">{study.title}</CardTitle>
                                    <div className="flex gap-2 flex-wrap">
                                      {study.industry && (
                                        <Badge className="bg-blue-100 text-blue-800">{study.industry}</Badge>
                                      )}
                                      {study.duration_months && (
                                        <Badge variant="outline">{study.duration_months} months</Badge>
                                      )}
                                      {study.is_featured && (
                                        <Badge className="bg-amber-500 text-white">
                                          <Star className="w-3 h-3 mr-1 fill-current" />
                                          Featured
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                {study.challenge && (
                                  <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
                                    <h4 className="font-semibold text-red-900 mb-2">🎯 Challenge</h4>
                                    <p className="text-sm text-gray-700">{study.challenge}</p>
                                  </div>
                                )}
                                {study.solution && (
                                  <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                                    <h4 className="font-semibold text-blue-900 mb-2">💡 Solution</h4>
                                    <p className="text-sm text-gray-700">{study.solution}</p>
                                  </div>
                                )}
                                {study.outcome && (
                                  <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                                    <h4 className="font-semibold text-green-900 mb-2">✅ Outcome</h4>
                                    <p className="text-sm text-gray-700">{study.outcome}</p>
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-2 border-dashed border-gray-300">
                        <CardContent className="p-12 text-center">
                          <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No case studies available</p>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}

                {activeTab === 'testimonials' && (
                  <motion.div
                    key="testimonials"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {consultant.client_testimonials && consultant.client_testimonials.length > 0 ? (
                      <div className="grid md:grid-cols-2 gap-4">
                        {consultant.client_testimonials.map((testimonial, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <Card className="h-full border-2 border-pink-300 hover:shadow-xl transition-all">
                              <CardContent className="p-6">
                                {testimonial.video_testimonial_url ? (
                                  <div className="aspect-video rounded-lg overflow-hidden mb-4 border-2 border-gray-200">
                                    <video src={testimonial.video_testimonial_url} controls className="w-full h-full" />
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-3 mb-4">
                                      {testimonial.client_photo_url ? (
                                        <img
                                          src={testimonial.client_photo_url}
                                          alt={testimonial.client_name}
                                          className="w-12 h-12 rounded-full object-cover border-2 border-pink-300"
                                        />
                                      ) : (
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 flex items-center justify-center">
                                          <User className="w-6 h-6 text-white" />
                                        </div>
                                      )}
                                      <div>
                                        <p className="font-semibold text-gray-900">{testimonial.client_name}</p>
                                        {testimonial.client_title && (
                                          <p className="text-xs text-gray-500">{testimonial.client_title}</p>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex gap-1 mb-3">
                                      {[...Array(5)].map((_, i) => (
                                        <Star
                                          key={i}
                                          className={`w-4 h-4 ${i < (testimonial.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`}
                                        />
                                      ))}
                                    </div>
                                    <p className="text-gray-700 italic leading-relaxed">"{testimonial.testimonial}"</p>
                                    {testimonial.date && (
                                      <p className="text-xs text-gray-400 mt-3">{new Date(testimonial.date).toLocaleDateString()}</p>
                                    )}
                                  </>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-2 border-dashed border-gray-300">
                        <CardContent className="p-12 text-center">
                          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No testimonials available yet</p>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}

                {activeTab === 'media' && (
                  <motion.div
                    key="media"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {consultant.media_gallery && consultant.media_gallery.length > 0 ? (
                      <div className="grid md:grid-cols-3 gap-4">
                        {consultant.media_gallery.map((media, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            whileHover={{ scale: 1.05 }}
                          >
                            <Card className="overflow-hidden border-2 border-purple-300 hover:shadow-xl transition-all cursor-pointer">
                              {media.media_type === 'video' ? (
                                <video
                                  src={media.media_url}
                                  poster={media.thumbnail_url}
                                  className="w-full h-48 object-cover"
                                  controls
                                />
                              ) : (
                                <img
                                  src={media.media_url}
                                  alt={media.title}
                                  className="w-full h-48 object-cover"
                                />
                              )}
                              {(media.title || media.description) && (
                                <CardContent className="p-3">
                                  {media.title && <p className="font-semibold text-sm text-gray-900">{media.title}</p>}
                                  {media.description && <p className="text-xs text-gray-600 mt-1">{media.description}</p>}
                                </CardContent>
                              )}
                            </Card>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <Card className="border-2 border-dashed border-gray-300">
                        <CardContent className="p-12 text-center">
                          <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">No media gallery available</p>
                        </CardContent>
                      </Card>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Portfolio Link */}
              {consultant.portfolio_url && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="mt-8"
                >
                  <a 
                    href={consultant.portfolio_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    <Globe className="w-5 h-5" />
                    View Full Portfolio
                  </a>
                </motion.div>
              )}

              {/* Booking Section */}
              {!showBooking ? (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="mt-8"
                >
                  <Button
                    onClick={() => setShowBooking(true)}
                    size="lg"
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl py-6 text-lg"
                  >
                    <Calendar className="w-6 h-6 mr-3" />
                    Book a Consultation
                    {zoomConnected && <Video className="w-5 h-5 ml-3" />}
                  </Button>
                </motion.div>
              ) : (
                <div className="space-y-6 mt-8">
                  {/* Date & Time Selection */}
                  <Card className="border-2 border-blue-300 bg-blue-50">
                    <CardHeader>
                      <CardTitle className="text-lg">📅 Select Date & Time</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">
                          Date
                        </label>
                        <Input
                          type="date"
                          value={selectedDate}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                          className="border-2 border-blue-200"
                        />
                      </div>

                      {selectedDate && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700 mb-2 block">
                            Available Times
                          </label>
                          <div className="grid grid-cols-4 gap-2">
                            {availableTimes.map((time) => (
                              <motion.button
                                key={time}
                                type="button"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedTime(time)}
                                className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                                  selectedTime === time
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-lg'
                                    : 'bg-white border-blue-200 text-gray-700 hover:border-blue-400'
                                }`}
                              >
                                {time}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Booking Form */}
                  {selectedDate && selectedTime && appointmentType && (
                    <BookingForm
                      appointmentType={appointmentType}
                      selectedDate={selectedDate}
                      selectedTime={selectedTime}
                      onSuccess={() => {
                        setShowBooking(false);
                        setSelectedDate('');
                        setSelectedTime('');
                      }}
                      onCancel={() => {
                        setShowBooking(false);
                        setSelectedDate('');
                        setSelectedTime('');
                      }}
                    />
                  )}

                  {!appointmentType && (
                    <Card className="border-2 border-yellow-300 bg-yellow-50">
                      <CardContent className="p-6 text-center">
                        <p className="text-yellow-800">
                          ⚠️ Appointment booking not yet configured for this consultant.
                          Please contact them directly.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
