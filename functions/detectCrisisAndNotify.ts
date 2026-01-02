import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

const CRISIS_KEYWORDS = [
  'suicide', 'kill myself', 'end it all', 'want to die', 'better off dead',
  'no reason to live', 'can\'t go on', 'end my life', 'suicidal',
  'take my own life', 'hurt myself', 'self harm', 'cutting', 'overdose'
];

const DISTRESS_KEYWORDS = [
  'hopeless', 'worthless', 'burden', 'can\'t take it anymore',
  'give up', 'no point', 'nothing matters', 'everyone would be better without me'
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message_content, context } = await req.json();

    if (!message_content) {
      return Response.json({ error: 'Message content required' }, { status: 400 });
    }

    const lowerMessage = message_content.toLowerCase();

    // Check for crisis keywords
    const hasCrisisKeywords = CRISIS_KEYWORDS.some(keyword => 
      lowerMessage.includes(keyword.toLowerCase())
    );

    const hasDistressKeywords = DISTRESS_KEYWORDS.some(keyword =>
      lowerMessage.includes(keyword.toLowerCase())
    );

    let crisisLevel = 'none';
    let shouldNotify = false;

    if (hasCrisisKeywords) {
      crisisLevel = 'immediate_danger';
      shouldNotify = true;
    } else if (hasDistressKeywords) {
      crisisLevel = 'moderate_concern';
      shouldNotify = false; // Only notify on explicit crisis language
    }

    // Get or create crisis support record
    const crisisSupports = await base44.asServiceRole.entities.CrisisSupport.filter({
      created_by: user.email
    });

    let crisisSupport = crisisSupports && crisisSupports.length > 0 
      ? crisisSupports[0]
      : await base44.asServiceRole.entities.CrisisSupport.create({
          created_by: user.email,
          safety_plan_created: false,
          warning_signs: [],
          coping_strategies: [],
          reasons_for_living: [],
          safe_people: [],
          crisis_level: 'none'
        });

    // Update crisis level
    if (crisisLevel !== 'none') {
      await base44.asServiceRole.entities.CrisisSupport.update(crisisSupport.id, {
        crisis_level: crisisLevel,
        last_crisis_check: new Date().toISOString()
      });

      // Log crisis episode
      const crisisHistory = crisisSupport.crisis_history || [];
      crisisHistory.push({
        date: new Date().toISOString(),
        severity: crisisLevel === 'immediate_danger' ? 'emergency' : 'moderate',
        triggers: [context || 'AI conversation'],
        emergency_contact_notified: shouldNotify
      });

      await base44.asServiceRole.entities.CrisisSupport.update(crisisSupport.id, {
        crisis_history: crisisHistory
      });
    }

    // Notify emergency contacts if immediate danger
    if (shouldNotify && crisisSupport.safe_people && crisisSupport.safe_people.length > 0) {
      const emergencyContacts = crisisSupport.safe_people.filter(p => p.notify_in_crisis);

      // Check if we've notified recently (don't spam within 1 hour)
      const lastNotification = crisisSupport.last_emergency_notification 
        ? new Date(crisisSupport.last_emergency_notification)
        : null;
      
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const shouldSendNotification = !lastNotification || lastNotification < oneHourAgo;

      if (shouldSendNotification && emergencyContacts.length > 0) {
        for (const contact of emergencyContacts) {
          try {
            // Send notification via available channels
            if (contact.phone) {
              await base44.asServiceRole.functions.invoke('sendSMS', {
                to: contact.phone,
                message: `URGENT: ${user.full_name || 'Your loved one'} may be in crisis and expressing suicidal thoughts. Please reach out to them immediately. If you believe they are in immediate danger, call 911. - Helper33 Crisis Alert System`
              });
            }

            if (contact.email) {
              await base44.asServiceRole.integrations.Core.SendEmail({
                to: contact.email,
                subject: `URGENT: Crisis Alert for ${user.full_name}`,
                body: `This is an automated crisis alert from Helper33.\n\n${user.full_name || 'Your loved one'} has expressed concerning thoughts that may indicate suicide risk. Please reach out to them immediately.\n\nIf you believe they are in immediate danger:\n- Call 911\n- Call 988 (Suicide & Crisis Lifeline)\n- Take them to the nearest emergency room\n\nThis alert was sent because ${user.full_name} listed you as an emergency contact in their crisis safety plan.\n\n- Helper33 Crisis Support System`
              });
            }
          } catch (error) {
            console.error('Error notifying emergency contact:', error);
          }
        }

        // Update last notification time
        await base44.asServiceRole.entities.CrisisSupport.update(crisisSupport.id, {
          last_emergency_notification: new Date().toISOString()
        });
      }
    }

    // Generate appropriate AI response
    let aiResponse = {
      crisis_detected: crisisLevel !== 'none',
      crisis_level: crisisLevel,
      emergency_contacts_notified: shouldNotify && crisisSupport.safe_people?.length > 0,
      recommended_actions: [],
      supportive_message: ''
    };

    if (crisisLevel === 'immediate_danger') {
      aiResponse.recommended_actions = [
        'call_988',
        'call_emergency_contact',
        'go_to_er',
        'use_safety_plan'
      ];
      aiResponse.supportive_message = "I'm really concerned about you right now, and I want you to know that help is available. Please call 988 (Suicide & Crisis Lifeline) or text HOME to 741741 right now. If you're in immediate danger, call 911 or go to your nearest emergency room. You matter, and you deserve support through this. Will you reach out to someone right now?";
    } else if (crisisLevel === 'moderate_concern') {
      aiResponse.recommended_actions = [
        'talk_to_someone',
        'use_coping_strategies',
        'review_reasons',
        'breathing_exercise'
      ];
      aiResponse.supportive_message = "I hear that you're going through a really difficult time. These feelings are heavy, and you don't have to carry them alone. Would it help to talk to someone? The Crisis Text Line (text HOME to 741741) has trained counselors available 24/7. Or we could work through some coping strategies together. What would feel most supportive right now?";
    }

    return Response.json({
      success: true,
      ...aiResponse,
      crisis_hub_url: '/CrisisHub',
      safety_plan_exists: crisisSupport.safety_plan_created
    });

  } catch (error) {
    console.error('Error in crisis detection:', error);
    return Response.json({ 
      error: error.message,
      success: false 
    }, { status: 500 });
  }
});