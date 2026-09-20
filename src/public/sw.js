const CACHE_NAME = "cerita-kita-v2";
const APP_SHELL = [
  "./",
  "./index.html",
  "./app.bundle.js",
  "./app.css",
  "./favicon.png",
  "./images/logo.png",
  "./manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((response) => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            return response;
          })
          .catch(() => caches.match("./index.html")),
    ),
  );
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {
    data = { message: event.data ? event.data.text() : "Ada cerita baru." };
  }

  const notificationData = data.data || {};
  const title = data.title || "Cerita Kita";
  const options = {
    body:
      data.options?.body ||
      data.message ||
      data.body ||
      "Ada cerita baru dari komunitas.",
    icon: data.icon || "./favicon.png",
    badge: data.badge || "./favicon.png",
    data: {
      url:
        data.url ||
        (notificationData.id ? `#/story/${notificationData.id}` : "#/home"),
    },
    tag: data.tag || "cerita-kita-story",
    renotify: true,
    actions: data.storyId
      ? [{ action: "open-story", title: "Lihat cerita" }]
      : [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = event.notification.data?.url || "#/home";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        const existing = clients.find((client) => "focus" in client);
        if (existing) {
          existing.navigate(new URL(target, self.location.origin).href);
          return existing.focus();
        }
        return self.clients.openWindow(
          new URL(target, self.location.origin).href,
        );
      }),
  );
});
