// Semicon Weekly service worker: lets the site install as an app and keeps pages you opened working offline.
// Pages: always try the internet first (so news is fresh), fall back to the saved copy, then to offline.html.
// CSS / JS / images / fonts: use the saved copy at once and refresh it in the background.
// Google Sheet data (jobs, news, events): internet first, saved copy when offline.
// VERSION is updated automatically on every release by private/news_tools/site_seo.py.
const VERSION = "20261107d";
const PAGES = "sw-pages-" + VERSION, ASSETS = "sw-assets-" + VERSION, DATA = "sw-data-v1";
const CORE = ["./", "offline.html", "saved-jobs.html", "style.css?v=" + VERSION, "theme.css?v=" + VERSION,
  "config.js?v=" + VERSION, "sw.js?v=" + VERSION, "site-ui.js?v=" + VERSION, "promo.js?v=" + VERSION, "search.js?v=" + VERSION,
  "manifest.webmanifest", "app-192.png", "favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(PAGES).then(c => Promise.all(CORE.map(u => c.add(new Request(u, { cache: "reload" })).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== PAGES && k !== ASSETS && k !== DATA).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

async function trim(name, max) {
  const c = await caches.open(name), keys = await c.keys();
  for (let i = 0; i < keys.length - max; i++) await c.delete(keys[i]);
}
async function networkFirst(req, name, max, fallback) {
  try {
    const res = await fetch(req);
    if (res && res.ok) { const c = await caches.open(name); c.put(req, res.clone()); trim(name, max); }
    return res;
  } catch (err) {
    const hit = await caches.match(req, { ignoreSearch: name === PAGES });
    if (hit) return hit;
    if (fallback) { const off = await caches.match(fallback); if (off) return off; }
    throw err;
  }
}
async function staleWhileRevalidate(req) {
  const c = await caches.open(ASSETS), hit = await c.match(req);
  const net = fetch(req).then(res => { if (res && (res.ok || res.type === "opaque")) { c.put(req, res.clone()); trim(ASSETS, 160); } return res; }).catch(() => hit);
  return hit || net;
}

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  // never touch the interview bot's server, sign-in, analytics or forms
  if (/workers\.dev|googleapis\.com\/(?!css)|accounts\.google|gstatic\.com\/recaptcha|goatcounter|mailerlite|forms\.gle|docs\.google\.com\/forms/.test(url.href)) return;
  if (url.origin === location.origin) {
    if (req.mode === "navigate" || req.destination === "document") { e.respondWith(networkFirst(req, PAGES, 60, "offline.html")); return; }
    if (/\.(css|js|png|jpe?g|webp|svg|ico|woff2?|webmanifest)$/.test(url.pathname)) { e.respondWith(staleWhileRevalidate(req)); return; }
    if (/\.json$/.test(url.pathname)) { e.respondWith(networkFirst(req, DATA, 20)); return; }
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com/.test(url.host)) { e.respondWith(staleWhileRevalidate(req)); return; }
  if (/docs\.google\.com\/spreadsheets/.test(url.href)) { e.respondWith(networkFirst(req, DATA, 20)); return; }
});
