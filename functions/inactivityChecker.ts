import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// This cron job runs periodically (e.g., daily) to check for user inactivity
// and sends a gentle re-engagement notification.
Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req).asServiceRole;

        const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();

        // Find users who haven't been active in the last 48 hours.
        // The '$or' condition handles users who have never logged in (last_active is null).
        const inactiveUsers = await base44.entities.User.filter({
            $or: [
                { last_active: { $lt: twoDaysAgo } },
                { last_active: null }
            ]
        });

        const userIdsToNotify = inactiveUsers
            .filter(user => user.onesignal_player_id) // Only users with a push subscription
            .map(user => user.id);
        
        if (userIdsToNotify.length > 0) {
            await base44.functions.invoke('sendPushNotificationOneSignal', {
                userIds: userIdsToNotify,
                title: "A gentle check-in from DobryLife ✨",
                body: "It's been a little while. How about a quick mood boost or a daily summary?",
                url: `/` // Open the home page
            });
        }

        return Response.json({ success: true, checked: inactiveUsers.length, notified: userIdsToNotify.length });

    } catch (error) {
        console.error("Inactivity Checker Cron Error:", error);
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
});