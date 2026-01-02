import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Detect if health metrics have concerning deviations
function detectHealthDeviations(recentMetrics, historicalAvg) {
  const deviations = [];

  const thresholds = {
    sleep: { min: 6, optimal: 7, max: 9 },
    steps: { min: 3000, optimal: 8000, max: 20000 },
    heart_rate: { min: 50, optimal: 70, max: 100 },
    hrv: { min: 20, optimal: 50, max: 100 },
    activity_minutes: { min: 20, optimal: 30, max: 120 }
  };

  Object.entries(recentMetrics).forEach(([metric, value]) => {
    if (!thresholds[metric]) return;

    const threshold = thresholds[metric];
    
    if (value < threshold.min) {
      deviations.push({
        metric,
        value,
        severity: 'concerning',
        message: `${metric} is below healthy range`,
        recommendation: `Try to increase your ${metric}`
      });
    } else if (value > threshold.max) {
      deviations.push({
        metric,
        value,
        severity: 'moderate',
        message: `${metric} is above typical range`,
        recommendation: `Consider if this is sustainable`
      });
    }
  });

  return deviations;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get today's and recent health data
    const today = new Date().toISOString().split('T')[0];
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      last7Days.push(date.toISOString().split('T')[0]);
    }

    const recentMetrics = await base44.entities.HealthMetric.filter({
      metric_date: { $in: last7Days }
    });

    const todayMood = await base44.entities.SoulLinkMoodEntry.filter({
      created_date: { $gte: `${today}T00:00:00` }
    });

    const last30DaysMetrics = await base44.entities.HealthMetric.filter({}, '-metric_date', 30);

    // Calculate baseline averages
    const metricAverages = {};
    last30DaysMetrics.forEach(metric => {
      if (!metricAverages[metric.metric_type]) {
        metricAverages[metric.metric_type] = { sum: 0, count: 0 };
      }
      metricAverages[metric.metric_type].sum += metric.value;
      metricAverages[metric.metric_type].count++;
    });

    Object.keys(metricAverages).forEach(key => {
      metricAverages[key] = metricAverages[key].sum / metricAverages[key].count;
    });

    // Get today's metrics
    const todayMetrics = {};
    recentMetrics
      .filter(m => m.metric_date === today)
      .forEach(m => {
        todayMetrics[m.metric_type] = m.value;
      });

    // Detect deviations
    const deviations = detectHealthDeviations(todayMetrics, metricAverages);

    // Check for concerning patterns
    const alerts = [];

    // Sleep pattern check
    const recentSleep = recentMetrics
      .filter(m => m.metric_type === 'sleep')
      .slice(0, 7);
    
    if (recentSleep.length >= 3) {
      const avgSleep = recentSleep.reduce((a, b) => a + b.value, 0) / recentSleep.length;
      if (avgSleep < 6) {
        alerts.push({
          type: 'sleep_deficit',
          severity: 'high',
          message: 'Sleep pattern below healthy levels',
          days_affected: recentSleep.length,
          recommendation: 'Prioritize sleep - it significantly impacts your mood and stress levels'
        });
      }
    }

    // Activity pattern check
    const recentSteps = recentMetrics
      .filter(m => m.metric_type === 'steps')
      .slice(0, 7);
    
    if (recentSteps.length >= 3) {
      const avgSteps = recentSteps.reduce((a, b) => a + b.value, 0) / recentSteps.length;
      if (avgSteps < 3000) {
        alerts.push({
          type: 'low_activity',
          severity: 'medium',
          message: 'Activity levels lower than usual',
          recommendation: 'Even a short walk can boost your mood and energy'
        });
      }
    }

    // Mood trend check
    if (todayMood.length > 0) {
      const currentMood = todayMood[0];
      
      if (currentMood.mood_rating <= 4 || currentMood.stress_level >= 7) {
        // Check if health metrics might be contributing
        const contributingFactors = [];
        
        if (todayMetrics.sleep && todayMetrics.sleep < 6) {
          contributingFactors.push('low sleep');
        }
        if (todayMetrics.steps && todayMetrics.steps < 3000) {
          contributingFactors.push('low activity');
        }
        if (todayMetrics.hrv && todayMetrics.hrv < metricAverages.hrv * 0.8) {
          contributingFactors.push('elevated stress response');
        }

        if (contributingFactors.length > 0) {
          alerts.push({
            type: 'mood_health_correlation',
            severity: 'medium',
            message: `Your mood may be affected by: ${contributingFactors.join(', ')}`,
            recommendation: 'Focus on rest and gentle movement today'
          });
        }
      }
    }

    // Generate AI-powered intervention suggestions if alerts exist
    let interventions = null;
    
    if (alerts.length > 0 || deviations.length > 0) {
      const interventionPrompt = `User's current health situation:

RECENT DEVIATIONS:
${deviations.map(d => `- ${d.metric}: ${d.value} (${d.severity})`).join('\n') || 'None'}

ALERTS:
${alerts.map(a => `- ${a.type}: ${a.message} (${a.severity} priority)`).join('\n')}

RECENT MOOD: ${todayMood.length > 0 ? `${todayMood[0].mood_rating}/10, stress: ${todayMood[0].stress_level}/10` : 'Not logged yet'}

Generate 3 personalized wellness interventions for TODAY:
1. One IMMEDIATE action (5 minutes)
2. One SHORT-TERM practice (today/tomorrow)
3. One PREVENTIVE habit (this week)

Make them specific, achievable, and compassionate.

Return JSON:
{
  "interventions": [
    {
      "timeframe": "immediate|short_term|preventive",
      "title": "Brief title",
      "action": "Specific action",
      "why": "Why this will help",
      "duration": "5 min|today|this week"
    }
  ]
}`;

      interventions = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: interventionPrompt,
        response_json_schema: {
          type: "object",
          properties: {
            interventions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  timeframe: { type: "string" },
                  title: { type: "string" },
                  action: { type: "string" },
                  why: { type: "string" },
                  duration: { type: "string" }
                }
              }
            }
          }
        }
      });
    }

    // Create urgent insights if needed
    const urgentInsights = [];

    for (const alert of alerts.filter(a => a.severity === 'high')) {
      const insight = await base44.entities.HealthInsight.create({
        insight_type: 'alert',
        title: alert.message,
        description: `Based on the last ${alert.days_affected || 3} days of data, we've noticed a pattern that may be affecting your well-being.`,
        priority: 'high',
        recommendation: {
          action: alert.recommendation,
          expected_benefit: 'Improved mood and energy levels',
          difficulty: 'moderate'
        },
        is_actionable: true,
        related_dates: [today]
      });

      urgentInsights.push(insight);
    }

    return Response.json({
      success: true,
      monitoring_date: today,
      deviations,
      alerts,
      interventions: interventions?.interventions || [],
      urgent_insights_created: urgentInsights.length,
      recommendation: alerts.length > 0 
        ? 'Take a moment for self-care today' 
        : 'Your health metrics look good! Keep it up! 💜'
    });

  } catch (error) {
    console.error('Proactive health monitor error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getTopTags(dataPoints) {
  const tagCounts = {};
  
  dataPoints.forEach(d => {
    (d.emotional_tags || []).forEach(tag => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);
}