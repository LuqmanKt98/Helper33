import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import admin from 'npm:firebase-admin@11.11.1';

export default Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, title, body, serviceAccount } = await req.json();

    if (!userId || !title || !body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    if (!serviceAccount) {
        return Response.json({ error: 'Missing serviceAccount' }, { status: 400 });
    }

    const appName = 'fcm_sender_' + Date.now() + '_' + Math.random();
    
    let app;
    try {
        app = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        }, appName);
    } catch (e) {
        console.error('Firebase init error:', e);
        return Response.json({ error: 'Failed to initialize Firebase: ' + e.message }, { status: 500 });
    }

    // Fetch target user to get token
    // Using list() as a safe fallback for admin access to User entity
    const users = await base44.entities.User.list();
    const targetUser = users.find(u => u.id === userId);
    
    if (!targetUser) {
        await app.delete();
        return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const fcmToken = targetUser.firebase_fcm_token;
    
    if (!fcmToken) {
        await app.delete();
        return Response.json({ error: 'User has no FCM token registered. Please have them visit the site with Firebase configured to generate one.' }, { status: 400 });
    }

    const message = {
        notification: {
            title,
            body
        },
        token: fcmToken
    };

    const response = await app.messaging().send(message);
    
    await app.delete();

    return Response.json({ success: true, messageId: response, user: targetUser.email });

  } catch (error) {
    console.error('FCM Send Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});