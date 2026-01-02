import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
    try {
        const base44 = createClientFromRequest(req);
        const { to, body } = await req.json();

        console.log('📱 SMS Request received:', { to, bodyLength: body?.length });

        if (!to || !body) {
            console.error('❌ Missing required fields');
            return Response.json({ 
                success: false, 
                error: 'Missing required fields: to and body' 
            }, { status: 400 });
        }

        // Get Twilio credentials
        const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
        const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
        const TWILIO_FROM = Deno.env.get("TWILIO_PHONE_NUMBER") || Deno.env.get("TWILIO_FROM_NUMBER");

        console.log('🔑 Checking Twilio credentials:', {
            hasSID: !!TWILIO_ACCOUNT_SID,
            hasToken: !!TWILIO_AUTH_TOKEN,
            hasFrom: !!TWILIO_FROM,
            fromNumber: TWILIO_FROM ? TWILIO_FROM.substring(0, 5) + '...' : 'none'
        });

        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM) {
            const missing = [];
            if (!TWILIO_ACCOUNT_SID) missing.push('TWILIO_ACCOUNT_SID');
            if (!TWILIO_AUTH_TOKEN) missing.push('TWILIO_AUTH_TOKEN');
            if (!TWILIO_FROM) missing.push('TWILIO_PHONE_NUMBER');
            
            console.error('❌ Missing Twilio credentials:', missing);
            return Response.json({ 
                success: false, 
                error: `Twilio not configured. Missing: ${missing.join(', ')}`,
                missing_credentials: missing
            }, { status: 500 });
        }

        // Format phone numbers
        const formatPhone = (phone) => {
            const cleaned = phone.replace(/\D/g, '');
            if (cleaned.length === 10) return `+1${cleaned}`;
            if (cleaned.length === 11 && cleaned.startsWith('1')) return `+${cleaned}`;
            return phone.startsWith('+') ? phone : `+${cleaned}`;
        };

        const fromNumber = formatPhone(TWILIO_FROM);
        const toNumber = formatPhone(to);

        console.log('📞 Formatted numbers:', { from: fromNumber, to: toNumber });

        // Send SMS via Twilio
        const authString = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
        
        const formData = new URLSearchParams();
        formData.append('From', fromNumber);
        formData.append('To', toNumber);
        formData.append('Body', body);

        console.log('🚀 Sending SMS via Twilio...');

        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${authString}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            }
        );

        const responseText = await response.text();
        console.log('📨 Twilio Response:', { 
            status: response.status,
            statusText: response.statusText,
            body: responseText.substring(0, 500) 
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = JSON.parse(responseText);
            } catch (e) {
                errorData = { message: responseText };
            }

            console.error('❌ Twilio Error Response:', errorData);

            // Check for unverified number error (trial account)
            if (errorData.code === 21608 || errorData.message?.includes('not a verified')) {
                return Response.json({
                    success: false,
                    error: 'Phone number not verified on Twilio Trial account',
                    trial_account: true,
                    twilio_error: errorData,
                    instructions: {
                        message: `Cannot send SMS to ${toNumber} - number not verified on your Twilio trial account.`,
                        steps: [
                            '1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified',
                            '2. Click "Add a new Caller ID"',
                            `3. Enter ${toNumber} and verify it`,
                            '4. You will receive a verification code via SMS',
                            '5. Enter the code to verify',
                            '6. Try sending SMS again from DobryLife'
                        ],
                        verify_url: 'https://console.twilio.com/us1/develop/phone-numbers/manage/verified'
                    }
                }, { status: 403 });
            }

            // Check for invalid phone number
            if (errorData.code === 21211 || errorData.message?.includes('invalid')) {
                return Response.json({
                    success: false,
                    error: `Invalid phone number format: ${toNumber}`,
                    twilio_error: errorData,
                    suggestion: 'Please check the phone number format in your profile. It should include country code (e.g., +1 for US)'
                }, { status: 400 });
            }

            // Check for insufficient balance
            if (errorData.code === 21606 || errorData.message?.includes('balance')) {
                return Response.json({
                    success: false,
                    error: 'Insufficient Twilio account balance',
                    twilio_error: errorData,
                    suggestion: 'Please add funds to your Twilio account at https://console.twilio.com'
                }, { status: 402 });
            }
            
            return Response.json({ 
                success: false, 
                error: errorData.message || 'Twilio API error',
                twilio_code: errorData.code,
                details: errorData
            }, { status: response.status });
        }

        const data = JSON.parse(responseText);
        console.log('✅ SMS Response Success:', {
            sid: data.sid,
            status: data.status,
            to: data.to,
            from: data.from,
            price: data.price,
            direction: data.direction
        });

        return Response.json({ 
            success: true, 
            sid: data.sid,
            status: data.status,
            to: toNumber,
            from: fromNumber,
            message: data.status === 'queued' ? 'SMS queued for delivery' : data.status === 'sent' ? 'SMS sent successfully' : 'SMS processing',
            price: data.price,
            price_unit: data.price_unit
        });

    } catch (error) {
        console.error('❌ SMS Function Error:', error);
        return Response.json({ 
            success: false, 
            error: error.message,
            stack: error.stack,
            type: error.name
        }, { status: 500 });
    }
});