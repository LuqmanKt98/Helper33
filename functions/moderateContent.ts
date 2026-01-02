import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content, context = 'general' } = await req.json();

    if (!content) {
      return Response.json({ error: 'Content is required' }, { status: 400 });
    }

    // Use AI to moderate content
    const moderationResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a content safety moderator for a wellness community platform supporting mental health, grief, and personal growth.

Analyze this ${context} content: "${content}"

Check for:
1. **Crisis Language**: Self-harm, suicide ideation, immediate danger (HIGHEST PRIORITY - flag as "crisis")
2. **Hate Speech**: Discrimination, bullying, harassment
3. **Spam**: Promotional content, scams, repetitive content
4. **Inappropriate Content**: Adult content, graphic violence
5. **Privacy Issues**: Sharing personal information (phone, address, financial info)
6. **Supportive Language**: Encouraging, empathetic, helpful (this is GOOD)

Context: This is a ${context} in a supportive wellness community. We want to encourage genuine sharing while protecting vulnerable users.

Return JSON with:
- is_safe: true if content is appropriate for the community
- severity: "safe" | "warning" | "crisis" | "blocked"
- reason: brief explanation of decision
- suggested_action: what to do ("approve" | "flag_for_review" | "redirect_to_crisis" | "block")
- suggested_resources: array of resource types if crisis detected`,
      response_json_schema: {
        type: "object",
        properties: {
          is_safe: { type: "boolean" },
          severity: { type: "string" },
          reason: { type: "string" },
          suggested_action: { type: "string" },
          suggested_resources: { 
            type: "array", 
            items: { type: "string" } 
          }
        }
      }
    });

    // If crisis detected, also notify admin
    if (moderationResult.severity === 'crisis') {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: Deno.env.get('ADMIN_EMAIL') || 'support@helper33.com',
          subject: '⚠️ URGENT: Crisis Content Detected',
          body: `Crisis language detected in user content.
          
User: ${user.email}
Content: ${content.substring(0, 200)}...
Timestamp: ${new Date().toISOString()}

Suggested resources: ${moderationResult.suggested_resources?.join(', ')}

Please review and follow up if needed.`
        });
      } catch (emailError) {
        console.error('Failed to send admin alert:', emailError);
      }
    }

    return Response.json({
      ...moderationResult,
      moderated_at: new Date().toISOString(),
      moderator: 'AI Safety System'
    });

  } catch (error) {
    console.error('Moderation error:', error);
    return Response.json({ 
      error: error.message,
      is_safe: false,
      severity: 'error',
      reason: 'Moderation system error - defaulting to safe review'
    }, { status: 500 });
  }
});