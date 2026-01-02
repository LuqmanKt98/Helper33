
import { base44 } from '@/api/base44Client';

export async function updateConstellationProgress(user, activityData) {
  if (!user) {
    throw new Error('User must be logged in');
  }

  try {
    // Create the activity first
    const activity = await base44.entities.HolidayWellnessActivity.create(activityData);

    // Get current constellation progress
    const allProgress = await base44.entities.ConstellationProgress.list();
    let myProgress = allProgress.find(p => p.created_by === user.email);

    const newStarCount = myProgress ? Math.min((myProgress.stars_lit || 0) + 1, 10) : 1;
    const isComplete = newStarCount >= 10;

    if (!myProgress) {
      // Create new progress
      await base44.entities.ConstellationProgress.create({
        user_display_name: user?.preferred_name || user?.full_name || 'Anonymous',
        stars_lit: 1,
        challenge_status: 'in_progress',
        share_with_community: true,
        badge_earned: false,
      });
    } else {
      // Update existing progress
      await base44.entities.ConstellationProgress.update(myProgress.id, {
        stars_lit: newStarCount,
        challenge_status: isComplete ? 'completed' : 'in_progress',
        completion_date: isComplete ? new Date().toISOString().split('T')[0] : myProgress.completion_date,
        badge_earned: isComplete,
      });
    }

    return {
      success: true,
      activity,
      starsLit: newStarCount,
      isComplete,
      pointsEarned: activityData.points_earned || 0,
    };
  } catch (error) {
    console.error('Error updating constellation:', error);
    throw error;
  }
}

export function shareToSocialMedia(zone, activityName, starsLit, isComplete) {
  const zoneEmojis = {
    calm: '🧘',
    connect: '💌',
    give: '🎁',
    reflect: '📔',
  };

  const shareText = isComplete
    ? `🎉 I completed my Heartful Holidays constellation! 10 stars lit through wellness activities. The holidays can be lonely - you're not alone. Join the journey! 🦃✨`
    : `🌟 Just lit star #${starsLit} in my Heartful Holidays constellation by ${activityName} ${zoneEmojis[zone] || ''} The holidays can be lonely - you're not alone in this moment! 🦃`;

  const url = 'https://www.helper33.com/HeartfulHolidays';

  return {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(shareText)}`,
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}&hashtags=HeartfulHolidays,YouAreNotAlone,MentalHealth`,
    instagram: `https://www.instagram.com/`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    tiktok: `https://www.tiktok.com/upload`,
  };
}
