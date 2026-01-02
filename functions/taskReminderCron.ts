
import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        console.log('🔔 Task Reminder Cron: Starting...');

        // Get all tasks with reminders enabled that are due soon
        const now = new Date();
        const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // Use service role to check all users' tasks
        const tasks = await base44.asServiceRole.entities.Task.filter({
            reminder_enabled: true,
            status: { $ne: 'completed' }
        }, '-due_date', 1000);

        console.log(`📋 Found ${tasks.length} tasks with reminders enabled`);

        let notificationsSent = 0;
        let errors = 0;

        for (const task of tasks) {
            try {
                if (!task.due_date || !task.due_time) {
                    continue;
                }

                // Parse task due date/time
                const dueDateTime = new Date(`${task.due_date}T${task.due_time}`);
                const reminderMinutes = task.reminder_minutes_before || 15;
                const reminderTime = new Date(dueDateTime.getTime() - (reminderMinutes * 60 * 1000));

                // Check if reminder should be sent (within next 5 minutes)
                const timeDiff = reminderTime.getTime() - now.getTime();
                const shouldSendReminder = timeDiff > 0 && timeDiff <= 5 * 60 * 1000;

                if (!shouldSendReminder) {
                    continue;
                }

                console.log(`⏰ Sending reminder for task: ${task.title} (${task.id})`);

                // Get task owner
                const taskOwner = await base44.asServiceRole.entities.User.filter({
                    email: task.created_by
                }, '', 1);

                if (!taskOwner || taskOwner.length === 0) {
                    console.warn(`⚠️ No user found for task ${task.id}`);
                    continue;
                }

                const user = taskOwner[0];

                // Check user's notification preferences
                const notificationSettings = user.notification_settings || {};
                
                if (notificationSettings.task_reminders === false) {
                    console.log(`🔕 User ${user.email} has task reminders disabled`);
                    continue;
                }

                // Prepare notification content
                const title = '⏰ Task Reminder';
                const body = `"${task.title}" is due ${reminderMinutes === 0 ? 'now' : `in ${reminderMinutes} minutes`}!`;

                // Send through multiple channels based on user preferences
                const notificationPromises = [];

                // 1. Push Notification (OneSignal)
                if (notificationSettings.push_enabled !== false && user.onesignal_player_id) {
                    console.log(`📱 Sending push to ${user.email}`);
                    notificationPromises.push(
                        base44.asServiceRole.functions.invoke('sendPushNotification', {
                            userId: user.id,
                            title,
                            body,
                            data: {
                                type: 'task_reminder',
                                taskId: task.id,
                                taskTitle: task.title
                            },
                            url: '/Organizer'
                        }).catch(err => {
                            console.error(`Push notification error:`, err);
                            return { success: false, error: err.message };
                        })
                    );
                }

                // 2. SMS Notification
                if (notificationSettings.sms_enabled && user.phone_number && user.prefers_sms) {
                    console.log(`💬 Sending SMS to ${user.email}`);
                    notificationPromises.push(
                        base44.asServiceRole.functions.invoke('sendSMS', {
                            to: user.phone_number,
                            body: `DobryLife Reminder: ${body}` // Changed from 'message' to 'body'
                        }).catch(err => {
                            console.error(`SMS error:`, err);
                            return { success: false, error: err.message };
                        })
                    );
                }

                // 3. Email Notification (fallback)
                if (notificationSettings.email_enabled !== false) {
                    console.log(`📧 Sending email to ${user.email}`);
                    notificationPromises.push(
                        base44.asServiceRole.integrations.Core.SendEmail({
                            to: user.email,
                            subject: title,
                            body: `Hi ${user.full_name || 'there'},\n\n${body}\n\n${task.description || ''}\n\nView your tasks: https://app.dobrylife.com/Organizer\n\nBest,\nDobryLife Team`
                        }).catch(err => {
                            console.error(`Email error:`, err);
                            return { success: false, error: err.message };
                        })
                    );
                }

                // Send all notifications
                const results = await Promise.all(notificationPromises);
                const successCount = results.filter(r => r?.data?.success !== false || r?.success !== false).length;

                if (successCount > 0) {
                    notificationsSent++;
                    console.log(`✅ Sent ${successCount} notification(s) for task ${task.id}`);
                } else {
                    errors++;
                    console.error(`❌ All notifications failed for task ${task.id}`);
                }

            } catch (error) {
                errors++;
                console.error(`Error processing task ${task.id}:`, error);
            }
        }

        console.log(`🎉 Task Reminder Cron Complete: ${notificationsSent} sent, ${errors} errors`);

        return Response.json({
            success: true,
            notificationsSent,
            errors,
            tasksChecked: tasks.length
        });

    } catch (error) {
        console.error('❌ Task Reminder Cron Error:', error);
        return Response.json({
            success: false,
            error: error.message
        }, { status: 500 });
    }
});
