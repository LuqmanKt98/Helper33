import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Users,
  MessageCircle,
  Trophy
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function FriendsList({ friends }) {
  if (friends.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="p-12 text-center">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Friends Yet
          </h3>
          <p className="text-gray-600">
            Search above to find and connect with other DobryLife users!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-purple-600" />
          My Friends ({friends.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          {friends.map((friend, idx) => (
            <motion.div
              key={friend.email}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-gradient-to-br from-white to-purple-50 border-2 border-purple-200 hover:shadow-lg transition-all">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {friend.avatar ? (
                        <img src={friend.avatar} alt={friend.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        friend.name?.charAt(0) || 'U'
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{friend.name}</h4>
                      <p className="text-xs text-gray-600">{friend.email}</p>
                      {friend.since && (
                        <p className="text-xs text-gray-500 mt-1">
                          Friends since {format(new Date(friend.since), 'MMM yyyy')}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link to={createPageUrl('UserProfile') + `?user=${friend.email}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Trophy className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                    </Link>
                    <Link to={createPageUrl('Messages') + `?user=${friend.email}`} className="flex-1">
                      <Button size="sm" className="w-full bg-purple-600">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}