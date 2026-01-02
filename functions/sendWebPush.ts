import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user) {
            return Response.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId, title, body, icon, url } = await req.json();

        // Get user's push subscription
        const targetUser = await base44.asServiceRole.entities.User.get(userId);
        
        if (!targetUser || !targetUser.push_subscription) {
            return Response.json({ 
                error: 'User does not have push notifications enabled' 
            }, { status: 400 });
        }

        const subscription = JSON.parse(targetUser.push_subscription);

        // Use Web Push Protocol (built into browsers)
        const payload = JSON.stringify({
            title,
            body,
            icon: icon || '/icons/app-icon.png',
            badge: '/icons/badge-icon.png',
            data: { url: url || '/' }
        });

        // Note: In production, you'd use web-push library with VAPID keys
        // For now, this shows the concept
        return Response.json({ 
            success: true,
            message: 'Web push notifications require VAPID keys setup'
        });

    } catch (error) {
        return Response.json({ 
            error: error.message 
        }, { status: 500 });
    }
});