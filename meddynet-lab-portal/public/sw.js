// Dummy service worker to silence 404 errors from previous project sessions on localhost
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});
