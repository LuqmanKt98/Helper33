import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        
        console.log('🔍 Starting notification system test...');

        const diagnostics = {
            timestamp: new Date().toISOString(),
            services: {
                onesignal: { configured: false, tested: false, error: null },
                twilio: { configured: false, tested: false, error: null },
                sendgrid: { configured: false, tested: false, error: null }
            },
            environment: {
                ONESIGNAL_APP_ID: !!Deno.env.get("ONESIGNAL_APP_ID"),
                ONESIGNAL_API_KEY: !!Deno.env.get("ONESIGNAL_API_KEY"),
                TWILIO_ACCOUNT_SID: !!Deno.env.get("TWILIO_ACCOUNT_SID"),
                TWILIO_AUTH_TOKEN: !!Deno.env.get("TWILIO_AUTH_TOKEN"),
                TWILIO_FROM_NUMBER: !!Deno.env.get("TWILIO_FROM_NUMBER") || !!Deno.env.get("TWILIO_PHONE_NUMBER"),
                SENDGRID_API_KEY: !!Deno.env.get("SENDGRID_API_KEY")
            },
            ready: false,
            recommendations: []
        };

        // TEST ONESIGNAL
        const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
        const ONESIGNAL_API_KEY = Deno.env.get("ONESIGNAL_API_KEY");

        if (ONESIGNAL_APP_ID && ONESIGNAL_API_KEY) {
            diagnostics.services.onesignal.configured = true;
            try {
                const authHeader = ONESIGNAL_API_KEY.startsWith('os_v2_') 
                    ? `Key ${ONESIGNAL_API_KEY}`
                    : `Basic ${ONESIGNAL_API_KEY}`;

                const response = await fetch(`https://onesignal.com/api/v1/apps/${ONESIGNAL_APP_ID}`, {
                    headers: { 'Authorization': authHeader }
                });

                if (response.ok) {
                    diagnostics.services.onesignal.tested = true;
                    const data = await response.json();
                    diagnostics.services.onesignal.appName = data.name;
                } else {
                    const errorText = await response.text();
                    diagnostics.services.onesignal.error = `HTTP ${response.status}: ${errorText}`;
                }
            } catch (error) {
                diagnostics.services.onesignal.error = error.message;
            }
        } else {
            diagnostics.services.onesignal.error = 'Missing credentials';
        }

        // TEST TWILIO
        const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
        const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
        const TWILIO_FROM = Deno.env.get("TWILIO_FROM_NUMBER") || Deno.env.get("TWILIO_PHONE_NUMBER");

        console.log('🔍 Twilio Check:', {
            hasSID: !!TWILIO_ACCOUNT_SID,
            hasToken: !!TWILIO_AUTH_TOKEN,
            hasPhone: !!TWILIO_FROM,
            phoneValue: TWILIO_FROM
        });

        if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM) {
            diagnostics.services.twilio.configured = true;
            diagnostics.services.twilio.phoneNumber = TWILIO_FROM;
            
            try {
                const authString = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
                const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}.json`, {
                    headers: {
                        'Authorization': `Basic ${authString}`
                    }
                });

                if (response.ok) {
                    diagnostics.services.twilio.tested = true;
                    const data = await response.json();
                    diagnostics.services.twilio.accountStatus = data.status;
                    diagnostics.services.twilio.accountName = data.friendly_name;
                } else {
                    const errorText = await response.text();
                    diagnostics.services.twilio.error = `HTTP ${response.status}: ${errorText}`;
                }
            } catch (error) {
                diagnostics.services.twilio.error = error.message;
            }
        } else {
            const missing = [];
            if (!TWILIO_ACCOUNT_SID) missing.push('TWILIO_ACCOUNT_SID');
            if (!TWILIO_AUTH_TOKEN) missing.push('TWILIO_AUTH_TOKEN');
            if (!TWILIO_FROM) missing.push('TWILIO_FROM_NUMBER');
            diagnostics.services.twilio.error = `Missing: ${missing.join(', ')}`;
        }

        // TEST SENDGRID
        const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

        if (SENDGRID_API_KEY) {
            diagnostics.services.sendgrid.configured = true;
            try {
                const response = await fetch('https://api.sendgrid.com/v3/user/profile', {
                    headers: {
                        'Authorization': `Bearer ${SENDGRID_API_KEY}`
                    }
                });

                if (response.ok) {
                    diagnostics.services.sendgrid.tested = true;
                    const data = await response.json();
                    diagnostics.services.sendgrid.email = data.email;
                } else {
                    const errorText = await response.text();
                    diagnostics.services.sendgrid.error = `HTTP ${response.status}: ${errorText}`;
                }
            } catch (error) {
                diagnostics.services.sendgrid.error = error.message;
            }
        } else {
            diagnostics.services.sendgrid.error = 'Missing SENDGRID_API_KEY';
        }

        // RECOMMENDATIONS
        if (!diagnostics.services.onesignal.tested) {
            diagnostics.recommendations.push('Fix OneSignal configuration for push notifications');
        }
        if (!diagnostics.services.twilio.tested) {
            diagnostics.recommendations.push('Fix Twilio configuration for SMS notifications');
        }
        if (!diagnostics.services.sendgrid.tested) {
            diagnostics.recommendations.push('Fix SendGrid configuration for email notifications');
        }

        diagnostics.ready = diagnostics.services.onesignal.tested || 
                           diagnostics.services.twilio.tested || 
                           diagnostics.services.sendgrid.tested;

        console.log('📊 Diagnostics Complete:', diagnostics);

        return Response.json(diagnostics);

    } catch (error) {
        console.error('❌ Diagnostics Error:', error);
        return Response.json({ 
            error: error.message,
            stack: error.stack 
        }, { status: 500 });
    }
});