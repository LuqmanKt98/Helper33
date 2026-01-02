import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Message template bank
const messageBank = {
  calm: {
    onCheckIn: [
      "Nice work, {name}. One small win for {habitName} today.",
      "Consistency builds confidence. You showed up.",
      "Gentle progress, real momentum.",
      "Checked in. Body and mind say thanks.",
      "You honored your plan. Keep it light, keep it going."
    ],
    onStreakMilestone: [
      "{streak} days—steady is strong.",
      "From intention to identity. You're a {habitName} person now.",
      "Momentum noted. Celebrate the pattern.",
      "New milestone unlocked: {streak}-day streak 🎉",
      "Longest streak: {longestStreak}. You're closing in."
    ],
    onMissedDay: [
      "No pressure—new day, new try.",
      "Reset, not regret. One tap to begin again.",
      "Life happens. Aim for 'most days,' not 'every day.'",
      "Small step today? We'll count it.",
      "Compassion first. When ready, return to {habitName}."
    ],
    onWeeklyReview: [
      "Weekly glance: {streak} active, best was {longestStreak}. What helped?",
      "Name one small win from this week. Keep that.",
      "Plan your cue for tomorrow—same time works best.",
      "Progress = practice over perfection.",
      "Lock one micro-goal for next week?"
    ],
    onFamilyCheer: [
      "You got {familyCheerCount} cheers today. Loved ones see your effort 💚",
      "Shared wins stick longer. Send a thank-you?",
      "Your routine is inspiring your family.",
      "Team momentum: {familyCheerCount} nudges of love."
    ]
  },
  hype: {
    onCheckIn: [
      "Boom—{habitName} DONE! 🔥",
      "Another brick in the wall of wins.",
      "Streak fuel added. Let's roll.",
      "Yes {name}! That's how habits stick.",
      "Tiny step. Big direction."
    ],
    onStreakMilestone: [
      "New milestone unlocked: {streak}-day streak 🎉",
      "You're CRUSHING {habitName}!",
      "From zero to hero: {streak} days strong!",
      "Unstoppable! {streak} days and counting!",
      "Champion status: {streak}-day streak achieved!"
    ],
    onMissedDay: [
      "No sweat—bounce back stronger today!",
      "Every champion has off days. Let's go!",
      "Restart = fresh start. You've got this!",
      "One miss doesn't break a habit. Keep moving!",
      "Back on track today? Let's do it!"
    ],
    onWeeklyReview: [
      "Week summary: {streak} wins! What's next?",
      "You crushed it this week. Level up?",
      "Progress report: IMPRESSIVE. Keep pushing!",
      "Weekly domination: {streak} completions!",
      "Next week's challenge: beat your best!"
    ],
    onFamilyCheer: [
      "BOOM! {familyCheerCount} family cheers! You're killing it!",
      "Your family is HYPED about your progress!",
      "Squad goals! {familyCheerCount} cheers unlocked!",
      "Family celebration mode: {familyCheerCount} reactions!",
      "You're inspiring the whole crew! 🔥"
    ]
  },
  playful: {
    onCheckIn: [
      "High-five, habit hero 🙌",
      "You and {habitName}? Power duo.",
      "Tick, tock, habit o'clock. Done!",
      "You did the thing. Gold star ⭐",
      "Your future self waves 'thank you!'"
    ],
    onStreakMilestone: [
      "Whoa! {streak} days? You're on fire! 🎯",
      "Achievement unlocked: {streak}-day superstar!",
      "Habit streak alert: {streak} days of awesome!",
      "Look at you go! {streak} days straight!",
      "Plot twist: you're actually consistent! 😄"
    ],
    onMissedDay: [
      "Oops! Plot twist—try again today? 😊",
      "No biggie! Every great story has a pause.",
      "Missed one? The universe says 'tomorrow's fresh!'",
      "Reset button pressed. Game on!",
      "One day off = not a problem. You've got this!"
    ],
    onWeeklyReview: [
      "Week recap: You're kinda awesome (just saying)",
      "Quick check: {streak} wins this week. Nice!",
      "Weekly roundup: progress detected 📈",
      "This week's vibe: consistent! Keep it rolling.",
      "Plot summary: you showed up. Gold star!"
    ],
    onFamilyCheer: [
      "Your fan club grew: {familyCheerCount} cheers! 🎉",
      "Family love incoming: {familyCheerCount} reactions!",
      "Aww! {familyCheerCount} family members are proud of you!",
      "You've got fans! {familyCheerCount} cheers today!",
      "Squad support: {familyCheerCount} thumbs up!"
    ]
  }
};

// Mood-aware add-ons
const moodAddons = {
  calm: "Hold that ease a bit longer.",
  proud: "Savor that feeling—name what you did right.",
  focused: "Great focus. Same cue tomorrow?",
  grateful: "Note one thing you're thankful for.",
  relaxed: "Perfect time for gentle stretching."
};

function selectMessage(trigger, tone, context) {
  const messages = messageBank[tone]?.[trigger] || messageBank.calm[trigger];
  if (!messages) return null;
  
  const randomMessage = messages[Math.floor(Math.random() * messages.length)];
  
  // Replace placeholders
  let message = randomMessage
    .replace(/{name}/g, context.name || 'there')
    .replace(/{habitName}/g, context.habitName || 'your habit')
    .replace(/{streak}/g, context.streak || 0)
    .replace(/{longestStreak}/g, context.longestStreak || 0)
    .replace(/{familyCheerCount}/g, context.familyCheerCount || 0)
    .replace(/{timeOfDay}/g, context.timeOfDay || 'today');
  
  // Add mood addon if applicable
  if (context.mood && moodAddons[context.mood]) {
    message += ` ${moodAddons[context.mood]}`;
  }
  
  return message;
}

function isQuietHours(date = new Date()) {
  const hour = date.getHours();
  return hour >= 21 || hour < 7; // 9pm - 7am
}

function getNextMorning(date = new Date()) {
  const next = new Date(date);
  next.setDate(next.getDate() + 1);
  next.setHours(7, 30, 0, 0); // 7:30 AM next day
  return next;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trigger, habitId, habitName, streak, longestStreak, mood, familyCheerCount } = await req.json();

    // Check message limit (max 2 per day)
    const today = new Date().toISOString().split('T')[0];
    const todayMessages = await base44.entities.AIEncouragement.filter({
      user_email: user.email,
      created_date: { $gte: today }
    });

    if (todayMessages.length >= 2 && !isQuietHours()) {
      return Response.json({ 
        message: 'Daily message limit reached',
        queued: false 
      });
    }

    // Get user's preferred tone from settings
    const userSettings = user.app_settings || {};
    const tone = userSettings.encouragement_tone || 'calm';

    // Prepare context
    const context = {
      name: user.full_name?.split(' ')[0] || 'there',
      habitName,
      streak,
      longestStreak,
      familyCheerCount,
      mood,
      timeOfDay: new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'
    };

    // Select appropriate message
    const message = selectMessage(trigger, tone, context);
    
    if (!message) {
      return Response.json({ error: 'No message template found' }, { status: 400 });
    }

    // Check if in quiet hours
    const now = new Date();
    let deliveredAt = now;
    let scheduledFor = null;

    if (isQuietHours(now) && trigger !== 'onFamilyCheer') {
      // Queue for next morning
      scheduledFor = getNextMorning(now);
      deliveredAt = null;
    }

    // Create encouragement
    const encouragement = await base44.entities.AIEncouragement.create({
      user_email: user.email,
      trigger_type: trigger,
      message,
      tone,
      habit_id: habitId,
      habit_name: habitName,
      streak_days: streak,
      delivered_at: deliveredAt?.toISOString(),
      scheduled_for: scheduledFor?.toISOString(),
      is_read: false
    });

    return Response.json({
      success: true,
      encouragement,
      queued: !!scheduledFor,
      deliveryTime: scheduledFor || deliveredAt
    });

  } catch (error) {
    console.error('Encouragement generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});