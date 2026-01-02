import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan_type = 'weekly' } = await req.json();

    // Gather user data for personalization
    const stats = user.gamification_stats || {};
    const currentLevel = stats.level || 1;
    const currentStreak = stats.current_streak || 0;
    
    // Get recent journal entries
    const recentJournals = await base44.entities.UserJournalEntry.filter({}, '-created_date', 10);
    
    // Get recent mood entries
    const recentMoods = await base44.entities.SoulLinkMoodEntry.filter({}, '-created_date', 7);
    
    // Get active challenges
    const activeChallenges = await base44.entities.ChallengeParticipant.filter({
      status: 'active'
    });
    
    // Get recent wellness entries
    const recentWellness = await base44.entities.WellnessEntry.filter({}, '-date', 7);
    
    // Get active habits
    const activeHabits = await base44.entities.HabitTracker.filter({
      is_active: true
    });
    
    // Get recent tasks
    const recentTasks = await base44.entities.Task.filter({}, '-created_date', 20);
    const completedTasks = recentTasks.filter(t => t.status === 'completed');
    const taskCompletionRate = recentTasks.length > 0 
      ? Math.round((completedTasks.length / recentTasks.length) * 100) 
      : 0;

    // Extract themes and patterns
    const journalThemes = recentJournals
      .flatMap(j => j.themes_detected || [])
      .filter((v, i, a) => a.indexOf(v) === i)
      .slice(0, 5);

    const avgMoodRating = recentMoods.length > 0
      ? recentMoods.reduce((sum, m) => sum + (m.mood_rating || 5), 0) / recentMoods.length
      : 5;

    const avgEnergyLevel = recentWellness.length > 0
      ? recentWellness.reduce((sum, w) => sum + (w.energy_level || 5), 0) / recentWellness.length
      : 5;

    const avgSleepHours = recentWellness.length > 0
      ? recentWellness.reduce((sum, w) => sum + (w.sleep_hours || 7), 0) / recentWellness.length
      : 7;

    // Build context for AI
    const context = {
      current_level: currentLevel,
      current_streak: currentStreak,
      active_challenges: activeChallenges.length,
      recent_moods: recentMoods.map(m => m.mood_label),
      journal_themes: journalThemes,
      wellness_goals: user.life_goals || [],
      avg_mood: avgMoodRating,
      avg_energy: avgEnergyLevel,
      avg_sleep: avgSleepHours,
      task_completion_rate: taskCompletionRate,
      active_habits_count: activeHabits.length
    };

    // Generate AI-powered plan
    const aiPrompt = `You are a compassionate wellness coach creating a personalized ${plan_type} wellness plan.

User Profile:
- Level: ${currentLevel}
- Current Streak: ${currentStreak} days
- Active Challenges: ${activeChallenges.length}
- Average Mood: ${avgMoodRating.toFixed(1)}/10
- Average Energy: ${avgEnergyLevel.toFixed(1)}/10
- Average Sleep: ${avgSleepHours.toFixed(1)} hours
- Task Completion Rate: ${taskCompletionRate}%
- Active Habits: ${activeHabits.length}
- Journal Themes: ${journalThemes.join(', ') || 'None yet'}
- Life Goals: ${(user.life_goals || []).join(', ') || 'Not set'}

Recent Mood Patterns:
${recentMoods.slice(0, 5).map(m => `- ${m.mood_label} (${m.mood_rating}/10): ${m.context_note || 'No note'}`).join('\n')}

Based on this data, create a personalized wellness plan with 5-7 suggestions. Include:
1. Daily tasks that align with their goals and mood patterns
2. Mindfulness exercises appropriate for their current state
3. New challenge recommendations
4. Habit formation suggestions
5. Reflection prompts

For each suggestion, provide:
- A clear, actionable title
- Detailed description (what and how)
- Why you're suggesting this (based on their data)
- Estimated duration in minutes
- Difficulty level (easy/moderate/challenging)
- Best time of day (morning/afternoon/evening/night/anytime)
- Priority level (low/medium/high/urgent)

Return a JSON object with this structure:
{
  "plan_name": "string",
  "ai_insights": "string (2-3 sentences about their current state and what they should focus on)",
  "focus_areas": ["string array of 2-3 key areas"],
  "suggestions": [
    {
      "suggestion_type": "task|mindfulness_exercise|challenge|habit|reflection|activity",
      "title": "string",
      "description": "string",
      "ai_reasoning": "string",
      "priority": "low|medium|high|urgent",
      "estimated_duration_minutes": number,
      "difficulty_level": "easy|moderate|challenging",
      "suggested_time_of_day": "morning|afternoon|evening|night|anytime",
      "task_data": {
        "title": "string",
        "description": "string",
        "category": "self_care|family|work|health|grief_support|daily_living|other",
        "priority": "low|medium|high|urgent",
        "estimated_duration": number
      }
    }
  ]
}`;

    const aiResult = await base44.integrations.Core.InvokeLLM({
      prompt: aiPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          plan_name: { type: "string" },
          ai_insights: { type: "string" },
          focus_areas: { type: "array", items: { type: "string" } },
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                suggestion_type: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                ai_reasoning: { type: "string" },
                priority: { type: "string" },
                estimated_duration_minutes: { type: "number" },
                difficulty_level: { type: "string" },
                suggested_time_of_day: { type: "string" },
                task_data: { 
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                    category: { type: "string" },
                    priority: { type: "string" },
                    estimated_duration: { type: "number" }
                  }
                }
              }
            }
          }
        }
      }
    });

    // Create WellnessPlan record
    const plan = await base44.entities.WellnessPlan.create({
      plan_name: aiResult.plan_name,
      plan_type: plan_type,
      generated_for_date: new Date().toISOString().split('T')[0],
      generation_context: context,
      ai_insights: aiResult.ai_insights,
      focus_areas: aiResult.focus_areas,
      total_suggestions: aiResult.suggestions.length,
      accepted_suggestions: 0,
      rejected_suggestions: 0,
      status: 'active'
    });

    // Create suggestion records
    const suggestions = [];
    for (const suggestion of aiResult.suggestions) {
      const created = await base44.entities.WellnessPlanSuggestion.create({
        plan_id: plan.id,
        suggestion_type: suggestion.suggestion_type,
        title: suggestion.title,
        description: suggestion.description,
        ai_reasoning: suggestion.ai_reasoning,
        priority: suggestion.priority,
        estimated_duration_minutes: suggestion.estimated_duration_minutes,
        difficulty_level: suggestion.difficulty_level,
        suggested_time_of_day: suggestion.suggested_time_of_day,
        task_data: suggestion.task_data,
        status: 'pending'
      });
      
      suggestions.push(created);
    }

    return Response.json({
      success: true,
      plan: plan,
      suggestions: suggestions
    });

  } catch (error) {
    console.error('Generate wellness plan error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to generate personalized wellness plan'
    }, { status: 500 });
  }
});