const CACHE_NAME = 'tomato-manga-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './IMG_20260201_100503_640.jpg'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Activation
self.addEventListener('activate', (event) => {
  console.log('Guardian Service Worker Active! 🛡️');
});

// Fetch Event (Install ခလုတ်ပေါ်ဖို့ ဒါက အရေးကြီးဆုံးပဲ!)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
