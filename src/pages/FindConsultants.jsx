
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Briefcase,
  DollarSign,
  Star,
  Video,
  Loader2,
  Sparkles,
  Calendar,
  ExternalLink,
  User,
  CheckCircle,
  Award,
  TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import AIConsultantMatcher from '@/components/consultants/AIConsultantMatcher';
import ConsultantChatAssistant from '@/components/consultants/ConsultantChatAssistant';

export default function FindConsultants() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false
  });

  const { data: consultants = [], isLoading, error, refetch } = useQuery({
    queryKey: ['consultants'],
    queryFn: async () => {
      try {
        const data = await base44.entities.ConsultantProfile.list('-created_date', 100);
        console.log('📊 Fetched consultants:', data.length, data);
        return data || [];
      } catch (err) {
        console.error('Error fetching consultants:', err);
        return [];
      }
    },
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });

  const { data: zoomIntegrations = [] } = useQuery({
    queryKey: ['zoomIntegrations'],
    queryFn: async () => {
      try {
        const integrations = await base44.entities.PlatformIntegration.filter({
          platform_name: 'zoom',
          is_connected: true
        });
        return integrations || [];
      } catch {
        return [];
      }
    }
  });

  const filteredConsultants = consultants.filter(consultant => {
    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const matchesSearch = 
        consultant.full_name?.toLowerCase().includes(search) ||
        consultant.title?.toLowerCase().includes(search) ||
        consultant.bio?.toLowerCase().includes(search) ||
        consultant.expertise?.some(e => e.toLowerCase().includes(search));
      
      if (!matchesSearch) return false;
    }

    // Category filter (based on expertise)
    if (filterCategory !== 'all') {
      const hasCategory = consultant.expertise?.some(e => 
        e.toLowerCase().includes(filterCategory.toLowerCase())
      );
      if (!hasCategory) return false;
    }

    return true;
  });

  const hasZoom = (consultant) => {
    return zoomIntegrations.some(z => z.created_by === consultant.created_by);
  };

  const categories = ['all', 'AI', 'Wellness', 'Business', 'Psychology', 'Life Coaching', 'Strategy'];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-6 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 className="w-16 h-16 text-purple-500" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Animated Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  rotate: [0, 10, -10, 0],
                  scale: [1, 1.15, 1]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center shadow-2xl"
              >
                <Briefcase className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-2">
                  🎯 Find Expert Consultants
                </h1>
                <p className="text-gray-600 text-sm sm:text-base">Book AI-powered consultations with verified experts</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Link to={createPageUrl('PostConsultationRequest')}>
                <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl">
                  <Sparkles className="w-5 h-5 mr-2" />
                  📢 Post Request
                </Button>
              </Link>
              <Link to={createPageUrl('MyConsultationRequests')}>
                <Button variant="outline" className="border-2 border-purple-400 hover:bg-purple-50">
                  📋 My Requests
                </Button>
              </Link>
              {user?.role === 'admin' && (
                <Link to={createPageUrl('BrowseClientRequests')}>
                  <Button variant="outline" className="border-2 border-amber-400 hover:bg-amber-50">
                    💼 Browse Requests
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, expertise, or specialty..."
              className="pl-12 h-14 sm:h-16 text-base sm:text-lg border-4 border-purple-300 focus:border-purple-500 shadow-xl rounded-2xl bg-white/80 backdrop-blur-sm"
            />
          </motion.div>

          {/* Category Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-2 mt-4 overflow-x-auto pb-2"
          >
            {categories.map((category, idx) => (
              <motion.button
                key={category}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setFilterCategory(category)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition-all shadow-md ${
                  filterCategory === category
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-purple-700 border-2 border-purple-200 hover:border-purple-400'
                }`}
              >
                {category}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>

        {/* AI Features - Show ONLY if consultants exist */}
        {consultants.length > 0 && (
          <>
            <ConsultantChatAssistant consultants={consultants} />
            <AIConsultantMatcher consultants={consultants} />
          </>
        )}

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-6 border-4 border-blue-300 bg-gradient-to-r from-blue-50 to-purple-50 shadow-xl">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  <p className="text-base sm:text-lg font-bold text-blue-900">
                    📊 Loaded: <span className="text-purple-600">{consultants.length}</span> consultants • 
                    Showing: <span className="text-pink-600">{filteredConsultants.length}</span>
                  </p>
                </div>
                <Button
                  onClick={() => refetch()}
                  size="sm"
                  variant="outline"
                  className="border-2 border-blue-400 hover:bg-blue-100"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Consultants Grid or Empty State */}
        <AnimatePresence mode="wait">
          {filteredConsultants.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <Card className="border-4 border-dashed border-purple-300 shadow-xl">
                <CardContent className="p-12 sm:p-16 text-center">
                  <motion.div
                    animate={{ 
                      y: [0, -10, 0],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <Briefcase className="w-20 h-20 sm:w-24 sm:h-24 text-purple-300 mx-auto mb-6" />
                  </motion.div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-700 mb-3">
                    {consultants.length === 0 ? '🚀 No Consultants Yet' : 'No Matches Found'}
                  </h3>
                  <p className="text-gray-500 mb-6 text-sm sm:text-base max-w-md mx-auto">
                    {consultants.length === 0 
                      ? 'Be the first to join our expert consultant network! Create your profile and start helping others.'
                      : 'Try adjusting your search or filters to find the perfect consultant match.'}
                  </p>
                  {consultants.length === 0 && user && (
                    <Link to={createPageUrl('BecomeAConsultant')}>
                      <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl px-8 py-6 text-lg">
                        <Sparkles className="w-5 h-5 mr-2" />
                        Become a Consultant
                      </Button>
                    </Link>
                  )}
                  <p className="text-xs text-gray-400 mt-4">
                    Total in database: {consultants.length}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6 flex items-center gap-3"
              >
                <Sparkles className="w-7 h-7 text-purple-600" />
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  All Verified Consultants ({filteredConsultants.length})
                </h2>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredConsultants.map((consultant, idx) => {
                  const consultantHasZoom = hasZoom(consultant);

                  return (
                    <motion.div
                      key={consultant.id}
                      initial={{ opacity: 0, y: 30, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        delay: idx * 0.1,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ y: -10, scale: 1.03 }}
                      className="h-full"
                    >
                      <Card className="h-full border-4 border-purple-300 hover:border-purple-500 shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-white to-purple-50 overflow-hidden">
                        {/* Animated gradient overlay */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl -z-0" />
                        
                        <CardHeader className="relative">
                          <div className="flex items-start gap-4 mb-3">
                            <motion.div
                              whileHover={{ scale: 1.15, rotate: 10 }}
                              transition={{ type: "spring", stiffness: 300 }}
                            >
                              {consultant.profile_picture_url ? (
                                <img
                                  src={consultant.profile_picture_url}
                                  alt={consultant.full_name}
                                  className="w-20 h-20 rounded-full border-4 border-purple-300 shadow-xl object-cover"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 flex items-center justify-center border-4 border-purple-300 shadow-xl">
                                  <User className="w-10 h-10 text-white" />
                                </div>
                              )}
                            </motion.div>
                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-xl mb-1 text-gray-900 line-clamp-1">
                                {consultant.full_name}
                              </CardTitle>
                              <CardDescription className="text-sm line-clamp-2">
                                {consultant.title}
                              </CardDescription>
                            </div>
                          </div>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2">
                            {consultant.verified_professional && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", delay: idx * 0.1 + 0.2 }}
                              >
                                <Badge className="bg-green-500 text-white shadow-md">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              </motion.div>
                            )}
                            {consultantHasZoom && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, delay: idx * 0.1 + 0.3 }}
                              >
                                <Badge className="bg-blue-500 text-white shadow-md">
                                  <Video className="w-3 h-3 mr-1" />
                                  Zoom
                                </Badge>
                              </motion.div>
                            )}
                            {consultant.years_of_experience && (
                              <Badge className="bg-amber-500 text-white shadow-md">
                                <Award className="w-3 h-3 mr-1" />
                                {consultant.years_of_experience}+ yrs
                              </Badge>
                            )}
                            {consultant.expertise?.slice(0, 2).map((skill, sIdx) => (
                              <Badge key={sIdx} variant="outline" className="border-purple-400 text-purple-700 bg-purple-50">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4 relative">
                          {/* Bio */}
                          {consultant.bio && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: idx * 0.1 + 0.4 }}
                            >
                              <p className="text-sm text-gray-700 line-clamp-3 bg-white/80 backdrop-blur-sm p-3 rounded-xl border-2 border-purple-100 shadow-sm">
                                {consultant.bio}
                              </p>
                            </motion.div>
                          )}

                          {/* Stats Row */}
                          <div className="flex items-center justify-between gap-2">
                            {consultant.consultation_rate && (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-2 rounded-xl border-2 border-green-300 flex-1"
                              >
                                <DollarSign className="w-5 h-5 text-green-600" />
                                <span className="font-bold text-green-900 text-base">
                                  ${consultant.consultation_rate}/hr
                                </span>
                              </motion.div>
                            )}
                            {consultant.average_rating > 0 && (
                              <motion.div
                                whileHover={{ scale: 1.05 }}
                                className="flex items-center gap-1 bg-amber-100 px-3 py-2 rounded-xl border-2 border-amber-300"
                              >
                                <Star className="w-4 h-4 text-amber-600 fill-amber-600" />
                                <span className="font-bold text-amber-900 text-sm">
                                  {consultant.average_rating.toFixed(1)}
                                </span>
                              </motion.div>
                            )}
                          </div>

                          {/* Certifications Preview */}
                          {consultant.certifications && consultant.certifications.length > 0 && (
                            <div className="flex items-center gap-2 text-xs text-purple-700 bg-purple-50 px-3 py-2 rounded-lg">
                              <Award className="w-4 h-4" />
                              <span className="font-semibold">{consultant.certifications.length} Certification{consultant.certifications.length > 1 ? 's' : ''}</span>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="space-y-2 pt-2">
                            <Link to={createPageUrl(`ConsultantProfile?consultantId=${consultant.id}`)}>
                              <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <Button className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white shadow-xl py-6 text-base font-bold rounded-xl">
                                  <Calendar className="w-5 h-5 mr-2" />
                                  Book Consultation
                                  {consultantHasZoom && <Video className="w-5 h-5 ml-2" />}
                                </Button>
                              </motion.div>
                            </Link>

                            <div className="flex gap-2">
                              <Link to={createPageUrl(`ConsultantProfile?consultantId=${consultant.id}`)} className="flex-1">
                                <Button variant="outline" className="w-full border-2 border-purple-300 hover:bg-purple-50 text-purple-700 font-semibold">
                                  <User className="w-4 h-4 mr-2" />
                                  View Profile
                                </Button>
                              </Link>
                              {consultant.portfolio_url && (
                                <a href={consultant.portfolio_url} target="_blank" rel="noopener noreferrer">
                                  <Button variant="outline" size="icon" className="border-2 border-purple-300 hover:bg-purple-50">
                                    <ExternalLink className="w-4 h-4 text-purple-600" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Become a Consultant CTA */}
        {user && consultants.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12"
          >
            <Card className="border-4 border-purple-400 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 shadow-2xl overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl" />
              <CardContent className="p-8 sm:p-12 text-center relative">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
                >
                  <Sparkles className="w-8 h-8 text-white" />
                </motion.div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
                  💼 Share Your Expertise
                </h3>
                <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                  Join our network of verified consultants and help others achieve their goals. Earn money while making a difference.
                </p>
                <Link to={createPageUrl('BecomeAConsultant')}>
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl px-8 py-6 text-lg rounded-xl">
                    <Briefcase className="w-6 h-6 mr-2" />
                    Become a Consultant
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
