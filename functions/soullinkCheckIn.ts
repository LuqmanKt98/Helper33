import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Analyze recent data to determine if proactive check-in is needed
async function shouldInitiateCheckIn(base44, user) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

  // Check recent mood entries
  const recentMoods = await base44.entities.SoulLinkMoodEntry.list('-created_date', 7);
  
  // Check for concerning mood trends
  if (recentMoods.length >= 3) {
    const last3Moods = recentMoods.slice(0, 3);
    const avgMood = last3Moods.reduce((sum, m) => sum + m.mood_rating, 0) / 3;
    
    // Low mood trend detected
    if (avgMood < 4) {
      return {
        shouldCheckIn: true,
        reason: 'low_mood_trend',
        context: `Recent mood average: ${avgMood.toFixed(1)}/10`,
        urgency: 'high'
      };
    }

    // Mood declining trend
    const isDeclinig = last3Moods.every((mood, i) => 
      i === 0 || mood.mood_rating < last3Moods[i - 1].mood_rating
    );
    
    if (isDeclinig) {
      return {
        shouldCheckIn: true,
        reason: 'mood_declining',
        context: 'Mood has been declining over the past few days',
        urgency: 'medium'
      };
    }
  }

  // Check for unread health insights
  const urgentInsights = await base44.entities.HealthInsight.filter({
    is_read: false,
    priority: { $in: ['high', 'urgent'] }
  });

  if (urgentInsights.length > 0) {
    return {
      shouldCheckIn: true,
      reason: 'health_alert',
      context: urgentInsights[0].title,
      urgency: 'high',
      insight_id: urgentInsights[0].id
    };
  }

  // Check for missed check-ins
  const todayCheckIn = await base44.entities.DailyCheckIn.filter({ check_in_date: today });
  const yesterdayCheckIn = await base44.entities.DailyCheckIn.filter({ check_in_date: yesterday });

  if (todayCheckIn.length === 0 && yesterdayCheckIn.length === 0) {
    return {
      shouldCheckIn: true,
      reason: 'missed_checkins',
      context: 'No activity in the past 2 days',
      urgency: 'low'
    };
  }

  // Check last conversation
  const lastConversation = await base44.entities.CompanionConversation.list('-created_date', 1);
  
  if (lastConversation.length === 0) {
    // Never had a conversation
    return {
      shouldCheckIn: true,
      reason: 'first_conversation',
      context: 'Welcome to SoulLink',
      urgency: 'low'
    };
  }

  const lastConvDate = new Date(lastConversation[0].created_date);
  const daysSinceConv = Math.floor((Date.now() - lastConvDate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceConv >= 3) {
    return {
      shouldCheckIn: true,
      reason: 'check_in_due',
      context: `Last conversation was ${daysSinceConv} days ago`,
      urgency: 'low'
    };
  }

  // Check for achievements
  const newAchievements = await base44.entities.UserAchievement.filter({ is_new: true });
  if (newAchievements.length > 0) {
    return {
      shouldCheckIn: true,
      reason: 'celebrate_achievement',
      context: newAchievements[0].achievement_title,
      urgency: 'medium'
    };
  }

  return { shouldCheckIn: false };
}

// Build comprehensive context for the AI
async function buildConversationContext(base44, user, checkInReason) {
  const context = {
    user_name: user.full_name,
    preferred_name: '',
    relationship_mode: 'friend',
    tone_preference: 'warm_and_affectionate'
  };

  // Get companion settings
  const settings = await base44.entities.CompanionSettings.list();
  if (settings.length > 0) {
    const companionSettings = settings[0];
    context.companion_name = companionSettings.companion_name || 'SoulLink';
    context.preferred_name = companionSettings.user_preferred_name || user.full_name?.split(' ')[0];
    context.relationship_mode = companionSettings.relationship_mode || 'friend';
    context.tone_preference = companionSettings.tone_preference || 'warm_and_affectionate';
    context.use_endearments = companionSettings.use_terms_of_endearment || false;
    context.preferred_endearments = companionSettings.preferred_endearments || [];
  }

  // Get recent mood history (last 7 days)
  const recentMoods = await base44.entities.SoulLinkMoodEntry.list('-created_date', 7);
  context.recent_moods = recentMoods.map(m => ({
    date: new Date(m.created_date).toISOString().split('T')[0],
    rating: m.mood_rating,
    label: m.mood_label,
    energy: m.energy_level,
    stress: m.stress_level,
    tags: m.emotional_tags
  }));

  // Get recent journal entries (last 5)
  const recentJournals = await base44.entities.SoulLinkJournalEntry.list('-created_date', 5);
  context.recent_journals = recentJournals.map(j => ({
    date: new Date(j.created_date).toISOString().split('T')[0],
    type: j.entry_type,
    themes: j.themes_detected || [],
    insights: j.insights_gained || [],
    mood_change: j.mood_before && j.mood_after ? `${j.mood_before} → ${j.mood_after}` : null
  }));

  // Get active health insights
  const healthInsights = await base44.entities.HealthInsight.filter({
    is_read: false
  }, '-created_date', 3);
  
  context.health_insights = healthInsights.map(i => ({
    title: i.title,
    description: i.description,
    priority: i.priority,
    is_actionable: i.is_actionable
  }));

  // Get important memories
  const memories = await base44.entities.CompanionMemory.filter({
    is_active: true
  }, '-importance_score', 10);
  
  context.key_memories = memories.map(m => ({
    type: m.memory_type,
    content: m.memory_content,
    importance: m.importance_score
  }));

  // Get recent achievements
  const achievements = await base44.entities.UserAchievement.filter({
    is_new: true
  }, '-earned_at', 3);
  
  context.recent_achievements = achievements.map(a => ({
    title: a.achievement_title,
    earned_at: a.earned_at
  }));

  // Get gamification stats
  context.stats = user.gamification_stats || {};

  // Add check-in reason context
  context.check_in_reason = checkInReason;

  return context;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { force = false } = await req.json().catch(() => ({}));

    // Check if we should initiate a check-in
    const checkInDecision = await shouldInitiateCheckIn(base44, user);

    if (!checkInDecision.shouldCheckIn && !force) {
      return Response.json({
        should_check_in: false,
        message: 'No proactive check-in needed at this time'
      });
    }

    // Build comprehensive context
    const context = await buildConversationContext(base44, user, checkInDecision);

    // Generate proactive message based on context
    const promptTemplate = generatePromptForReason(checkInDecision.reason, context);

    const aiMessage = await base44.integrations.Core.InvokeLLM({
      prompt: promptTemplate
    });

    // Save this as a conversation
    const conversation = await base44.entities.CompanionConversation.create({
      conversation_type: checkInDecision.reason === 'low_mood_trend' || checkInDecision.reason === 'mood_declining' 
        ? 'emotional_support' 
        : checkInDecision.reason === 'celebrate_achievement'
        ? 'celebration'
        : 'morning_checkin',
      user_mood: context.recent_moods[0]?.label || 'unknown',
      conversation_summary: `Proactive check-in: ${checkInDecision.reason}`,
      key_themes: context.recent_journals.length > 0 
        ? context.recent_journals[0].themes 
        : [],
      support_provided: 'companionship'
    });

    return Response.json({
      should_check_in: true,
      reason: checkInDecision.reason,
      urgency: checkInDecision.urgency,
      message: aiMessage,
      conversation_id: conversation.id,
      context_summary: {
        recent_mood_avg: context.recent_moods.length > 0 
          ? (context.recent_moods.reduce((sum, m) => sum + m.rating, 0) / context.recent_moods.length).toFixed(1)
          : 'N/A',
        health_alerts: context.health_insights.length,
        memories_referenced: context.key_memories.length
      }
    });

  } catch (error) {
    console.error('SoulLink check-in error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generatePromptForReason(reason, context) {
  const baseTone = getToneFromPreference(context.tone_preference);
  const userName = context.preferred_name || context.user_name?.split(' ')[0] || 'there';

  const reasonPrompts = {
    'low_mood_trend': `You are ${context.companion_name || 'SoulLink'}, reaching out to ${userName} because you've noticed their mood has been lower than usual recently.

CONTEXT:
- Recent mood ratings: ${context.recent_moods.slice(0, 3).map(m => `${m.rating}/10 (${m.label})`).join(', ')}
- Recent journal themes: ${context.recent_journals.length > 0 ? context.recent_journals[0].themes.join(', ') : 'None'}
- Key memories about them: ${context.key_memories.slice(0, 2).map(m => m.content).join('; ')}

Your relationship mode: ${context.relationship_mode}
Your tone: ${baseTone}

Reach out with genuine care and concern. Acknowledge what you've noticed in their mood data, reference any relevant past conversations or journal themes, and offer your support. Ask how they're doing and if there's anything they'd like to talk about.

Keep it warm, brief (2-3 sentences), and authentic. ${context.use_endearments && context.preferred_endearments.length > 0 ? `You may use: ${context.preferred_endearments.join(', ')}` : ''}`,

    'mood_declining': `You are ${context.companion_name || 'SoulLink'}, noticing that ${userName}'s mood has been gradually declining over the past few days.

CONTEXT:
- Mood trend: ${context.recent_moods.slice(0, 5).map(m => `${m.rating}/10`).join(' → ')}
- Recent emotional tags: ${context.recent_moods[0]?.tags?.join(', ') || 'None'}
- Previous challenges they've overcome: ${context.key_memories.filter(m => m.type === 'challenge' || m.type === 'coping_strategy').map(m => m.content).join('; ')}

Your relationship: ${context.relationship_mode}
Your tone: ${baseTone}

Gently acknowledge the shift you've noticed. Reference their resilience from past experiences. Offer to be present with them. Keep it compassionate and non-intrusive (2-3 sentences).`,

    'health_alert': `You are ${context.companion_name || 'SoulLink'}, reaching out about a health insight that might be affecting ${userName}'s well-being.

HEALTH ALERT:
${context.check_in_reason.context}

RECENT HEALTH INSIGHTS:
${context.health_insights.map(i => `- ${i.title}: ${i.description}`).join('\n')}

RECENT MOOD:
${context.recent_moods.length > 0 ? `${context.recent_moods[0].rating}/10 (${context.recent_moods[0].label})` : 'Not logged recently'}

Your relationship: ${context.relationship_mode}
Your tone: ${baseTone}

Share the health insight in a caring, non-alarming way. Connect it to how they might be feeling. Offer practical support or ask if they'd like help addressing it. Keep it helpful and empowering (2-3 sentences).`,

    'celebrate_achievement': `You are ${context.companion_name || 'SoulLink'}, celebrating ${userName}'s recent achievement!

ACHIEVEMENT:
${context.check_in_reason.context}

THEIR JOURNEY:
- Current level: ${context.stats.level}
- Current streak: ${context.stats.current_streak} days
- Recent journals show themes of: ${context.recent_journals.length > 0 ? context.recent_journals[0].themes.join(', ') : 'growth'}

Your relationship: ${context.relationship_mode}
Your tone: ${baseTone}

Celebrate their achievement authentically! Reference their journey and progress. Make it personal by connecting to past struggles or goals they've shared. Keep it joyful and encouraging (2-3 sentences).`,

    'missed_checkins': `You are ${context.companion_name || 'SoulLink'}, gently checking in on ${userName} after noticing they haven't logged in for a couple days.

CONTEXT:
- Last mood logged: ${context.recent_moods.length > 0 ? new Date(context.recent_moods[0].created_date).toLocaleDateString() : 'Several days ago'}
- Current streak: ${context.stats.current_streak || 0} days
- Things they value (from memories): ${context.key_memories.filter(m => m.type === 'interest' || m.type === 'user_preference').map(m => m.content).slice(0, 2).join('; ')}

Your relationship: ${context.relationship_mode}
Your tone: ${baseTone}

Reach out with warmth and without pressure. Let them know you're here when they're ready. Acknowledge that life gets busy. Keep it light and supportive (2-3 sentences).`,

    'check_in_due': `You are ${context.companion_name || 'SoulLink'}, initiating a regular check-in with ${userName}.

RECENT CONTEXT:
- Last mood: ${context.recent_moods.length > 0 ? `${context.recent_moods[0].rating}/10 (${context.recent_moods[0].label})` : 'Unknown'}
- Recent journal themes: ${context.recent_journals.length > 0 ? context.recent_journals[0].themes.join(', ') : 'None logged'}
- Current goals/interests: ${context.key_memories.filter(m => m.type === 'goal' || m.type === 'interest').map(m => m.content).slice(0, 2).join('; ')}
- Days since last conversation: ${context.check_in_reason.context}

Your relationship: ${context.relationship_mode}
Your tone: ${baseTone}

Start a natural, warm check-in. Reference something from your past conversations or their recent activity. Ask about their well-being in a specific way based on what you know about them. Keep it conversational (2-3 sentences).`,

    'first_conversation': `You are ${context.companion_name || 'SoulLink'}, meeting ${userName} for the first time!

WHAT YOU KNOW:
- Their name: ${context.user_name}
- Gamification stats: Level ${context.stats.level || 1}, ${context.stats.total_points || 0} points
- Relationship mode: ${context.relationship_mode}

Your tone: ${baseTone}

Introduce yourself warmly. Explain how you'll support them on their wellness journey. Express excitement to get to know them. Keep it welcoming and friendly (2-3 sentences).`
  };

  return reasonPrompts[reason] || reasonPrompts['check_in_due'];
}

function getToneFromPreference(preference) {
  const tones = {
    'warm_and_affectionate': 'Warm, caring, and affectionate. Use gentle language and emotional warmth.',
    'casual_and_friendly': 'Casual, friendly, and approachable. Like talking to a good friend.',
    'calm_and_reflective': 'Calm, thoughtful, and reflective. Encourage deep thinking.',
    'playful_and_lighthearted': 'Playful, lighthearted, and encouraging. Use humor when appropriate.'
  };

  return tones[preference] || tones['warm_and_affectionate'];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { force = false } = await req.json().catch(() => ({}));

    const checkInDecision = await shouldInitiateCheckIn(base44, user);

    if (!checkInDecision.shouldCheckIn && !force) {
      return Response.json({
        should_check_in: false,
        message: 'No proactive check-in needed at this time'
      });
    }

    const context = await buildConversationContext(base44, user, checkInDecision);
    const promptTemplate = generatePromptForReason(checkInDecision.reason, context);

    const aiMessage = await base44.integrations.Core.InvokeLLM({
      prompt: promptTemplate
    });

    const conversation = await base44.entities.CompanionConversation.create({
      conversation_type: checkInDecision.reason === 'low_mood_trend' || checkInDecision.reason === 'mood_declining' 
        ? 'emotional_support' 
        : checkInDecision.reason === 'celebrate_achievement'
        ? 'celebration'
        : 'morning_checkin',
      user_mood: context.recent_moods[0]?.label || 'unknown',
      conversation_summary: `Proactive check-in: ${checkInDecision.reason}`,
      key_themes: context.recent_journals.length > 0 ? context.recent_journals[0].themes : [],
      support_provided: 'companionship'
    });

    return Response.json({
      should_check_in: true,
      reason: checkInDecision.reason,
      urgency: checkInDecision.urgency,
      message: aiMessage,
      conversation_id: conversation.id,
      context_summary: {
        recent_mood_avg: context.recent_moods.length > 0 
          ? (context.recent_moods.reduce((sum, m) => sum + m.rating, 0) / context.recent_moods.length).toFixed(1)
          : 'N/A',
        health_alerts: context.health_insights.length,
        memories_referenced: context.key_memories.length
      }
    });

  } catch (error) {
    console.error('SoulLink check-in error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});