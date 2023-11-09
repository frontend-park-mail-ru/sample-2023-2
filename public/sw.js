const CACHE_NAME = 'lesson-6';
const CACHE_URLS = [
    '/',
    'index.html',
    'index.js',
    'utils/safe.js',
    'index.css',
    'components/Menu/Menu.precompiled.js',
    'components/Menu/Menu.js',
    'components/Menu/Menu.css',
    'modules/ajax.js',
];

/**
 * записать статитечские файлы в кэш
 */
this.addEventListener('install', (event) => {
    event.waitUntil(
        // по ключу или открываем, или создаем хранилище
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(CACHE_URLS);
            })
    );
});

/**
 * если нет интернета, достать файлы из кэша
 */
this.addEventListener('fetch', (event) => {
    /**
     * есть 2 подхода
     * online first - сначала свежие данные
     * offline first - сначала из кэша
     */

    event.respondWith(
        // ищем ресурс в кэше
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request);
            })
    );
});