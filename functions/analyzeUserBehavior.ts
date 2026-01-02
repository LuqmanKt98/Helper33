import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user activities from the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const activities = await base44.entities.UserActivity.list('-created_date', 200);
    const recentActivities = activities.filter(a => 
      new Date(a.created_date) >= thirtyDaysAgo
    );

    if (recentActivities.length < 5) {
      return Response.json({ 
        message: 'Not enough data yet',
        patterns: [],
        suggestions: []
      });
    }

    // Analyze patterns with AI
    const analysisPrompt = `Analyze the following user activities and detect behavioral patterns. 
    
Activities (last 30 days):
${recentActivities.map(a => `- ${a.activity_type} (${a.activity_category}) at ${a.time_of_day} on ${a.day_of_week}${a.mood_after ? `, mood after: ${a.mood_after}` : ''}`).join('\n')}

Detect:
1. Consistent routines (activities that happen regularly at similar times)
2. Time preferences (when user is most active/productive)
3. Category trends (which categories user engages with most)
4. Mood triggers (activities that consistently improve mood)
5. Correlations (activities that often happen together)

For each pattern:
- Provide confidence score (0-1)
- Suggest a habit that could formalize this behavior
- Estimate impact on user's wellbeing

Return structured insights with specific, actionable habit suggestions.`;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          patterns: {
            type: "array",
            items: {
              type: "object",
              properties: {
                pattern_type: {
                  type: "string",
                  enum: ["consistent_routine", "time_preference", "category_trend", "mood_trigger", "productivity_peak", "correlation"]
                },
                pattern_name: { type: "string" },
                description: { type: "string" },
                confidence_score: { type: "number" },
                frequency: { type: "string" },
                time_of_day: { type: "string" },
                suggested_habit: {
                  type: "object",
                  properties: {
                    habit_name: { type: "string" },
                    description: { type: "string" },
                    category: { type: "string" },
                    frequency: { type: "string" }
                  }
                },
                impact_score: { type: "number" },
                related_activities: {
                  type: "array",
                  items: { type: "string" }
                }
              }
            }
          },
          summary: { type: "string" },
          top_recommendation: { type: "string" }
        }
      }
    });

    // Save detected patterns
    const savedPatterns = [];
    for (const pattern of analysis.patterns) {
      // Check if pattern already exists
      const existing = await base44.entities.BehaviorPattern.filter({
        pattern_name: pattern.pattern_name,
        is_active: true
      });

      if (existing.length > 0) {
        // Update observation count
        const updated = await base44.entities.BehaviorPattern.update(existing[0].id, {
          observation_count: existing[0].observation_count + 1,
          last_observed: new Date().toISOString().split('T')[0],
          confidence_score: Math.min(1, existing[0].confidence_score + 0.05)
        });
        savedPatterns.push(updated);
      } else {
        // Create new pattern
        const created = await base44.entities.BehaviorPattern.create({
          pattern_type: pattern.pattern_type,
          pattern_name: pattern.pattern_name,
          description: pattern.description,
          confidence_score: pattern.confidence_score,
          frequency: pattern.frequency,
          related_activities: pattern.related_activities,
          time_of_day: pattern.time_of_day || "any",
          suggested_habit: pattern.suggested_habit,
          impact_score: pattern.impact_score,
          last_observed: new Date().toISOString().split('T')[0],
          observation_count: 1,
          is_active: true
        });
        savedPatterns.push(created);
      }
    }

    return Response.json({
      success: true,
      patterns: savedPatterns,
      summary: analysis.summary,
      top_recommendation: analysis.top_recommendation,
      activities_analyzed: recentActivities.length
    });

  } catch (error) {
    console.error('Behavior analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});