import { createClient } from 'npm:@base44/sdk@0.7.1';
import { subDays } from 'npm:date-fns@3.0.0';

const base44 = createClient({ serviceRole: true });

Deno.serve(async (req) => {
  try {
    console.log('🔍 Proactive Coach Check-In Started');

    const allGoals = await base44.entities.CoachingGoal.filter({
      status: 'active',
      has_human_coach: false
    });

    console.log(`📋 Analyzing ${allGoals.length} self-directed goals`);

    let interventionsSent = 0;

    for (const goal of allGoals) {
      try {
        const users = await base44.entities.User.filter({ email: goal.created_by });
        if (!users || users.length === 0) continue;
        const user = users[0];

        const sevenDaysAgo = subDays(new Date(), 7).toISOString().split('T')[0];
        const recentProgress = await base44.entities.CoachingProgress.filter({
          goal_id: goal.id,
          progress_date: { $gte: sevenDaysAgo }
        }, '-progress_date');

        const patterns = analyzePatterns(goal, recentProgress);
        const intervention = needsIntervention(patterns, goal, recentProgress);

        if (intervention.needed) {
          console.log(`🚨 Intervention for ${user.email}: ${intervention.reason}`);

          const aiResponse = await createProactiveMessage(goal, patterns, intervention, user);

          await base44.integrations.Core.SendEmail({
            from_name: 'DobryLife AI Coach',
            to: user.email,
            subject: aiResponse.subject,
            body: aiResponse.emailBody
          });

          await base44.entities.CoachingProgress.create({
            goal_id: goal.id,
            progress_date: new Date().toISOString().split('T')[0],
            progress_type: 'check_in',
            description: `Proactive: ${intervention.reason}`,
            ai_encouragement: aiResponse.encouragement
          });

          interventionsSent++;
        }

      } catch (error) {
        console.error(`Error processing goal ${goal.id}:`, error);
      }
    }

    console.log(`✅ Complete: ${interventionsSent} interventions`);

    return Response.json({
      success: true,
      interventions_sent: interventionsSent,
      goals_analyzed: allGoals.length
    });

  } catch (error) {
    console.error('❌ Error:', error);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});

function analyzePatterns(goal, recentProgress) {
  const patterns = {
    lowMoodStreak: false,
    lowMoodDays: 0,
    noActivityDays: 0,
    taskAvoidance: false,
    positiveStreak: false,
    stagnation: false
  };

  if (recentProgress.length === 0) {
    const daysSince = goal.last_checkin_date 
      ? Math.floor((Date.now() - new Date(goal.last_checkin_date)) / (1000 * 60 * 60 * 24))
      : 999;
    patterns.noActivityDays = daysSince;
    patterns.stagnation = daysSince > 14;
    return patterns;
  }

  const moods = recentProgress.filter(p => p.mood_rating).map(p => p.mood_rating);
  if (moods.length >= 3) {
    const avg = moods.reduce((a, b) => a + b, 0) / moods.length;
    patterns.lowMoodStreak = avg <= 4;
    patterns.lowMoodDays = moods.filter(m => m <= 4).length;
    patterns.positiveStreak = avg >= 7;
  }

  const tasks = goal.suggested_tasks || [];
  const completed = tasks.filter(t => t.completed).length;
  if (tasks.length >= 3) {
    patterns.taskAvoidance = (completed / tasks.length) < 0.3;
  }

  return patterns;
}

function needsIntervention(patterns, goal, progress) {
  if (patterns.lowMoodStreak && patterns.lowMoodDays >= 3) {
    return { needed: true, reason: 'Low mood pattern', type: 'emotional_support' };
  }
  if (patterns.stagnation && patterns.noActivityDays > 10) {
    return { needed: true, reason: 'Extended inactivity', type: 'gentle_reconnect' };
  }
  if (patterns.taskAvoidance) {
    return { needed: true, reason: 'Task difficulty', type: 'barrier_exploration' };
  }
  if (patterns.positiveStreak && progress.length >= 3) {
    const daysSince = goal.last_checkin_date 
      ? Math.floor((Date.now() - new Date(goal.last_checkin_date)) / (1000 * 60 * 60 * 24))
      : 0;
    if (daysSince >= 7) {
      return { needed: true, reason: 'Positive momentum', type: 'celebration' };
    }
  }
  return { needed: false };
}

async function createProactiveMessage(goal, patterns, intervention, user) {
  const prompt = `Create proactive email for ${intervention.type}. Return JSON with subject, opening, pattern_observation, affirmation, suggested_action, encouragement, meditation_suggestion fields.`;

  const response = await base44.integrations.Core.InvokeLLM({
    prompt: `Compassionate proactive check-in for ${user.full_name}. Goal: ${goal.goal_title}. Type: ${intervention.type}. Create JSON: {subject, opening, pattern_observation, affirmation, suggested_action, encouragement, meditation_suggestion}`,
    response_json_schema: {
      type: "object",
      properties: {
        subject: { type: "string" },
        opening: { type: "string" },
        pattern_observation: { type: "string" },
        affirmation: { type: "string" },
        suggested_action: { type: "string" },
        encouragement: { type: "string" },
        meditation_suggestion: { type: "string" }
      }
    }
  });

  const appUrl = Deno.env.get('APP_URL') || 'https://dobrylife.com';
  
  const emailBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #7C3AED, #EC4899); border-radius: 16px; padding: 30px; color: white; text-align: center; margin-bottom: 20px;">
        <h1 style="margin: 0 0 10px 0; font-size: 28px;">💜 A Gentle Check-In</h1>
        <p style="margin: 0; font-size: 16px;">${user.full_name}, I wanted to reach out</p>
      </div>
      <div style="background: white; border-radius: 12px; padding: 25px;">
        <p style="color: #4B5563; line-height: 1.8; margin-bottom: 20px;">${response.opening}</p>
        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin: 20px 0; border-radius: 8px;">
          <p style="margin: 0; color: #78350F;"><strong>Pattern:</strong> ${response.pattern_observation}</p>
        </div>
        <div style="background: #DBEAFE; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <p style="font-size: 18px; font-weight: bold; color: #1E3A8A; margin: 0 0 10px 0;">✨ Affirmation ✨</p>
          <p style="font-size: 16px; color: #1E40AF; font-style: italic;">"${response.affirmation}"</p>
        </div>
        ${response.suggested_action ? `<div style="background: #D1FAE5; border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="font-weight: 600; color: #065F46; margin-bottom: 10px;">🎯 Gentle Action:</p>
          <p style="color: #047857;">${response.suggested_action}</p>
        </div>` : ''}
        <p style="color: #4B5563; line-height: 1.8; margin: 20px 0;">${response.encouragement}</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${appUrl}/CoachingProgress" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #EC4899); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600;">
            Continue Journey
          </a>
        </div>
      </div>
    </div>
  `;

  return { subject: response.subject, encouragement: response.encouragement, affirmation: response.affirmation, emailBody };
}