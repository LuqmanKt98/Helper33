import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);

        const user = await base44.auth.me();
        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (!user.google_auth?.access_token) {
            return Response.json({ 
                success: false,
                error: 'Google Calendar not connected'
            });
        }

        // Get all tasks with due dates
        const tasks = await base44.entities.Task.filter({
            status: { $ne: 'completed' },
            due_date: { $exists: true }
        });

        console.log(`📅 Bulk syncing ${tasks.length} tasks to Google Calendar...`);

        const results = {
            success: 0,
            failed: 0,
            skipped: 0,
            errors: []
        };

        for (const task of tasks) {
            try {
                const response = await base44.functions.invoke('syncTaskToCalendar', {
                    taskId: task.id,
                    action: task.google_calendar_event_id ? 'update' : 'create'
                });

                if (response.data?.success) {
                    results.success++;
                } else {
                    results.failed++;
                    results.errors.push({
                        task: task.title,
                        error: response.data?.error
                    });
                }
            } catch (error) {
                results.failed++;
                results.errors.push({
                    task: task.title,
                    error: error.message
                });
            }
        }

        console.log('✅ Bulk sync complete:', results);

        return Response.json({ 
            success: true,
            results
        });

    } catch (error) {
        console.error('❌ Bulk Sync Error:', error);
        return Response.json({ 
            success: false,
            error: error.message 
        }, { status: 500 });
    }
});