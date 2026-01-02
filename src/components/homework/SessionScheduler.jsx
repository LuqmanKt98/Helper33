import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Calendar, Video, MapPin, Users, Plus, X, Loader2, Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';

export default function SessionScheduler({ group, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    session_title: '',
    description: '',
    scheduled_start: '',
    duration_minutes: 60,
    session_type: 'virtual',
    meeting_link: '',
    location: '',
    topics: [],
    materials: []
  });
  const [topicInput, setTopicInput] = useState('');

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const scheduleSessionMutation = useMutation({
    mutationFn: async (data) => {
      const startDate = new Date(data.scheduled_start);
      const endDate = new Date(startDate.getTime() + data.duration_minutes * 60000);

      return await base44.entities.StudySession.create({
        ...data,
        group_id: group.id,
        group_name: group.group_name,
        scheduled_end: endDate.toISOString(),
        organizer_email: user.email,
        organizer_name: user.full_name || user.email.split('@')[0],
        attendees: [{
          email: user.email,
          name: user.full_name || user.email.split('@')[0],
          rsvp_status: 'going',
          attended: false
        }],
        status: 'scheduled',
        questions_answered: 0,
        reminder_sent: false,
        is_recurring: false
      });
    },
    onSuccess: async (newSession) => {
      await base44.entities.StudyGroup.update(group.id, {
        total_sessions: (group.total_sessions || 0) + 1
      });
      
      queryClient.invalidateQueries({ queryKey: ['groupSessions'] });
      queryClient.invalidateQueries({ queryKey: ['myStudyGroups'] });
      toast.success('📅 Study session scheduled!');
      onClose();
    },
    onError: () => {
      toast.error('Failed to schedule session');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.session_title || !formData.scheduled_start) {
      toast.error('Please fill in required fields');
      return;
    }
    scheduleSessionMutation.mutate(formData);
  };

  const addTopic = () => {
    if (topicInput.trim()) {
      setFormData({
        ...formData,
        topics: [...formData.topics, topicInput.trim()]
      });
      setTopicInput('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-4 border-indigo-300"
      >
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 flex items-center justify-between z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Schedule Study Session</h2>
              <p className="text-indigo-100 text-sm">{group.group_name}</p>
            </div>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20 rounded-full"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Session Title */}
          <div>
            <Label htmlFor="title" className="text-sm font-bold text-gray-700">
              Session Title *
            </Label>
            <Input
              id="title"
              value={formData.session_title}
              onChange={(e) => setFormData({ ...formData, session_title: e.target.value })}
              placeholder="e.g., Chapter 5 Review, Exam Prep"
              className="mt-2 border-2 border-indigo-200"
              required
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-bold text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will you cover in this session?"
              rows={3}
              className="mt-2 border-2 border-indigo-200"
            />
          </div>

          {/* Date and Duration */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start-time" className="text-sm font-bold text-gray-700">
                Start Time *
              </Label>
              <Input
                id="start-time"
                type="datetime-local"
                value={formData.scheduled_start}
                onChange={(e) => setFormData({ ...formData, scheduled_start: e.target.value })}
                className="mt-2 border-2 border-indigo-200"
                required
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-sm font-bold text-gray-700">
                Duration (minutes)
              </Label>
              <select
                id="duration"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
                className="w-full p-2 border-2 border-indigo-200 rounded-lg mt-2 focus:border-indigo-400 focus:outline-none"
              >
                <option value={30}>30 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
              </select>
            </div>
          </div>

          {/* Session Type */}
          <div>
            <Label className="text-sm font-bold text-gray-700 mb-3 block">
              Session Type
            </Label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'virtual', label: 'Virtual', icon: Video, color: 'from-blue-500 to-indigo-500' },
                { value: 'in_person', label: 'In Person', icon: MapPin, color: 'from-green-500 to-emerald-500' },
                { value: 'hybrid', label: 'Hybrid', icon: Users, color: 'from-purple-500 to-pink-500' }
              ].map((type) => (
                <motion.button
                  key={type.value}
                  type="button"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFormData({ ...formData, session_type: type.value })}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    formData.session_type === type.value
                      ? `bg-gradient-to-br ${type.color} text-white border-white shadow-xl`
                      : 'bg-white border-gray-200 hover:border-indigo-400'
                  }`}
                >
                  <type.icon className={`w-5 h-5 mx-auto mb-1 ${formData.session_type === type.value ? 'text-white' : 'text-gray-600'}`} />
                  <p className={`text-xs font-semibold ${formData.session_type === type.value ? 'text-white' : 'text-gray-700'}`}>
                    {type.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Meeting Link or Location */}
          {formData.session_type === 'virtual' || formData.session_type === 'hybrid' ? (
            <div>
              <Label htmlFor="meeting-link" className="text-sm font-bold text-gray-700">
                Meeting Link
              </Label>
              <div className="relative mt-2">
                <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="meeting-link"
                  value={formData.meeting_link}
                  onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                  placeholder="https://zoom.us/j/..."
                  className="pl-10 border-2 border-indigo-200"
                />
              </div>
            </div>
          ) : null}

          {formData.session_type === 'in_person' || formData.session_type === 'hybrid' ? (
            <div>
              <Label htmlFor="location" className="text-sm font-bold text-gray-700">
                Location
              </Label>
              <div className="relative mt-2">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Library Room 204"
                  className="pl-10 border-2 border-indigo-200"
                />
              </div>
            </div>
          ) : null}

          {/* Topics */}
          <div>
            <Label className="text-sm font-bold text-gray-700 mb-2 block">
              Topics to Cover
            </Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                placeholder="Add a topic..."
                className="flex-1 border-2 border-indigo-200"
              />
              <Button
                type="button"
                onClick={addTopic}
                variant="outline"
                className="border-2 border-indigo-300"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.topics.map((topic, idx) => (
                <Badge
                  key={idx}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white cursor-pointer hover:opacity-80"
                  onClick={() => setFormData({
                    ...formData,
                    topics: formData.topics.filter((_, i) => i !== idx)
                  })}
                >
                  {topic}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-2 border-gray-300 touch-manipulation"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={scheduleSessionMutation.isPending}
              className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white touch-manipulation"
            >
              {scheduleSessionMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Scheduling...
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Session
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}