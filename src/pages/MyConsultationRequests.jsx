import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Plus,
  Briefcase,
  MessageSquare,
  Eye,
  Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function MyConsultationRequests() {
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['myRequests'],
    queryFn: async () => {
      const data = await base44.entities.ClientRequest.filter({
        created_by: user?.email
      }, '-created_date');
      return data || [];
    },
    enabled: !!user
  });

  const filteredRequests = requests.filter(request => {
    if (filterStatus === 'all') return true;
    return request.status === filterStatus;
  });

  const statusColors = {
    open: 'bg-green-100 text-green-800 border-green-300',
    reviewing_offers: 'bg-blue-100 text-blue-800 border-blue-300',
    consultant_selected: 'bg-purple-100 text-purple-800 border-purple-300',
    completed: 'bg-gray-100 text-gray-800 border-gray-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300'
  };

  const urgencyColors = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-amber-100 text-amber-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800 animate-pulse'
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6 flex items-center justify-center">
        <Loader2 className="w-16 h-16 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.15, 1]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl"
              >
                <Briefcase className="w-8 h-8 text-white" />
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  📋 My Consultation Requests
                </h1>
                <p className="text-gray-600">Manage your requests and review offers</p>
              </div>
            </div>

            <Link to={createPageUrl('PostConsultationRequest')}>
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-xl">
                <Plus className="w-5 h-5 mr-2" />
                New Request
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { value: 'all', label: 'All Requests' },
              { value: 'open', label: 'Open' },
              { value: 'reviewing_offers', label: 'Reviewing Offers' },
              { value: 'consultant_selected', label: 'Consultant Selected' },
              { value: 'completed', label: 'Completed' }
            ].map(filter => (
              <Button
                key={filter.value}
                onClick={() => setFilterStatus(filter.value)}
                variant={filterStatus === filter.value ? 'default' : 'outline'}
                size="sm"
                className={filterStatus === filter.value 
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-lg whitespace-nowrap'
                  : 'border-2 border-purple-300 hover:bg-purple-50 whitespace-nowrap'
                }
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </motion.div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <Card className="border-4 border-dashed border-purple-300">
            <CardContent className="p-16 text-center">
              <Briefcase className="w-20 h-20 text-purple-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">No Requests Yet</h3>
              <p className="text-gray-500 mb-6">Post your first consultation request to get started!</p>
              <Link to={createPageUrl('PostConsultationRequest')}>
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl px-8 py-6 text-lg">
                  <Plus className="w-5 h-5 mr-2" />
                  Post Your First Request
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request, idx) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ x: 5, scale: 1.01 }}
              >
                <Card className="border-4 border-purple-300 hover:border-purple-500 shadow-xl hover:shadow-2xl transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{request.title}</h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge className={`${statusColors[request.status]} border-2`}>
                            {request.status.replace('_', ' ')}
                          </Badge>
                          <Badge className={urgencyColors[request.urgency]}>
                            {request.urgency}
                          </Badge>
                          <Badge className="bg-purple-100 text-purple-800">
                            {request.category.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {request.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4 text-gray-600">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {request.view_count || 0} views
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          {request.offer_count || 0} offers
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Posted {new Date(request.created_date).toLocaleDateString()}
                      </p>
                    </div>

                    <Link to={createPageUrl(`ClientRequestDetail?requestId=${request.id}`)}>
                      <Button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg">
                        View Details & Offers
                      </Button>
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