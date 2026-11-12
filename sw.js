// Offline support: every file of the game is saved when the service worker installs, so after
// the first visit the game opens and plays with no internet.
// Code files (page, scripts, styles) are checked online first (4-second limit) so updates arrive;
// the server answers "unchanged" in a few bytes when nothing changed. Images rarely change, so they
// come straight from the saved copy with no request at all (bump CACHE when an image changes).
const CACHE = 'abtal-v5';
const FILES = [
  './', './style.css', './viewport.js', './game.js', './menu.js', './install.js',
  './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png',
  './img/logo.webp', './img/characters.webp', './img/plank.webp', './img/brick.webp', './img/sling.webp',
  './img/tree.webp', './img/joshua.webp', './img/mountain.webp', './img/rock1.webp', './img/rock2.webp',
  './img/bg-sky.webp', './img/bg-island.webp', './img/bg-pasture.webp', './img/bg-map-jungle.webp'
];

self.addEventListener('install', e => e.waitUntil(
  caches.open(CACHE)
    .then(c => Promise.all(FILES.map(u => c.add(new Request(u, { cache: 'no-cache' })).catch(() => {}))))
    .then(() => self.skipWaiting())
));

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim())
));

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  const nav = r.mode === 'navigate';
  if (/\/img\/[^/]+$/.test(new URL(r.url).pathname)) {
    e.respondWith(caches.match(r, { ignoreSearch: true }).then(m => m || fetch(r).then(res => {
      if (res.ok && res.type === 'basic') { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); }
      return res;
    })));
    return;
  }
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const key = nav ? './' : r;
    const net = fetch(r).then(res => {
      if (res.ok && !res.redirected && res.type === 'basic') c.put(key, res.clone());
      return res;
    });
    net.catch(() => {});
    try {
      return await Promise.race([net, new Promise((_, no) => setTimeout(no, 4000))]);
    } catch (_) {
      const saved = await c.match(key, { ignoreSearch: true });
      return saved || net.catch(() => Response.error());
    }
  })());
});
