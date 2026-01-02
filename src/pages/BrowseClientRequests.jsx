import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Search,
  Briefcase,
  DollarSign,
  Clock,
  Calendar,
  Zap,
  Eye,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function BrowseClientRequests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterUrgency, setFilterUrgency] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: consultantProfile } = useQuery({
    queryKey: ['myConsultantProfile'],
    queryFn: async () => {
      const profiles = await base44.entities.ConsultantProfile.filter({
        created_by: user?.email
      });
      return profiles[0] || null;
    },
    enabled: !!user
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['clientRequests'],
    queryFn: async () => {
      const data = await base44.entities.ClientRequest.filter({
        status: { $in: ['open', 'reviewing_offers'] }
      }, '-created_date', 100);
      return data || [];
    },
    refetchInterval: 30000
  });

  const { data: myOffers = [] } = useQuery({
    queryKey: ['myOffers'],
    queryFn: async () => {
      const offers = await base44.entities.ConsultantOffer.filter({
        created_by: user?.email
      });
      return offers || [];
    },
    enabled: !!user
  });

  const hasOffered = (requestId) => {
    return myOffers.some(o => o.request_id === requestId);
  };

  const filteredRequests = requests.filter(request => {
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const matches = 
        request.title?.toLowerCase().includes(search) ||
        request.description?.toLowerCase().includes(search) ||
        request.required_expertise?.some(e => e.toLowerCase().includes(search));
      if (!matches) return false;
    }

    if (filterCategory !== 'all' && request.category !== filterCategory) {
      return false;
    }

    if (filterUrgency !== 'all' && request.urgency !== filterUrgency) {
      return false;
    }

    return true;
  });

  const categories = [
    'all', 'AI_Strategy', 'Business_Development', 'Mental_Health', 
    'Wellness_Coaching', 'Career_Coaching', 'Technology', 'Other'
  ];

  const urgencyColors = {
    low: 'bg-blue-100 text-blue-800 border-blue-300',
    medium: 'bg-amber-100 text-amber-800 border-amber-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    urgent: 'bg-red-100 text-red-800 border-red-300 animate-pulse'
  };

  if (!consultantProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <Card className="max-w-2xl border-4 border-purple-400 shadow-2xl">
          <CardContent className="p-12 text-center">
            <Briefcase className="w-20 h-20 text-purple-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Create Your Consultant Profile First
            </h2>
            <p className="text-gray-600 mb-6">
              You need to set up your consultant profile before you can browse and respond to client requests.
            </p>
            <Link to={createPageUrl('BecomeAConsultant')}>
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-2xl px-8 py-6 text-lg">
                <Sparkles className="w-6 h-6 mr-2" />
                Create Consultant Profile
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.15, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl"
            >
              <Briefcase className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                💼 Client Requests
              </h1>
              <p className="text-gray-600">Browse opportunities and submit your offers</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <Card className="border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-4 text-center">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-900">{requests.length}</p>
                <p className="text-sm text-gray-600">Open Requests</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-4 text-center">
                <MessageSquare className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-900">{myOffers.length}</p>
                <p className="text-sm text-gray-600">Your Offers</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-4 text-center">
                <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-900">{filteredRequests.length}</p>
                <p className="text-sm text-gray-600">Matching Your Skills</p>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search requests by title, description, or expertise..."
                className="pl-12 h-14 border-4 border-purple-300 focus:border-purple-500 shadow-lg rounded-2xl"
              />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  onClick={() => setFilterCategory(category)}
                  variant={filterCategory === category ? 'default' : 'outline'}
                  size="sm"
                  className={filterCategory === category 
                    ? 'bg-purple-600 hover:bg-purple-700 shadow-lg whitespace-nowrap'
                    : 'border-2 border-purple-300 hover:bg-purple-50 whitespace-nowrap'
                  }
                >
                  {category === 'all' ? 'All' : category.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Requests Grid */}
        {filteredRequests.length === 0 ? (
          <Card className="border-4 border-dashed border-gray-300">
            <CardContent className="p-16 text-center">
              <Briefcase className="w-20 h-20 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Requests Found</h3>
              <p className="text-gray-500">Check back soon for new opportunities!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {filteredRequests.map((request, idx) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <Card className="h-full border-4 border-purple-300 hover:border-purple-500 shadow-xl hover:shadow-2xl transition-all bg-gradient-to-br from-white to-purple-50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900 mb-2">
                          {request.title}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge className={`${urgencyColors[request.urgency]} border-2 font-semibold`}>
                            {request.urgency === 'low' && '🕐'}
                            {request.urgency === 'medium' && '⏰'}
                            {request.urgency === 'high' && '🔥'}
                            {request.urgency === 'urgent' && '⚡'}
                            {' '}{request.urgency}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-800 border-2 border-purple-300">
                            {request.category.replace('_', ' ')}
                          </Badge>
                          {hasOffered(request.id) && (
                            <Badge className="bg-green-500 text-white shadow-md">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Offered
                            </Badge>
                          )}
                        </div>
                      </div>
                      {!request.is_anonymous && request.client_avatar && (
                        <img
                          src={request.client_avatar}
                          alt={request.client_name}
                          className="w-12 h-12 rounded-full border-2 border-purple-300 shadow-md"
                        />
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Description */}
                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 bg-white/60 p-3 rounded-lg border border-gray-200">
                      {request.description}
                    </p>

                    {/* Required Expertise */}
                    {request.required_expertise && request.required_expertise.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-gray-700 mb-1">🎯 Looking For:</p>
                        <div className="flex flex-wrap gap-1">
                          {request.required_expertise.map((skill, sIdx) => (
                            <Badge key={sIdx} variant="outline" className="border-blue-300 text-blue-700 text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      {request.budget_range?.min && request.budget_range?.max && (
                        <div className="bg-green-50 p-3 rounded-lg border-2 border-green-200">
                          <DollarSign className="w-4 h-4 text-green-600 mb-1" />
                          <p className="text-xs text-gray-600">Budget</p>
                          <p className="text-sm font-bold text-green-900">
                            ${request.budget_range.min}-${request.budget_range.max}/hr
                          </p>
                        </div>
                      )}

                      <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
                        <Clock className="w-4 h-4 text-blue-600 mb-1" />
                        <p className="text-xs text-gray-600">Duration</p>
                        <p className="text-sm font-bold text-blue-900">
                          {request.preferred_duration_minutes} min
                        </p>
                      </div>

                      {request.timeline && (
                        <div className="bg-amber-50 p-3 rounded-lg border-2 border-amber-200 col-span-2">
                          <Calendar className="w-4 h-4 text-amber-600 mb-1" />
                          <p className="text-xs text-gray-600">Timeline</p>
                          <p className="text-sm font-bold text-amber-900">{request.timeline}</p>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {request.view_count || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {request.offer_count || 0} offers
                        </span>
                      </div>
                      <span>
                        Posted {new Date(request.created_date).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Action Button */}
                    <Link to={createPageUrl(`ClientRequestDetail?requestId=${request.id}`)}>
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button className={`w-full shadow-xl py-6 text-base font-bold ${
                          hasOffered(request.id)
                            ? 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                        } text-white`}>
                          {hasOffered(request.id) ? (
                            <>
                              <MessageSquare className="w-5 h-5 mr-2" />
                              View Your Offer
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 mr-2" />
                              Submit Offer
                            </>
                          )}
                        </Button>
                      </motion.div>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}