
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Activity,
  Heart,
  Moon,
  Footprints,
  Zap,
  TrendingUp,
  Link2,
  Shield,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Settings,
  Sparkles,
  Brain,
  EyeOff,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  Bar
} from 'recharts';
import { awardPoints } from '@/functions/awardPoints';
import PointsNotification from '@/components/gamification/PointsNotification';

const healthProviders = [
  {
    id: 'apple_health',
    name: 'Apple Health',
    icon: Heart,
    color: 'red',
    description: 'Sync from iPhone Health app',
    comingSoon: true
  },
  {
    id: 'google_fit',
    name: 'Google Fit',
    icon: Activity,
    color: 'blue',
    description: 'Connect your Google Fit data',
    comingSoon: true
  },
  {
    id: 'fitbit',
    name: 'Fitbit',
    icon: Footprints,
    color: 'teal',
    description: 'Sync Fitbit activity & sleep',
    comingSoon: true
  },
  {
    id: 'oura',
    name: 'Oura Ring',
    icon: Moon,
    color: 'purple',
    description: 'Advanced sleep & readiness data',
    comingSoon: true
  }
];

const metricOptions = [
  { id: 'steps', label: 'Daily Steps', icon: Footprints, unit: 'steps' },
  { id: 'sleep', label: 'Sleep Hours', icon: Moon, unit: 'hours' },
  { id: 'heart_rate', label: 'Heart Rate', icon: Heart, unit: 'bpm' },
  { id: 'hrv', label: 'Heart Rate Variability', icon: Activity, unit: 'ms' },
  { id: 'activity_minutes', label: 'Active Minutes', icon: Zap, unit: 'min' },
  { id: 'mindfulness_minutes', label: 'Mindfulness', icon: Brain, unit: 'min' }
];

export default function HealthDataIntegration({ settings }) {
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showInsights, setShowInsights] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pointsNotification, setPointsNotification] = useState(null);
  const queryClient = useQueryClient();

  const { data: connections = [] } = useQuery({
    queryKey: ['health-data-syncs'],
    queryFn: () => base44.entities.HealthDataSync.list()
  });

  const { data: metrics = [] } = useQuery({
    queryKey: ['health-metrics'],
    queryFn: () => base44.entities.HealthMetric.filter({}, '-metric_date', 30)
  });

  const { data: insights = [] } = useQuery({
    queryKey: ['health-insights'],
    queryFn: () => base44.entities.HealthInsight.filter({ is_read: false }, '-created_date')
  });

  const { data: moodHistory = [] } = useQuery({
    queryKey: ['soulLinkMoodHistory'],
    queryFn: () => base44.entities.SoulLinkMoodEntry.list('-created_date', 30)
  });

  const updateSyncMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.HealthDataSync.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['health-data-syncs']);
      toast.success('Settings updated');
    }
  });

  const markInsightReadMutation = useMutation({
    mutationFn: (insightId) => base44.entities.HealthInsight.update(insightId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['health-insights']);
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: (syncId) => base44.entities.HealthDataSync.delete(syncId),
    onSuccess: () => {
      queryClient.invalidateQueries(['health-data-syncs']);
      toast.success('Disconnected successfully');
    }
  });

  const syncHealthDataMutation = useMutation({
    mutationFn: async (provider) => {
      const { syncHealthData } = await import('@/functions/syncHealthData');
      return syncHealthData({ provider });
    },
    onSuccess: async (data) => {
      queryClient.invalidateQueries(['health-metrics']);
      queryClient.invalidateQueries(['health-data-syncs']);
      toast.success(`Synced ${data.metrics_synced || 0} health metrics! 📊`);

      // Award points for health sync
      try {
        const pointsResult = await awardPoints({
          activity_type: 'health_sync',
          activity_data: { provider: data.provider }
        });

        if (pointsResult.data.success) {
          setPointsNotification(pointsResult.data);
          queryClient.invalidateQueries({ queryKey: ['user'] });
        }
      } catch (error) {
        console.error('Error awarding points:', error);
      }
    },
    onError: () => {
      toast.error('Failed to sync health data');
    }
  });

  const runAnalysisMutation = useMutation({
    mutationFn: async () => {
      const { analyzeHealthCorrelations } = await import('@/functions/analyzeHealthCorrelations');
      return analyzeHealthCorrelations({});
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['health-insights']);
      toast.success(`Generated ${data.insights?.length || 0} new insights! 🧠`);
    },
    onError: () => {
      toast.error('Failed to analyze health data');
    }
  });

  const runProactiveMonitor = useMutation({
    mutationFn: async () => {
      const { proactiveHealthMonitor } = await import('@/functions/proactiveHealthMonitor');
      return proactiveHealthMonitor({});
    },
    onSuccess: (data) => {
      if (data.alerts?.length > 0) {
        queryClient.invalidateQueries(['health-insights']);
        toast.success('Health monitoring complete - check your insights!');
      } else {
        toast.success('All health metrics looking good! 💚');
      }
    }
  });

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      await runAnalysisMutation.mutateAsync();
      await runProactiveMonitor.mutateAsync();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const activeConnection = connections.find(c => c.is_connected);

  // Prepare chart data combining health metrics and mood
  const chartData = prepareCorrelationData(metrics, moodHistory);

  return (
    <div className="space-y-6">
      {/* Points Notification */}
      {pointsNotification && (
        <PointsNotification
          points={pointsNotification.points_earned}
          breakdown={pointsNotification.breakdown}
          leveledUp={pointsNotification.leveled_up}
          newLevel={pointsNotification.new_level}
          achievements={pointsNotification.achievements_earned}
          onClose={() => setPointsNotification(null)}
        />
      )}

      {/* Privacy Notice */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">Privacy First</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                Your health data is encrypted and never shared with third parties. 
                You control what's synced and can disconnect anytime.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Control */}
      {(metrics.length > 0 || moodHistory.length > 0) && (
        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
                  <Brain className="w-6 h-6" />
                  AI Health Analysis
                </h3>
                <p className="text-purple-100 text-sm">
                  Analyze {metrics.length} health metrics + {moodHistory.length} mood entries
                </p>
              </div>
              <Button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                variant="secondary"
                size="lg"
                className="gap-2"
              >
                {isAnalyzing ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Analyze Now
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Insights */}
      {insights.length > 0 && showInsights && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                AI Health Insights ({insights.length})
              </span>
              <Button
                onClick={() => setShowInsights(false)}
                size="sm"
                variant="ghost"
              >
                <EyeOff className="w-4 h-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {insights.slice(0, 3).map((insight, idx) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onMarkRead={() => markInsightReadMutation.mutate(insight.id)}
              />
            ))}
            {insights.length > 3 && (
              <p className="text-sm text-purple-600 text-center">
                + {insights.length - 3} more insights available
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Connected Providers */}
      {activeConnection ? (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-green-600" />
              Connected Health Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ConnectionCard
              connection={activeConnection}
              onUpdate={(data) => updateSyncMutation.mutate({ id: activeConnection.id, data })}
              onDisconnect={() => disconnectMutation.mutate(activeConnection.id)}
            />
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-600" />
              Connect Health Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Connect your health data to get personalized insights based on sleep, activity, and wellness patterns.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4">
              {healthProviders.map(provider => {
                const Icon = provider.icon;
                return (
                  <button
                    key={provider.id}
                    onClick={() => setSelectedProvider(provider)}
                    disabled={provider.comingSoon}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      provider.comingSoon
                        ? 'border-gray-200 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-${provider.color}-100 flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 text-${provider.color}-600`} />
                    </div>
                    {provider.comingSoon && (
                      <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    )}
                    <h4 className="font-semibold text-gray-900 mt-2">{provider.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{provider.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Coming Soon!</strong> Health data integrations are currently in development. 
                For now, you can manually log health data in the Wellness tab.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Health & Mood Correlation Chart */}
      {chartData.length > 0 && (
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Health & Mood Correlation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={chartData}>
                <defs>
                  <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
                <YAxis yAxisId="left" stroke="#a855f7" />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
                <Tooltip />
                <Legend />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="mood"
                  stroke="#a855f7"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#moodGradient)"
                  name="Mood (1-10)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="steps"
                  fill="#3b82f6"
                  name="Steps (thousands)"
                  opacity={0.6}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="sleep"
                  stroke="#10b981"
                  strokeWidth={2}
                  name="Sleep (hours)"
                  dot={{ fill: '#10b981' }}
                />
              </ComposedChart>
            </ResponsiveContainer>
            <p className="text-xs text-gray-500 mt-3 text-center">
              Visualize how your physical health correlates with your emotional well-being
            </p>
          </CardContent>
        </Card>
      )}

      {/* Sample Insights (when no real data) */}
      {connections.length === 0 && (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              Example Insights You'll Get
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ExampleInsight
              icon={Moon}
              color="purple"
              title="Sleep & Mood Connection"
              description="You tend to report 2x better mood on days with 7+ hours of sleep"
            />
            <ExampleInsight
              icon={Footprints}
              color="blue"
              title="Activity Boost"
              description="Your stress levels decrease by 30% on days you hit 8,000+ steps"
            />
            <ExampleInsight
              icon={Heart}
              color="pink"
              title="Recovery Pattern"
              description="Your HRV is highest after mindfulness sessions, suggesting better stress recovery"
            />
            <ExampleInsight
              icon={AlertCircle}
              color="orange"
              title="Trigger Detection"
              description="Low sleep (<6 hrs) predicts 40% higher stress levels the next day"
            />
            <ExampleInsight
              icon={Sparkles}
              color="green"
              title="Personalized Intervention"
              description="When energy is low, a 10-minute walk improves your mood by an average of 2 points"
            />
          </CardContent>
        </Card>
      )}

      {/* How It Works Guide */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Settings className="w-5 h-5 text-amber-600" />
            How Health Integration Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-700">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-700 text-xs font-bold">1</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Connect Your Data</p>
              <p className="text-xs text-gray-600">Link Apple Health, Google Fit, or your wearable device</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-700 text-xs font-bold">2</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">AI Analyzes Patterns</p>
              <p className="text-xs text-gray-600">Correlates sleep, activity, HRV with your mood and journal entries</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-700 text-xs font-bold">3</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Get Personalized Insights</p>
              <p className="text-xs text-gray-600">Receive actionable recommendations tailored to your unique patterns</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-700 text-xs font-bold">4</span>
            </div>
            <div>
              <p className="font-semibold text-gray-900">Proactive Support</p>
              <p className="text-xs text-gray-600">Get early alerts when health deviations might affect your mood</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConnectionCard({ connection, onUpdate, onDisconnect }) {
  const provider = healthProviders.find(p => p.id === connection.provider);
  const Icon = provider?.icon || Activity;

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg bg-${provider?.color || 'green'}-100 flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-5 h-5 text-${provider?.color || 'green'}-600`} />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-gray-900">{provider?.name || connection.provider}</h4>
              <Badge className="bg-green-600 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            </div>
            <p className="text-xs text-gray-600">
              Last synced: {connection.last_sync ? format(new Date(connection.last_sync), 'MMM d, h:mm a') : 'Never'}
            </p>
          </div>
        </div>
        <Button
          onClick={onDisconnect}
          size="sm"
          variant="ghost"
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Enabled Metrics */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Synced Metrics</h4>
        <div className="grid grid-cols-2 gap-2">
          {metricOptions.map(metric => {
            const MetricIcon = metric.icon;
            const isEnabled = connection.enabled_metrics?.includes(metric.id);
            
            return (
              <label
                key={metric.id}
                className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isEnabled
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <Switch
                  checked={isEnabled}
                  onCheckedChange={(checked) => {
                    const newMetrics = checked
                      ? [...(connection.enabled_metrics || []), metric.id]
                      : (connection.enabled_metrics || []).filter(m => m !== metric.id);
                    onUpdate({ enabled_metrics: newMetrics });
                  }}
                />
                <MetricIcon className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">{metric.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Privacy Settings
        </h4>
        
        <div className="space-y-3">
          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">AI Analysis</p>
              <p className="text-xs text-gray-600">Allow AI to analyze health data for insights</p>
            </div>
            <Switch
              checked={connection.privacy_settings?.share_with_ai !== false}
              onCheckedChange={(checked) => {
                onUpdate({
                  privacy_settings: {
                    ...connection.privacy_settings,
                    share_with_ai: checked
                  }
                });
              }}
            />
          </label>

          <label className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Auto-Delete</p>
              <p className="text-xs text-gray-600">Delete data after {connection.privacy_settings?.retention_days || 90} days</p>
            </div>
            <Switch
              checked={connection.privacy_settings?.auto_delete_enabled !== false}
              onCheckedChange={(checked) => {
                onUpdate({
                  privacy_settings: {
                    ...connection.privacy_settings,
                    auto_delete_enabled: checked
                  }
                });
              }}
            />
          </label>
        </div>
      </div>

      {/* Sync Control */}
      <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
        <div>
          <p className="text-sm font-medium text-gray-900">Sync Frequency</p>
          <p className="text-xs text-gray-600">How often to update your data</p>
        </div>
        <select
          value={connection.sync_frequency}
          onChange={(e) => onUpdate({ sync_frequency: e.target.value })}
          className="p-2 border rounded-lg text-sm focus:border-purple-500 focus:outline-none"
        >
          <option value="manual">Manual</option>
          <option value="daily">Daily</option>
          <option value="hourly">Hourly</option>
        </select>
      </div>
    </div>
  );
}

function InsightCard({ insight, onMarkRead }) {
  const icons = {
    correlation: TrendingUp,
    pattern: Activity,
    recommendation: Sparkles,
    achievement: CheckCircle,
    alert: AlertCircle
  };

  const colors = {
    correlation: 'blue',
    pattern: 'purple',
    recommendation: 'green',
    achievement: 'yellow',
    alert: 'red'
  };

  const Icon = icons[insight.insight_type] || Sparkles;
  const color = colors[insight.insight_type] || 'purple';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-lg border-2 border-${color}-200 bg-${color}-50`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 text-${color}-600`} />
        </div>
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
            <Badge className={`bg-${color}-600 text-xs`}>
              {insight.insight_type}
            </Badge>
          </div>
          
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            {insight.description}
          </p>

          {insight.correlation_data && (
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
              <span>Correlation: {(insight.correlation_data.correlation_strength * 100).toFixed(0)}%</span>
              <span>•</span>
              <span>{insight.correlation_data.data_points} days analyzed</span>
            </div>
          )}

          {insight.recommendation && (
            <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs font-semibold text-gray-900 mb-1">💡 Try This:</p>
              <p className="text-sm text-gray-700">{insight.recommendation.action}</p>
              {insight.recommendation.expected_benefit && (
                <p className="text-xs text-gray-600 mt-1">
                  Expected benefit: {insight.recommendation.expected_benefit}
                </p>
              )}
            </div>
          )}

          <Button
            onClick={onMarkRead}
            size="sm"
            variant="ghost"
            className="mt-2 text-xs"
          >
            Mark as Read
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

function ExampleInsight({ icon: Icon, color, title, description }) {
  return (
    <div className={`p-4 rounded-lg border-2 border-${color}-200 bg-${color}-50`}>
      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-4 h-4 text-${color}-600`} />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
          <p className="text-sm text-gray-700">{description}</p>
        </div>
      </div>
    </div>
  );
}

function prepareCorrelationData(metrics, moodHistory) {
  const last7Days = [];
  
  for (let i = 6; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'MM/dd');
    
    const dayMetrics = metrics.filter(m => {
      const metricDate = new Date(m.metric_date);
      return metricDate.toDateString() === date.toDateString();
    });

    const dayMoods = moodHistory.filter(m => {
      const moodDate = new Date(m.created_date);
      return moodDate.toDateString() === date.toDateString();
    });

    const stepsMetric = dayMetrics.find(m => m.metric_type === 'steps');
    const sleepMetric = dayMetrics.find(m => m.metric_type === 'sleep');
    
    const avgMood = dayMoods.length > 0
      ? dayMoods.reduce((sum, m) => sum + m.mood_rating, 0) / dayMoods.length
      : null;

    last7Days.push({
      date: dateStr,
      mood: avgMood,
      steps: stepsMetric ? Math.round(stepsMetric.value / 1000) : null,
      sleep: sleepMetric ? sleepMetric.value : null
    });
  }

  return last7Days;
}
