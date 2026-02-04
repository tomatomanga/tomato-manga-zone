const CACHE_NAME = 'tomato-manga-cache-v5';
const IMAGE_CACHE_LIMIT = 200; // သိမ်းထားမယ့် အများဆုံး ပုံအရေအတွက်

// ၁။ Install ဖြစ်ချိန်မှာ ဘာမှမလုပ်သေးဘဲ စောင့်မယ်
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

// ၂။ Activate ဖြစ်ရင် Cache အဟောင်းတွေကို ရှင်းမယ်
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            );
        })
    );
});

// ၃။ Fetch - Cloudinary ပုံတွေကို ဖမ်းပြီး Cache ထဲ ထည့်မယ်
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Cloudinary က ပုံတွေကိုပဲ Cache လုပ်မယ်
    if (url.hostname.includes('cloudinary.com')) {
        event.respondWith(smartImageCache(request));
    }
});

async function smartImageCache(request) {
    const cache = await caches.open(CACHE_NAME);
    
    // Cache ထဲမှာ ရှိပြီးသားလား အရင်စစ်မယ်
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
        return cachedResponse; // ရှိရင် Cloudinary ဆီ မသွားတော့ဘဲ ဒါကိုပဲ ပေးလိုက်မယ် (Credit သက်သာစေတယ်)
    }

    // Cache ထဲမှာ မရှိရင် Cloudinary ဆီကနေ သွားဆွဲမယ်
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            // ပုံအသစ်ကို Cache ထဲ သိမ်းမယ်
            cache.put(request, networkResponse.clone());
            
            // Storage မပြည့်အောင် ပုံအရေအတွက်ကို စစ်ပြီး ပိုတာတွေကို ရှင်းမယ်
            limitCacheSize(CACHE_NAME, IMAGE_CACHE_LIMIT);
        }
        return networkResponse;
    } catch (error) {
        return null; // Error တက်ရင် ဘာမှမပြဘူး (Retry logic က index.html မှာ ပါပြီးသားမို့လို့)
    }
}

// ၄။ Storage Management - အဟောင်းတွေကို အလိုအလျောက် ဖျက်ပေးတဲ့ စနစ်
async function limitCacheSize(name, maxItems) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    if (keys.length > maxItems) {
        // အဟောင်းဆုံး ပုံတွေကို စတင်ဖျက်ထုတ်မယ်
        await cache.delete(keys[0]);
        limitCacheSize(name, maxItems);
    }
}
