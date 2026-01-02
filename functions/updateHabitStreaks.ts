import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // This can be called by cron or manually
    // For manual calls, require authentication
    const user = await base44.auth.me().catch(() => null);
    
    // Use service role to update all habits
    const habits = await base44.asServiceRole.entities.HabitTracker.list();
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    const updates = [];

    for (const habit of habits) {
      if (!habit.is_active) continue;

      // Get completions for this habit
      const completions = await base44.asServiceRole.entities.HabitCompletion.filter({
        habit_id: habit.id
      });

      // Sort by date
      const sortedCompletions = completions
        .map(c => ({
          ...c,
          date: new Date(c.completion_date)
        }))
        .sort((a, b) => b.date - a.date);

      if (sortedCompletions.length === 0) {
        // No completions - streak is 0
        if (habit.current_streak !== 0) {
          await base44.asServiceRole.entities.HabitTracker.update(habit.id, {
            current_streak: 0,
            last_completed_date: null
          });
          updates.push({
            habit: habit.habit_name,
            action: 'reset',
            streak: 0
          });
        }
        continue;
      }

      // Calculate current streak
      let currentStreak = 0;
      const completionDates = sortedCompletions.map(c => c.completion_date);
      
      // Check if completed today or yesterday (to maintain streak)
      const lastCompletionDate = sortedCompletions[0].completion_date;
      
      if (lastCompletionDate === today || lastCompletionDate === yesterday) {
        // Start counting streak
        currentStreak = 1;
        let checkDate = new Date(lastCompletionDate);
        
        // Count consecutive days backwards
        for (let i = 1; i < completionDates.length; i++) {
          const prevDate = new Date(completionDates[i]);
          const expectedPrevDate = new Date(checkDate);
          expectedPrevDate.setDate(expectedPrevDate.getDate() - 1);
          
          // Check if previous completion is exactly one day before
          if (prevDate.toISOString().split('T')[0] === expectedPrevDate.toISOString().split('T')[0]) {
            currentStreak++;
            checkDate = prevDate;
          } else {
            break; // Streak broken
          }
        }
      } else {
        // Last completion was more than 1 day ago - streak is broken
        currentStreak = 0;
      }

      // Update habit if streak changed
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
          action: 'updated',
          streak: currentStreak,
          user: habit.created_by
        });
      }
    }

    return Response.json({
      success: true,
      message: `Updated ${updates.length} habits`,
      updates,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Streak update error:', error);
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});