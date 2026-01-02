import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { 
  Loader2, Sparkles, CalendarDays, Save, Copy, Download, 
  Instagram, Facebook, Twitter, Youtube, Linkedin, MessageSquare,
  Edit, ChevronLeft, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { base44 } from '@/api/base44Client';

const PLATFORMS = {
  Instagram: { icon: Instagram, color: 'from-pink-500 to-purple-600' },
  Facebook: { icon: Facebook, color: 'from-blue-500 to-blue-700' },
  TikTok: { icon: MessageSquare, color: 'from-black to-gray-700' },
  YouTube: { icon: Youtube, color: 'from-red-500 to-red-700' },
  Twitter: { icon: Twitter, color: 'from-sky-400 to-blue-600' },
  LinkedIn: { icon: Linkedin, color: 'from-blue-600 to-blue-800' }
};

const NICHES = [
  { value: 'wellness', label: 'Wellness & Mental Health', emoji: '🧘' },
  { value: 'lifestyle', label: 'Lifestyle & Personal Growth', emoji: '✨' },
  { value: 'family', label: 'Family & Parenting', emoji: '👨‍👩‍👧‍👦' },
  { value: 'fitness', label: 'Fitness & Health', emoji: '💪' },
  { value: 'business', label: 'Business & Productivity', emoji: '💼' },
  { value: 'food', label: 'Food & Nutrition', emoji: '🍽️' },
  { value: 'travel', label: 'Travel & Adventure', emoji: '✈️' },
  { value: 'fashion', label: 'Fashion & Beauty', emoji: '👗' },
  { value: 'tech', label: 'Technology & Innovation', emoji: '💻' },
  { value: 'education', label: 'Education & Learning', emoji: '📚' }
];

export default function ContentCalendarSection({ trends, queryClient }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [generatedCalendar, setGeneratedCalendar] = useState(null);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [editingDay, setEditingDay] = useState(null);
  
  const [formData, setFormData] = useState({
    niche: 'wellness',
    posting_frequency: 'daily',
    platforms: ['Instagram'],
    tone: 'friendly',
    goals: '',
    additional_context: ''
  });

  const handleGenerateCalendar = async () => {
    setIsGenerating(true);
    try {
      const trendContext = trends.slice(0, 5).map(t => `${t.trend_name}: ${t.description}`).join('\n');
      const selectedNiche = NICHES.find(n => n.value === formData.niche);
      
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a comprehensive 30-day content calendar for social media.

BRAND DETAILS:
- Niche: ${selectedNiche.label}
- Posting Frequency: ${formData.posting_frequency}
- Target Platforms: ${formData.platforms.join(', ')}
- Content Tone: ${formData.tone}
- Goals: ${formData.goals || 'Build engagement and grow following'}
- Additional Context: ${formData.additional_context || 'Focus on value-driven content'}

CURRENT TRENDS TO CONSIDER:
${trendContext || 'Focus on evergreen content'}

For each day (30 days), provide:
1. Day number (1-30)
2. Theme/Topic (aligned with niche)
3. Post Type (e.g., carousel, reel, story, poll, tutorial, quote, behind-the-scenes)
4. Content Idea (specific, actionable content description)
5. Caption suggestion (engaging, platform-appropriate, 100-150 words)
6. Best Platform (from selected platforms)
7. Best Posting Time (specific time like "9:00 AM", "1:00 PM")
8. Hashtags (5-10 relevant hashtags as array)
9. Call-to-Action (specific CTA)
10. Content Series (if part of a series, specify which)

Create a balanced mix of:
- Educational content (40%)
- Entertaining/Engaging content (30%)
- Promotional/Sales content (20%)
- Community-building content (10%)

Consider content series that span multiple days (e.g., "Monday Motivation" series, "Tips Tuesday", etc.)
Ensure variety in post types and themes throughout the month.
Align with current trends when relevant.`,
        response_json_schema: {
          type: "object",
          properties: {
            calendar_summary: { type: "string" },
            content_strategy_notes: { type: "string" },
            weekly_themes: { type: "array", items: { type: "string" } },
            calendar_days: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  date: { type: "string" },
                  theme: { type: "string" },
                  post_type: { type: "string" },
                  content_idea: { type: "string" },
                  caption: { type: "string" },
                  platform: { type: "string" },
                  best_time: { type: "string" },
                  hashtags: { type: "array", items: { type: "string" } },
                  cta: { type: "string" },
                  content_series: { type: "string" }
                }
              }
            }
          }
        }
      });

      // Add dates to each day
      const today = new Date();
      const calendarWithDates = response.calendar_days.map((day, idx) => {
        const date = new Date(today);
        date.setDate(today.getDate() + idx);
        return {
          ...day,
          date: date.toISOString().split('T')[0],
          day_name: date.toLocaleDateString('en-US', { weekday: 'short' })
        };
      });

      setGeneratedCalendar({
        ...response,
        calendar_days: calendarWithDates,
        generated_at: new Date().toISOString(),
        niche: formData.niche,
        platforms: formData.platforms
      });
      
      setShowForm(false);
      toast.success('Content calendar generated! 🎉');
    } catch (error) {
      console.error('Error generating calendar:', error);
      toast.error('Failed to generate calendar');
    } finally {
      setIsGenerating(false);
    }
  };

  const saveAllToSchedule = async () => {
    if (!generatedCalendar) return;
    
    try {
      const posts = generatedCalendar.calendar_days.map(day => ({
        platform: day.platform,
        content: `${day.caption}\n\n${day.hashtags.map(h => `#${h}`).join(' ')}`,
        post_at: `${day.date}T${day.best_time}`,
        status: 'scheduled',
        ai_generated: true,
        content_theme: day.theme,
        post_type: day.post_type
      }));

      await base44.entities.ScheduledPost.bulkCreate(posts);
      queryClient.invalidateQueries(['scheduledPosts']);
      toast.success(`Saved all ${posts.length} posts to schedule! 🎉`);
    } catch (error) {
      console.error('Error saving calendar:', error);
      toast.error('Failed to save calendar');
    }
  };

  const saveSinglePost = async (day) => {
    try {
      await base44.entities.ScheduledPost.create({
        platform: day.platform,
        content: `${day.caption}\n\n${day.hashtags.map(h => `#${h}`).join(' ')}`,
        post_at: `${day.date}T${day.best_time}`,
        status: 'scheduled',
        ai_generated: true,
        content_theme: day.theme,
        post_type: day.post_type
      });
      
      queryClient.invalidateQueries(['scheduledPosts']);
      toast.success('Post saved to schedule!');
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    }
  };

  const updateDay = (dayIndex, updates) => {
    setGeneratedCalendar(prev => ({
      ...prev,
      calendar_days: prev.calendar_days.map((day, idx) => 
        idx === dayIndex ? { ...day, ...updates } : day
      )
    }));
    setEditingDay(null);
    toast.success('Updated!');
  };

  const exportCalendar = () => {
    if (!generatedCalendar) return;
    
    const csvContent = [
      ['Day', 'Date', 'Theme', 'Type', 'Platform', 'Time', 'Content', 'Hashtags', 'CTA'].join(','),
      ...generatedCalendar.calendar_days.map(day => 
        [
          day.day,
          day.date,
          day.theme,
          day.post_type,
          day.platform,
          day.best_time,
          `"${day.content_idea}"`,
          `"${day.hashtags.join(' ')}"`,
          `"${day.cta}"`
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-calendar-${formData.niche}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Calendar exported! 📥');
  };

  if (showForm || !generatedCalendar) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <CalendarDays className="w-7 h-7 text-purple-600" />
              </motion.div>
              AI Content Calendar Generator
            </CardTitle>
            <CardDescription>
              Generate a complete 30-day content strategy tailored to your niche and goals
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Niche Selection */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Select Your Niche *</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {NICHES.map((niche) => (
                  <motion.button
                    key={niche.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFormData({ ...formData, niche: niche.value })}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      formData.niche === niche.value
                        ? 'border-purple-500 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <div className="text-3xl mb-2">{niche.emoji}</div>
                    <div className="font-semibold text-sm text-gray-800">{niche.label}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Platforms */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Target Platforms *</Label>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {Object.entries(PLATFORMS).map(([platform, data]) => {
                  const Icon = data.icon;
                  const isSelected = formData.platforms.includes(platform);
                  return (
                    <motion.button
                      key={platform}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          platforms: isSelected
                            ? prev.platforms.filter(p => p !== platform)
                            : [...prev.platforms, platform]
                        }));
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300 bg-white'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? 'text-purple-600' : 'text-gray-600'}`} />
                      <div className="text-xs font-medium text-gray-700">{platform}</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Posting Frequency */}
              <div>
                <Label>Posting Frequency</Label>
                <Select value={formData.posting_frequency} onValueChange={(val) => setFormData({ ...formData, posting_frequency: val })}>
                  <SelectTrigger className="border-2 border-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily (30 posts)</SelectItem>
                    <SelectItem value="5_per_week">5 per week (20 posts)</SelectItem>
                    <SelectItem value="3_per_week">3 per week (12 posts)</SelectItem>
                    <SelectItem value="2_per_week">2 per week (8 posts)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Content Tone */}
              <div>
                <Label>Content Tone</Label>
                <Select value={formData.tone} onValueChange={(val) => setFormData({ ...formData, tone: val })}>
                  <SelectTrigger className="border-2 border-purple-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="friendly">Friendly & Conversational</SelectItem>
                    <SelectItem value="professional">Professional & Authoritative</SelectItem>
                    <SelectItem value="inspirational">Inspirational & Motivational</SelectItem>
                    <SelectItem value="educational">Educational & Informative</SelectItem>
                    <SelectItem value="humorous">Humorous & Entertaining</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Goals */}
            <div>
              <Label>Content Goals (Optional)</Label>
              <Textarea
                value={formData.goals}
                onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                placeholder="e.g., Build community, drive sales, increase brand awareness, educate audience..."
                rows={2}
                className="border-2 border-purple-200"
              />
            </div>

            {/* Additional Context */}
            <div>
              <Label>Additional Context (Optional)</Label>
              <Textarea
                value={formData.additional_context}
                onChange={(e) => setFormData({ ...formData, additional_context: e.target.value })}
                placeholder="e.g., Launching a new product in week 3, avoid controversial topics, focus on sustainability..."
                rows={3}
                className="border-2 border-purple-200"
              />
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleGenerateCalendar}
                disabled={isGenerating || formData.platforms.length === 0}
                className="w-full h-14 text-lg bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Generating Your Calendar...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate 30-Day Calendar
                  </>
                )}
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Calendar View
  const weeksInMonth = 4;
  const daysPerWeek = 7;
  const weekDays = generatedCalendar.calendar_days.slice(currentWeek * daysPerWeek, (currentWeek + 1) * daysPerWeek);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <Card className="bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 border-2 border-purple-300 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-purple-900 mb-2">
                Your {NICHES.find(n => n.value === generatedCalendar.niche)?.label} Content Calendar
              </h3>
              <p className="text-purple-700 text-sm">{generatedCalendar.calendar_summary}</p>
            </div>
            <Button onClick={() => setShowForm(true)} variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              New Calendar
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {generatedCalendar.platforms.map(platform => {
              const Icon = PLATFORMS[platform].icon;
              return (
                <Badge key={platform} className="bg-white/70 text-purple-800 px-3 py-1">
                  <Icon className="w-4 h-4 mr-1" />
                  {platform}
                </Badge>
              );
            })}
            <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">
              {generatedCalendar.calendar_days.length} Posts
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button onClick={saveAllToSchedule} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Save All to Schedule
            </Button>
            <Button onClick={exportCalendar} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Week Navigator */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => setCurrentWeek(Math.max(0, currentWeek - 1))}
          disabled={currentWeek === 0}
          variant="outline"
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous Week
        </Button>
        <div className="text-center">
          <p className="font-bold text-lg text-purple-900">Week {currentWeek + 1} of {weeksInMonth}</p>
          <p className="text-sm text-gray-600">
            {weekDays[0]?.date} - {weekDays[weekDays.length - 1]?.date}
          </p>
        </div>
        <Button
          onClick={() => setCurrentWeek(Math.min(weeksInMonth - 1, currentWeek + 1))}
          disabled={currentWeek === weeksInMonth - 1}
          variant="outline"
        >
          Next Week
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weekDays.map((day, idx) => {
          const Icon = PLATFORMS[day.platform]?.icon || MessageSquare;
          const isEditing = editingDay === currentWeek * daysPerWeek + idx;
          
          return (
            <motion.div
              key={day.day}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-purple-200 hover:shadow-xl transition-all h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-purple-100 text-purple-700">Day {day.day}</Badge>
                        <span className="text-sm font-semibold text-gray-700">{day.day_name}</span>
                      </div>
                      <p className="text-xs text-gray-500">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${PLATFORMS[day.platform].color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs font-semibold text-purple-600 mb-1">{day.theme}</p>
                    <Badge variant="outline" className="text-xs">{day.post_type}</Badge>
                    {day.content_series && (
                      <Badge className="bg-blue-100 text-blue-700 text-xs ml-1">{day.content_series}</Badge>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-gray-700 font-medium mb-1">{day.content_idea}</p>
                    <p className="text-xs text-gray-600 line-clamp-3">{day.caption}</p>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {day.hashtags.slice(0, 4).map((tag, i) => (
                      <span key={i} className="text-xs text-blue-600">#{tag}</span>
                    ))}
                    {day.hashtags.length > 4 && (
                      <span className="text-xs text-gray-400">+{day.hashtags.length - 4}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>📅 {day.best_time}</span>
                    <span className="font-semibold text-purple-600">{day.cta}</span>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => saveSinglePost(day)}
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-xs"
                    >
                      <Save className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      onClick={() => {
                        const fullCaption = `${day.caption}\n\n${day.hashtags.map(h => `#${h}`).join(' ')}`;
                        navigator.clipboard.writeText(fullCaption);
                        toast.success('Copied!');
                      }}
                      size="sm"
                      variant="outline"
                      className="text-xs"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}