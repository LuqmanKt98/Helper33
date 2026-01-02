
import React, { useState, useEffect } from 'react';
import { FamilyUpdate } from '@/entities/all';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  Heart,
  PartyPopper,
  HandHeart,
  Coffee,
  Users,
  Clock,
  RefreshCw,
  MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FamilyActivityFeed() {
  const [updates, setUpdates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadActivityFeed();
  }, []);

  const loadActivityFeed = async () => {
    setIsLoading(true);
    try {
      // Load recent family updates
      const allUpdates = await FamilyUpdate.list('-created_date', 20);
      setUpdates(allUpdates);
    } catch (error) {
      console.log("Error loading activity feed");
    }
    setIsLoading(false);
  };

  const getUpdateIcon = (updateType) => {
    const icons = {
      status: MessageSquare,
      achievement: PartyPopper,
      milestone: Heart,
      request_help: HandHeart,
      share_joy: Coffee
    };
    return icons[updateType] || MessageSquare;
  };

  const getMoodEmoji = (mood) => {
    const emojis = {
      celebrating: '🎉',
      grateful: '🙏',
      excited: '😄',
      peaceful: '😌',
      busy: '⚡',
      need_support: '🤗'
    };
    return emojis[mood] || '😊';
  };

  const getUpdateColor = (updateType) => {
    const colors = {
      status: 'bg-blue-100 text-blue-800',
      achievement: 'bg-yellow-100 text-yellow-800',
      milestone: 'bg-rose-100 text-rose-800',
      request_help: 'bg-purple-100 text-purple-800',
      share_joy: 'bg-green-100 text-green-800'
    };
    return colors[updateType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Community Activity Feed
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={loadActivityFeed}
            disabled={isLoading}
            className="bg-white/50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {updates.length > 0 ? (
              updates.map((update, index) => {
                const UpdateIcon = getUpdateIcon(update.update_type);
                return (
                  <motion.div
                    key={update.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 bg-white/60 rounded-lg border border-white/20 hover:bg-white/80 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        F
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-800">Family Update</span>
                          <Badge className={getUpdateColor(update.update_type)}>
                            <UpdateIcon className="w-3 h-3 mr-1" />
                            {update.update_type.replace('_', ' ')}
                          </Badge>
                          <span className="text-lg">{getMoodEmoji(update.mood)}</span>
                        </div>
                        <p className="text-gray-700 leading-relaxed mb-3">
                          {update.content}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(update.created_date).toLocaleString()}
                          </div>
                          {update.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {update.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">No Community Updates Yet</h3>
                <p className="text-gray-500 text-sm">
                  Connect with families and start sharing your family moments!
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
