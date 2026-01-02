import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { activity_type, activity_data = {} } = await req.json();

    const stats = user.gamification_stats || {};
    const newBadges = [];

    // Get all available badges
    const allBadges = await base44.entities.Badge.filter({ is_active: true });
    
    // Get user's existing badges
    const userBadges = await base44.entities.UserBadge.filter({});
    const earnedBadgeKeys = new Set(userBadges.map(b => b.badge_key));

    // Event-related badges
    const eventBadgeCriteria = [
      {
        key: 'event_first_rsvp',
        condition: activity_data.events_rsvp_count === 1 && activity_type === 'event_rsvp'
      },
      {
        key: 'event_early_bird',
        condition: activity_type === 'event_rsvp' && activity_data.days_until_event > 7
      },
      {
        key: 'event_first_attendance',
        condition: activity_data.events_attended === 1 && activity_type === 'event_attendance'
      },
      {
        key: 'event_regular_attendee',
        condition: activity_data.events_attended === 5
      },
      {
        key: 'event_community_champion',
        condition: activity_data.events_attended === 10
      },
      {
        key: 'event_chat_active',
        condition: activity_data.event_chat_messages >= 10 && activity_type === 'event_chat_message'
      },
      {
        key: 'event_super_engaged',
        condition: activity_data.event_chat_messages >= 50
      }
    ];

    // Existing streak and challenge badges
    const streakBadgeCriteria = [
      { key: 'streak_7_day', condition: stats.current_streak === 7 },
      { key: 'streak_30_day', condition: stats.current_streak === 30 },
      { key: 'streak_100_day', condition: stats.current_streak === 100 },
      { key: 'perfect_week', condition: stats.perfect_days >= 7 },
      { key: 'wellness_warrior', condition: stats.wellness_streak >= 30 },
      { key: 'mindful_master', condition: stats.mindfulness_streak >= 21 },
      { key: 'journal_enthusiast', condition: stats.journal_streak >= 14 }
    ];

    const allCriteria = [...eventBadgeCriteria, ...streakBadgeCriteria];

    // Check each badge criteria
    for (const criteria of allCriteria) {
      if (criteria.condition && !earnedBadgeKeys.has(criteria.key)) {
        const badge = allBadges.find(b => b.key === criteria.key);
        
        if (badge) {
          // Award the badge
          const userBadge = await base44.entities.UserBadge.create({
            badge_key: badge.key,
            badge_title: badge.title,
            badge_tier: badge.tier,
            badge_category: badge.category,
            badge_icon: badge.icon_emoji || badge.icon_url,
            badge_gradient: badge.gradient_colors,
            points_earned: badge.points_reward || 0,
            earned_at: new Date().toISOString(),
            unlock_message: badge.unlock_message,
            progress_data: {
              streak_at_earn: stats.current_streak || 0,
              level_at_earn: stats.level || 1,
              challenges_completed: activity_data.challenges_completed || 0,
              events_attended: activity_data.events_attended || 0
            }
          });

          newBadges.push(userBadge);

          // Award bonus points for the badge
          if (badge.points_reward > 0) {
            const newTotal = (stats.total_points || 0) + badge.points_reward;
            await base44.auth.updateMe({
              gamification_stats: {
                ...stats,
                total_points: newTotal
              }
            });
          }

          // Create social activity for badge earn
          await base44.functions.invoke('createFriendActivity', {
            activity_type: 'badge_earned',
            achievement_title: badge.title,
            achievement_description: badge.description,
            achievement_data: {
              badge_tier: badge.tier,
              badge_icon: badge.icon_emoji || '🏆',
              points_earned: badge.points_reward || 0
            }
          });
        }
      }
    }

    return Response.json({
      success: true,
      badges_earned: newBadges.length,
      new_badges: newBadges.map(b => ({
        key: b.badge_key,
        title: b.badge_title,
        tier: b.badge_tier,
        points: b.points_earned
      }))
    });

  } catch (error) {
    console.error('Check and award badges error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});