import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// Test endpoint to verify Twilio configuration
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const fromNumber = Deno.env.get("TWILIO_FROM_NUMBER") || Deno.env.get("TWILIO_PHONE_NUMBER");

    const config = {
      accountSid: {
        configured: !!accountSid,
        value: accountSid ? `${accountSid.substring(0, 8)}...` : null
      },
      authToken: {
        configured: !!authToken,
        value: authToken ? '***configured***' : null
      },
      fromNumber: {
        configured: !!fromNumber,
        value: fromNumber || null
      }
    };

    let twilioStatus = 'not_configured';
    let accountInfo = null;

    if (accountSid && authToken) {
      try {
        const { default: twilio } = await import('npm:twilio@5.2.0');
        const client = twilio(accountSid, authToken);
        
        // Try to fetch account info
        const account = await client.api.accounts(accountSid).fetch();
        twilioStatus = 'connected';
        accountInfo = {
          friendlyName: account.friendlyName,
          status: account.status,
          type: account.type
        };

        // Try to fetch phone numbers if fromNumber is configured
        if (fromNumber) {
          try {
            const phoneNumbers = await client.incomingPhoneNumbers.list({ phoneNumber: fromNumber, limit: 1 });
            if (phoneNumbers.length > 0) {
              accountInfo.phoneNumberValid = true;
              accountInfo.phoneNumberCapabilities = phoneNumbers[0].capabilities;
            } else {
              accountInfo.phoneNumberValid = false;
              accountInfo.phoneNumberError = 'Phone number not found in your Twilio account';
            }
          } catch (phoneError) {
            accountInfo.phoneNumberValid = false;
            accountInfo.phoneNumberError = phoneError.message;
          }
        }

      } catch (error) {
        twilioStatus = 'error';
        accountInfo = { error: error.message };
      }
    }

    return Response.json({
      status: twilioStatus,
      configuration: config,
      accountInfo: accountInfo,
      recommendation: !accountSid || !authToken || !fromNumber ? 
        'Please configure all Twilio credentials in the integrations settings' :
        twilioStatus === 'connected' ? 'Twilio is properly configured!' : 'There may be an issue with your credentials'
    });

  } catch (error) {
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});