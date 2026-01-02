import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { report_type = 'weekly' } = await req.json();

    // Calculate date range
    const today = new Date();
    let startDate, endDate;

    if (report_type === 'weekly') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      endDate = today;
    } else if (report_type === 'monthly') {
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      endDate = today;
    } else {
      return Response.json({ error: 'Invalid report type' }, { status: 400 });
    }

    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Gather all data
    const [
      pregnancyData,
      symptoms,
      cycles,
      wellnessEntries,
      babyFeedings,
      diaperLogs,
      babySleepLogs,
      healthLogs
    ] = await Promise.all([
      base44.entities.PregnancyTracking.list(),
      base44.entities.CycleSymptom.filter({
        created_by: user.email,
        log_date: { $gte: startDateStr, $lte: endDateStr }
      }),
      base44.entities.MenstrualCycle.list('-created_date'),
      base44.entities.WellnessEntry.filter({
        created_by: user.email,
        date: { $gte: startDateStr, $lte: endDateStr }
      }),
      base44.entities.BabyFeedLog.filter({
        created_by: user.email,
        start_time: { $gte: startDateStr }
      }),
      base44.entities.DiaperLog.filter({
        created_by: user.email,
        change_time: { $gte: startDateStr }
      }),
      base44.entities.BabySleepLog.filter({
        created_by: user.email,
        sleep_start: { $gte: startDateStr }
      }),
      base44.entities.HealthLog.filter({
        created_by: user.email,
        log_date: { $gte: startDateStr }
      })
    ]);

    const pregnancy = pregnancyData[0];
    const healthProfile = user.health_profile || {};

    // Calculate wellness metrics
    const wellnessMetrics = {
      average_mood: wellnessEntries.length > 0 
        ? wellnessEntries.reduce((sum, e) => sum + (e.mood_rating || 0), 0) / wellnessEntries.length 
        : 0,
      average_energy: wellnessEntries.length > 0
        ? wellnessEntries.reduce((sum, e) => sum + (e.energy_level || 0), 0) / wellnessEntries.length
        : 0,
      average_sleep_hours: wellnessEntries.length > 0
        ? wellnessEntries.reduce((sum, e) => sum + (e.sleep_hours || 0), 0) / wellnessEntries.length
        : 0,
      average_sleep_quality: wellnessEntries.length > 0
        ? wellnessEntries.reduce((sum, e) => sum + (e.sleep_quality || 0), 0) / wellnessEntries.length
        : 0,
      total_exercise_minutes: wellnessEntries.reduce((sum, e) => sum + (e.exercise_minutes || 0), 0),
      total_meditation_minutes: wellnessEntries.reduce((sum, e) => sum + (e.meditation_minutes || 0), 0),
      average_water_intake: wellnessEntries.length > 0
        ? wellnessEntries.reduce((sum, e) => sum + (e.water_intake || 0), 0) / wellnessEntries.length
        : 0
    };

    // Analyze symptoms
    const symptomCounts = {};
    const symptomSeverities = {};

    symptoms.forEach(s => {
      (s.physical_symptoms || []).forEach(symptom => {
        symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        
        if (s.symptom_severity && s.symptom_severity[symptom]) {
          if (!symptomSeverities[symptom]) symptomSeverities[symptom] = [];
          symptomSeverities[symptom].push(s.symptom_severity[symptom]);
        }
      });
    });

    const mostFrequentSymptoms = Object.entries(symptomCounts)
      .map(([symptom, frequency]) => ({
        symptom,
        frequency,
        average_severity: symptomSeverities[symptom]
          ? symptomSeverities[symptom].reduce((a, b) => a + b, 0) / symptomSeverities[symptom].length
          : 0
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 5);

    // Baby care summary for postpartum
    let babyCare = null;
    if (pregnancy?.pregnancy_status === 'postpartum') {
      babyCare = {
        total_feedings: babyFeedings.length,
        average_feeding_duration: babyFeedings.length > 0
          ? babyFeedings.reduce((sum, f) => sum + (f.duration_minutes || 0), 0) / babyFeedings.length
          : 0,
        total_diaper_changes: diaperLogs.length,
        average_sleep_hours_per_day: babySleepLogs.length > 0
          ? babySleepLogs.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) / babySleepLogs.length / 60
          : 0
      };
    }

    // Build prompt for AI analysis
    const analysisPrompt = `You are a women's health AI coach generating a personalized health report.

USER CONTEXT:
- Health Status: ${pregnancy?.pregnancy_status || 'general wellness tracking'}
- Pregnancy Week: ${pregnancy?.current_week || 'N/A'}
- Postpartum Weeks: ${pregnancy?.postpartum_weeks || 'N/A'}
- Age: ${healthProfile.age || 'Unknown'}
- Chronic Conditions: ${(healthProfile.chronic_conditions || []).join(', ') || 'None'}

PERIOD: ${report_type} report from ${startDateStr} to ${endDateStr}

WELLNESS DATA:
- Days logged: ${wellnessEntries.length}
- Average mood: ${wellnessMetrics.average_mood.toFixed(1)}/10
- Average energy: ${wellnessMetrics.average_energy.toFixed(1)}/10
- Average sleep: ${wellnessMetrics.average_sleep_hours.toFixed(1)} hours
- Sleep quality: ${wellnessMetrics.average_sleep_quality.toFixed(1)}/10
- Total exercise: ${wellnessMetrics.total_exercise_minutes} minutes
- Total meditation: ${wellnessMetrics.total_meditation_minutes} minutes
- Average water: ${wellnessMetrics.average_water_intake.toFixed(1)} glasses/day

SYMPTOM DATA:
- Total symptom logs: ${symptoms.length}
- Most frequent symptoms: ${mostFrequentSymptoms.map(s => `${s.symptom} (${s.frequency} times, severity ${s.average_severity.toFixed(1)}/10)`).join(', ')}

${pregnancy?.pregnancy_status === 'postpartum' ? `
BABY CARE DATA:
- Total feedings: ${babyCare.total_feedings}
- Average feeding duration: ${babyCare.average_feeding_duration.toFixed(0)} minutes
- Total diaper changes: ${babyCare.total_diaper_changes}
- Baby's average sleep: ${babyCare.average_sleep_hours_per_day.toFixed(1)} hours/day
` : ''}

GENERATE A COMPREHENSIVE HEALTH REPORT:

1. **summary**: A warm, encouraging 2-3 sentence overview of this period

2. **key_insights**: Array of 4-6 insights with:
   - category: pregnancy_progress, symptom_trends, wellness, nutrition, sleep, mood, baby_care, or cycle_health
   - insight: Specific observation (e.g., "Your energy improved by 20% this week!")
   - severity: positive, neutral, needs_attention, or concerning

3. **symptom_analysis**:
   - symptom_trends: Description of symptom patterns
   - concerning_patterns: Array of any worrying patterns (empty if none)

4. **recommendations**: Array of 5-7 specific recommendations with:
   - category: nutrition, exercise, sleep, stress_management, symptom_management, medical_consultation, self_care, or baby_care
   - recommendation: Clear advice
   - priority: low, medium, high, or urgent
   - actionable_steps: Array of 2-3 specific actions

5. **personalized_meal_plan**:
   - focus_nutrients: Array of nutrients to prioritize (e.g., "iron", "folic acid", "calcium")
   - suggested_foods: Array of specific foods to eat more of
   - foods_to_limit: Array of foods to reduce (if any)

6. **milestone_achievements**: Array of positive milestones reached (e.g., "Entered second trimester!", "Baby sleeping longer stretches")

7. **medical_alerts**: Array of symptoms/patterns requiring doctor consultation (empty if none concerning)

8. **next_steps**: Array of 3-5 action items for the next ${report_type} period

Be specific, encouraging, and evidence-based. Celebrate progress while gently addressing areas for improvement.`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          summary: { type: "string" },
          key_insights: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                insight: { type: "string" },
                severity: { type: "string" }
              }
            }
          },
          symptom_analysis: {
            type: "object",
            properties: {
              symptom_trends: { type: "string" },
              concerning_patterns: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                category: { type: "string" },
                recommendation: { type: "string" },
                priority: { type: "string" },
                actionable_steps: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          personalized_meal_plan: {
            type: "object",
            properties: {
              focus_nutrients: {
                type: "array",
                items: { type: "string" }
              },
              suggested_foods: {
                type: "array",
                items: { type: "string" }
              },
              foods_to_limit: {
                type: "array",
                items: { type: "string" }
              }
            }
          },
          milestone_achievements: {
            type: "array",
            items: {
              type: "object",
              properties: {
                milestone: { type: "string" },
                date_achieved: { type: "string" },
                description: { type: "string" }
              }
            }
          },
          medical_alerts: {
            type: "array",
            items: { type: "string" }
          },
          next_steps: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    // Create health report
    const reportData = {
      report_type,
      period_start: startDateStr,
      period_end: endDateStr,
      health_status: pregnancy?.pregnancy_status || 'not_pregnant',
      pregnancy_week_range: pregnancy?.pregnancy_status === 'pregnant' ? {
        start_week: pregnancy.current_week,
        end_week: pregnancy.current_week
      } : null,
      postpartum_week_range: pregnancy?.pregnancy_status === 'postpartum' ? {
        start_week: pregnancy.postpartum_weeks,
        end_week: pregnancy.postpartum_weeks
      } : null,
      summary: aiResponse.summary,
      key_insights: aiResponse.key_insights,
      symptom_analysis: {
        most_frequent_symptoms: mostFrequentSymptoms,
        symptom_trends: aiResponse.symptom_analysis.symptom_trends,
        concerning_patterns: aiResponse.symptom_analysis.concerning_patterns
      },
      wellness_metrics: {
        ...wellnessMetrics,
        wellness_trend: wellnessMetrics.average_mood > 7 ? 'improving' : 
                        wellnessMetrics.average_mood > 5 ? 'stable' : 'needs_attention'
      },
      baby_care_summary: babyCare,
      recommendations: aiResponse.recommendations,
      personalized_meal_plan: aiResponse.personalized_meal_plan,
      milestone_achievements: aiResponse.milestone_achievements,
      medical_alerts: aiResponse.medical_alerts,
      next_steps: aiResponse.next_steps,
      report_generated_at: new Date().toISOString()
    };

    const report = await base44.entities.HealthReport.create(reportData);

    return Response.json({
      success: true,
      report
    });
  } catch (error) {
    console.error('Error generating health report:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});