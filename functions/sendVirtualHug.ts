import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { recipientEmail, recipientName, senderName, hugType, noteContent } = await req.json();

    const hugMessages = {
      heart: { emoji: '❤️', subject: 'Someone sent you a virtual hug', message: 'sent you a warm virtual hug' },
      see_you: { emoji: '👁️', subject: 'I see you', message: 'wants you to know: I see you. You are seen and valued.' },
      feel_you: { emoji: '🫂', subject: 'I feel you', message: 'wants you to know: I feel you. You\'re not alone in this.' },
      not_alone: { emoji: '🌟', subject: 'You are not alone', message: 'wants you to know: You are not alone. We\'re in this together.' },
      lonely_too: { emoji: '💛', subject: 'The holidays can be lonely', message: 'wants you to know: The holidays can be lonely - you\'re not alone in this moment. Sending warmth your way.' },
    };

    const hug = hugMessages[hugType] || hugMessages.heart;

    // Send email if recipient has email
    if (recipientEmail) {
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 16px;">
          <div style="text-align: center; padding: 40px 20px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
            <div style="font-size: 64px; margin-bottom: 20px;">${hug.emoji}</div>
            <h2 style="color: #b45309; margin-bottom: 16px; font-size: 28px;">${hug.subject}</h2>
            <p style="color: #78350f; font-size: 18px; line-height: 1.6; margin-bottom: 20px;">
              <strong>${senderName}</strong> ${hug.message}
            </p>
            ${noteContent ? `
              <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="color: #78350f; font-style: italic; margin: 0;">"${noteContent}"</p>
              </div>
            ` : ''}
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #fed7aa;">
              <p style="color: #92400e; font-size: 14px;">
                This heartfelt message was sent through <strong>Heartful Holidays</strong> on Helper33 🦃
              </p>
              <p style="color: #92400e; font-size: 14px;">
                Join the wellness journey at <a href="https://www.helper33.com/HeartfulHolidays" style="color: #ea580c; text-decoration: none;">helper33.com</a>
              </p>
            </div>
          </div>
        </div>
      `;

      await base44.integrations.Core.SendEmail({
        to: recipientEmail,
        from_name: 'Heartful Holidays',
        subject: `${hug.emoji} ${hug.subject}`,
        body: emailBody,
      });
    }

    return Response.json({ 
      success: true,
      message: `${hug.emoji} Virtual hug sent!` 
    });

  } catch (error) {
    console.error('Error sending virtual hug:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});