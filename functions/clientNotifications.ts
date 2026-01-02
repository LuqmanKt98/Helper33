import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, data } = await req.json();

    // Create notification
    await base44.asServiceRole.entities.Notification.create({
      user_email: data.user_email,
      title: data.title,
      message: data.message,
      type: type,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      is_read: false
    });

    // Send email if requested
    if (data.send_email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: data.user_email,
        subject: data.title,
        body: data.message
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});