import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This endpoint is called by a cron job, use service role
    const { reminderType, userId } = await req.json();
    
    if (!reminderType || !userId) {
      return Response.json({ 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }

    // Get user data
    const users = await base44.asServiceRole.entities.User.filter({ id: userId });
    if (!users || users.length === 0) {
      return Response.json({ 
        error: 'User not found' 
      }, { status: 404 });
    }

    const user = users[0];
    const reminderSettings = user.wellness_reminder_settings?.[reminderType];

    if (!reminderSettings?.enabled) {
      return Response.json({ 
        message: 'Reminder not enabled for user' 
      });
    }

    // Check quiet hours
    const quietHours = user.wellness_reminder_settings?.quiet_hours;
    if (quietHours?.enabled) {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      const inQuietHours = isInQuietHours(currentTime, quietHours.start, quietHours.end);
      if (inQuietHours) {
        return Response.json({ 
          message: 'User in quiet hours' 
        });
      }
    }

    // Get reminder message
    const reminderMessages = {
      water: [
        "Time for a refreshing glass of water! 💧",
        "Stay hydrated - drink some water! 🌊",
        "Your body needs hydration 💙"
      ],
      breaks: [
        "Time to stretch and move! 🧘",
        "Take a quick movement break 💪",
        "Stand up and stretch 🌿"
      ],
      mindfulness: [
        "Take 3 deep breaths 🧘‍♀️",
        "Mindful moment: Notice your breath 🌸",
        "Pause and breathe 💜"
      ],
      eye_rest: [
        "Rest your eyes - look 20 feet away 👀",
        "Screen break time! 🌅",
        "Give your eyes a rest 🪟"
      ],
      posture: [
        "Posture check! Sit up straight 💪",
        "Adjust your posture 🧍",
        "Straighten up! ✨"
      ],
      gratitude: [
        "What are you grateful for? 💖",
        "Notice something beautiful 🌸",
        "Gratitude moment 🙏"
      ],
      bedtime: [
        "Time to wind down for sleep 🌙",
        "Start your bedtime routine 😴",
        "Prepare for peaceful rest 💤"
      ],
      morning: [
        "Good morning! How are you? ☀️",
        "Set your intention for today 🌅",
        "Morning check-in ✨"
      ]
    };

    const messages = reminderMessages[reminderType] || ["Time for a wellness check!"];
    const message = messages[Math.floor(Math.random() * messages.length)];

    // Send push notification if enabled
    if (reminderSettings.push_enabled !== false && user.onesignal_player_id) {
      try {
        await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `Send a push notification to player ID ${user.onesignal_player_id} with message: ${message}`
        });
      } catch (pushError) {
        console.error('Push notification error:', pushError);
      }
    }

    return Response.json({ 
      success: true,
      message: 'Reminder sent'
    });

  } catch (error) {
    console.error('Wellness reminder error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});

function isInQuietHours(currentTime, startTime, endTime) {
  if (!startTime || !endTime) return false;
  
  if (startTime < endTime) {
    return currentTime >= startTime && currentTime <= endTime;
  } else {
    return currentTime >= startTime || currentTime <= endTime;
  }
}