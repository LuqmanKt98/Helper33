import { createClientFromRequest } from 'npm:@base44/sdk@0.7.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider, sync_id } = await req.json();

    // Get the sync configuration
    const sync = await base44.entities.HealthDataSync.filter({ id: sync_id });
    
    if (!sync || sync.length === 0) {
      return Response.json({ error: 'Sync configuration not found' }, { status: 404 });
    }

    const syncConfig = sync[0];

    // This is a placeholder for actual health API integration
    // In production, you would:
    // 1. Use the access_token to call the health provider's API
    // 2. Fetch recent health data
    // 3. Transform it to our HealthMetric format
    // 4. Save to database

    // For now, return a coming soon message
    return Response.json({
      message: 'Health data sync is coming soon',
      provider: provider,
      note: 'This feature requires OAuth setup with health providers. For now, please manually log health data in the Wellness tab.',
      enabled_metrics: syncConfig.enabled_metrics
    });

    // Example of what the implementation would look like:
    /*
    if (provider === 'google_fit') {
      const response = await fetch('https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${syncConfig.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          aggregateBy: [{
            dataTypeName: 'com.google.step_count.delta'
          }],
          bucketByTime: { durationMillis: 86400000 }, // 1 day
          startTimeMillis: Date.now() - (7 * 86400000), // 7 days ago
          endTimeMillis: Date.now()
        })
      });

      const data = await response.json();
      
      // Transform and save
      for (const bucket of data.bucket) {
        const steps = bucket.dataset[0].point[0]?.value[0]?.intVal || 0;
        await base44.entities.HealthMetric.create({
          sync_id: sync_id,
          metric_date: new Date(bucket.startTimeMillis).toISOString().split('T')[0],
          metric_type: 'steps',
          value: steps,
          unit: 'steps'
        });
      }

      await base44.entities.HealthDataSync.update(sync_id, {
        last_sync: new Date().toISOString(),
        sync_status: 'active'
      });

      return Response.json({ success: true, synced: data.bucket.length });
    }
    */

  } catch (error) {
    console.error('Health sync error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});