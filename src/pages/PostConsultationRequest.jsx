import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import {
  Send,
  Sparkles,
  DollarSign,
  Clock,
  Calendar,
  Zap,
  Loader2,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { createPageUrl } from '@/utils';
import { useNavigate } from 'react-router-dom';
import { 
  sanitizeText, 
  checkRateLimit,
  getCSRFToken
} from '@/components/security/SecureInput';

export default function PostConsultationRequest() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    urgency: 'medium',
    budget_range: { min: '', max: '', flexible: false },
    required_expertise: [],
    timeline: '',
    preferred_duration_minutes: 60,
    preferred_meeting_type: 'virtual'
  });
  const [newExpertise, setNewExpertise] = useState('');
  const [csrfToken] = useState(() => getCSRFToken());

  useEffect(() => {
    getCSRFToken();
  }, []);

  const { data: user } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me()
  });

  const createRequestMutation = useMutation({
    mutationFn: async (data) => {
      const rateLimitCheck = checkRateLimit('consultation_request', 5, 3600000);
      if (!rateLimitCheck.allowed) {
        throw new Error(`Too many requests. Please wait ${Math.ceil(rateLimitCheck.retryAfter / 60000)} minutes before posting another request.`);
      }

      const finalRequestData = {
        ...data,
        client_avatar: user?.avatar_url,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      return await base44.entities.ClientRequest.create(finalRequestData);
    },
    onSuccess: async (newRequest) => {
      toast.success('🎉 Request posted successfully!');
      
      try {
        await base44.integrations.Core.SendEmail({
          to: 'contact@dobrylife.com',
          subject: '📢 New Consultation Request Posted',
          body: `
A new consultation request has been posted!

Title: ${sanitizeText(formData.title)}
Category: ${formData.category}
Urgency: ${formData.urgency}
Budget: $${formData.budget_range.min}-$${formData.budget_range.max}/hr
Posted by: ${user?.email}

Request ID: ${newRequest.id}
          `
        });
      } catch (emailError) {
        console.error('Failed to send notification email:', emailError);
        toast.warning('Email notification failed, but your request was posted!');
      }

      setTimeout(() => {
        navigate(createPageUrl('MyConsultationRequests'));
      }, 1500);
    },
    onError: (error) => {
      console.error('Request creation error:', error);
      toast.error(error.message || 'Failed to post request. Please try again.');
    }
  });

  const addExpertise = () => {
    const sanitized = sanitizeText(newExpertise);
    
    if (!sanitized) {
      toast.error('Please enter a valid expertise area');
      return;
    }

    if (sanitized.length > 50) {
      toast.error('Expertise area too long (max 50 characters)');
      return;
    }

    if (formData.required_expertise.length >= 10) {
      toast.error('Maximum 10 expertise areas allowed');
      return;
    }

    if (formData.required_expertise.includes(sanitized)) {
      toast.error('This expertise is already added');
      return;
    }

    setFormData(prev => ({
      ...prev,
      required_expertise: [...prev.required_expertise, sanitized]
    }));
    setNewExpertise('');
  };

  const removeExpertise = (index) => {
    setFormData(prev => ({
      ...prev,
      required_expertise: prev.required_expertise.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    const sanitizedTitle = sanitizeText(formData.title);
    const sanitizedDescription = sanitizeText(formData.description);
    const sanitizedTimeline = sanitizeText(formData.timeline);

    if (!sanitizedTitle || sanitizedTitle.length < 10) {
      toast.error('Please provide a title (minimum 10 characters)');
      return;
    }

    if (sanitizedTitle.length > 200) {
      toast.error('Title too long (maximum 200 characters)');
      return;
    }

    if (!sanitizedDescription || sanitizedDescription.length < 50) {
      toast.error('Please provide a detailed description (minimum 50 characters)');
      return;
    }

    if (sanitizedDescription.length > 5000) {
      toast.error('Description too long (maximum 5000 characters)');
      return;
    }

    if (!formData.category) {
      toast.error('Please select a category');
      return;
    }

    const minBudget = parseFloat(formData.budget_range.min);
    const maxBudget = parseFloat(formData.budget_range.max);

    if (isNaN(minBudget) || isNaN(maxBudget) || minBudget <= 0 || maxBudget <= 0) {
      toast.error('Please set a valid budget range (numbers greater than 0)');
      return;
    }

    if (minBudget > maxBudget) {
      toast.error('Minimum budget cannot be greater than maximum budget');
      return;
    }

    if (maxBudget > 10000) {
      toast.error('Budget seems unreasonably high. Please contact support for high-value projects.');
      return;
    }

    if (!sanitizedTimeline) {
      toast.error('Please specify when you need the consultation');
      return;
    }

    const submitData = {
      title: sanitizedTitle,
      description: sanitizedDescription,
      category: formData.category,
      urgency: formData.urgency,
      budget_range: {
        min: minBudget,
        max: maxBudget,
        flexible: formData.budget_range.flexible
      },
      required_expertise: formData.required_expertise.map(e => sanitizeText(e)),
      timeline: sanitizedTimeline,
      preferred_duration_minutes: parseInt(formData.preferred_duration_minutes) || 60,
      preferred_meeting_type: formData.preferred_meeting_type,
      client_name: user?.full_name || user?.email,
      client_email: user?.email,
      status: 'open',
      view_count: 0,
      offer_count: 0
    };

    createRequestMutation.mutate(submitData);
  };

  const categories = [
    { value: 'AI_Strategy', label: '🤖 AI Strategy', color: 'purple' },
    { value: 'Business_Development', label: '💼 Business Development', color: 'blue' },
    { value: 'Mental_Health', label: '🧠 Mental Health', color: 'pink' },
    { value: 'Wellness_Coaching', label: '🌸 Wellness Coaching', color: 'green' },
    { value: 'Career_Coaching', label: '🚀 Career Coaching', color: 'amber' },
    { value: 'Life_Coaching', label: '⭐ Life Coaching', color: 'indigo' },
    { value: 'Grief_Support', label: '💜 Grief Support', color: 'violet' },
    { value: 'Technology', label: '💻 Technology', color: 'cyan' },
    { value: 'Marketing', label: '📢 Marketing', color: 'orange' },
    { value: 'Finance', label: '💰 Finance', color: 'emerald' },
    { value: 'Legal', label: '⚖️ Legal', color: 'slate' },
    { value: 'Other', label: '🔧 Other', color: 'gray' }
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low', color: 'bg-blue-100 text-blue-800', icon: '🕐' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-800', icon: '⏰' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800', icon: '🔥' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 animate-pulse', icon: '⚡' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            animate={{ 
              rotate: [0, 360],
              scale: [1, 1.15, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-blue-600 flex items-center justify-center mx-auto mb-4 shadow-2xl"
          >
            <Send className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-3">
            📢 Post Consultation Request
          </h1>
          <p className="text-gray-600 text-lg">
            Describe your needs and let expert consultants come to you
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-4 border-purple-400 shadow-2xl bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <CardTitle className="text-2xl flex items-center gap-2">
                <Sparkles className="w-6 h-6" />
                Tell Us What You Need
              </CardTitle>
              <CardDescription className="text-white/90">
                Fill out this form and get matched with expert consultants
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Request Title *
                </label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Need AI Strategy for Healthcare Startup"
                  className="border-2 border-purple-300 focus:border-purple-500 text-base"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Detailed Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your situation, what you're trying to achieve, and what kind of help you need..."
                  className="h-32 border-2 border-purple-300 focus:border-purple-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length} characters
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => (
                    <motion.button
                      key={cat.value}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData(prev => ({ ...prev, category: cat.value }))}
                      className={`p-3 rounded-xl font-semibold text-sm border-2 transition-all ${
                        formData.category === cat.value
                          ? `bg-${cat.color}-600 border-${cat.color}-700 text-white shadow-lg`
                          : `bg-white border-${cat.color}-300 text-gray-700 hover:border-${cat.color}-500`
                      }`}
                    >
                      {cat.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Urgency */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Urgency Level
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {urgencyLevels.map((level) => (
                    <motion.button
                      key={level.value}
                      type="button"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setFormData(prev => ({ ...prev, urgency: level.value }))}
                      className={`p-3 rounded-xl font-semibold text-sm ${
                        formData.urgency === level.value
                          ? level.color.replace('100', '600') + ' shadow-lg'
                          : level.color + ' border-2 border-gray-200'
                      }`}
                    >
                      {level.icon} {level.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Budget Range (per hour)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Minimum</label>
                    <Input
                      type="number"
                      value={formData.budget_range.min}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        budget_range: { ...prev.budget_range, min: e.target.value }
                      }))}
                      placeholder="50"
                      className="border-2 border-green-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 mb-1 block">Maximum</label>
                    <Input
                      type="number"
                      value={formData.budget_range.max}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        budget_range: { ...prev.budget_range, max: e.target.value }
                      }))}
                      placeholder="200"
                      className="border-2 border-green-300"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 mt-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.budget_range.flexible}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      budget_range: { ...prev.budget_range, flexible: e.target.checked }
                    }))}
                    className="rounded"
                  />
                  <span className="text-gray-700">Budget is flexible</span>
                </label>
              </div>

              {/* Required Expertise */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Required Expertise (Optional)
                </label>
                <div className="flex gap-2 mb-3">
                  <Input
                    value={newExpertise}
                    onChange={(e) => setNewExpertise(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addExpertise())}
                    placeholder="e.g., AI Implementation, Change Management"
                    className="flex-1 border-2 border-purple-300"
                  />
                  <Button
                    onClick={addExpertise}
                    type="button"
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.required_expertise.map((skill, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <Badge className="bg-purple-100 text-purple-800 border-2 border-purple-300 px-3 py-2">
                        {skill}
                        <button
                          onClick={() => removeExpertise(idx)}
                          className="ml-2 hover:text-red-600"
                          type="button"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Timeline / When Do You Need This?
                </label>
                <Input
                  value={formData.timeline}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeline: e.target.value }))}
                  placeholder="e.g., Within the next 2 weeks, ASAP, Flexible"
                  className="border-2 border-blue-300"
                />
              </div>

              {/* Duration & Meeting Type */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Session Duration
                  </label>
                  <select
                    value={formData.preferred_duration_minutes}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferred_duration_minutes: parseInt(e.target.value) }))}
                    className="w-full p-3 border-2 border-purple-300 rounded-lg"
                  >
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Meeting Type
                  </label>
                  <select
                    value={formData.preferred_meeting_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, preferred_meeting_type: e.target.value }))}
                    className="w-full p-3 border-2 border-purple-300 rounded-lg"
                  >
                    <option value="virtual">💻 Virtual (Zoom, etc.)</option>
                    <option value="phone">📞 Phone Call</option>
                    <option value="in_person">🤝 In Person</option>
                    <option value="flexible">🔄 Flexible</option>
                  </select>
                </div>
              </div>

              {/* Preview Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-300">
                <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Request Preview
                </h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Title:</strong> {formData.title || '—'}</p>
                  <p><strong>Category:</strong> {categories.find(c => c.value === formData.category)?.label || '—'}</p>
                  <p><strong>Urgency:</strong> {urgencyLevels.find(u => u.value === formData.urgency)?.label || '—'}</p>
                  <p><strong>Budget:</strong> ${formData.budget_range.min || '?'} - ${formData.budget_range.max || '?'}/hr {formData.budget_range.flexible && '(flexible)'}</p>
                  <p><strong>Duration:</strong> {formData.preferred_duration_minutes} minutes</p>
                  <p><strong>Type:</strong> {formData.preferred_meeting_type}</p>
                </div>
              </div>

              {/* Submit Button */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={handleSubmit}
                  disabled={createRequestMutation.isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white shadow-2xl py-8 text-xl font-bold"
                >
                  {createRequestMutation.isLoading ? (
                    <>
                      <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                      Posting Request...
                    </>
                  ) : (
                    <>
                      <Send className="w-6 h-6 mr-2" />
                      Post Request & Get Matched
                      <Zap className="w-6 h-6 ml-2" />
                    </>
                  )}
                </Button>
              </motion.div>

              <p className="text-xs text-center text-gray-500">
                💡 Your request will be visible to verified consultants. Expect offers within 24-48 hours.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="border-4 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-600" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { icon: Send, title: '1. Post Your Need', desc: 'Describe what you need help with in detail' },
                  { icon: Zap, title: '2. Get AI Matches', desc: 'Our AI finds the best consultant matches for you' },
                  { icon: CheckCircle, title: '3. Choose & Book', desc: 'Review offers and book with your top choice' }
                ].map((step, idx) => {
                  const Icon = step.icon;
                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      whileHover={{ y: -5, scale: 1.05 }}
                      className="bg-white p-5 rounded-xl border-2 border-blue-200 shadow-md text-center"
                    >
                      <Icon className="w-10 h-10 text-blue-600 mx-auto mb-3" />
                      <h4 className="font-bold text-gray-900 mb-2">{step.title}</h4>
                      <p className="text-sm text-gray-600">{step.desc}</p>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-4xl mx-auto mt-6 text-center"
      >
        <p className="text-xs text-gray-500">
          🔒 Your request is reviewed before being published • All data is encrypted and secure
        </p>
      </motion.div>
    </div>
  );
}