// Service worker do Painel da Reparação.
// Página: rede primeiro (pega a edição nova), cache se estiver offline.
// Ícones, manifest e fontes: cache primeiro.
const VERSAO = "2026-11-13-145327";
const CACHE = "painel-" + VERSAO;
const BASE = ["./", "./index.html", "./manifest.webmanifest",
  "./icones/icone-192.png", "./icones/icone-512.png", "./icones/apple-touch-icon.png", "./icones/favicon-32.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(
    ks.filter(k => k.startsWith("painel-") && k !== CACHE).map(k => caches.delete(k))
  )).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const fonte = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  if (req.mode === "navigate") {
    e.respondWith(fetch(req, {cache: "no-store"}).then(r => {
      const copia = r.clone();
      caches.open(CACHE).then(c => c.put("./index.html", copia));
      return r;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  if (url.origin === location.origin || fonte) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(r => {
      if (r.ok || r.type === "opaque") { const c2 = r.clone(); caches.open(CACHE).then(c => c.put(req, c2)); }
      return r;
    })));
  }
});
