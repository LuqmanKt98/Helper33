import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Use service role for cron job
    const users = await base44.asServiceRole.entities.User.list();
    const today = new Date();
    const currentDay = today.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    
    let notificationsSent = 0;
    const notifications = [];

    for (const user of users) {
      const settings = user.womens_health_notifications;
      
      // Skip if notifications disabled
      if (!settings || !settings.enabled) continue;

      // Check quiet hours
      if (settings.quiet_hours_enabled) {
        const quietStart = parseInt(settings.quiet_hours_start?.split(':')[0] || '22');
        const quietEnd = parseInt(settings.quiet_hours_end?.split(':')[0] || '8');
        
        if (currentHour >= quietStart || currentHour < quietEnd) {
          continue; // Skip during quiet hours
        }
      }

      // Get user's pregnancy data
      const pregnancyData = await base44.asServiceRole.entities.PregnancyTracking.filter({
        created_by: user.email
      });
      const pregnancy = pregnancyData[0];

      // === WEEKLY PREGNANCY TIPS ===
      if (
        settings.weekly_pregnancy_tips &&
        pregnancy?.pregnancy_status === 'pregnant' &&
        pregnancy?.current_week
      ) {
        const preferredDay = settings.weekly_pregnancy_day || 'monday';
        const preferredTime = settings.weekly_pregnancy_time || '09:00';
        const preferredHour = parseInt(preferredTime.split(':')[0]);
        const preferredMinute = parseInt(preferredTime.split(':')[1]);

        // Check if it's the right day and time (within 1 hour window)
        if (
          currentDay === preferredDay &&
          currentHour === preferredHour &&
          currentMinute < 60
        ) {
          // Get weekly insight
          const insights = await base44.asServiceRole.entities.PregnancyWeeklyInsight.filter({
            week_number: pregnancy.current_week
          });
          
          if (insights[0]) {
            const insight = insights[0];
            notifications.push({
              userEmail: user.email,
              type: 'weekly_pregnancy_tip',
              title: `Week ${pregnancy.current_week}: ${insight.baby_size_comparison} 🤰`,
              message: `Your baby is the size of a ${insight.baby_size_comparison}! ${insight.baby_development.substring(0, 150)}...`,
              data: { week: pregnancy.current_week }
            });
          }
        }
      }

      // === MILESTONE CELEBRATIONS ===
      if (settings.milestone_celebrations && pregnancy?.current_week) {
        const milestoneWeeks = [8, 12, 13, 20, 24, 28, 37, 40];
        
        // Check if user just entered a milestone week (compare with last notification date)
        if (milestoneWeeks.includes(pregnancy.current_week)) {
          const lastNotified = user.womens_health_notifications?.last_milestone_notified;
          
          if (!lastNotified || lastNotified !== pregnancy.current_week) {
            let milestoneName = '';
            let milestoneEmoji = '🎉';
            
            if (pregnancy.current_week === 8) {
              milestoneName = 'First Ultrasound Week!';
              milestoneEmoji = '👶';
            } else if (pregnancy.current_week === 12) {
              milestoneName = 'End of First Trimester!';
              milestoneEmoji = '🎊';
            } else if (pregnancy.current_week === 13) {
              milestoneName = 'Second Trimester Begins!';
              milestoneEmoji = '✨';
            } else if (pregnancy.current_week === 20) {
              milestoneName = 'Halfway There!';
              milestoneEmoji = '🎂';
            } else if (pregnancy.current_week === 24) {
              milestoneName = 'Viability Milestone!';
              milestoneEmoji = '💪';
            } else if (pregnancy.current_week === 28) {
              milestoneName = 'Third Trimester!';
              milestoneEmoji = '🏁';
            } else if (pregnancy.current_week === 37) {
              milestoneName = 'Full Term - Baby Could Come Any Day!';
              milestoneEmoji = '👶';
            } else if (pregnancy.current_week === 40) {
              milestoneName = 'Due Week!';
              milestoneEmoji = '🎈';
            }
            
            notifications.push({
              userEmail: user.email,
              type: 'milestone_celebration',
              title: `${milestoneEmoji} Week ${pregnancy.current_week}: ${milestoneName}`,
              message: `Congratulations on reaching this special milestone in your pregnancy journey!`,
              data: { week: pregnancy.current_week, milestone: milestoneName }
            });

            // Update last notified
            await base44.asServiceRole.auth.updateUser(user.id, {
              womens_health_notifications: {
                ...settings,
                last_milestone_notified: pregnancy.current_week
              }
            });
          }
        }
      }

      // === POSTPARTUM CHECK-UP REMINDERS ===
      if (
        settings.postpartum_checkup_reminders &&
        pregnancy?.pregnancy_status === 'postpartum' &&
        pregnancy?.birth_date
      ) {
        const birthDate = new Date(pregnancy.birth_date);
        const weeksPostpartum = Math.floor((today - birthDate) / (7 * 24 * 60 * 60 * 1000));

        // 6-week check-up reminder (send at 5 weeks 6 days)
        if (weeksPostpartum === 5) {
          const daysPostpartum = Math.floor((today - birthDate) / (24 * 60 * 60 * 1000));
          if (daysPostpartum === 41 && currentHour === 9) { // Send at 9 AM on day 41
            notifications.push({
              userEmail: user.email,
              type: 'postpartum_checkup',
              title: '🩺 6-Week Postpartum Check-Up Reminder',
              message: 'Your 6-week postpartum check-up is coming up! This is an important appointment to ensure you\'re healing well. Schedule it if you haven\'t already!',
              data: { weeks_postpartum: 6 }
            });
          }
        }
      }

      // === BABY DEVELOPMENT ALERTS ===
      if (
        settings.baby_development_alerts &&
        pregnancy?.pregnancy_status === 'postpartum' &&
        pregnancy?.birth_date
      ) {
        const birthDate = new Date(pregnancy.birth_date);
        const monthsOld = Math.floor((today - birthDate) / (30 * 24 * 60 * 60 * 1000));
        const developmentMonths = [1, 2, 3, 4, 6, 9, 12];

        // Send on the actual month birthday at 10 AM
        if (developmentMonths.includes(monthsOld) && currentHour === 10) {
          const dayOfMonth = today.getDate();
          const birthDay = new Date(pregnancy.birth_date).getDate();
          
          if (dayOfMonth === birthDay) {
            const lastNotified = settings.last_development_month_notified;
            
            if (!lastNotified || lastNotified !== monthsOld) {
              let milestoneText = '';
              
              if (monthsOld === 1) milestoneText = 'First smiles might appear soon! 😊';
              else if (monthsOld === 2) milestoneText = 'Social smiles and cooing! 🥰';
              else if (monthsOld === 3) milestoneText = 'May start rolling over! 🤸';
              else if (monthsOld === 4) milestoneText = 'Reaching for toys and laughing! 😄';
              else if (monthsOld === 6) milestoneText = 'Sitting up and starting solids! 🥄';
              else if (monthsOld === 9) milestoneText = 'Crawling and exploring! 🚼';
              else if (monthsOld === 12) milestoneText = 'Happy First Birthday! 🎂';

              notifications.push({
                userEmail: user.email,
                type: 'baby_development',
                title: `👶 ${pregnancy.baby_name || 'Baby'} is ${monthsOld} Month${monthsOld > 1 ? 's' : ''} Old!`,
                message: milestoneText,
                data: { months: monthsOld }
              });

              await base44.asServiceRole.auth.updateUser(user.id, {
                womens_health_notifications: {
                  ...settings,
                  last_development_month_notified: monthsOld
                }
              });
            }
          }
        }
      }

      // === PERIOD REMINDERS ===
      if (settings.period_reminders && !pregnancy?.pregnancy_status) {
        const cycles = await base44.asServiceRole.entities.MenstrualCycle.filter({
          created_by: user.email,
          is_current_cycle: true
        });
        
        if (cycles[0]?.predicted_next_period) {
          const predictedDate = new Date(cycles[0].predicted_next_period);
          const daysUntil = Math.floor((predictedDate - today) / (24 * 60 * 60 * 1000));
          
          // Send reminder 2 days before predicted period
          if (daysUntil === 2 && currentHour === 9) {
            notifications.push({
              userEmail: user.email,
              type: 'period_reminder',
              title: '🌸 Period Predicted in 2 Days',
              message: 'Your period is expected to start soon. Make sure you have supplies ready!',
              data: { predicted_date: cycles[0].predicted_next_period }
            });
          }
        }
      }

      // === FERTILE WINDOW ALERTS ===
      if (settings.fertile_window_alerts) {
        const cycles = await base44.asServiceRole.entities.MenstrualCycle.filter({
          created_by: user.email,
          is_current_cycle: true
        });
        
        if (cycles[0]?.fertile_window_start && cycles[0]?.fertile_window_end) {
          const fertileStart = new Date(cycles[0].fertile_window_start);
          const fertileEnd = new Date(cycles[0].fertile_window_end);
          
          // Alert on first day of fertile window
          if (
            today.toDateString() === fertileStart.toDateString() &&
            currentHour === 8
          ) {
            notifications.push({
              userEmail: user.email,
              type: 'fertile_window',
              title: '🌺 Fertile Window Begins Today',
              message: 'Your fertile window has started. This is your most fertile time of the month.',
              data: { fertile_start: cycles[0].fertile_window_start, fertile_end: cycles[0].fertile_window_end }
            });
          }
        }
      }
    }

    // === SEND ALL NOTIFICATIONS ===
    for (const notification of notifications) {
      try {
        const user = users.find(u => u.email === notification.userEmail);
        if (!user) continue;

        const deliveryMethods = settings?.delivery_method || ['push'];
        
        // Send via selected methods
        if (deliveryMethods.includes('push') && user.onesignal_player_id) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: user.email,
            subject: notification.title,
            body: notification.message
          });
        }

        if (deliveryMethods.includes('email')) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: user.email,
            subject: notification.title,
            body: notification.message
          });
        }

        if (deliveryMethods.includes('sms') && user.phone_number) {
          // SMS would go here if Twilio is set up
          // await sendSMS(user.phone_number, notification.message);
        }

        notificationsSent++;
      } catch (error) {
        console.error(`Error sending notification to ${notification.userEmail}:`, error);
      }
    }

    return Response.json({
      success: true,
      notifications_sent: notificationsSent,
      users_checked: users.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Women\'s health notifications cron error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
});