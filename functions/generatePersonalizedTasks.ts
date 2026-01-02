import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { goal_id, count = 3 } = await req.json();

    // Get the goal
    const goals = await base44.entities.CoachingGoal.filter({ id: goal_id });
    if (!goals || goals.length === 0) {
      return Response.json({ error: 'Goal not found' }, { status: 404 });
    }
    const goal = goals[0];

    // Get user preferences and interaction history
    const prefs = user.coaching_preferences || {};
    const history = user.coaching_interaction_history || {};

    // Get recent progress to understand context
    const recentProgress = await base44.entities.CoachingProgress.filter({
      goal_id: goal.id
    }, '-progress_date', 5);

    // Determine task difficulty based on user preferences and performance
    let taskDifficulty = prefs.task_difficulty_preference || 'adaptive';
    
    if (taskDifficulty === 'adaptive') {
      // Adapt based on task acceptance rate
      if (history.task_acceptance_rate < 0.4) {
        taskDifficulty = 'gentle';
      } else if (history.task_acceptance_rate > 0.7) {
        taskDifficulty = 'moderate_stretch';
      } else {
        taskDifficulty = 'moderate';
      }
    } else if (taskDifficulty === 'always_gentle') {
      taskDifficulty = 'very_gentle';
    } else if (taskDifficulty === 'challenging') {
      taskDifficulty = 'challenging_stretch';
    }

    // Build personalized context
    const recentMoods = recentProgress
      .filter(p => p.mood_rating)
      .map(p => p.mood_rating);
    const avgMood = recentMoods.length > 0
      ? recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length
      : 5;

    const prompt = `You are generating personalized action tasks for this specific user.

USER PROFILE & PREFERENCES:
- Name: ${user.full_name}
- Communication Style: ${prefs.communication_style || 'warm_conversational'}
- Task Difficulty: ${taskDifficulty}
- Learning Style: ${prefs.learning_modality || 'mixed'}
- Core Values: ${prefs.values_keywords?.join(', ') || 'authenticity, growth'}
- Preferred Metaphors: ${prefs.metaphor_preferences?.join(', ') || 'journey, nature'}
- Spiritual Approach: ${prefs.spiritual_openness || 'varied'}
- NEVER USE: ${prefs.trigger_words_to_avoid?.join(', ') || 'none'}
- Response to Setbacks: ${prefs.response_to_setbacks || 'reframing_focus'}
- Session Length Preference: ${prefs.session_length_preference || 'moderate'}

LEARNED PATTERNS:
- Task Acceptance Rate: ${((history.task_acceptance_rate || 0.5) * 100).toFixed(0)}%
- Preferred Task Difficulty (learned): ${history.preferred_task_difficulty || 'learning'}
- Most Active Time: ${history.most_active_time || 'flexible'}
- Engages with Depth: ${history.response_patterns?.engages_with_depth ? 'Yes' : 'Learning'}

CURRENT STATE:
- Goal: ${goal.goal_title}
- Category: ${goal.category}
- Progress: ${goal.progress_percentage}%
- Recent Average Mood: ${avgMood.toFixed(1)}/10
- Recent Challenges: ${recentProgress[0]?.challenges_faced?.join(', ') || 'none noted'}
- Recent Wins: ${recentProgress[0]?.wins_celebrated?.join(', ') || 'none noted'}

TASK DIFFICULTY LEVEL: ${taskDifficulty}

CREATE ${count} PERSONALIZED TASKS:

REQUIREMENTS:
1. Match ${prefs.communication_style || 'warm'} communication style
2. Use ${prefs.learning_modality || 'mixed'} learning approaches
3. Incorporate their values: ${prefs.values_keywords?.slice(0, 2).join(', ') || 'personal growth'}
4. Use ${prefs.metaphor_preferences?.[0] || 'journey'} metaphors when natural
5. NEVER include these words: ${prefs.trigger_words_to_avoid?.join(', ') || 'none'}
6. Respect ${prefs.spiritual_openness || 'varied'} spiritual approach
7. Match difficulty: ${taskDifficulty}

${taskDifficulty.includes('gentle') ? 'Focus on: Small, achievable, low-pressure, supportive tasks' : ''}
${taskDifficulty.includes('moderate') ? 'Focus on: Meaningful but manageable tasks that build momentum' : ''}
${taskDifficulty.includes('challenging') ? 'Focus on: Growth-edge tasks that inspire capability' : ''}

${prefs.learning_modality === 'visual' ? 'Include: Visual tasks (create, observe, design)' : ''}
${prefs.learning_modality === 'auditory' ? 'Include: Listening or speaking tasks' : ''}
${prefs.learning_modality === 'kinesthetic' ? 'Include: Active, hands-on tasks' : ''}
${prefs.learning_modality === 'reading_writing' ? 'Include: Reflective, written tasks' : ''}

Return JSON array:
[
  {
    "task_title": "Specific, actionable task",
    "task_description": "Why this matters for their goal (1-2 sentences)",
    "estimated_minutes": 15-60,
    "difficulty_level": "gentle" | "moderate" | "challenging",
    "supports_value": "Which of their values this supports",
    "learning_style_match": "How this matches their learning style",
    "personalization_note": "Why this task is specifically for them"
  }
]`;

    const tasks = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                task_title: { type: "string" },
                task_description: { type: "string" },
                estimated_minutes: { type: "number" },
                difficulty_level: { type: "string" },
                supports_value: { type: "string" },
                learning_style_match: { type: "string" },
                personalization_note: { type: "string" }
              }
            }
          }
        }
      }
    });

    // Update goal with new suggested tasks
    const existingTasks = goal.suggested_tasks || [];
    const newTasks = tasks.tasks.map(task => ({
      task_title: task.task_title,
      task_description: task.task_description,
      estimated_minutes: task.estimated_minutes,
      difficulty_level: task.difficulty_level,
      personalization_note: task.personalization_note,
      created_at: new Date().toISOString(),
      accepted: false,
      completed: false
    }));

    await base44.entities.CoachingGoal.update(goal.id, {
      suggested_tasks: [...existingTasks, ...newTasks]
    });

    return Response.json({
      success: true,
      tasks: tasks.tasks,
      personalization_applied: {
        communication_style: prefs.communication_style,
        difficulty: taskDifficulty,
        learning_style: prefs.learning_modality,
        values_incorporated: prefs.values_keywords?.slice(0, 2)
      }
    });

  } catch (error) {
    console.error('Task generation error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});