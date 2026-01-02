
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import {
  Baby, Droplet, Moon, Mail, Printer, AlertCircle, CheckCircle, BarChart3, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { format, parseISO, startOfDay, endOfDay, subDays, eachDayOfInterval } from 'date-fns';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import BabySelector from './BabySelector';

export default function BabyCareHistory({ babyName = 'Baby', birthDate, pregnancyData }) {
  const [timeRange, setTimeRange] = useState('7');
  const [selectedBaby, setSelectedBaby] = useState('all');
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const babies = useMemo(() => pregnancyData?.babies || [], [pregnancyData]);
  const isMultipleBirth = useMemo(() => pregnancyData?.is_multiple_birth && babies.length > 0, [pregnancyData, babies]);

  const startDate = subDays(new Date(), parseInt(timeRange));
  const endDate = new Date();

  // Fetch all logs for time range
  const { data: allFeedings = [] } = useQuery({
    queryKey: ['baby-feeds-history', timeRange],
    queryFn: () => base44.entities.BabyFeedLog.list('-start_time', 500)
  });

  const { data: allDiapers = [] } = useQuery({
    queryKey: ['baby-diapers-history', timeRange],
    queryFn: () => base44.entities.DiaperLog.list('-change_time', 500)
  });

  const { data: allSleep = [] } = useQuery({
    queryKey: ['baby-sleep-history', timeRange],
    queryFn: () => base44.entities.BabySleepLog.list('-sleep_start', 500)
  });

  // Filter by time range and selected baby
  const feedings = allFeedings.filter(f => {
    const feedDate = new Date(f.start_time);
    const inRange = feedDate >= startDate && feedDate <= endDate;
    const matchesBaby = selectedBaby === 'all' || f.baby_id === selectedBaby;
    return inRange && matchesBaby;
  });

  const diapers = allDiapers.filter(d => {
    const diaperDate = new Date(d.change_time);
    const inRange = diaperDate >= startDate && diaperDate <= endDate;
    const matchesBaby = selectedBaby === 'all' || d.baby_id === selectedBaby;
    return inRange && matchesBaby;
  });

  const sleepLogs = allSleep.filter(s => {
    const sleepDate = new Date(s.sleep_start);
    const inRange = sleepDate >= startDate && sleepDate <= endDate;
    const matchesBaby = selectedBaby === 'all' || s.baby_id === selectedBaby;
    return inRange && matchesBaby;
  });

  const currentBabyName = selectedBaby === 'all'
    ? (babies.length > 1 ? `All ${babies.length} Babies` : babyName)
    : babies.find(b => b.baby_id === selectedBaby)?.baby_name || babyName;

  // Analytics calculations
  const analytics = useMemo(() => {
    // Prevent division by zero if timeRange is 0 or less, though it's typically '7', '14', etc.
    const validTimeRange = parseInt(timeRange) > 0 ? parseInt(timeRange) : 1;

    // Feeding stats
    const totalFeedings = feedings.length;
    const avgFeedingsPerDay = totalFeedings / validTimeRange;
    const feedingsByType = feedings.reduce((acc, f) => {
      acc[f.feed_type] = (acc[f.feed_type] || 0) + 1;
      return acc;
    }, {});

    // Diaper stats
    const totalDiapers = diapers.length;
    const avgDiapersPerDay = totalDiapers / validTimeRange;
    const wetDiapers = diapers.filter(d => d.diaper_type === 'wet' || d.diaper_type === 'both').length;
    const dirtyDiapers = diapers.filter(d => d.diaper_type === 'dirty' || d.diaper_type === 'both').length;
    const rashOccurrences = diapers.filter(d => d.rash_detected).length;

    // Stool tracking
    const stoolColors = diapers.filter(d => d.stool_color).reduce((acc, d) => {
      acc[d.stool_color] = (acc[d.stool_color] || 0) + 1;
      return acc;
    }, {});

    // Sleep stats
    const totalSleep = sleepLogs.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const avgSleepPerDay = totalSleep / validTimeRange;
    const napCount = sleepLogs.filter(s => s.sleep_type === 'nap').length;
    const nightSleepCount = sleepLogs.filter(s => s.sleep_type === 'night_sleep').length;

    return {
      feedings: {
        total: totalFeedings,
        avgPerDay: avgFeedingsPerDay.toFixed(1),
        byType: feedingsByType
      },
      diapers: {
        total: totalDiapers,
        avgPerDay: avgDiapersPerDay.toFixed(1),
        wet: wetDiapers,
        dirty: dirtyDiapers,
        rashCount: rashOccurrences,
        stoolColors
      },
      sleep: {
        totalMinutes: totalSleep,
        avgHoursPerDay: (avgSleepPerDay / 60).toFixed(1),
        naps: napCount,
        nightSleep: nightSleepCount
      }
    };
  }, [feedings, diapers, sleepLogs, timeRange]);

  // Daily breakdown for charts
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return days.map(day => {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      const dayFeedings = feedings.filter(f => {
        const feedTime = parseISO(f.start_time);
        return feedTime >= dayStart && feedTime <= dayEnd;
      });
      const dayDiapers = diapers.filter(d => {
        const diaperTime = parseISO(d.change_time);
        return diaperTime >= dayStart && diaperTime <= dayEnd;
      });
      const daySleep = sleepLogs.filter(s => {
        const sleepStart = parseISO(s.sleep_start);
        const sleepEnd = s.sleep_end ? parseISO(s.sleep_end) : null;
        return (sleepStart >= dayStart && sleepStart <= dayEnd) || (sleepEnd && sleepEnd >= dayStart && sleepEnd <= dayEnd);
      });
      const totalSleepMins = daySleep.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);

      return {
        date: format(day, 'MMM d'),
        feedings: dayFeedings.length,
        diapers: dayDiapers.length,
        sleepHours: (totalSleepMins / 60).toFixed(1),
        wetDiapers: dayDiapers.filter(d => d.diaper_type === 'wet' || d.diaper_type === 'both').length,
        dirtyDiapers: dayDiapers.filter(d => d.diaper_type === 'dirty' || d.diaper_type === 'both').length
      };
    });
  }, [feedings, diapers, sleepLogs, startDate, endDate]);

  // Feeding type pie chart data
  const feedingTypeData = Object.entries(analytics.feedings.byType).map(([type, count]) => ({
    name: type.replace(/_/g, ' '),
    value: count
  }));

  // Stool color data for health monitoring
  const stoolColorData = Object.entries(analytics.diapers.stoolColors).map(([color, count]) => ({
    name: color,
    value: count,
    isNormal: ['yellow', 'brown'].includes(color)
  }));

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'];

  const handlePrint = () => {
    window.print();
    toast.success('📄 Print dialog opened');
  };

  const handleEmail = async () => {
    if (!recipientEmail || !recipientEmail.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSending(true);

    try {
      const reportContent = `
Baby Care Report for ${currentBabyName}
${isMultipleBirth && selectedBaby !== 'all' ? `(Part of ${babies.length} ${babies.length === 2 ? 'twins' : babies.length === 3 ? 'triplets' : 'quadruplets'})` : ''}
Period: ${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}

${isMultipleBirth && selectedBaby === 'all' ? `
===== BABIES TRACKED =====
${babies.map((b, i) => `${i + 1}. ${b.emoji || '👶'} ${b.baby_name} - Born ${format(parseISO(b.birth_date), 'MMM d, yyyy')}`).join('\n')}
` : ''}

===== FEEDING SUMMARY =====
Total Feedings: ${analytics.feedings.total}
Average per Day: ${analytics.feedings.avgPerDay}
Feeding Types:
${Object.entries(analytics.feedings.byType).map(([type, count]) => `  - ${type.replace(/_/g, ' ')}: ${count}`).join('\n')}

===== DIAPER SUMMARY =====
Total Changes: ${analytics.diapers.total}
Average per Day: ${analytics.diapers.avgPerDay}
Wet Diapers: ${analytics.diapers.wet}
Dirty Diapers: ${analytics.diapers.dirty}
Rash Occurrences: ${analytics.diapers.rashCount}
${analytics.diapers.rashCount > 0 ? '⚠️ ATTENTION: Diaper rash detected - please review' : ''}

Stool Colors Observed:
${Object.entries(analytics.diapers.stoolColors).map(([color, count]) => {
  const warning = ['red', 'white', 'black'].includes(color) ? ' ⚠️ (Consult pediatrician)' : '';
  return `  - ${color}: ${count}${warning}`;
}).join('\n')}

===== SLEEP SUMMARY =====
Total Sleep: ${(analytics.sleep.totalMinutes / 60).toFixed(1)} hours
Average per Day: ${analytics.sleep.avgHoursPerDay} hours
Naps: ${analytics.sleep.naps}
Night Sleep Sessions: ${analytics.sleep.nightSleep}

===== DAILY BREAKDOWN =====
${dailyData.map(day => `
${day.date}:
  Feedings: ${day.feedings}
  Diapers: ${day.diapers} (${day.wetDiapers} wet, ${day.dirtyDiapers} dirty)
  Sleep: ${day.sleepHours} hours
`).join('')}

===== RECENT OBSERVATIONS =====
${diapers.slice(0, 10).map(d => `
${format(parseISO(d.change_time), 'MMM d, h:mm a')}${selectedBaby === 'all' && d.baby_id ? ` - ${babies.find(b => b.baby_id === d.baby_id)?.baby_name || ''}` : ''} - ${d.diaper_type}
${d.stool_color ? `  Stool: ${d.stool_color}, ${d.stool_consistency}` : ''}
${d.rash_detected ? `  ⚠️ Rash: ${d.rash_severity}` : ''}
${d.notes ? `  Notes: ${d.notes}` : ''}
`).join('')}

This report was generated from DobryLife Women's Health Hub.
For questions, please contact the parent/caregiver.
      `;

      await base44.integrations.Core.SendEmail({
        to: recipientEmail,
        subject: `Baby Care Report for ${currentBabyName} - ${format(startDate, 'MMM d')} to ${format(endDate, 'MMM d')}`,
        body: reportContent
      });

      toast.success(`📧 Report sent to ${recipientEmail}`);
      setShowEmailDialog(false);
      setRecipientEmail('');
    } catch (error) {
      console.error('Error sending email:', error);
      toast.error('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Baby Selector for Multiple Births */}
      {isMultipleBirth && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardContent className="p-4">
            <BabySelector
              babies={babies}
              selectedBaby={selectedBaby}
              onSelect={setSelectedBaby}
              showAll={true}
            />
          </CardContent>
        </Card>
      )}

      {/* Header with Actions */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 shadow-xl print:shadow-none">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {currentBabyName}'s Care History
              </h2>
              <p className="text-sm text-gray-600">
                Comprehensive tracking for {timeRange} days
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="14">Last 14 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={handlePrint}
                variant="outline"
                size="sm"
                className="bg-white print:hidden"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>

              <Button
                onClick={() => setShowEmailDialog(true)}
                variant="outline"
                size="sm"
                className="bg-white print:hidden"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email to Provider
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Dialog */}
      {showEmailDialog && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowEmailDialog(false)}
        >
          <Card
            className="w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Email Report to Care Provider
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Provider's Email Address
                </label>
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="pediatrician@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <p className="text-xs text-blue-900">
                  <strong>Report includes:</strong> Complete feeding, diaper, and sleep logs with graphs and observations for the last {timeRange} days.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowEmailDialog(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleEmail}
                  disabled={isSending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSending ? 'Sending...' : 'Send Report'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Feedings</p>
                <p className="text-4xl font-bold text-blue-700">{analytics.feedings.total}</p>
              </div>
              <Baby className="w-10 h-10 text-blue-600 opacity-50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-700">
                <strong>Average:</strong> {analytics.feedings.avgPerDay} per day
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(analytics.feedings.byType).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type.replace(/_/g, ' ')}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Diapers</p>
                <p className="text-4xl font-bold text-orange-700">{analytics.diapers.total}</p>
              </div>
              <Droplet className="w-10 h-10 text-orange-600 opacity-50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-700">
                <strong>Average:</strong> {analytics.diapers.avgPerDay} per day
              </p>
              <p className="text-sm text-gray-700">Wet: {analytics.diapers.wet} • Dirty: {analytics.diapers.dirty}</p>
              {analytics.diapers.rashCount > 0 && (
                <div className="flex items-center gap-1 mt-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <p className="text-sm text-red-700 font-semibold">
                    {analytics.diapers.rashCount} rash occurrences
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Sleep</p>
                <p className="text-4xl font-bold text-purple-700">
                  {(analytics.sleep.totalMinutes / 60).toFixed(1)}h
                </p>
              </div>
              <Moon className="w-10 h-10 text-purple-600 opacity-50" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-700">
                <strong>Average:</strong> {analytics.sleep.avgHoursPerDay} hrs/day
              </p>
              <p className="text-sm text-gray-700">Naps: {analytics.sleep.naps} • Night: {analytics.sleep.nightSleep}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Activity Chart */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl print:shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Daily Activity Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line type="monotone" dataKey="feedings" stroke="#3b82f6" strokeWidth={2} name="Feedings" />
              <Line type="monotone" dataKey="diapers" stroke="#f59e0b" strokeWidth={2} name="Diapers" />
              <Line type="monotone" dataKey="sleepHours" stroke="#8b5cf6" strokeWidth={2} name="Sleep (hrs)" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Diaper Type Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl print:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplet className="w-5 h-5 text-orange-600" />
              Diaper Changes by Day
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                />
                <Legend />
                <Bar dataKey="wetDiapers" stackId="a" fill="#60a5fa" name="Wet" />
                <Bar dataKey="dirtyDiapers" stackId="a" fill="#fb923c" name="Dirty" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Feeding Types Pie Chart */}
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl print:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-blue-600" />
              Feeding Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={feedingTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {feedingTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Stool Health Monitoring */}
      {stoolColorData.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl print:shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              Stool Color Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {stoolColorData.map((data, index) => (
                <div
                  key={data.name}
                  className={`p-4 rounded-lg border-2 ${
                    data.isNormal
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <p className="text-xs text-gray-600 mb-1 capitalize">{data.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{data.value}</p>
                  {!data.isNormal && (
                    <p className="text-xs text-red-700 mt-1 font-semibold">⚠️ Monitor</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 bg-yellow-50 rounded-lg p-4 border border-yellow-200">
              <p className="text-sm text-yellow-900">
                <strong>⚠️ Medical Note:</strong> Black stools in newborns (meconium) are normal for first few days.
                Red or white stools require immediate pediatrician consultation.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Detailed Observations */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl print:shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-gray-600" />
            Recent Diaper Change Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {diapers.slice(0, 20).map((diaper, index) => (
              <motion.div
                key={diaper.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-lg border-2 ${
                  diaper.rash_detected
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-bold text-gray-900">
                      {format(parseISO(diaper.change_time), 'MMM d, yyyy - h:mm a')}
                    </p>
                    {selectedBaby === 'all' && diaper.baby_id && (
                       <Badge className="mt-1 mr-2 capitalize bg-blue-100 text-blue-800">
                         {babies.find(b => b.baby_id === diaper.baby_id)?.baby_name || 'Unknown Baby'}
                       </Badge>
                    )}
                    <Badge className="mt-1 capitalize bg-orange-500 text-white">
                      {diaper.diaper_type}
                    </Badge>
                  </div>
                  {diaper.rash_detected && (
                    <Badge className="bg-red-500 text-white">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Rash: {diaper.rash_severity}
                    </Badge>
                  )}
                </div>

                {(diaper.diaper_type === 'dirty' || diaper.diaper_type === 'both') && (
                  <div className="grid grid-cols-2 gap-2 mt-3">
                    {diaper.stool_color && (
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-600">Stool Color</p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">{diaper.stool_color}</p>
                      </div>
                    )}
                    {diaper.stool_consistency && (
                      <div className="bg-white rounded p-2">
                        <p className="text-xs text-gray-600">Consistency</p>
                        <p className="text-sm font-semibold text-gray-900 capitalize">{diaper.stool_consistency}</p>
                      </div>
                    )}
                  </div>
                )}

                {diaper.notes && (
                  <div className="mt-3 bg-white rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-600 mb-1">Notes:</p>
                    <p className="text-sm text-gray-800 italic">{diaper.notes}</p>
                  </div>
                )}

                {diaper.logged_by && (
                  <p className="text-xs text-gray-500 mt-2">Logged by: {diaper.logged_by}</p>
                )}
              </motion.div>
            ))}

            {diapers.length === 0 && (
              <div className="text-center py-12">
                <Droplet className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No diaper changes logged yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Health Alerts & Recommendations */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 print:shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-700" />
            Health Observations & Alerts
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Hydration Check */}
          <div className={`p-4 rounded-lg border-2 ${
            analytics.diapers.wet >= parseInt(timeRange) * 6
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {analytics.diapers.wet >= parseInt(timeRange) * 6 ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <h4 className="font-bold text-gray-900">Hydration Status</h4>
            </div>
            <p className="text-sm text-gray-700">
              {analytics.diapers.wet >= parseInt(timeRange) * 6
                ? `✅ Good hydration: ${analytics.diapers.wet} wet diapers in ${timeRange} days (6+ per day is healthy)`
                : `⚠️ Low wet diaper count: ${analytics.diapers.wet} in ${timeRange} days. Newborns should have 6-8 wet diapers per day. Consult pediatrician if concerned.`
              }
            </p>
          </div>

          {/* Bowel Movement Check */}
          <div className={`p-4 rounded-lg border-2 ${
            analytics.diapers.dirty >= parseInt(timeRange) * 3
              ? 'bg-green-50 border-green-300'
              : 'bg-yellow-50 border-yellow-300'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-bold text-gray-900">Bowel Movements</h4>
            </div>
            <p className="text-sm text-gray-700">
              {analytics.diapers.dirty} dirty diapers in {timeRange} days.
              Breastfed babies: 3-4+ per day is normal. Formula-fed: 1-4 per day is normal.
            </p>
          </div>

          {/* Rash Alert */}
          {analytics.diapers.rashCount > 0 && (
            <div className="p-4 rounded-lg border-2 bg-red-50 border-red-300">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <h4 className="font-bold text-red-900">Diaper Rash Detected</h4>
              </div>
              <p className="text-sm text-red-800 mb-2">
                Rash occurred {analytics.diapers.rashCount} times in the last {timeRange} days.
              </p>
              <div className="bg-white rounded p-3 mt-2">
                <p className="text-xs text-gray-700">
                  <strong>Recommendations:</strong> Change diapers more frequently, use barrier cream,
                  allow diaper-free time, consult pediatrician if severe or persistent.
                </p>
              </div>
            </div>
          )}

          {/* Stool Color Alerts */}
          {(analytics.diapers.stoolColors.red > 0 || analytics.diapers.stoolColors.white > 0) && (
            <div className="p-4 rounded-lg border-2 bg-red-50 border-red-400">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-red-700" />
                <h4 className="font-bold text-red-900">⚠️ URGENT: Abnormal Stool Color</h4>
              </div>
              <p className="text-sm text-red-800 font-semibold">
                {analytics.diapers.stoolColors.red > 0 && `Red stool detected ${analytics.diapers.stoolColors.red} times. `}
                {analytics.diapers.stoolColors.white > 0 && `White stool detected ${analytics.diapers.stoolColors.white} times. `}
              </p>
              <p className="text-sm text-red-800 mt-2">
                <strong>Action Required:</strong> Contact your pediatrician immediately for evaluation.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Print Instructions */}
      <div className="print:hidden bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg p-4 border-2 border-purple-200">
        <p className="text-sm text-gray-700">
          <strong>💡 Tip:</strong> This report is optimized for printing and emailing to your baby's healthcare provider.
          It includes all tracked data, trends, and health alerts for comprehensive care review.
        </p>
      </div>

      {/* Print-only header */}
      <div className="hidden print:block">
        <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Baby Care Report</h1>
          <p className="text-lg text-gray-700">{currentBabyName}</p>
          {isMultipleBirth && selectedBaby !== 'all' && (
            <p className="text-sm text-gray-600">
              ({babies.length} {babies.length === 2 ? 'twins' : babies.length === 3 ? 'triplets' : 'quadruplets'})
            </p>
          )}
          <p className="text-sm text-gray-600">
            Report Period: {format(startDate, 'MMMM d, yyyy')} - {format(endDate, 'MMMM d, yyyy')}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Generated on {format(new Date(), 'MMMM d, yyyy')} via DobryLife Women's Health Hub
          </p>
        </div>
      </div>
    </div>
  );
}
