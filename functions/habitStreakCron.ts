import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

/**
 * Cron job to update habit streaks daily
 * Configure this to run once per day at midnight in your timezone
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Use service role for cron operations
    const habits = await base44.asServiceRole.entities.HabitTracker.list();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const updates = [];
    const streaksReset = [];

    for (const habit of habits) {
      if (!habit.is_active) continue;

      // Get all completions for this habit
      const completions = await base44.asServiceRole.entities.HabitCompletion.filter({
        habit_id: habit.id
      });

      if (completions.length === 0) {
        if (habit.current_streak !== 0) {
          await base44.asServiceRole.entities.HabitTracker.update(habit.id, {
            current_streak: 0,
            last_completed_date: null
          });
          streaksReset.push({
            habit: habit.habit_name,
            user: habit.created_by,
            reason: 'No completions'
          });
        }
        continue;
      }

      // Sort completions by date (most recent first)
      const sortedCompletions = completions
        .map(c => ({
          ...c,
          date: new Date(c.completion_date)
        }))
        .sort((a, b) => b.date - a.date);

      const lastCompletionDate = sortedCompletions[0].completion_date;
      
      // Check if habit was maintained (completed today or yesterday)
      if (lastCompletionDate !== today && lastCompletionDate !== yesterday) {
        // Streak broken - reset to 0
        if (habit.current_streak > 0) {
          await base44.asServiceRole.entities.HabitTracker.update(habit.id, {
            current_streak: 0,
            last_completed_date: lastCompletionDate
          });
          
          streaksReset.push({
            habit: habit.habit_name,
            user: habit.created_by,
            previous_streak: habit.current_streak,
            last_completed: lastCompletionDate
          });
        }
        continue;
      }

      // Calculate actual streak
      let currentStreak = 0;
      const completionDates = sortedCompletions.map(c => c.completion_date);
      
      if (lastCompletionDate === today || lastCompletionDate === yesterday) {
        currentStreak = 1;
        let checkDate = new Date(lastCompletionDate);
        
        for (let i = 1; i < completionDates.length; i++) {
          const prevDate = new Date(completionDates[i]);
          const expectedPrevDate = new Date(checkDate);
          expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
          
          if (prevDate.toISOString().split('T')[0] === expectedPrevDate.toISOString().split('T')[0]) {
            currentStreak++;
            checkDate = prevDate;
          } else {
            break;
          }
        }
      }

      // Update habit
      const updateData = {
        current_streak: currentStreak,
        longest_streak: Math.max(currentStreak, habit.longest_streak || 0),
        total_completions: completions.length,
        last_completed_date: lastCompletionDate
      };

      if (
        habit.current_streak !== currentStreak ||
        habit.longest_streak < updateData.longest_streak ||
        habit.total_completions !== completions.length
      ) {
        await base44.asServiceRole.entities.HabitTracker.update(habit.id, updateData);
        updates.push({
          habit: habit.habit_name,
          user: habit.created_by,
          streak: currentStreak,
          is_new_record: currentStreak > (habit.longest_streak || 0)
        });
      }
    }

    // Send notifications for streaks at risk
    if (streaksReset.length > 0) {
      console.log(`${streaksReset.length} streaks were reset`);
    }

    return Response.json({
      success: true,
      message: `Processed ${habits.length} habits`,
      updates: updates.length,
      streaks_reset: streaksReset.length,
      timestamp: new Date().toISOString(),
      details: { updates, streaksReset }
    });

  } catch (error) {
    console.error('Cron error:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});