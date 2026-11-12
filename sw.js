// Offline support: the game's files are saved when the service worker installs, so after the
// first visit the game opens and plays with no internet. The page itself is network-first with
// a short timeout, so updates still arrive when online; icons and other files are cache-first.
const CACHE = 'abtal-v3';
const CORE = ['./', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE)
    .then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: 'reload' })).catch(() => {}))))
    .then(() => self.skipWaiting())
));

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;

  // the game page: try the network (to get updates), fall back to the saved copy when offline
  // or when the network takes more than 4 seconds
  if (r.mode === 'navigate') {
    e.respondWith((async () => {
      const c = await caches.open(CACHE);
      const saved = () => c.match('./');
      const net = fetch(r).then(res => {
        if (res.ok && !res.redirected) c.put('./', res.clone());
        return res;
      });
      net.catch(() => {});
      try {
        const res = await Promise.race([net, new Promise((_, no) => setTimeout(no, 4000))]);
        return res;
      } catch (_) {
        const s = await saved();
        return s || net.catch(() => Response.error());
      }
    })());
    return;
  }

  // everything else: saved copy first, otherwise download it and save it for next time
  e.respondWith(
    caches.match(r, { ignoreSearch: true }).then(m => m || fetch(r).then(res => {
      if (res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(CACHE).then(ch => ch.put(r, cp)); }
      return res;
    }))
  );
});
