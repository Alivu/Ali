// sw.js - Service Worker
const CACHE_NAME = 'electro-calc-v1.3';
const urlsToCache = [
    '/',
    '/index.html',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://raw.githubusercontent.com/Alivu/alivu.github.io/main/Icon/icon-32x32.png',
    'https://raw.githubusercontent.com/Alivu/alivu.github.io/main/Icon/icon-48x48.png',
    'https://raw.githubusercontent.com/Alivu/alivu.github.io/main/Icon/icon-180x180.png'
];

// Устанавливаем Service Worker и кэшируем файлы
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Открыт кэш');
                return cache.addAll(urlsToCache);
            })
    );
});

// Обслуживаем запросы из кэша
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Возвращаем из кэша, если нашли
                if (response) {
                    return response;
                }
                
                // Иначе загружаем из сети
                return fetch(event.request)
                    .then(function(response) {
                        // Проверяем валидный ли ответ
                        if(!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        // Клонируем ответ
                        var responseToCache = response.clone();
                        
                        // Добавляем в кэш для будущих запросов
                        caches.open(CACHE_NAME)
                            .then(function(cache) {
                                cache.put(event.request, responseToCache);
                            });
                        
                        return response;
                    })
                    .catch(function() {
                        // Если сеть не доступна и нет в кэше
                        // Можно вернуть оффлайн страницу
                        return caches.match('/')
                            .then(function(cachedResponse) {
                                return cachedResponse;
                            });
                    });
            })
    );
});

// Очищаем старые кэши при активации
self.addEventListener('activate', function(event) {
    var cacheWhitelist = [CACHE_NAME];
    
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
