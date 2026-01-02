import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Points awarded for different activities
const ACTIVITY_POINTS = {
  'mood_check_in': 10,
  'journal_entry': 15,
  'wellness_log': 15,
  'health_sync': 10,
  'mindfulness_session': 20,
  'task_completed': 5,
  'habit_completed': 10,
  'challenge_check_in': 25,
  'event_rsvp': 10,
  'event_attendance': 30,
  'event_chat_message': 2,
  'event_full_participation': 50
};

// Streak bonuses
const STREAK_BONUSES = {
  3: 25,
  7: 75,
  14: 150,
  30: 300,
  60: 600,
  100: 1000
};

function getXPForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { activity_type, activity_data = {} } = await req.json();

    let basePoints = 0;
    let bonusPoints = 0;
    let streakBonus = 0;
    const breakdown = {};
    const achievementsEarned = [];

    basePoints = ACTIVITY_POINTS[activity_type] || 0;
    breakdown.base_points = basePoints;

    const stats = user.gamification_stats || {
      total_points: 0,
      level: 1,
      xp_current: 0,
      xp_to_next_level: 100,
      current_streak: 0,
      longest_streak: 0,
      wellness_streak: 0,
      journal_streak: 0,
      mood_streak: 0,
      mindfulness_streak: 0,
      perfect_days: 0,
      events_attended: 0,
      events_rsvp_count: 0,
      event_chat_messages: 0
    };

    // Event-specific bonuses
    if (activity_type === 'event_rsvp') {
      const newRSVPCount = (stats.events_rsvp_count || 0) + 1;
      
      // Bonus for first RSVP
      if (newRSVPCount === 1) {
        bonusPoints += 15;
        breakdown.first_rsvp_bonus = 15;
      }
      
      // Bonus for RSVPing early (more than 7 days in advance)
      if (activity_data.days_until_event > 7) {
        bonusPoints += 5;
        breakdown.early_bird_bonus = 5;
      }

      stats.events_rsvp_count = newRSVPCount;
    }

    if (activity_type === 'event_attendance') {
      const newAttendanceCount = (stats.events_attended || 0) + 1;
      
      // Bonus for consistent event attendance
      if (newAttendanceCount === 1) {
        bonusPoints += 20;
        breakdown.first_event_bonus = 20;
      } else if (newAttendanceCount === 5) {
        bonusPoints += 50;
        breakdown.event_milestone_bonus = 50;
      } else if (newAttendanceCount === 10) {
        bonusPoints += 100;
        breakdown.event_milestone_bonus = 100;
      }

      // Use provided points from event reward
      if (activity_data.points) {
        basePoints = activity_data.points;
        breakdown.base_points = basePoints;
      }

      stats.events_attended = newAttendanceCount;
    }

    if (activity_type === 'event_chat_message') {
      const newChatCount = (stats.event_chat_messages || 0) + 1;
      
      // Bonus for active participation
      if (newChatCount >= 10) {
        bonusPoints += 5;
        breakdown.active_participant_bonus = 5;
      }

      stats.event_chat_messages = newChatCount;
    }

    if (activity_type === 'event_full_participation') {
      // Bonus for staying the entire event
      bonusPoints += 25;
      breakdown.full_participation_bonus = 25;
      
      // Extra bonus if they also participated in chat
      if (activity_data.chat_messages_sent > 0) {
        bonusPoints += 15;
        breakdown.engagement_bonus = 15;
      }
    }

    // Challenge bonuses
    if (activity_type === 'challenge_check_in' && activity_data.completed) {
      bonusPoints += 100;
      breakdown.challenge_completion_bonus = 100;
      
      if (activity_data.completion_percentage === 100) {
        bonusPoints += 200;
        breakdown.perfect_challenge_bonus = 200;
      }
    }

    // Perfect day check
    const today = new Date().toISOString().split('T')[0];
    const todayCheckIn = await base44.entities.DailyCheckIn.filter({ check_in_date: today });
    
    if (todayCheckIn.length > 0) {
      const checkIn = todayCheckIn[0];
      const isPerfectDay = checkIn.mood_logged && checkIn.journal_written && checkIn.wellness_tracked && checkIn.mindfulness_practiced;
      
      if (isPerfectDay) {
        bonusPoints += 50;
        breakdown.perfect_day_bonus = 50;
      }
    }

    const currentStreak = stats.current_streak || 0;
    if (STREAK_BONUSES[currentStreak]) {
      streakBonus = STREAK_BONUSES[currentStreak];
      breakdown.streak_bonus = streakBonus;
    }

    const totalPoints = basePoints + bonusPoints + streakBonus;
    breakdown.total = totalPoints;

    const newTotalPoints = stats.total_points + totalPoints;
    const newXP = stats.xp_current + totalPoints;
    
    let newLevel = stats.level;
    let newXPToNext = stats.xp_to_next_level;
    let leveledUp = false;

    if (newXP >= stats.xp_to_next_level) {
      newLevel = stats.level + 1;
      newXPToNext = getXPForLevel(newLevel);
      leveledUp = true;
    }

    await base44.auth.updateMe({
      gamification_stats: {
        ...stats,
        total_points: newTotalPoints,
        level: newLevel,
        xp_current: leveledUp ? newXP - stats.xp_to_next_level : newXP,
        xp_to_next_level: newXPToNext,
        last_activity_date: today
      }
    });

    if (todayCheckIn.length > 0) {
      const current = todayCheckIn[0];
      const updates = { points_earned: (current.points_earned || 0) + totalPoints };

      if (activity_type === 'mood_check_in') updates.mood_logged = true;
      if (activity_type === 'journal_entry') updates.journal_written = true;
      if (activity_type === 'wellness_log') updates.wellness_tracked = true;
      if (activity_type === 'health_sync') updates.health_synced = true;
      if (activity_type === 'mindfulness_session') updates.mindfulness_practiced = true;

      await base44.entities.DailyCheckIn.update(todayCheckIn[0].id, updates);
    } else {
      await base44.entities.DailyCheckIn.create({
        check_in_date: today,
        mood_logged: activity_type === 'mood_check_in',
        journal_written: activity_type === 'journal_entry',
        wellness_tracked: activity_type === 'wellness_log',
        health_synced: activity_type === 'health_sync',
        mindfulness_practiced: activity_type === 'mindfulness_session',
        points_earned: totalPoints,
        completion_percentage: 0
      });
    }

    // Check for event-related badge awards
    await base44.functions.invoke('checkAndAwardBadges', {
      activity_type,
      activity_data: {
        ...activity_data,
        events_attended: stats.events_attended,
        events_rsvp_count: stats.events_rsvp_count,
        event_chat_messages: stats.event_chat_messages
      }
    });

    return Response.json({
      success: true,
      points_earned: totalPoints,
      breakdown: breakdown,
      leveled_up: leveledUp,
      new_level: newLevel,
      new_total_points: newTotalPoints,
      achievements_earned: achievementsEarned,
      perfect_day: breakdown.perfect_day_bonus > 0
    });

  } catch (error) {
    console.error('Award points error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});