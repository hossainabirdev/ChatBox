/* ChatBox v173 service worker — tab-closed push notifications + PWA.
   Shows a push notification even when no ChatBox tab is open,
   as long as Chrome runs in the background and push is enabled.
   Clicking the notification opens/focuses ChatBox on that chat.

   PWA (v78): the app shell is cached so the app OPENS even when the
   phone is offline — like a real app. Strategy, chosen so a new deploy
   is never hidden behind a stale page:
   - App pages (index.html, /): NETWORK-FIRST with a 2.5s timeout (v145 T13)
     — always fetch fresh when online and fast; on a slow/flaky network the
     cached shell opens instantly instead of hanging, and the fresh page
     still lands in the cache for next time; serve the cached copy when
     the network fails (offline).
   - Shell assets (manifest, icons, logo, favicon, call background):
     CACHE-FIRST — they almost never change; fall back to network if not
     cached.
   - Everything else (Supabase, media, other sites): NETWORK-ONLY,
     never cached.
   The cache name carries the version; activating a new worker deletes
   old caches, so an old shell can never linger. */
const CACHE_NAME = 'chatbox-v173';
const SHELL = [
  '/',
 '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-512.png',
  '/logo.png',
  '/favicon.svg',
  '/chatbox-call-doodle-bg.jpg'
];
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => Promise.all(
      SHELL.map((u) => cache.add(u).catch(() => {}))
    )).catch(() => {})
  );
  self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== 'chatbox-share').map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});
self.addEventListener('fetch', (event) => {
  const req = event.request;
  /* v111: Share Target — another app shares text/files into ChatBox.
     The share arrives as a POST. Read the form, store it in a small
     dedicated cache, then send the user to the app, which shows a
     "Share to..." picker. The page reads the stored share and deletes
     it, so a stale share never reappears. */
  if (req.method === 'POST' && new URL(req.url).pathname === '/share-target/') {
    event.respondWith((async () => {
      try {
        const formData = await req.formData();
        let total = 0;
        formData.forEach((v) => { if (v && typeof v.size === 'number') total += v.size; });
        if (total > 60 * 1024 * 1024) return Response.redirect('/?shared=failed', 303);
        const cache = await caches.open('chatbox-share');
        await cache.put('/__chatbox-shared', new Response(formData));
        return Response.redirect('/?shared=1', 303);
      } catch (e) { return Response.redirect('/?shared=failed', 303); }
    })());
    return;
  }
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // Supabase, media, etc: pass through.
  const path = url.pathname;
  /* v111: the page reads the stored share payload from here. */
  if (path === '/__chatbox-shared') {
    event.respondWith(caches.open('chatbox-share').then((cache) => cache.match('/__chatbox-shared')));
    return;
  }
  const isPage = req.mode === 'navigate' || path === '/' || path.endsWith('/index.html');
  const isShellAsset = SHELL.indexOf(path) !== -1;
  if (isPage) {
    // v145 T13: network first, but never hang the open on a slow network —
    // race the fetch against a 2.5s timeout and serve the cached shell when
    // the network is slow or down. The fetch still updates the cache when it
    // lands, so the next open is fresh. No cache yet (first install, offline):
    // wait for the network instead of showing a stale page.
    const net = fetch(req).then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy)).catch(() => {});
      }
      return res;
    });
    event.respondWith(
      Promise.race([
        net,
        new Promise((_, rej) => setTimeout(() => rej(new Error('sw-page-timeout')), 2500))
      ]).catch(() => caches.match('/index.html').then((cached) => cached || net))
    );
    return;
  }
  if (isShellAsset) {
    // Cache first, network as fallback.
    event.respondWith(
      caches.match(req).then((cached) => cached || fetch(req).then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy)).catch(() => {});
        }
        return res;
      }))
    );
    return;
  }
  // Everything else on this origin: network only, never cached.
  // v155: a failed fetch no longer rejects outright — fall back to cache.
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) {}
  const title = data.title || 'ChatBox';
  const body = data.body || 'New message';
  const chatId = data.chat_id || data.chatId || null;
  const url = chatId ? '/?chat=' + encodeURIComponent(chatId) : '/';
  const kind = data.kind || 'message';
  // Messenger-style: the sender's photo as the notification icon, the
  // ChatBox logo as the small badge, and Reply / Open actions.
  // Smooth + beautiful: gentle double-pulse vibration, re-alert on each
  // new message in the same chat, and the real arrival time.
  const options = {
    body: body,
    tag: chatId ? 'chatbox-' + chatId : 'chatbox',
    data: { url: url, chatId: chatId },
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    renotify: true,
    timestamp: Date.now(),
    actions: kind === 'call'
      ? [{ action: 'open', title: 'Open' }]
      : [{ action: 'reply', title: 'Reply' }, { action: 'open', title: 'Open' }]
  };
  if (data.icon) options.icon = data.icon;
  /* v167 push fix: when a ChatBox window is already open and visible, the
     app itself shows the message (and plays the in-app tone under the
     v167 burst rule) — a system notification + sound on top of it is the
     "notification sound while chatting" complaint. Skip the system
     notification in that case. Fail OPEN: any error in the client check
     still shows the notification, so a message is never silently lost. */
  event.waitUntil((async () => {
    try {
      const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        try { if (client.visibilityState === 'visible') return; } catch (e) {}
      }
    } catch (e) { /* fail open — show the notification below */ }
    return self.registration.showNotification(title, options);
  })());
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  let url = (event.notification.data && event.notification.data.url) || '/';
  // Reply = open the chat AND focus the message box, so typing is instant.
  if (event.action === 'reply' && url.indexOf('chat=') !== -1) {
    url += (url.indexOf('?') !== -1 ? '&' : '?') + 'focus=1';
  }
  event.waitUntil((async () => {
    const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
    const target = new URL(url, self.location.origin).href;
    let fallback = null;
    for (const client of allClients) {
      if (!('focus' in client)) continue;
      if (!fallback) fallback = client;
      // v155: prefer a tab already showing the target instead of hijacking the first tab.
      try { if (client.url === target) { return client.focus(); } } catch (e) {}
    }
    if (fallback) {
      try { if (url !== '/') await fallback.navigate(url); } catch (e) {}
      return fallback.focus();
    }
    if (clients.openWindow) {
      try { return await clients.openWindow(url); }
      catch (e) { try { return await clients.openWindow('/'); } catch (e2) {} }
    }
  })());
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

/* v111: Background Sync — when the phone comes back online, the browser
   wakes this worker, which tells any open ChatBox tab to flush the
   offline message outbox. The worker itself cannot send (it has no
   login session); the page does the sending. */
self.addEventListener('sync', (event) => {
  if (event.tag === 'chatbox-outbox') {
    event.waitUntil((async () => {
      const allClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      for (const client of allClients) {
        try { client.postMessage({ type: 'chatbox-flush-outbox' }); } catch (e) {}
      }
    })());
  }
});
