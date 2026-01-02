import { createClient } from 'npm:@base44/sdk@0.7.1';
import { format, addDays } from 'npm:date-fns@3.0.0';

const base44 = createClient({ serviceRole: true });

Deno.serve(async (req) => {
  try {
    console.log('🔔 Self Check-In Cron Started');

    const today = new Date().toISOString().split('T')[0];
    
    // Get all active goals without human coaches that need check-ins today
    const allGoals = await base44.entities.CoachingGoal.filter({
      status: 'active',
      has_human_coach: false,
      checkin_reminder_enabled: true
    });

    const dueCheckIns = allGoals.filter(goal => {
      if (!goal.next_checkin_date) return true; // First check-in
      return goal.next_checkin_date === today;
    });

    console.log(`📋 Found ${dueCheckIns.length} goals needing check-ins`);

    let remindersSent = 0;

    for (const goal of dueCheckIns) {
      try {
        // Get the user who owns this goal
        const users = await base44.entities.User.filter({ 
          email: goal.created_by 
        });
        
        if (!users || users.length === 0) continue;
        const user = users[0];

        // Calculate days since last check-in
        const daysSinceLastCheckIn = goal.last_checkin_date 
          ? Math.floor((Date.now() - new Date(goal.last_checkin_date)) / (1000 * 60 * 60 * 24))
          : 999;

        // Create personalized reminder
        const reminderHTML = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #7C3AED, #EC4899); border-radius: 16px; padding: 30px; color: white; text-align: center; margin-bottom: 20px;">
              <h1 style="margin: 0 0 10px 0; font-size: 28px;">💜 Time for Your Check-In</h1>
              <p style="margin: 0; font-size: 16px; opacity: 0.95;">
                ${user.full_name}, let's see how you're doing with your goal
              </p>
            </div>

            <div style="background: white; border-radius: 12px; padding: 25px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
              <h2 style="color: #1F2937; margin: 0 0 15px 0; font-size: 20px;">
                🎯 ${goal.goal_title}
              </h2>
              
              <div style="background: #F3F4F6; border-left: 4px solid #7C3AED; padding: 15px; margin: 15px 0; border-radius: 8px;">
                <p style="margin: 0; color: #4B5563; font-size: 14px;">
                  <strong>Current Progress:</strong> ${goal.progress_percentage || 0}%
                </p>
                ${goal.target_date ? `
                  <p style="margin: 8px 0 0 0; color: #4B5563; font-size: 14px;">
                    <strong>Target Date:</strong> ${format(new Date(goal.target_date), 'MMMM d, yyyy')}
                  </p>
                ` : ''}
              </div>

              <div style="background: linear-gradient(135deg, #DBEAFE, #E0E7FF); border-radius: 12px; padding: 20px; margin: 20px 0;">
                <h3 style="margin: 0 0 12px 0; color: #1F2937; font-size: 16px;">
                  ✨ Your Check-In Will Include:
                </h3>
                <ul style="margin: 0; padding-left: 20px; color: #4B5563; line-height: 1.8;">
                  <li>How you're feeling (mood & confidence check)</li>
                  <li>Celebrating your wins, big or small</li>
                  <li>Acknowledging any challenges</li>
                  <li>Getting a personalized next action step</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 25px 0;">
                <a href="${Deno.env.get('APP_URL') || 'https://dobrylife.com'}/CoachingProgress" 
                   style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #EC4899); color: white; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);">
                  Complete Your Check-In
                </a>
              </div>

              <p style="text-align: center; color: #9CA3AF; font-size: 13px; margin-top: 20px;">
                Takes about 5 minutes • A compassionate space for your progress
              </p>
            </div>

            <div style="text-align: center; margin-top: 25px; color: #6B7280; font-size: 12px;">
              <p>You're doing great work on your journey 💜</p>
              <p style="margin-top: 8px;">
                This is an automated reminder. You can adjust your check-in frequency in your goal settings.
              </p>
            </div>
          </div>
        `;

        // Send email reminder
        await base44.integrations.Core.SendEmail({
          from_name: 'DobryLife Coaching',
          to: user.email,
          subject: `💜 Check-In Time: ${goal.goal_title}`,
          body: reminderHTML
        });

        // Send push notification if available
        if (user.onesignal_player_id) {
          try {
            await base44.integrations.Core.InvokeLLM({
              prompt: 'ignored'
            }); // Placeholder - implement OneSignal notification
          } catch (error) {
            console.log('Push notification skipped');
          }
        }

        remindersSent++;
        console.log(`✅ Sent check-in reminder to ${user.email} for goal: ${goal.goal_title}`);

      } catch (error) {
        console.error(`Error processing goal ${goal.id}:`, error);
      }
    }

    console.log(`✅ Self Check-In Cron Complete: ${remindersSent} reminders sent`);

    return Response.json({
      success: true,
      reminders_sent: remindersSent,
      goals_checked: dueCheckIns.length
    });

  } catch (error) {
    console.error('❌ Self Check-In Cron Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});