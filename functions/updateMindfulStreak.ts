import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { item_key, item_type, duration_seconds } = await req.json();
    
    if (!item_key || !item_type) {
      return Response.json({ 
        error: 'Missing required fields: item_key and item_type are required' 
      }, { status: 400 });
    }

    // Get current date in user's timezone
    const today = new Date().toISOString().split('T')[0];
    
    // Get current streak data
    const currentStreak = user.mindful_streak || { current: 0, longest: 0, last_session_date: null };
    
    let newCurrent = currentStreak.current;
    let newLongest = currentStreak.longest || 0;
    
    // Check if this is a new day
    if (currentStreak.last_session_date !== today) {
      // Check if streak should continue (yesterday) or reset
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      
      if (currentStreak.last_session_date === yesterdayStr) {
        // Continue streak
        newCurrent = currentStreak.current + 1;
      } else if (currentStreak.last_session_date === null || currentStreak.last_session_date === today) {
        // First session ever or same day
        newCurrent = currentStreak.current || 1;
      } else {
        // Streak broken, start over
        newCurrent = 1;
      }
      
      // Update longest streak if current is higher
      if (newCurrent > newLongest) {
        newLongest = newCurrent;
      }
    }
    
    // Update user's streak data
    await base44.auth.updateMe({
      mindful_streak: {
        current: newCurrent,
        longest: newLongest,
        last_session_date: today
      }
    });
    
    // Record the session
    try {
      await base44.asServiceRole.entities.MindfulSession.create({
        item_key,
        item_type,
        completed_at: new Date().toISOString(),
        duration_seconds: duration_seconds || 0
      });
    } catch (sessionError) {
      console.error('Error creating session record:', sessionError);
      // Don't fail the whole request if session recording fails
    }
    
    return Response.json({
      success: true,
      streak: {
        current: newCurrent,
        longest: newLongest,
        last_session_date: today
      }
    });
    
  } catch (error) {
    console.error('Error updating mindful streak:', error);
    return Response.json({ 
      error: 'Internal server error', 
      details: error.message 
    }, { status: 500 });
  }
});