import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all family members
    const members = await base44.entities.FamilyMember.filter(
      { created_by: user.email },
      '-name'
    );

    // Get all chores
    const chores = await base44.entities.Chore.filter(
      { created_by: user.email },
      '-created_date'
    );

    // Get recent chore completions (via RecurringTaskCompletion)
    const recentCompletions = await base44.entities.RecurringTaskCompletion?.filter(
      { created_by: user.email },
      '-completion_date',
      100
    ) || [];

    // Analyze completion patterns for each member
    const memberStats = members.map(member => {
      const memberCompletions = recentCompletions.filter(c => 
        chores.find(ch => ch.id === c.task_id && ch.current_assignee_id === member.id)
      );

      const completionRate = memberCompletions.length > 0 
        ? (memberCompletions.length / 10) * 100 
        : 50;

      const avgDaysToComplete = 3; // Placeholder
      
      return {
        id: member.id,
        name: member.name,
        role: member.role,
        age: member.age,
        completionRate,
        avgDaysToComplete,
        recentTaskCount: memberCompletions.length,
        isChild: ['ChildMember', 'TeenMember'].includes(member.role),
        isAdult: ['ParentGuardian', 'AdultMember', 'FamilyAdmin'].includes(member.role)
      };
    });

    // Build AI prompt for chore suggestions
    const prompt = `You are a family management AI assistant helping to assign chores fairly and effectively.

Family Members:
${memberStats.map(m => `- ${m.name} (${m.role}, ${m.age || 'age unknown'}) - Completion rate: ${m.completionRate}%, Recent tasks: ${m.recentTaskCount}`).join('\n')}

Chores to Assign:
${chores.map(c => `- ${c.name} (${c.frequency}, ${c.points} points, currently: ${members.find(m => m.id === c.current_assignee_id)?.name || 'unassigned'})`).join('\n')}

Analyze the data and suggest optimal chore assignments. Consider:
- Fair distribution based on age and capability
- Rotation to prevent boredom
- Completion rates and member reliability
- Age-appropriate tasks (children for simple tasks, adults for complex ones)
- Balanced workload

Provide suggestions in this exact JSON format:
{
  "suggestions": [
    {
      "chore_id": "chore_id_here",
      "chore_name": "chore name",
      "suggested_member_id": "member_id",
      "suggested_member_name": "member name",
      "reason": "brief explanation why this member is ideal for this chore",
      "confidence_score": 0.85,
      "alternative_members": [
        {"member_id": "id", "member_name": "name", "reason": "why they're also suitable"}
      ]
    }
  ],
  "overall_insights": "2-3 sentences about the overall distribution and balance",
  "fairness_score": 0.9
}`;

    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          suggestions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                chore_id: { type: "string" },
                chore_name: { type: "string" },
                suggested_member_id: { type: "string" },
                suggested_member_name: { type: "string" },
                reason: { type: "string" },
                confidence_score: { type: "number" },
                alternative_members: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      member_id: { type: "string" },
                      member_name: { type: "string" },
                      reason: { type: "string" }
                    }
                  }
                }
              }
            }
          },
          overall_insights: { type: "string" },
          fairness_score: { type: "number" }
        }
      }
    });

    return Response.json({ 
      success: true,
      data: aiResponse,
      member_stats: memberStats
    });

  } catch (error) {
    console.error('Error generating chore suggestions:', error);
    return Response.json({ 
      error: error.message || 'Failed to generate suggestions' 
    }, { status: 500 });
  }
});