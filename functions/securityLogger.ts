import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const securityEvents = [];
const MAX_EVENTS = 1000;

const logSecurityEvent = (event) => {
  const logEntry = {
    timestamp: new Date().toISOString(),
    type: event.type || 'unknown',
    severity: event.severity || 'info',
    ip: event.ip || 'unknown',
    userId: event.userId || null,
    details: event.details || '',
    userAgent: event.userAgent || '',
  };
  
  securityEvents.push(logEntry);
  
  if (securityEvents.length > MAX_EVENTS) {
    securityEvents.shift();
  }
  
  if (logEntry.severity === 'critical' || logEntry.severity === 'high') {
    console.error('[SECURITY]', logEntry);
  } else {
    console.log('[SECURITY]', logEntry);
  }
  
  return logEntry;
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (req.method === 'GET') {
      const url = new URL(req.url);
      const limit = parseInt(url.searchParams.get('limit')) || 100;
      const severity = url.searchParams.get('severity');
      
      let events = securityEvents.slice(-limit);
      
      if (severity) {
        events = events.filter(e => e.severity === severity);
      }
      
      return Response.json({
        events,
        total: events.length,
        maxEvents: MAX_EVENTS
      });
    }

    if (req.method === 'POST') {
      const event = await req.json();
      const logged = logSecurityEvent(event);
      
      return Response.json({
        success: true,
        event: logged
      });
    }

    return Response.json({ error: 'Method not allowed' }, { status: 405 });

  } catch (error) {
    console.error('Security logger error:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});