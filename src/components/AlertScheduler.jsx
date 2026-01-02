
import { useEffect, useRef, useState, useCallback } from 'react';
import { Task, FamilyEvent } from '@/entities/all';
// Removed: import { sendPushNotification } from '@/functions/sendPushNotification';
import { format, formatDistanceToNow } from 'date-fns';
import userCache from './UserCache';
import toast from 'react-hot-toast'; // Assuming react-hot-toast for toast messages
// Assuming base44 is an SDK/utility, adjust import path if necessary
// If base44 is globally available, this import might not be needed.
import base44 from '@/lib/base44'; 

const AlertScheduler = () => {
  const [user, setUser] = useState(null);
  const [sentNotifications, setSentNotifications] = useState(new Set());
  const intervalRef = useRef(null);
  const initialTimeoutRef = useRef(null);

  // Function to fetch user and set it in state
  const fetchUser = async () => {
    try {
      const currentUser = await userCache.getUser();
      setUser(currentUser);
    } catch (error) {
      console.error("Error fetching user for push notifications:", error);
      setUser(null);
    }
  };

  const scheduleNotifications = useCallback(async () => {
    // We only proceed if a user is loaded and has a OneSignal player ID, or for multi-channel.
    if (!user || !user.id) { // Ensure user.id is available for multi-channel notifications
      console.log('Skipping multi-channel notification scheduling: User not available.');
      return;
    }

    try {
      const now = new Date();

      // Get user's notification settings, with defaults if not set
      const notificationSettings = user.notification_settings || {
        task_reminders: true,
        event_reminders: true,
        push_enabled: true, // This setting will now control all channels by default
        sms_enabled: true, // New: Assume SMS is enabled by default
        email_enabled: true // New: Assume Email is enabled by default
      };

      // Determine active channels based on user settings
      const activeChannels = [];
      if (notificationSettings.push_enabled && user.onesignal_player_id) { // Only add 'push' if OneSignal ID is present
        activeChannels.push('push');
      }
      if (notificationSettings.sms_enabled && user.phone_number) { // Only add 'sms' if phone number is present
        activeChannels.push('sms');
      }
      if (notificationSettings.email_enabled && user.email) { // Only add 'email' if email is present
        activeChannels.push('email');
      }

      if (activeChannels.length === 0) {
        console.log('No active notification channels enabled for user.');
        return;
      }


      // --- Check for Task Reminders ---
      if (notificationSettings.task_reminders) {
        const tasks = await Task.filter({ status: { $ne: 'completed' } });

        for (const task of tasks) {
          if (!task.reminder_enabled || !task.due_date) continue;

          const dueDate = new Date(task.due_date);
          if (task.due_time) {
            const [hours, minutes] = task.due_time.split(':');
            dueDate.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
          } else {
            dueDate.setHours(23, 59, 59, 999);
          }

          const reminderMinutesBefore = task.reminder_minutes_before || 15;
          const reminderTime = new Date(dueDate.getTime() - reminderMinutesBefore * 60000);
          const timeDiff = reminderTime.getTime() - now.getTime();

          if (timeDiff > 0 && timeDiff < 3600000) { // If reminder is within the next hour
            const notifKey = `task-upcoming-${task.id}-${reminderTime.getTime()}`;
            if (sentNotifications.has(notifKey)) continue;

            setTimeout(async () => {
              try {
                const messageBody = `"${task.title}" is due ${task.due_time ? 'at ' + task.due_time : 'today'}`;
                await base44.functions.invoke('sendMultiChannelNotification', {
                  userId: user.id,
                  title: '⏰ Task Reminder',
                  body: messageBody,
                  data: {
                    type: 'task_reminder',
                    taskId: task.id,
                    url: '/organizer'
                  },
                  channels: activeChannels,
                  priority: 'high'
                });
                toast.success('Task reminder sent via ' + activeChannels.join(', ').toUpperCase());
                setSentNotifications(prev => new Set([...prev, notifKey]));
              } catch (error) {
                console.error('Error sending multi-channel task reminder:', error);
                toast.error('Failed to send task reminder');
              }
            }, timeDiff);
          }

          // Check for overdue tasks
          if (dueDate < now && task.status === 'pending') {
            const overdueKey = `task-overdue-${task.id}`;
            if (!sentNotifications.has(overdueKey)) {
              try {
                const messageBody = `"${task.title}" was due ${formatDistanceToNow(dueDate, { addSuffix: true })}`;
                await base44.functions.invoke('sendMultiChannelNotification', {
                  userId: user.id,
                  title: '🚨 Task Overdue',
                  body: messageBody,
                  data: {
                    type: 'task_overdue',
                    taskId: task.id,
                    url: '/organizer'
                  },
                  channels: activeChannels,
                  priority: 'high'
                });
                toast.success('Overdue task alert sent via ' + activeChannels.join(', ').toUpperCase());
                setSentNotifications(prev => new Set([...prev, overdueKey]));
              } catch (error) {
                console.error('Error sending multi-channel overdue task notification:', error);
                toast.error('Failed to send overdue task alert');
              }
            }
          }
        }
      }

      // --- Check for Family Event Reminders ---
      if (notificationSettings.event_reminders) {
        const events = await FamilyEvent.filter({
          start_date: { $gte: now.toISOString() }
        });

        for (const event of events) {
          if (!event.reminder_enabled) continue;

          const eventDate = new Date(event.start_date);
          const reminderMinutesBefore = event.reminder_minutes || 15;
          const reminderTime = new Date(eventDate.getTime() - reminderMinutesBefore * 60000);
          const timeDiff = reminderTime.getTime() - now.getTime();

          if (timeDiff > 0 && timeDiff < 3600000) { // If reminder is within the next hour
            const notifKey = `event-upcoming-${event.id}-${reminderTime.getTime()}`;
            if (sentNotifications.has(notifKey)) continue;

            setTimeout(async () => {
              try {
                const messageBody = `"${event.title}" starts ${format(eventDate, 'at h:mm a')}`;
                await base44.functions.invoke('sendMultiChannelNotification', {
                  userId: user.id,
                  title: '📅 Event Reminder',
                  body: messageBody,
                  data: {
                    type: 'event_reminder',
                    eventId: event.id,
                    url: '/family'
                  },
                  channels: activeChannels,
                  priority: 'high'
                });
                toast.success('Event reminder sent via ' + activeChannels.join(', ').toUpperCase());
                setSentNotifications(prev => new Set([...prev, notifKey]));
              } catch (error) {
                console.error('Error sending multi-channel event reminder:', error);
                toast.error('Failed to send event reminder');
              }
            }, timeDiff);
          }
        }
      }
    } catch (error) {
      console.error('Error in scheduleNotifications:', error);
    }
  }, [user, sentNotifications]);

  useEffect(() => {
    // Fetch user on initial load
    fetchUser();

    const startScheduling = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (initialTimeoutRef.current) clearTimeout(initialTimeoutRef.current);

      // Perform an initial check after delay
      initialTimeoutRef.current = setTimeout(() => {
        scheduleNotifications();
      }, 5000);

      // Then check every 30 seconds
      intervalRef.current = setInterval(() => {
        scheduleNotifications();
      }, 30000);
    };

    if (user) {
      startScheduling();
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (initialTimeoutRef.current) clearTimeout(initialTimeoutRef.current);
    };
  }, [user, scheduleNotifications]);

  return null;
};

export default AlertScheduler;
