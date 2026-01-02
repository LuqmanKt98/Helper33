import { createClient } from 'npm:@base44/sdk@0.7.1';

const base44 = createClient({ serviceRole: true });

Deno.serve(async (req) => {
    try {
        console.log('💧 Wellness Reminder Cron Started - ALL 3 CHANNELS (Email + SMS + Push)');

        const users = await base44.entities.User.filter({});
        let remindersProcessed = 0;

        for (const user of users) {
            try {
                const settings = user.wellness_settings || {};
                const notificationPrefs = user.notification_settings || {};

                // Skip if wellness reminders are disabled
                if (notificationPrefs.wellness_reminders === false) continue;

                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();

                // Water reminder (every hour during waking hours)
                if (currentHour >= 8 && currentHour <= 22 && currentMinute === 0) {
                    await base44.functions.invoke('sendMultiChannelNotification', {
                        userId: user.id,
                        title: '💧 Hydration Reminder',
                        body: 'Time for a glass of water! Stay hydrated throughout the day.\n\nThis reminder was sent via Email, SMS, and Push for maximum reliability.',
                        data: {
                            type: 'wellness_reminder',
                            category: 'hydration',
                            url: '/wellness'
                        },
                        channels: ['email', 'sms', 'push'], // ALL THREE CHANNELS
                        priority: 'normal',
                        force: true
                    });
                    remindersProcessed++;
                }

                // Movement reminder (every 2 hours during work hours)
                if (currentHour >= 9 && currentHour <= 17 && currentHour % 2 === 0 && currentMinute === 0) {
                    await base44.functions.invoke('sendMultiChannelNotification', {
                        userId: user.id,
                        title: '🚶 Movement Break',
                        body: 'Time to stretch and move! Take a quick 5-minute break.\n\nReminder sent via all channels: Email, SMS, and Push.',
                        data: {
                            type: 'wellness_reminder',
                            category: 'movement',
                            url: '/wellness'
                        },
                        channels: ['email', 'sms', 'push'], // ALL THREE CHANNELS
                        priority: 'normal',
                        force: true
                    });
                    remindersProcessed++;
                }

                // Bedtime reminder
                const bedtime = settings.bedtime || '22:00';
                const [bedHour, bedMinute] = bedtime.split(':').map(Number);
                const reminderTime = bedHour * 60 + bedMinute - 30; // 30 minutes before
                const currentTime = currentHour * 60 + currentMinute;

                if (Math.abs(currentTime - reminderTime) < 5) {
                    await base44.functions.invoke('sendMultiChannelNotification', {
                        userId: user.id,
                        title: '🌙 Bedtime Approaching',
                        body: 'Start winding down. Your bedtime is in 30 minutes.\n\nSent via Email, SMS, and Push.',
                        data: {
                            type: 'wellness_reminder',
                            category: 'sleep',
                            url: '/wellness'
                        },
                        channels: ['email', 'sms', 'push'], // ALL THREE CHANNELS
                        priority: 'normal',
                        force: true
                    });
                    remindersProcessed++;
                }

            } catch (error) {
                console.error(`Error processing wellness reminders for user ${user.id}:`, error);
            }
        }

        console.log(`✅ Processed ${remindersProcessed} wellness reminders via Email, SMS, and Push`);

        return Response.json({
            success: true,
            users_checked: users.length,
            reminders_sent: remindersProcessed,
            message: `Sent ${remindersProcessed} reminders via all 3 channels`
        });

    } catch (error) {
        console.error('❌ Wellness Reminder Cron Error:', error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});