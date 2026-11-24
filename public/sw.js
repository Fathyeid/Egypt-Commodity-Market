// Public curriculum only. No authenticated pages, requests or learner data cached.
const CACHE = "lisan-v3";
const LESSONS = "lisan-public-lessons-v1";
const OFFLINE = "/offline.html";
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll([OFFLINE, "/offline-library.js", "/icons/icon-192.png"])));
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("lisan-") && ![CACHE, LESSONS, "lisan-private-offline-v1"].includes(k)).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if ([OFFLINE, "/offline-library.js", "/icons/icon-192.png"].includes(url.pathname)) {
    event.respondWith(caches.match(url.pathname).then((r) => r || fetch(event.request)));
  } else if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => caches.match(OFFLINE)));
  }
});
self.addEventListener("message", (event) => {
  event.waitUntil((async () => {
    const reply = (value) => event.ports[0]?.postMessage(value);
    try {
      if (event.data?.type === "CLEAR_LESSONS") { await caches.delete(LESSONS); reply({ok:true}); return; }
      if (event.data?.type !== "SAVE_LESSON") return;
      const {lesson, language} = event.data;
      if (!lesson || typeof lesson.id !== "string" || lesson.id.length > 180 || !/^[a-z]{2,3}$/.test(language)) throw new Error("invalid");
      // Explicit allowlist: never retain exercise answers or unknown fields.
      const content = { id: lesson.id, title: lesson.title, goal: lesson.goal, explanation: lesson.explanation, vocabulary: lesson.vocabulary, pronunciation: lesson.pronunciation, examples: lesson.examples, grammar: lesson.grammar, review: lesson.review };
      const body = JSON.stringify({lesson:content, attribution:event.data.attribution ?? null, language, savedAt:new Date().toISOString()});
      if (body.length > 300000) throw new Error("large");
      const cache = await caches.open(LESSONS);
      const key = `/__offline_lesson__/${encodeURIComponent(lesson.id)}`;
      // Replacing a lesson moves it to the end for bounded storage.
      await cache.delete(key);
      await cache.put(key, new Response(body, {headers:{"Content-Type":"application/json"}}));
      const keys = await cache.keys();
      await Promise.all(keys.slice(0, Math.max(0, keys.length-20)).map((k) => cache.delete(k)));
      reply({ok:true});
    } catch { reply({ok:false}); }
  })());
});
