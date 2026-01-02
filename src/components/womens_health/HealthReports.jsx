import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { generateHealthReport } from '@/functions/generateHealthReport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  TrendingUp,
  Calendar,
  Heart,
  Baby,
  Brain,
  Apple,
  Activity,
  Moon,
  Droplet,
  AlertCircle,
  CheckCircle,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'sonner';

const InsightCard = ({ insight }) => {
  const severityStyles = {
    positive: { bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircle, iconColor: 'text-green-600' },
    neutral: { bg: 'bg-blue-50', border: 'border-blue-200', icon: Activity, iconColor: 'text-blue-600' },
    needs_attention: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: AlertCircle, iconColor: 'text-yellow-600' },
    concerning: { bg: 'bg-red-50', border: 'border-red-200', icon: AlertCircle, iconColor: 'text-red-600' }
  };

  const style = severityStyles[insight.severity] || severityStyles.neutral;
  const Icon = style.icon;

  return (
    <div className={`p-4 rounded-lg border-2 ${style.bg} ${style.border}`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${style.iconColor} flex-shrink-0 mt-0.5`} />
        <div>
          <p className="font-semibold text-gray-900 text-sm mb-1 capitalize">
            {insight.category.replace(/_/g, ' ')}
          </p>
          <p className="text-sm text-gray-700">{insight.insight}</p>
        </div>
      </div>
    </div>
  );
};

const RecommendationCard = ({ rec }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityStyles = {
    urgent: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-300' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-300' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300' },
    low: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300' }
  };

  const style = priorityStyles[rec.priority] || priorityStyles.medium;

  return (
    <div className={`p-4 rounded-lg border-2 ${style.bg} ${style.border}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge className={`${style.bg} ${style.text} border-0 text-xs`}>
              {rec.category.replace(/_/g, ' ')}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {rec.priority} priority
            </Badge>
          </div>
          <p className="font-semibold text-gray-900 mb-2">{rec.recommendation}</p>
          
          <AnimatePresence>
            {isExpanded && rec.actionable_steps && rec.actionable_steps.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 space-y-2"
              >
                <p className="text-xs font-semibold text-gray-700 mb-2">Action Steps:</p>
                {rec.actionable_steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-700">{step}</p>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {rec.actionable_steps && rec.actionable_steps.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        )}
      </div>
    </div>
  );
};

const ReportView = ({ report }) => {
  const categoryIcons = {
    pregnancy_progress: Baby,
    symptom_trends: Activity,
    wellness: Heart,
    nutrition: Apple,
    sleep: Moon,
    mood: Brain,
    baby_care: Baby,
    cycle_health: Calendar
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-2xl">
        <CardContent className="p-6">
          <div className="text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-90" />
            <h2 className="text-2xl font-bold mb-2">
              {report.report_type === 'weekly' ? 'Weekly' : 'Monthly'} Health Report
            </h2>
            <p className="text-white/90 mb-4">
              {format(new Date(report.period_start), 'MMM d')} - {format(new Date(report.period_end), 'MMM d, yyyy')}
            </p>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-1">Overall Summary</p>
              <p className="text-white font-medium">{report.summary}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Alerts */}
      {report.medical_alerts && report.medical_alerts.length > 0 && (
        <Card className="bg-red-50 border-2 border-red-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertCircle className="w-5 h-5" />
              Important: Consult Your Doctor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.medical_alerts.map((alert, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-white rounded-lg">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-900 font-medium">{alert}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Key Insights */}
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-3">
          {report.key_insights?.map((insight, idx) => (
            <InsightCard key={idx} insight={insight} />
          ))}
        </CardContent>
      </Card>

      {/* Wellness Metrics */}
      {report.wellness_metrics && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Wellness Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <Brain className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-700">
                  {report.wellness_metrics.average_mood?.toFixed(1)}
                </p>
                <p className="text-xs text-gray-600">Avg Mood</p>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg text-center">
                <Activity className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-orange-700">
                  {report.wellness_metrics.average_energy?.toFixed(1)}
                </p>
                <p className="text-xs text-gray-600">Avg Energy</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <Moon className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-700">
                  {report.wellness_metrics.average_sleep_hours?.toFixed(1)}h
                </p>
                <p className="text-xs text-gray-600">Avg Sleep</p>
              </div>
              
              <div className="p-4 bg-cyan-50 rounded-lg text-center">
                <Droplet className="w-6 h-6 text-cyan-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-cyan-700">
                  {report.wellness_metrics.average_water_intake?.toFixed(0)}
                </p>
                <p className="text-xs text-gray-600">Glasses/Day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Baby Care Summary */}
      {report.baby_care_summary && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Baby className="w-5 h-5 text-pink-500" />
              Baby Care Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-pink-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-pink-700">
                  {report.baby_care_summary.total_feedings}
                </p>
                <p className="text-xs text-gray-600">Total Feedings</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {report.baby_care_summary.average_feeding_duration?.toFixed(0)}m
                </p>
                <p className="text-xs text-gray-600">Avg Feed Time</p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-700">
                  {report.baby_care_summary.total_diaper_changes}
                </p>
                <p className="text-xs text-gray-600">Diaper Changes</p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-700">
                  {report.baby_care_summary.average_sleep_hours_per_day?.toFixed(1)}h
                </p>
                <p className="text-xs text-gray-600">Baby's Sleep</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Personalized Nutrition Plan */}
      {report.personalized_meal_plan && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Apple className="w-5 h-5 text-green-500" />
              Personalized Nutrition Plan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Focus Nutrients:</h4>
              <div className="flex flex-wrap gap-2">
                {report.personalized_meal_plan.focus_nutrients?.map((nutrient, idx) => (
                  <Badge key={idx} className="bg-green-100 text-green-700 border-green-300">
                    {nutrient}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Suggested Foods:</h4>
              <div className="flex flex-wrap gap-2">
                {report.personalized_meal_plan.suggested_foods?.map((food, idx) => (
                  <Badge key={idx} variant="outline" className="bg-white">
                    {food}
                  </Badge>
                ))}
              </div>
            </div>

            {report.personalized_meal_plan.foods_to_limit?.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Foods to Limit:</h4>
                <div className="flex flex-wrap gap-2">
                  {report.personalized_meal_plan.foods_to_limit.map((food, idx) => (
                    <Badge key={idx} className="bg-red-100 text-red-700">
                      {food}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {report.recommendations && report.recommendations.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.recommendations.map((rec, idx) => (
              <RecommendationCard key={idx} rec={rec} />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Milestones */}
      {report.milestone_achievements && report.milestone_achievements.length > 0 && (
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <Award className="w-5 h-5" />
              Milestones Achieved! 🎉
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {report.milestone_achievements.map((milestone, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg">
                <p className="font-semibold text-gray-900">{milestone.milestone}</p>
                {milestone.description && (
                  <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {report.next_steps && report.next_steps.length > 0 && (
        <Card className="bg-white/90 backdrop-blur-sm shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-500" />
              Your Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {report.next_steps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-gray-700">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default function HealthReports() {
  const [selectedReport, setSelectedReport] = useState(null);
  const queryClient = useQueryClient();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['health-reports'],
    queryFn: () => base44.entities.HealthReport.list('-created_date')
  });

  const generateMutation = useMutation({
    mutationFn: async (reportType) => {
      const response = await generateHealthReport({ report_type: reportType });
      return response.data.report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['health-reports'] });
      toast.success('✅ Health report generated!');
    },
    onError: (error) => {
      toast.error('Failed to generate report: ' + error.message);
    }
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-7 h-7 text-purple-600" />
            My Health Reports
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            AI-powered insights and personalized recommendations
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => generateMutation.mutate('weekly')}
            disabled={generateMutation.isPending}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Weekly Report
          </Button>
          <Button
            onClick={() => generateMutation.mutate('monthly')}
            disabled={generateMutation.isPending}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            {generateMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Monthly Report
          </Button>
        </div>
      </div>

      {/* Report View or List */}
      {selectedReport ? (
        <div>
          <Button
            variant="outline"
            onClick={() => setSelectedReport(null)}
            className="mb-4"
          >
            ← Back to All Reports
          </Button>
          <ReportView report={selectedReport} />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Info Banner */}
          <Card className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-purple-900 mb-2">
                    AI-Powered Health Insights
                  </p>
                  <p className="text-sm text-purple-800">
                    Generate comprehensive reports that analyze your symptoms, wellness activities, 
                    pregnancy/postpartum progress, and provide personalized recommendations. 
                    Reports include custom meal plans, exercise guidance, and next steps tailored to your unique journey!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-3" />
              <p className="text-gray-600">Loading reports...</p>
            </div>
          ) : reports.length === 0 ? (
            <Card className="bg-white/90 backdrop-blur-sm">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Reports Yet</h3>
                <p className="text-gray-600 mb-6">
                  Generate your first health report to get personalized insights and recommendations!
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => generateMutation.mutate('weekly')}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Weekly Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {reports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card 
                    className="bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-purple-100 text-purple-700">
                              {report.report_type}
                            </Badge>
                            <Badge variant="outline">
                              {report.health_status?.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="font-semibold text-gray-900 mb-1">
                            {format(new Date(report.period_start), 'MMM d')} - {format(new Date(report.period_end), 'MMM d, yyyy')}
                          </p>
                          <p className="text-sm text-gray-600 line-clamp-2">{report.summary}</p>
                          
                          {/* Quick Stats */}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              {report.key_insights?.length || 0} insights
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {report.recommendations?.length || 0} recommendations
                            </span>
                            {report.medical_alerts?.length > 0 && (
                              <span className="flex items-center gap-1 text-red-600 font-semibold">
                                <AlertCircle className="w-3 h-3" />
                                {report.medical_alerts.length} alert{report.medical_alerts.length > 1 ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          View Report →
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}