import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const user = await base44.auth.me();

        if (!user || user.role !== 'admin') {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }

        console.log('🔍 Starting comprehensive notification verification...');

        const verification = {
            timestamp: new Date().toISOString(),
            environment_variables: {
                onesignal: {
                    ONESIGNAL_APP_ID: { 
                        set: !!Deno.env.get("ONESIGNAL_APP_ID"),
                        value: Deno.env.get("ONESIGNAL_APP_ID") || 'NOT_SET'
                    },
                    ONESIGNAL_API_KEY: { 
                        set: !!Deno.env.get("ONESIGNAL_API_KEY"),
                        value: Deno.env.get("ONESIGNAL_API_KEY") ? 
                            Deno.env.get("ONESIGNAL_API_KEY").substring(0, 20) + '...' : 'NOT_SET',
                        length: Deno.env.get("ONESIGNAL_API_KEY")?.length || 0,
                        format: Deno.env.get("ONESIGNAL_API_KEY")?.startsWith('os_v2_') ? 'New Format (os_v2_)' : 'Old Format or Invalid'
                    }
                },
                sendgrid: {
                    SENDGRID_API_KEY: { 
                        set: !!Deno.env.get("SENDGRID_API_KEY"),
                        value: Deno.env.get("SENDGRID_API_KEY") ? 
                            Deno.env.get("SENDGRID_API_KEY").substring(0, 15) + '...' : 'NOT_SET'
                    }
                },
                twilio: {
                    TWILIO_ACCOUNT_SID: { 
                        set: !!Deno.env.get("TWILIO_ACCOUNT_SID"),
                        value: Deno.env.get("TWILIO_ACCOUNT_SID") ? 
                            Deno.env.get("TWILIO_ACCOUNT_SID").substring(0, 10) + '...' : 'NOT_SET'
                    },
                    TWILIO_AUTH_TOKEN: { 
                        set: !!Deno.env.get("TWILIO_AUTH_TOKEN"),
                        value: 'HIDDEN'
                    },
                    TWILIO_FROM_NUMBER: { 
                        set: !!(Deno.env.get("TWILIO_FROM_NUMBER") || Deno.env.get("TWILIO_PHONE_NUMBER")),
                        value: (Deno.env.get("TWILIO_FROM_NUMBER") || Deno.env.get("TWILIO_PHONE_NUMBER")) || 'NOT_SET'
                    }
                }
            },
            api_tests: {
                onesignal: { success: false, error: null, details: null },
                sendgrid: { success: false, error: null, details: null },
                twilio: { success: false, error: null, details: null }
            },
            summary: {
                onesignal: '❌ Testing...',
                sendgrid: '❌ Testing...',
                twilio: '❌ Testing...'
            },
            recommendations: []
        };

        // TEST ONESIGNAL
        const ONESIGNAL_APP_ID = Deno.env.get("ONESIGNAL_APP_ID");
        const ONESIGNAL_API_KEY = Deno.env.get("ONESIGNAL_API_KEY");

        console.log('🔍 OneSignal credentials check:', {
            appId: ONESIGNAL_APP_ID,
            apiKeyLength: ONESIGNAL_API_KEY?.length,
            apiKeyFormat: ONESIGNAL_API_KEY?.substring(0, 10),
            isNewFormat: ONESIGNAL_API_KEY?.startsWith('os_v2_')
        });

        if (!ONESIGNAL_APP_ID || !ONESIGNAL_API_KEY) {
            verification.api_tests.onesignal.error = 'Missing credentials';
            verification.summary.onesignal = '❌ Not Configured';
            verification.recommendations.push({
                service: 'OneSignal',
                issue: 'Missing environment variables',
                solution: 'Set both ONESIGNAL_APP_ID and ONESIGNAL_API_KEY',
                priority: 'HIGH'
            });
        } else {
            try {
                console.log('🔄 Testing OneSignal API...');
                
                // Determine auth header format based on key type
                const authHeader = ONESIGNAL_API_KEY.startsWith('os_v2_') 
                    ? `Key ${ONESIGNAL_API_KEY}`  // New format
                    : `Basic ${ONESIGNAL_API_KEY}`; // Old format

                console.log('🔐 Using auth format:', ONESIGNAL_API_KEY.startsWith('os_v2_') ? 'Key (new)' : 'Basic (old)');
                
                // Test 1: Get App Info
                const appResponse = await fetch(`https://onesignal.com/api/v1/apps/${ONESIGNAL_APP_ID}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': authHeader,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('📡 OneSignal response status:', appResponse.status);

                if (appResponse.ok) {
                    const appData = await appResponse.json();
                    console.log('✅ OneSignal app data received:', appData.name);
                    
                    verification.api_tests.onesignal.success = true;
                    verification.api_tests.onesignal.details = {
                        app_name: appData.name,
                        app_id: ONESIGNAL_APP_ID,
                        messageable_players: appData.messageable_players || 0,
                        auth_format: ONESIGNAL_API_KEY.startsWith('os_v2_') ? 'Key (REST API v2)' : 'Basic (Legacy)'
                    };
                    verification.summary.onesignal = '✅ Working';
                } else {
                    const errorText = await appResponse.text();
                    console.error('❌ OneSignal API error:', errorText);
                    
                    verification.api_tests.onesignal.error = `HTTP ${appResponse.status}: ${errorText}`;
                    verification.summary.onesignal = `❌ Error (${appResponse.status})`;
                    
                    if (appResponse.status === 403) {
                        verification.recommendations.push({
                            service: 'OneSignal',
                            issue: 'Invalid API Key or wrong authorization format',
                            solution: 'Verify you are using the REST API Key (not User Auth Key)',
                            steps: [
                                'Go to https://dashboard.onesignal.com/apps/4a798c34-90cc-47d2-9c0f-bb350eafb514/settings/keys',
                                'Find "REST API Key" section',
                                'Copy the key starting with "os_v2_app_..."',
                                'Update ONESIGNAL_API_KEY environment variable',
                                'Key should be ~160 characters long'
                            ],
                            priority: 'CRITICAL'
                        });
                    }
                }
            } catch (error) {
                console.error('❌ OneSignal test failed:', error);
                verification.api_tests.onesignal.error = error.message;
                verification.summary.onesignal = '❌ Failed';
            }
        }

        // TEST SENDGRID
        const SENDGRID_API_KEY = Deno.env.get("SENDGRID_API_KEY");

        if (!SENDGRID_API_KEY) {
            verification.api_tests.sendgrid.error = 'API key not set';
            verification.summary.sendgrid = '❌ Not Configured';
        } else {
            try {
                const sgResponse = await fetch('https://api.sendgrid.com/v3/user/account', {
                    headers: {
                        'Authorization': `Bearer ${SENDGRID_API_KEY}`
                    }
                });

                if (sgResponse.ok) {
                    const sgData = await sgResponse.json();
                    verification.api_tests.sendgrid.success = true;
                    verification.api_tests.sendgrid.details = {
                        email: sgData.email,
                        type: sgData.type
                    };
                    verification.summary.sendgrid = '✅ Working';
                } else {
                    const errorText = await sgResponse.text();
                    verification.api_tests.sendgrid.error = `HTTP ${sgResponse.status}: ${errorText}`;
                    verification.summary.sendgrid = `❌ Error (${sgResponse.status})`;
                }
            } catch (error) {
                verification.api_tests.sendgrid.error = error.message;
                verification.summary.sendgrid = '❌ Failed';
            }
        }

        // TEST TWILIO
        const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
        const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");

        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
            verification.api_tests.twilio.error = 'Credentials not set (optional)';
            verification.summary.twilio = '⚠️ Optional';
        } else {
            try {
                const twilioAuth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
                const twilioResponse = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}.json`, {
                    headers: {
                        'Authorization': `Basic ${twilioAuth}`
                    }
                });

                if (twilioResponse.ok) {
                    const twilioData = await twilioResponse.json();
                    verification.api_tests.twilio.success = true;
                    verification.api_tests.twilio.details = {
                        account_name: twilioData.friendly_name,
                        account_status: twilioData.status
                    };
                    verification.summary.twilio = '✅ Working';
                } else {
                    const errorText = await twilioResponse.text();
                    verification.api_tests.twilio.error = `HTTP ${twilioResponse.status}: ${errorText}`;
                    verification.summary.twilio = `❌ Error (${twilioResponse.status})`;
                }
            } catch (error) {
                verification.api_tests.twilio.error = error.message;
                verification.summary.twilio = '❌ Failed';
            }
        }

        return Response.json(verification);

    } catch (error) {
        console.error('Verification error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
});