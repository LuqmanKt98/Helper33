import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      activity_type,
      achievement_title,
      achievement_description,
      achievement_data = {}
    } = await req.json();

    // Create the friend activity
    const activity = await base44.entities.FriendActivity.create({
      activity_type,
      user_name: user.full_name,
      user_avatar: user.avatar_url,
      achievement_title,
      achievement_description,
      achievement_data,
      visibility: 'friends',
      cheer_count: 0,
      comment_count: 0
    });

    // Get user's friends to notify them
    const sentRequests = await base44.entities.FriendRequest.filter({
      requester_email: user.email,
      status: 'accepted'
    });
    
    const receivedRequests = await base44.entities.FriendRequest.filter({
      receiver_email: user.email,
      status: 'accepted'
    });

    const friendEmails = [
      ...sentRequests.map(r => r.receiver_email),
      ...receivedRequests.map(r => r.requester_email)
    ];

    // Send notifications to friends (optional)
    if (friendEmails.length > 0 && achievement_data.badge_tier && 
        ['platinum', 'diamond', 'legendary'].includes(achievement_data.badge_tier)) {
      // Only notify for significant achievements
      try {
        await base44.functions.invoke('sendPushNotificationOneSignal', {
          userIds: friendEmails,
          title: `${user.full_name} earned a ${achievement_data.badge_tier} badge!`,
          body: achievement_title,
          url: '/community'
        });
      } catch (error) {
        console.log('Notification failed (non-critical):', error);
      }
    }

    return Response.json({
      success: true,
      activity_id: activity.id
    });

  } catch (error) {
    console.error('Create friend activity error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});