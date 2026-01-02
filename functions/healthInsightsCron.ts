import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

// This cron runs daily to analyze health-mood correlations for all users
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all users with active health data syncs
    const activeSyncs = await base44.asServiceRole.entities.HealthDataSync.filter({
      is_connected: true,
      sync_status: 'active'
    });

    if (activeSyncs.length === 0) {
      return Response.json({
        message: 'No active health data syncs',
        processed: 0
      });
    }

    const results = [];

    for (const sync of activeSyncs) {
      try {
        // Get user's health metrics and mood data
        const userMetrics = await base44.asServiceRole.entities.HealthMetric.filter({
          created_by: sync.created_by
        }, '-metric_date', 30);

        const userMoods = await base44.asServiceRole.entities.SoulLinkMoodEntry.filter({
          created_by: sync.created_by
        }, '-created_date', 30);

        // Only analyze if there's sufficient data
        if (userMetrics.length >= 5 && userMoods.length >= 5) {
          // Check if AI analysis is enabled
          if (sync.privacy_settings?.share_with_ai !== false) {
            // Call the analysis function
            const analysisResponse = await base44.asServiceRole.functions.invoke('analyzeHealthCorrelations', {
              days: 30,
              force_analysis: true
            });

            results.push({
              user: sync.created_by,
              status: 'analyzed',
              insights_created: analysisResponse.insights?.length || 0
            });
          } else {
            results.push({
              user: sync.created_by,
              status: 'skipped_privacy_settings'
            });
          }
        } else {
          results.push({
            user: sync.created_by,
            status: 'insufficient_data',
            metrics: userMetrics.length,
            moods: userMoods.length
          });
        }

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`Error analyzing user ${sync.created_by}:`, error);
        results.push({
          user: sync.created_by,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      processed: results.length,
      results
    });

  } catch (error) {
    console.error('Health insights cron error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});