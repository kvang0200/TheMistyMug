/* The Barovian Archive — offline cache.
   - The page and js/data.js are fetched fresh when online (so session updates show up right away)
     and fall back to the cache when offline.
   - Everything else (styles, scripts, fonts, images) is served from the cache instantly and
     refreshed in the background.
   Bump VERSION when you change css/, js/app.js, js/sound.js, fonts/ or img/ to make every
   player's device drop the old copies on its next visit. */
const VERSION = "2026-11-18-dnd-entrances";
const CACHE = "barovia-" + VERSION;
const CORE = [
  "./",
  "index.html",
  "css/style.css",
  "js/data.js",
  "js/sound.js",
  "js/app.js",
  "fonts/bodoni-moda.woff2",
  "fonts/bodoni-moda-italic.woff2",
  "fonts/inter.woff2",
  "fonts/plex-mono-400.woff2",
  "fonts/plex-mono-600.woff2",
  "img/grain.webp",
  "img/icon-192.png",
  "manifest.webmanifest"
];
const FRESH_FIRST = [/\/$/, /index\.html$/, /js\/data\.js$/];

self.addEventListener("install", e => {
  // cache:"reload" skips the browser's own HTTP cache, which GitHub Pages lets keep a
  // file for 10 minutes; without it a new version could be filled with the old CSS/JS
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE.map(u => new Request(u, { cache: "reload" })))).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith("barovia-") && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const freshFirst = req.mode === "navigate" || FRESH_FIRST.some(r => r.test(url.pathname));
  if (freshFirst) {
    e.respondWith(
      fetch(req)
        .then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; })
        .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("index.html")))
    );
    return;
  }

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(req).then(hit => {
        const net = fetch(req, { cache: "no-cache" }).then(res => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => hit);
        return hit || net;
      })
    )
  );
});
