import { createClient } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        // This cron runs daily to check and reset streaks if needed
        const base44 = createClient({
            apiKey: Deno.env.get('BASE44_SERVICE_ROLE_KEY')
        });

        // Get all users with mindful streaks
        const users = await base44.entities.User.filter({
            'mindful_streak.current': { $gt: 0 }
        });

        const today = new Date().toISOString().split('T')[0];
        let resetsCount = 0;

        for (const user of users) {
            const lastSessionDate = user.mindful_streak?.last_session_date;
            
            if (!lastSessionDate) continue;

            // Calculate days since last session
            const lastDate = new Date(lastSessionDate);
            const todayDate = new Date(today);
            const diffTime = todayDate.getTime() - lastDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            // If more than 1 day has passed, reset the streak
            if (diffDays > 1) {
                await base44.entities.User.update(user.id, {
                    mindful_streak: {
                        current: 0,
                        longest: user.mindful_streak.longest,
                        last_session_date: lastSessionDate
                    }
                });
                resetsCount++;

                // Optionally send a gentle reminder notification
                // You can implement this later if needed
            }
        }

        return Response.json({
            success: true,
            message: `Checked ${users.length} users, reset ${resetsCount} streaks`
        });

    } catch (error) {
        console.error('Error checking streaks:', error);
        return Response.json({ 
            error: error.message,
            details: 'Failed to check streaks'
        }, { status: 500 });
    }
});