import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { interaction_type, data } = await req.json();

    const interactionHistory = user.coaching_interaction_history || {
      meditation_completions: {},
      affirmation_saves: {},
      task_acceptance_rate: 0.5,
      total_affirmations_generated: 0,
      total_meditations_completed: 0,
      breakthrough_sessions_completed: 0,
      favorite_affirmation_categories: [],
      favorite_meditation_types: [],
      response_patterns: {}
    };

    // Update based on interaction type
    if (interaction_type === 'meditation_completed') {
      const meditationType = data.meditation_type;
      interactionHistory.meditation_completions[meditationType] = 
        (interactionHistory.meditation_completions[meditationType] || 0) + 1;
      interactionHistory.total_meditations_completed = 
        (interactionHistory.total_meditations_completed || 0) + 1;
      
      interactionHistory.favorite_meditation_types = 
        Object.entries(interactionHistory.meditation_completions)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([type]) => type);
    } else if (interaction_type === 'affirmation_saved') {
      const category = data.category;
      interactionHistory.affirmation_saves[category] = 
        (interactionHistory.affirmation_saves[category] || 0) + 1;
      
      interactionHistory.favorite_affirmation_categories = 
        Object.entries(interactionHistory.affirmation_saves)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([cat]) => cat);
    } else if (interaction_type === 'affirmation_generated') {
      interactionHistory.total_affirmations_generated = 
        (interactionHistory.total_affirmations_generated || 0) + 1;
    } else if (interaction_type === 'task_accepted') {
      const currentRate = interactionHistory.task_acceptance_rate || 0.5;
      const totalTasks = (user.coaching_stats?.tasksAccepted || 0) + 1;
      interactionHistory.task_acceptance_rate = 
        (currentRate * (totalTasks - 1) + 1) / totalTasks;
      
      if (data.difficulty) {
        interactionHistory.preferred_task_difficulty = data.difficulty;
      }
    } else if (interaction_type === 'task_skipped') {
      const skipRate = interactionHistory.task_acceptance_rate || 0.5;
      const skipTotal = (user.coaching_stats?.tasksAccepted || 0) + 1;
      interactionHistory.task_acceptance_rate = 
        (skipRate * (skipTotal - 1)) / skipTotal;
    } else if (interaction_type === 'breakthrough_completed') {
      interactionHistory.breakthrough_sessions_completed = 
        (interactionHistory.breakthrough_sessions_completed || 0) + 1;
      
      interactionHistory.response_patterns = {
        ...interactionHistory.response_patterns,
        engages_with_depth: true
      };
    } else if (interaction_type === 'session_duration_tracked') {
      const currentAvg = interactionHistory.avg_session_duration_minutes || 10;
      const sessionCount = interactionHistory.total_meditations_completed || 1;
      interactionHistory.avg_session_duration_minutes = 
        (currentAvg * (sessionCount - 1) + data.duration_minutes) / sessionCount;
    } else if (interaction_type === 'active_time_logged') {
      const hour = new Date(data.timestamp).getHours();
      const timeOfDay = 
        hour < 12 ? 'morning' :
        hour < 17 ? 'midday' :
        hour < 21 ? 'evening' : 'night';
      
      interactionHistory.most_active_time = timeOfDay;
    }

    // Auto-update preferences
    const updatedPreferences = updatePreferencesFromHistory(user, interactionHistory);

    // Update user
    await base44.auth.updateMe({
      coaching_interaction_history: interactionHistory,
      ...(updatedPreferences && { coaching_preferences: updatedPreferences })
    });

    return Response.json({ 
      success: true,
      learned_preferences: {
        favorite_meditations: interactionHistory.favorite_meditation_types,
        favorite_affirmations: interactionHistory.favorite_affirmation_categories,
        task_acceptance_rate: interactionHistory.task_acceptance_rate
      }
    });

  } catch (error) {
    console.error('Tracking error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});

function updatePreferencesFromHistory(user, history) {
  const currentPrefs = user.coaching_preferences || {};
  let updated = false;
  const newPrefs = { ...currentPrefs };

  if (history.favorite_meditation_types?.length >= 2 && history.total_meditations_completed >= 5) {
    newPrefs.preferred_meditation_types = history.favorite_meditation_types;
    updated = true;
  }

  if (history.favorite_affirmation_categories?.length >= 2 && history.total_affirmations_generated >= 10) {
    newPrefs.preferred_affirmation_categories = history.favorite_affirmation_categories;
    updated = true;
  }

  if (history.task_acceptance_rate < 0.4 && currentPrefs.task_difficulty_preference === 'adaptive') {
    newPrefs.task_difficulty_preference = 'always_gentle';
    updated = true;
  } else if (history.task_acceptance_rate > 0.8 && currentPrefs.task_difficulty_preference === 'adaptive') {
    newPrefs.task_difficulty_preference = 'challenging';
    updated = true;
  }

  if (history.most_active_time) {
    newPrefs.preferred_session_time = history.most_active_time;
    updated = true;
  }

  if (updated) {
    newPrefs.last_auto_update = new Date().toISOString();
    return newPrefs;
  }

  return null;
}