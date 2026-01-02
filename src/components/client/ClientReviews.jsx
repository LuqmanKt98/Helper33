import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ClientReviews({ reviews, user }) {
  return (
    <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-amber-500" />
          My Reviews
        </CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review, idx) => (
              <ReviewCard key={review.id} review={review} index={idx} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Star className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">You haven't left any reviews yet</p>
            <Link to={createPageUrl('FindPractitioners')}>
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
                Find Practitioners
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewCard({ review, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
    >
      <Card className="border-2 border-purple-200 hover:shadow-md transition-all">
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h4 className="font-bold text-gray-800">{review.practitioner_name}</h4>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <Star
                    key={n}
                    className={`w-4 h-4 ${n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            {review.verified_client && (
              <Badge className="bg-green-100 text-green-700 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>

          {review.review_text && (
            <p className="text-sm text-gray-700 leading-relaxed mb-2">{review.review_text}</p>
          )}

          <p className="text-xs text-gray-500 mb-3">
            Posted on {new Date(review.created_date).toLocaleDateString()}
          </p>

          {review.practitioner_response && (
            <div className="mt-3 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                Practitioner Response:
              </p>
              <p className="text-sm text-gray-700">{review.practitioner_response}</p>
              <p className="text-xs text-gray-500 mt-1">
                {new Date(review.response_date).toLocaleDateString()}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}