// 文献库 Service Worker
// 版本号 - 更新此值以强制更新缓存
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `literature-library-${CACHE_VERSION}`;

// 需要缓存的静态资源
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/index.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// 需要缓存的外部资源（字体等）
const EXTERNAL_ASSETS = [
    'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Noto+Serif+SC:wght@400;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap'
];

// 安装事件 - 缓存静态资源
self.addEventListener('install', (event) => {
    console.log('[SW] 安装中...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] 缓存静态资源');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                // 跳过等待，立即激活
                return self.skipWaiting();
            })
    );
});

// 激活事件 - 清理旧缓存
self.addEventListener('activate', (event) => {
    console.log('[SW] 激活中...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name.startsWith('literature-library-') && name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] 删除旧缓存:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => {
                // 立即控制所有页面
                return self.clients.claim();
            })
    );
});

// 请求拦截 - 缓存策略
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // 跳过非 GET 请求
    if (request.method !== 'GET') {
        return;
    }

    // 跳过 API 请求（不缓存动态数据）
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // 跳过开发模式的热更新请求
    if (url.pathname.includes('/@vite') || url.pathname.includes('/__vite')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                // 如果有缓存，返回缓存的同时在后台更新
                if (cachedResponse) {
                    // Stale-While-Revalidate 策略
                    event.waitUntil(
                        fetch(request)
                            .then((networkResponse) => {
                                if (networkResponse && networkResponse.status === 200) {
                                    caches.open(CACHE_NAME)
                                        .then((cache) => {
                                            cache.put(request, networkResponse.clone());
                                        });
                                }
                            })
                            .catch(() => {
                                // 网络失败，静默处理
                            })
                    );
                    return cachedResponse;
                }

                // 没有缓存，从网络获取
                return fetch(request)
                    .then((networkResponse) => {
                        // 缓存成功的响应
                        if (networkResponse && networkResponse.status === 200) {
                            const responseToCache = networkResponse.clone();
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(request, responseToCache);
                                });
                        }
                        return networkResponse;
                    })
                    .catch(() => {
                        // 网络失败，尝试返回离线页面
                        if (request.destination === 'document') {
                            return caches.match('/');
                        }
                        return new Response('离线模式', { status: 503 });
                    });
            })
    );
});

// 后台同步（可选功能）
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-papers') {
        console.log('[SW] 后台同步文献数据...');
        // 可以在这里实现离线数据同步
    }
});

// 推送通知（可选功能）
self.addEventListener('push', (event) => {
    if (event.data) {
        const data = event.data.json();
        const options = {
            body: data.body || '您有新的消息',
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            vibrate: [100, 50, 100],
            data: {
                url: data.url || '/'
            }
        };
        event.waitUntil(
            self.registration.showNotification(data.title || '文献库', options)
        );
    }
});

// 点击通知
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        clients.openWindow(event.notification.data.url || '/')
    );
});
