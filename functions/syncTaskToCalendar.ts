import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { google } from 'npm:googleapis@128.0.0';

const getOauth2Client = () => {
    return new google.auth.OAuth2(
        Deno.env.get("GOOGLE_CLIENT_ID"),
        Deno.env.get("GOOGLE_CLIENT_SECRET"),
        Deno.env.get("GOOGLE_REDIRECT_URI")
    );
};

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { taskId, action = 'create' } = await req.json();

        console.log('📅 Google Calendar Sync:', { taskId, action });

        if (!taskId) {
            return Response.json({ error: 'Task ID required' }, { status: 400 });
        }

        // Get user
        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if Google Calendar is connected
        if (!user.google_auth?.access_token) {
            return Response.json({ 
                success: false,
                error: 'Google Calendar not connected',
                connect_required: true
            });
        }

        // Get task
        const tasks = await base44.entities.Task.filter({ id: taskId });
        if (!tasks || tasks.length === 0) {
            return Response.json({ error: 'Task not found' }, { status: 404 });
        }

        const task = tasks[0];

        // Set up OAuth client
        const oauth2Client = getOauth2Client();
        oauth2Client.setCredentials({
            access_token: user.google_auth.access_token,
            refresh_token: user.google_auth.refresh_token
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        if (action === 'delete') {
            // Delete from Google Calendar
            if (task.google_calendar_event_id) {
                try {
                    await calendar.events.delete({
                        calendarId: 'primary',
                        eventId: task.google_calendar_event_id
                    });

                    // Remove calendar ID from task
                    await base44.entities.Task.update(taskId, {
                        google_calendar_event_id: null
                    });

                    console.log('✅ Event deleted from Google Calendar');
                    return Response.json({ 
                        success: true,
                        message: 'Removed from Google Calendar'
                    });
                } catch (error) {
                    console.error('❌ Error deleting event:', error);
                    return Response.json({ 
                        success: false,
                        error: error.message 
                    });
                }
            }

            return Response.json({ 
                success: true,
                message: 'No calendar event to delete'
            });
        }

        // Create or update event
        if (!task.due_date) {
            return Response.json({ 
                success: false,
                error: 'Task must have a due date for calendar sync'
            });
        }

        // Build event data
        const startDate = new Date(task.due_date);
        if (task.due_time) {
            const [hours, minutes] = task.due_time.split(':');
            startDate.setHours(parseInt(hours), parseInt(minutes));
        } else {
            startDate.setHours(9, 0); // Default to 9 AM
        }

        const endDate = new Date(startDate);
        endDate.setMinutes(endDate.getMinutes() + (task.estimated_duration || 60));

        const event = {
            summary: `📋 ${task.title}`,
            description: task.description || '',
            start: {
                dateTime: startDate.toISOString(),
                timeZone: Deno.env.get('TZ') || 'America/New_York'
            },
            end: {
                dateTime: endDate.toISOString(),
                timeZone: Deno.env.get('TZ') || 'America/New_York'
            },
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: task.reminder_minutes_before || 15 },
                    { method: 'email', minutes: task.reminder_minutes_before || 15 }
                ]
            },
            colorId: getPriorityColor(task.priority),
            extendedProperties: {
                private: {
                    dobrylife_task_id: taskId,
                    dobrylife_source: 'true'
                }
            }
        };

        if (action === 'update' && task.google_calendar_event_id) {
            // Update existing event
            try {
                const response = await calendar.events.update({
                    calendarId: 'primary',
                    eventId: task.google_calendar_event_id,
                    requestBody: event
                });

                console.log('✅ Event updated in Google Calendar');
                return Response.json({ 
                    success: true,
                    event_id: response.data.id,
                    event_link: response.data.htmlLink,
                    message: 'Updated in Google Calendar'
                });
            } catch (error) {
                console.error('❌ Error updating event:', error);
                
                // If event not found, create a new one
                if (error.code === 404) {
                    action = 'create';
                } else {
                    return Response.json({ 
                        success: false,
                        error: error.message 
                    });
                }
            }
        }

        if (action === 'create') {
            // Create new event
            try {
                const response = await calendar.events.insert({
                    calendarId: 'primary',
                    requestBody: event
                });

                // Save event ID to task
                await base44.entities.Task.update(taskId, {
                    google_calendar_event_id: response.data.id
                });

                console.log('✅ Event created in Google Calendar');
                return Response.json({ 
                    success: true,
                    event_id: response.data.id,
                    event_link: response.data.htmlLink,
                    message: 'Added to Google Calendar'
                });
            } catch (error) {
                console.error('❌ Error creating event:', error);
                return Response.json({ 
                    success: false,
                    error: error.message 
                });
            }
        }

    } catch (error) {
        console.error('❌ Calendar Sync Error:', error);
        
        // Handle token expiration
        if (error.code === 401) {
            return Response.json({ 
                success: false,
                error: 'Google Calendar access expired',
                reconnect_required: true
            }, { status: 401 });
        }

        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});

function getPriorityColor(priority) {
    const colors = {
        low: '2',      // Green
        medium: '5',   // Yellow
        high: '11',    // Red
        urgent: '11'   // Red
    };
    return colors[priority] || '5';
}