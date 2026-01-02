import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Calculate correlation coefficient between two arrays
function calculateCorrelation(x, y) {
  const n = Math.min(x.length, y.length);
  if (n < 3) return 0;

  const xMean = x.reduce((a, b) => a + b, 0) / n;
  const yMean = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let xDenominator = 0;
  let yDenominator = 0;

  for (let i = 0; i < n; i++) {
    const xDiff = x[i] - xMean;
    const yDiff = y[i] - yMean;
    numerator += xDiff * yDiff;
    xDenominator += xDiff * xDiff;
    yDenominator += yDiff * yDiff;
  }

  if (xDenominator === 0 || yDenominator === 0) return 0;
  return numerator / Math.sqrt(xDenominator * yDenominator);
}

// Detect anomalies and potential triggers
function detectTriggers(dataByDate, metricType) {
  const values = Object.values(dataByDate)
    .filter(d => d[metricType] !== undefined)
    .map(d => d[metricType]);

  if (values.length < 7) return null;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  const triggers = [];

  Object.entries(dataByDate).forEach(([date, data]) => {
    if (data[metricType] === undefined || data.avg_mood === undefined) return;

    const deviation = (data[metricType] - mean) / stdDev;
    const moodImpact = data.avg_mood - 5; // Normalized mood impact

    // Significant deviation + mood change
    if (Math.abs(deviation) > 1.5 && Math.abs(moodImpact) > 2) {
      triggers.push({
        date,
        metric_value: data[metricType],
        deviation: deviation.toFixed(2),
        mood_rating: data.avg_mood,
        direction: deviation < 0 ? 'low' : 'high',
        mood_direction: moodImpact < 0 ? 'worse' : 'better'
      });
    }
  });

  return triggers.length > 0 ? triggers : null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { days = 30, force_analysis = false } = await req.json().catch(() => ({}));

    // Get comprehensive data
    const healthMetrics = await base44.entities.HealthMetric.filter({}, '-metric_date', days);
    const moodEntries = await base44.entities.SoulLinkMoodEntry.list('-created_date', days);
    const journalEntries = await base44.entities.SoulLinkJournalEntry.list('-created_date', days);

    if (healthMetrics.length === 0 || moodEntries.length === 0) {
      return Response.json({
        message: 'Not enough data for analysis yet',
        insights: [],
        min_required: '5 days of health + mood data'
      });
    }

    // Organize data by date
    const dataByDate = {};
    
    healthMetrics.forEach(metric => {
      const date = metric.metric_date;
      if (!dataByDate[date]) dataByDate[date] = { date };
      dataByDate[date][metric.metric_type] = metric.value;
      
      // Store sleep quality if available
      if (metric.metric_type === 'sleep' && metric.additional_data?.sleep_quality) {
        dataByDate[date].sleep_quality = metric.additional_data.sleep_quality;
      }
    });

    moodEntries.forEach(mood => {
      const date = new Date(mood.created_date).toISOString().split('T')[0];
      if (!dataByDate[date]) dataByDate[date] = { date };
      if (!dataByDate[date].moods) dataByDate[date].moods = [];
      dataByDate[date].moods.push({
        rating: mood.mood_rating,
        energy: mood.energy_level || 5,
        stress: mood.stress_level || 5,
        tags: mood.emotional_tags || []
      });
    });

    journalEntries.forEach(journal => {
      const date = new Date(journal.created_date).toISOString().split('T')[0];
      if (!dataByDate[date]) dataByDate[date] = { date };
      if (!dataByDate[date].journals) dataByDate[date].journals = [];
      dataByDate[date].journals.push({
        themes: journal.themes_detected || [],
        mood_before: journal.mood_before,
        mood_after: journal.mood_after
      });
    });

    // Calculate daily averages
    Object.keys(dataByDate).forEach(date => {
      if (dataByDate[date].moods) {
        const moods = dataByDate[date].moods;
        dataByDate[date].avg_mood = moods.reduce((a, b) => a + b.rating, 0) / moods.length;
        dataByDate[date].avg_energy = moods.reduce((a, b) => a + b.energy, 0) / moods.length;
        dataByDate[date].avg_stress = moods.reduce((a, b) => a + b.stress, 0) / moods.length;
        
        // Collect all emotional tags for the day
        const allTags = moods.flatMap(m => m.tags);
        dataByDate[date].emotional_tags = [...new Set(allTags)];
      }
    });

    const dataPoints = Object.values(dataByDate).filter(d => d.avg_mood !== undefined);

    if (dataPoints.length < 5) {
      return Response.json({
        message: 'Need at least 5 days of combined data for meaningful analysis',
        current_days: dataPoints.length,
        insights: []
      });
    }

    // Calculate correlations for all available metrics
    const metricTypes = ['steps', 'sleep', 'heart_rate', 'hrv', 'activity_minutes', 'mindfulness_minutes'];
    const correlations = [];

    for (const metricType of metricTypes) {
      const metricValues = [];
      const moodValues = [];

      dataPoints.forEach(d => {
        if (d[metricType] !== undefined && d.avg_mood !== undefined) {
          metricValues.push(d[metricType]);
          moodValues.push(d.avg_mood);
        }
      });

      if (metricValues.length >= 5) {
        const correlation = calculateCorrelation(metricValues, moodValues);
        const triggers = detectTriggers(dataByDate, metricType);
        
        correlations.push({
          metric: metricType,
          correlation,
          strength: Math.abs(correlation),
          data_points: metricValues.length,
          triggers: triggers,
          metric_avg: metricValues.reduce((a, b) => a + b, 0) / metricValues.length,
          mood_avg: moodValues.reduce((a, b) => a + b, 0) / moodValues.length
        });
      }
    }

    // Sort by correlation strength
    correlations.sort((a, b) => b.strength - a.strength);

    // Prepare comprehensive data summary for AI
    const dataSummary = {
      total_days: dataPoints.length,
      avg_mood: (dataPoints.reduce((a, b) => a + (b.avg_mood || 0), 0) / dataPoints.length).toFixed(2),
      avg_energy: (dataPoints.reduce((a, b) => a + (b.avg_energy || 5), 0) / dataPoints.length).toFixed(2),
      avg_stress: (dataPoints.reduce((a, b) => a + (b.avg_stress || 5), 0) / dataPoints.length).toFixed(2),
      correlations: correlations.slice(0, 5),
      recent_journals: journalEntries.slice(0, 10).map(j => ({
        themes: j.themes_detected,
        mood_change: j.mood_after && j.mood_before ? `${j.mood_before} → ${j.mood_after}` : null
      })),
      common_emotional_tags: getTopTags(dataPoints)
    };

    // AI Analysis Prompt
    const analysisPrompt = `You are a compassionate health and wellness AI analyzing ${user.full_name}'s data.

COMPREHENSIVE HEALTH & MOOD DATA (${dataPoints.length} days):

OVERALL PATTERNS:
- Average Mood: ${dataSummary.avg_mood}/10
- Average Energy: ${dataSummary.avg_energy}/10  
- Average Stress: ${dataSummary.avg_stress}/10
- Common Emotions: ${dataSummary.common_emotional_tags.join(', ')}

TOP CORRELATIONS DETECTED:
${correlations.slice(0, 5).map((c, i) => `${i + 1}. ${c.metric} ↔ mood: ${(c.correlation * 100).toFixed(0)}% correlation (${c.data_points} days)`).join('\n')}

POTENTIAL TRIGGERS DETECTED:
${correlations.filter(c => c.triggers).map(c => `- ${c.metric}: ${c.triggers.length} significant deviations`).join('\n') || 'None detected'}

RECENT JOURNAL THEMES:
${dataSummary.recent_journals.filter(j => j.themes).map(j => j.themes.join(', ')).slice(0, 5).join('\n') || 'No themes detected'}

TASK: Generate 4-6 personalized health insights:
1. Identify the STRONGEST correlation with actionable recommendation
2. Detect MOOD TRIGGERS from health deviations
3. Find POSITIVE PATTERNS to reinforce
4. Suggest PREVENTIVE interventions for detected risks
5. Celebrate ACHIEVEMENTS in health metrics
6. Provide HOLISTIC wellness recommendations

For each insight, be:
- Specific and data-driven
- Compassionate and encouraging
- Actionable with clear next steps
- Personalized to their patterns

Return JSON:
{
  "insights": [
    {
      "insight_type": "correlation|pattern|recommendation|achievement|alert",
      "title": "Brief, engaging title",
      "description": "2-3 sentences explaining the insight with empathy",
      "correlation_data": {
        "health_metric": "metric name",
        "mood_impact": "mood_rating|energy_level|stress_level",
        "correlation_strength": 0.75,
        "data_points": 15
      },
      "pattern_data": {
        "pattern_description": "What pattern was found",
        "frequency": "daily|weekly|occasional",
        "confidence": 0.8
      },
      "recommendation": {
        "action": "Specific action to take (e.g., 'Aim for 7-8 hours of sleep')",
        "expected_benefit": "What they'll gain",
        "difficulty": "easy|moderate|challenging"
      },
      "priority": "low|medium|high|urgent"
    }
  ]
}`;

    const aiAnalysis = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                insight_type: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                correlation_data: {
                  type: "object",
                  properties: {
                    health_metric: { type: "string" },
                    mood_impact: { type: "string" },
                    correlation_strength: { type: "number" },
                    data_points: { type: "number" }
                  }
                },
                pattern_data: {
                  type: "object",
                  properties: {
                    pattern_description: { type: "string" },
                    frequency: { type: "string" },
                    confidence: { type: "number" }
                  }
                },
                recommendation: {
                  type: "object",
                  properties: {
                    action: { type: "string" },
                    expected_benefit: { type: "string" },
                    difficulty: { type: "string" }
                  }
                },
                priority: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Save insights to database
    const savedInsights = [];
    for (const insight of aiAnalysis.insights || []) {
      const saved = await base44.entities.HealthInsight.create({
        ...insight,
        related_dates: dataPoints.map(d => d.date),
        is_actionable: !!insight.recommendation
      });
      savedInsights.push(saved);
    }

    return Response.json({
      success: true,
      insights: savedInsights,
      data_points_analyzed: dataPoints.length,
      correlations_found: correlations.length,
      summary: dataSummary
    });

  } catch (error) {
    console.error('Health correlation analysis error:', error);
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