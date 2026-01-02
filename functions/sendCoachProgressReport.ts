import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';
import { format } from 'npm:date-fns@3.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { connectionId, manualSend = false } = await req.json();

    if (!connectionId) {
      return Response.json({ 
        error: 'Missing connectionId parameter' 
      }, { status: 400 });
    }

    // Get coach connection
    const connection = await base44.entities.CoachConnection.get(connectionId);
    
    if (!connection || connection.created_by !== user.email) {
      return Response.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (connection.relationship_status !== 'active') {
      return Response.json({ error: 'Connection is not active' }, { status: 400 });
    }

    // Get all relevant data based on sharing preferences
    const prefs = connection.sharing_preferences || {};
    
    let goals = [];
    let sessions = [];
    let progressEntries = [];

    if (prefs.share_goals) {
      goals = await base44.entities.CoachingGoal.filter({ 
        shared_with_coach: true 
      }, '-created_date');
    }

    if (prefs.share_sessions) {
      sessions = await base44.entities.CoachingSession.filter({ 
        shared_with_coach: true 
      }, '-created_date', 10);
    }

    if (prefs.share_progress) {
      const allProgress = await base44.entities.CoachingProgress.list('-progress_date', 20);
      const goalIds = goals.map(g => g.id);
      progressEntries = allProgress.filter(p => goalIds.includes(p.goal_id));
    }

    // Generate comprehensive report
    let reportHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #7C3AED; border-bottom: 3px solid #7C3AED; padding-bottom: 10px;">
          Progress Report for ${user.full_name}
        </h1>
        <p style="color: #666; font-size: 14px;">
          ${format(new Date(), 'MMMM d, yyyy')} • ${connection.coaching_type.replace('_', ' ')}
        </p>
    `;

    // Goals Section
    if (prefs.share_goals && goals.length > 0) {
      reportHTML += `
        <h2 style="color: #4F46E5; margin-top: 30px; margin-bottom: 15px;">
          🎯 Active Goals (${goals.filter(g => g.status === 'active').length})
        </h2>
      `;

      goals.forEach(goal => {
        const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
        const totalMilestones = goal.milestones?.length || 0;

        reportHTML += `
          <div style="background: #F9FAFB; border-left: 4px solid #7C3AED; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #1F2937;">${goal.goal_title}</h3>
            <div style="background: #E5E7EB; height: 8px; border-radius: 4px; overflow: hidden; margin: 10px 0;">
              <div style="background: linear-gradient(to right, #7C3AED, #EC4899); height: 100%; width: ${goal.progress_percentage || 0}%;"></div>
            </div>
            <p style="color: #6B7280; font-size: 14px; margin: 5px 0;">
              Progress: <strong>${goal.progress_percentage || 0}%</strong>
            </p>
            ${goal.goal_description ? `<p style="color: #6B7280; font-size: 14px;">${goal.goal_description}</p>` : ''}
            ${totalMilestones > 0 ? `
              <p style="color: #6B7280; font-size: 14px; margin-top: 10px;">
                Milestones: ${completedMilestones}/${totalMilestones} completed
              </p>
            ` : ''}
            ${goal.target_date ? `
              <p style="color: #6B7280; font-size: 14px;">
                Target Date: ${format(new Date(goal.target_date), 'MMMM d, yyyy')}
              </p>
            ` : ''}
          </div>
        `;
      });
    }

    // Recent Sessions
    if (prefs.share_sessions && sessions.length > 0) {
      reportHTML += `
        <h2 style="color: #4F46E5; margin-top: 30px; margin-bottom: 15px;">
          📅 Recent Sessions (${sessions.length})
        </h2>
      `;

      sessions.forEach(session => {
        reportHTML += `
          <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
            <h3 style="margin: 0 0 10px 0; color: #1F2937;">${session.session_title}</h3>
            <p style="color: #6B7280; font-size: 14px;">
              ${format(new Date(session.created_date), 'MMMM d, yyyy')} • ${session.duration_minutes} minutes
            </p>
            ${session.mood_before && session.mood_after ? `
              <p style="color: #6B7280; font-size: 14px; margin-top: 10px;">
                Mood Shift: ${session.mood_before} → ${session.mood_after}
              </p>
            ` : ''}
            ${session.ai_summary ? `
              <div style="background: white; padding: 12px; border-radius: 6px; margin-top: 10px;">
                <p style="color: #7C3AED; font-weight: bold; font-size: 13px; margin-bottom: 8px;">AI Insights:</p>
                <p style="color: #4B5563; font-size: 14px; line-height: 1.6;">${session.ai_summary}</p>
              </div>
            ` : ''}
          </div>
        `;
      });
    }

    // Progress Updates
    if (prefs.share_progress && progressEntries.length > 0) {
      reportHTML += `
        <h2 style="color: #4F46E5; margin-top: 30px; margin-bottom: 15px;">
          📈 Progress Updates (Last 10)
        </h2>
      `;

      progressEntries.slice(0, 10).forEach(entry => {
        const typeColors = {
          milestone_completed: '#10B981',
          breakthrough: '#7C3AED',
          setback: '#F59E0B',
          regular_update: '#3B82F6',
          check_in: '#6366F1'
        };

        reportHTML += `
          <div style="background: #F9FAFB; border-left: 4px solid ${typeColors[entry.progress_type] || '#6B7280'}; padding: 15px; margin-bottom: 15px; border-radius: 8px;">
            <p style="color: #1F2937; font-weight: 600; margin-bottom: 8px;">
              ${entry.progress_type.replace('_', ' ').toUpperCase()}
            </p>
            <p style="color: #4B5563; font-size: 14px; margin-bottom: 8px;">${entry.description}</p>
            <p style="color: #9CA3AF; font-size: 12px;">
              ${format(new Date(entry.progress_date), 'MMMM d, yyyy')}
            </p>
            ${entry.mood_rating ? `
              <p style="color: #6B7280; font-size: 13px; margin-top: 8px;">
                Mood: ${entry.mood_rating}/10 | Confidence: ${entry.confidence_level}/10
              </p>
            ` : ''}
            ${entry.ai_encouragement ? `
              <p style="color: #7C3AED; font-style: italic; font-size: 13px; margin-top: 8px;">
                💜 ${entry.ai_encouragement}
              </p>
            ` : ''}
          </div>
        `;
      });
    }

    reportHTML += `
      <div style="margin-top: 40px; padding: 20px; background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%); border-radius: 12px; color: white; text-align: center;">
        <p style="font-size: 16px; margin-bottom: 10px;">
          This report was securely generated by DobryLife
        </p>
        <p style="font-size: 14px; opacity: 0.9;">
          All information is shared with ${user.full_name}'s explicit consent
        </p>
      </div>
    </div>
    `;

    // Send email to coach
    await base44.integrations.Core.SendEmail({
      to: connection.coach_email,
      subject: `Progress Report - ${user.full_name} (${format(new Date(), 'MMM d, yyyy')})`,
      body: reportHTML
    });

    // Update connection
    await base44.entities.CoachConnection.update(connectionId, {
      last_report_sent: new Date().toISOString()
    });

    // Send confirmation to user
    if (manualSend) {
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: 'Progress Report Sent Successfully',
        body: `Hi ${user.full_name},\n\nYour progress report has been sent to ${connection.coach_name} (${connection.coach_email}).\n\nThe report included:\n${prefs.share_goals ? '✓ Your goals and milestones\n' : ''}${prefs.share_sessions ? '✓ Recent session summaries\n' : ''}${prefs.share_progress ? '✓ Progress updates\n' : ''}\n\nYou can manage your sharing preferences anytime in the Coaching Progress page.\n\nWith care,\nDobryLife`
      });
    }

    return Response.json({ 
      success: true,
      message: 'Progress report sent successfully'
    });

  } catch (error) {
    console.error('Progress report error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});