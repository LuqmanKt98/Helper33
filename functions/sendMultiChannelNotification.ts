import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        const { userId, title, body, data, channels = ['push', 'email', 'sms'], priority = 'normal', force = false } = await req.json();

        console.log('📢 Multi-Channel Notification Request:', {
            userId,
            title,
            channels,
            priority
        });

        if (!userId || !title || !body) {
            return Response.json({
                success: false,
                error: 'Missing required fields: userId, title, body'
            }, { status: 400 });
        }

        // Get user data with service role
        const users = await base44.asServiceRole.entities.User.filter({ id: userId }, '', 1);
        if (!users || users.length === 0) {
            return Response.json({
                success: false,
                error: 'User not found'
            }, { status: 404 });
        }

        const user = users[0];
        const notificationSettings = user.notification_settings || {};

        const results = {
            push: { attempted: false, success: false },
            sms: { attempted: false, success: false },
            email: { attempted: false, success: false }
        };

        // 1. PUSH NOTIFICATION
        if (channels.includes('push') && (force || notificationSettings.push_enabled !== false)) {
            results.push.attempted = true;
            
            if (user.onesignal_player_id) {
                try {
                    console.log('📱 Sending Push to:', user.email);
                    const pushResult = await base44.asServiceRole.functions.invoke('sendPushNotification', {
                        userId: user.id,
                        title,
                        body,
                        data: data || {},
                        url: data?.url
                    });

                    results.push.success = pushResult?.data?.success !== false;
                    console.log('Push result:', results.push);
                } catch (error) {
                    console.error('Push error:', error);
                    results.push.error = error.message;
                }
            } else {
                console.log('⚠️ No OneSignal player ID for user');
                results.push.error = 'No OneSignal player ID';
            }
        }

        // 2. SMS NOTIFICATION (ALWAYS ENABLED BY DEFAULT)
        if (channels.includes('sms') && (force || notificationSettings.sms_enabled !== false)) {
            results.sms.attempted = true;
            
            if (user.phone_number) {
                try {
                    console.log('💬 Sending SMS to:', user.phone_number);
                    
                    // Format the message to be concise for SMS
                    const smsBody = `${title}\n\n${body}`;
                    
                    const smsResult = await base44.asServiceRole.functions.invoke('sendSMS', {
                        to: user.phone_number,
                        body: smsBody
                    });

                    console.log('SMS Result:', smsResult?.data);
                    results.sms.success = smsResult?.data?.success !== false;
                    
                    if (smsResult?.data?.trial_account) {
                        results.sms.error = 'Phone number not verified on Twilio trial account';
                        results.sms.trial_account = true;
                    }
                } catch (error) {
                    console.error('SMS error:', error);
                    results.sms.error = error.message;
                }
            } else {
                console.log('⚠️ No phone number for user');
                results.sms.error = 'No phone number';
            }
        }

        // 3. EMAIL NOTIFICATION (ALWAYS ENABLED BY DEFAULT)
        if (channels.includes('email') && (force || notificationSettings.email_enabled !== false)) {
            results.email.attempted = true;
            
            if (user.email) {
                try {
                    console.log('📧 Sending Email to:', user.email);
                    
                    const emailBody = `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                            <h2 style="color: #6366f1;">${title}</h2>
                            <p style="font-size: 16px; line-height: 1.6; color: #374151;">${body.replace(/\n/g, '<br>')}</p>
                            ${data?.url ? `
                                <a href="https://app.base44.com${data.url}" 
                                   style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: linear-gradient(to right, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
                                    View in Helper33
                                </a>
                            ` : ''}
                            <p style="margin-top: 30px; font-size: 14px; color: #9ca3af;">
                                This is an automated notification from Helper33.
                            </p>
                        </div>
                    `;
                    
                    const emailResult = await base44.integrations.Core.SendEmail({
                        to: user.email,
                        subject: title,
                        body: emailBody
                    });

                    results.email.success = true;
                    console.log('Email sent successfully');
                } catch (error) {
                    console.error('Email error:', error);
                    results.email.error = error.message;
                }
            } else {
                console.log('⚠️ No email for user');
                results.email.error = 'No email';
            }
        }

        // Calculate overall success
        const attemptedChannels = Object.values(results).filter(r => r.attempted).length;
        const successfulChannels = Object.values(results).filter(r => r.success).length;
        const overallSuccess = attemptedChannels > 0 && successfulChannels > 0;

        console.log('✅ Multi-Channel Results:', {
            attempted: attemptedChannels,
            successful: successfulChannels,
            results
        });

        return Response.json({
            success: overallSuccess,
            results,
            summary: {
                attempted: attemptedChannels,
                successful: successfulChannels,
                channels: channels
            }
        });

    } catch (error) {
        console.error('❌ Multi-Channel Notification Error:', error);
        return Response.json({
            success: false,
            error: error.message,
            stack: error.stack
        }, { status: 500 });
    }
});