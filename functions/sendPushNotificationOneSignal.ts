import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID') || '4a798c34-90cc-47d2-9c0f-bb350eafb514';
const ONESIGNAL_API_KEY = Deno.env.get('ONESIGNAL_API_KEY');

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req).asServiceRole;

        if (!ONESIGNAL_API_KEY) {
            return Response.json({
                success: false,
                error: 'OneSignal not configured',
                sent: false
            });
        }

        const { userIds, title, body, url, data } = await req.json();

        if (!userIds || userIds.length === 0) {
            return Response.json({ error: 'No user IDs provided' }, { status: 400 });
        }

        const users = await Promise.all(
            userIds.map(id => base44.entities.User.get(id).catch(() => null))
        );

        const playerIds = users
            .filter(user => user?.onesignal_player_id)
            .map(user => user.onesignal_player_id);

        if (playerIds.length === 0) {
            return Response.json({
                success: false,
                error: 'No users have push notifications enabled',
                sent: false
            });
        }

        const notification = {
            app_id: ONESIGNAL_APP_ID,
            headings: { en: title },
            contents: { en: body },
            include_player_ids: playerIds,
        };

        if (url) notification.url = url;
        if (data) notification.data = data;

        // Use correct auth header format
        const authHeader = ONESIGNAL_API_KEY.startsWith('os_v2_') 
            ? `Key ${ONESIGNAL_API_KEY}` 
            : `Basic ${ONESIGNAL_API_KEY}`;

        const response = await fetch('https://onesignal.com/api/v1/notifications', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader,
            },
            body: JSON.stringify(notification),
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('OneSignal error:', result);
            return Response.json({
                success: false,
                error: result.errors?.[0] || 'Failed to send notification',
                sent: false
            });
        }

        return Response.json({
            success: true,
            id: result.id,
            recipients: result.recipients,
            sent: true
        });

    } catch (error) {
        console.error('Push notification error:', error);
        return Response.json({
            success: false,
            error: error.message,
            sent: false
        });
    }
});