Deno.serve((req) => {
  const serviceWorkerCode = `// Service Worker for Push Notifications
self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push received:', event);
  const defaultOptions = {
    icon: '/logo192.png',
    badge: '/badge-72x72.png',
    vibrate: [200, 100, 200],
    requireInteraction: false
  };
  if (!event.data) return;
  try {
    const data = event.data.json();
    const title = data.title || 'Helper33';
    const options = {
      body: data.body || data.message || 'You have a new notification',
      icon: data.icon || defaultOptions.icon,
      badge: data.badge || defaultOptions.badge,
      vibrate: data.vibrate || defaultOptions.vibrate,
      data: { url: data.url || '/', ...data },
      requireInteraction: data.requireInteraction || defaultOptions.requireInteraction,
      tag: data.tag || 'default-notification',
      renotify: !!data.renotify
    };
    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error('[Service Worker] Error:', error);
    event.waitUntil(self.registration.showNotification('Helper33', { body: 'You have a new notification', ...defaultOptions }));
  }
});
self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification clicked');
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
    for (let i = 0; i < clientList.length; i++) {
      const client = clientList[i];
      if (client.url.includes(urlToOpen) && 'focus' in client) return client.focus();
    }
    if (clients.openWindow) return clients.openWindow(urlToOpen);
  }));
});`;

  return new Response(serviceWorkerCode, {
    status: 200,
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Cache-Control': 'public, max-age=0',
      'Service-Worker-Allowed': '/'
    }
  });
});