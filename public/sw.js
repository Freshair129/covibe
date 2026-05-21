const CACHE_NAME = "covibe-shell-v1.1";
const SHELL = ["/", "/manifest.webmanifest", "/icon.svg"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
      )
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);
  // สำหรับหน้าหลัก (HTML) ให้ใช้กลยุทธ์ Network-First เพื่ออัปเดตชื่อไฟล์ JS/CSS ล่าสุดเสมอ
  if (url.origin === self.location.origin && (url.pathname === "/" || url.pathname === "/index.html")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // สำหรับทรัพยากรอื่นๆ (เช่น ไอคอน, Manifest) ให้ใช้ Cache-First ตามปกติ
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request);
    })
  );
});
