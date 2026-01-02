import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, MapPin, Star, Clock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function CaregiverCard({ caregiver }) {
  const { data: reviews = [] } = useQuery({
    queryKey: ['caregiverReviews', caregiver.id],
    queryFn: async () => {
      const data = await base44.entities.Review.filter({ caregiver_id: caregiver.id });
      return data || [];
    }
  });

  const averageRating = reviews.length > 0
    ? (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  const getBackgroundCheckBadge = () => {
    if (caregiver.status === 'pending_admin_review') {
      return (
        <Badge className="bg-blue-100 text-blue-800 text-xs">
          <Clock className="w-3 h-3 mr-1" />
          Under Review
        </Badge>
      );
    }
    
    if (caregiver.background_check_status === 'passed' && caregiver.is_background_checked) {
      return (
        <Badge className="bg-green-100 text-green-800 text-xs">
          <ShieldCheck className="w-3 h-3 mr-1" />
          Background Checked
        </Badge>
      );
    }
    
    if (caregiver.background_check_status === 'pending') {
      return (
        <Badge className="bg-amber-100 text-amber-800 text-xs">
          <Clock className="w-3 h-3 mr-1" />
          Check Pending
        </Badge>
      );
    }

    return null;
  };

  return (
    <Link to={createPageUrl(`CaregiverProfileDetail?id=${caregiver.id}`)}>
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-2 border-cyan-300 hover:border-cyan-500 hover:shadow-2xl transition-all h-full flex flex-col cursor-pointer">
          <CardContent className="p-6 flex-grow">
            <div className="flex items-start gap-4">
              {caregiver.profile_picture_url ? (
                <img 
                  src={caregiver.profile_picture_url} 
                  alt={caregiver.full_name} 
                  className="w-20 h-20 rounded-full object-cover border-4 border-cyan-300 shadow-lg" 
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 flex items-center justify-center border-4 border-cyan-300 shadow-lg">
                  <User className="w-10 h-10 text-white" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">{caregiver.full_name}</h3>
                  {caregiver.hourly_rate && (
                    <span className="text-lg font-semibold text-emerald-600">${caregiver.hourly_rate}/hr</span>
                  )}
                </div>
                {caregiver.location && (
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                    <MapPin className="w-4 h-4" />
                    <span>{caregiver.location}</span>
                  </div>
                )}
                <div className="flex gap-2 mt-2 flex-wrap">
                  {caregiver.is_id_verified && (
                    <Badge className="bg-blue-100 text-blue-800 text-xs">
                      <ShieldCheck className="w-3 h-3 mr-1" />
                      ID Verified
                    </Badge>
                  )}
                  {getBackgroundCheckBadge()}
                </div>
              </div>
            </div>
            {caregiver.bio && (
              <p className="text-sm text-gray-600 mt-4 line-clamp-2">{caregiver.bio}</p>
            )}
            <div className="flex flex-wrap gap-2 mt-3">
              {caregiver.services?.map(service => (
                <Badge key={service} variant="secondary" className="capitalize bg-cyan-100 text-cyan-800 text-xs">
                  {service.replace('_', ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
          <div className="px-6 pb-6 flex justify-between items-center border-t-2 border-gray-100 pt-4">
            <div className="flex items-center gap-1">
              <Star className={`w-5 h-5 ${reviews.length > 0 ? 'text-yellow-500 fill-yellow-400' : 'text-gray-400'}`}/>
              <span className="font-bold text-gray-700">{averageRating}</span>
              <span className="text-sm text-gray-500">({reviews.length})</span>
            </div>
            <Button variant="outline" size="sm" className="border-2 border-cyan-300 hover:bg-cyan-50">
              View Profile
            </Button>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}