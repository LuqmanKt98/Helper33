import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Star, User } from 'lucide-react';

export default function ReviewList({ reviews }) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No reviews yet. Be the first to leave one!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="bg-white/60 backdrop-blur-sm border-0">
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User className="w-6 h-6 text-gray-500"/>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center">
                    <h4 className="font-semibold">{review.client_name}</h4>
                    <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-400' : 'text-gray-300'}`}/>
                        ))}
                    </div>
                </div>
                <p className="text-sm text-gray-500 mb-2">{new Date(review.created_date).toLocaleDateString()}</p>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}