import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const body = await req.json();
    const { email, code, trust_device = false } = body;

    // Get 2FA record
    const records = await base44.asServiceRole.entities.TwoFactorAuth.filter({ user_email: email });
    
    if (records.length === 0) {
      return Response.json({ error: 'No 2FA setup found' }, { status: 404 });
    }

    const twoFARecord = records[0];

    // Check if code is expired
    if (new Date(twoFARecord.code_expires_at) < new Date()) {
      return Response.json({ error: 'Code expired' }, { status: 400 });
    }

    // Verify code
    if (twoFARecord.pending_code !== code) {
      return Response.json({ error: 'Invalid code' }, { status: 400 });
    }

    // Code is valid - update record
    const updateData = {
      last_verified: new Date().toISOString(),
      pending_code: null,
      code_expires_at: null
    };

    // Add trusted device if requested
    if (trust_device) {
      const deviceId = crypto.randomUUID();
      const deviceName = req.headers.get('user-agent')?.substring(0, 50) || 'Unknown Device';
      
      const trustedDevices = twoFARecord.trusted_devices || [];
      trustedDevices.push({
        device_id: deviceId,
        device_name: deviceName,
        added_at: new Date().toISOString(),
        last_used: new Date().toISOString()
      });
      
      updateData.trusted_devices = trustedDevices;
    }

    await base44.asServiceRole.entities.TwoFactorAuth.update(twoFARecord.id, updateData);

    return Response.json({ 
      success: true,
      message: '2FA verification successful',
      device_id: trust_device ? updateData.trusted_devices[updateData.trusted_devices.length - 1].device_id : null
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});