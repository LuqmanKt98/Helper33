import { createClient } from 'npm:@base44/sdk@0.7.1';
import { format, addDays, addWeeks, addMonths, differenceInDays } from 'npm:date-fns@3.0.0';

const base44 = createClient({ serviceRole: true });

Deno.serve(async (req) => {
  try {
    console.log('🎯 Coach Check-In Cron Started');

    const today = new Date();
    
    // Get all active coach connections
    const connections = await base44.entities.CoachConnection.filter({
      relationship_status: 'active'
    });

    console.log(`📋 Found ${connections.length} active coach connections`);

    let reportsSent = 0;
    let checkInsScheduled = 0;

    for (const connection of connections) {
      try {
        const prefs = connection.sharing_preferences || {};
        
        // Skip if auto-sharing is not enabled
        if (!prefs.auto_share) {
          continue;
        }

        // Check if it's time for a check-in
        const shouldSendReport = shouldSendCheckIn(connection, today);

        if (shouldSendReport) {
          // Get user who owns this connection
          const users = await base44.entities.User.filter({ 
            email: connection.created_by 
          });
          
          if (!users || users.length === 0) continue;
          const user = users[0];

          // Collect data based on sharing preferences
          let goals = [];
          let sessions = [];
          let progressEntries = [];

          if (prefs.share_goals) {
            goals = await base44.entities.CoachingGoal.filter({ 
              created_by: user.email,
              shared_with_coach: true 
            });
          }

          if (prefs.share_sessions) {
            sessions = await base44.entities.CoachingSession.filter({ 
              created_by: user.email,
              shared_with_coach: true 
            }, '-created_date', 10);
          }

          if (prefs.share_progress) {
            const allProgress = await base44.entities.CoachingProgress.filter({
              created_by: user.email
            }, '-progress_date', 20);
            const goalIds = goals.map(g => g.id);
            progressEntries = allProgress.filter(p => goalIds.includes(p.goal_id));
          }

          // Generate HTML report
          const reportHTML = generateHTMLReport(user, connection, goals, sessions, progressEntries);

          // Send email to coach
          await base44.integrations.Core.SendEmail({
            to: connection.coach_email,
            subject: `Scheduled Check-In Report - ${user.full_name} (${format(today, 'MMM d, yyyy')})`,
            body: reportHTML
          });

          // Update connection
          const nextCheckIn = calculateNextCheckIn(connection.check_in_frequency, today);
          
          await base44.entities.CoachConnection.update(connection.id, {
            last_report_sent: today.toISOString(),
            next_check_in: nextCheckIn.toISOString()
          });

          reportsSent++;
          console.log(`✅ Sent report to ${connection.coach_email} for ${user.email}`);

          // Notify user that report was sent
          await base44.integrations.Core.SendEmail({
            to: user.email,
            subject: 'Progress Report Sent to Your Coach',
            body: `Hi ${user.full_name},\n\nYour scheduled progress report has been sent to ${connection.coach_name}.\n\nNext check-in: ${format(nextCheckIn, 'MMMM d, yyyy')}\n\nYou can manage your sharing settings anytime in the Coaching Progress page.\n\nWith care,\nDobryLife`
          });
        }
      } catch (error) {
        console.error(`Error processing connection ${connection.id}:`, error);
      }
    }

    console.log(`✅ Coach Check-In Cron Complete: ${reportsSent} reports sent`);

    return Response.json({
      success: true,
      reports_sent: reportsSent,
      connections_checked: connections.length
    });

  } catch (error) {
    console.error('❌ Coach Check-In Cron Error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});

function shouldSendCheckIn(connection, today) {
  const nextCheckIn = connection.next_check_in;
  
  if (!nextCheckIn) {
    // First check-in, send now
    return true;
  }

  const nextDate = new Date(nextCheckIn);
  return today >= nextDate;
}

function calculateNextCheckIn(frequency, currentDate) {
  switch (frequency) {
    case 'weekly':
      return addWeeks(currentDate, 1);
    case 'biweekly':
      return addWeeks(currentDate, 2);
    case 'monthly':
      return addMonths(currentDate, 1);
    default:
      return addWeeks(currentDate, 1);
  }
}

function generateHTMLReport(user, connection, goals, sessions, progressEntries) {
  const prefs = connection.sharing_preferences || {};
  
  let html = `
    <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #F9FAFB;">
      <div style="background: white; border-radius: 16px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h1 style="color: #7C3AED; border-bottom: 3px solid #7C3AED; padding-bottom: 15px; margin-bottom: 20px;">
          Progress Report for ${user.full_name}
        </h1>
        <p style="color: #666; font-size: 14px; margin-bottom: 30px;">
          ${format(new Date(), 'MMMM d, yyyy')} • ${connection.coaching_type.replace('_', ' ')}
        </p>
  `;

  // Goals
  if (prefs.share_goals && goals.length > 0) {
    html += `
      <h2 style="color: #4F46E5; margin-top: 30px; margin-bottom: 15px; font-size: 20px;">
        🎯 Goals (${goals.length})
      </h2>
    `;

    goals.forEach(goal => {
      const completedMilestones = goal.milestones?.filter(m => m.completed).length || 0;
      const totalMilestones = goal.milestones?.length || 0;

      html += `
        <div style="background: #F3F4F6; border-left: 4px solid #7C3AED; padding: 20px; margin-bottom: 15px; border-radius: 8px;">
          <h3 style="margin: 0 0 12px 0; color: #1F2937; font-size: 18px;">${goal.goal_title}</h3>
          <div style="background: #E5E7EB; height: 10px; border-radius: 5px; overflow: hidden; margin: 12px 0;">
            <div style="background: linear-gradient(to right, #7C3AED, #EC4899); height: 100%; width: ${goal.progress_percentage || 0}%; transition: width 0.3s;"></div>
          </div>
          <p style="color: #6B7280; font-size: 14px; margin: 8px 0;">
            <strong style="color: #7C3AED;">${goal.progress_percentage || 0}%</strong> Complete
          </p>
          ${goal.goal_description ? `<p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin-top: 10px;">${goal.goal_description}</p>` : ''}
          ${totalMilestones > 0 ? `
            <p style="color: #6B7280; font-size: 14px; margin-top: 12px;">
              ✓ ${completedMilestones} of ${totalMilestones} milestones completed
            </p>
          ` : ''}
        </div>
      `;
    });
  }

  // Sessions
  if (prefs.share_sessions && sessions.length > 0) {
    html += `
      <h2 style="color: #4F46E5; margin-top: 35px; margin-bottom: 15px; font-size: 20px;">
        📅 Recent Sessions
      </h2>
    `;

    sessions.slice(0, 5).forEach(session => {
      html += `
        <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; margin-bottom: 15px; border-radius: 8px;">
          <h3 style="margin: 0 0 10px 0; color: #1F2937; font-size: 16px;">${session.session_title}</h3>
          <p style="color: #78716C; font-size: 13px;">
            ${format(new Date(session.created_date), 'MMMM d, yyyy')} • ${session.duration_minutes} minutes
          </p>
          ${session.ai_summary ? `
            <div style="background: white; padding: 15px; border-radius: 8px; margin-top: 12px;">
              <p style="color: #7C3AED; font-weight: 600; font-size: 13px; margin-bottom: 8px;">💜 Key Insights:</p>
              <p style="color: #374151; font-size: 14px; line-height: 1.6;">${session.ai_summary}</p>
            </div>
          ` : ''}
        </div>
      `;
    });
  }

  // Progress Entries
  if (prefs.share_progress && progressEntries.length > 0) {
    html += `
      <h2 style="color: #4F46E5; margin-top: 35px; margin-bottom: 15px; font-size: 20px;">
        📈 Recent Progress
      </h2>
    `;

    progressEntries.slice(0, 8).forEach(entry => {
      html += `
        <div style="background: #F0FDF4; border-left: 4px solid #10B981; padding: 15px; margin-bottom: 12px; border-radius: 8px;">
          <p style="color: #065F46; font-weight: 600; font-size: 14px; margin-bottom: 6px;">
            ${entry.progress_type.replace('_', ' ').toUpperCase()}
          </p>
          <p style="color: #047857; font-size: 14px;">${entry.description}</p>
          <p style="color: #6B7280; font-size: 12px; margin-top: 8px;">
            ${format(new Date(entry.progress_date), 'MMM d, yyyy')}
          </p>
        </div>
      `;
    });
  }

  html += `
      <div style="margin-top: 40px; padding: 25px; background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%); border-radius: 12px; color: white; text-align: center;">
        <p style="font-size: 16px; font-weight: 600; margin-bottom: 8px;">
          Securely Generated by DobryLife
        </p>
        <p style="font-size: 13px; opacity: 0.95;">
          All information shared with explicit consent from ${user.full_name}
        </p>
        <p style="font-size: 12px; margin-top: 12px; opacity: 0.85;">
          Next scheduled check-in: ${format(calculateNextCheckIn(connection.check_in_frequency, new Date()), 'MMMM d, yyyy')}
        </p>
      </div>
    </div>
  </div>
  `;

  return html;
}