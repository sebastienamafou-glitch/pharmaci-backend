// public/sw.js
const CACHE_NAME = 'pharmaci-v1-pro';
const ASSETS_TO_CACHE = [
    '/js/dashboard.js',
    // On ne met pas index.hbs ou livreur.hbs ici car ce sont des pages dynamiques,
    // on les mettra en cache "à la volée" quand l'utilisateur les visite.
];

// 1. INSTALLATION : On met en cache les fichiers statiques essentiels
self.addEventListener('install', (event) => {
    console.log('[Service Worker] Installation...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] Mise en cache des assets statiques');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. ACTIVATION : Nettoyage des vieux caches si on change de version
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] Activation...');
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== CACHE_NAME) {
                    console.log('[Service Worker] Suppression vieux cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
});

// 3. FETCH : Stratégie "Network First, falling back to Cache"
// C'est la meilleure stratégie pour des données dynamiques comme des commandes.
self.addEventListener('fetch', (event) => {
    // On ignore les requêtes non-GET (POST, PUT...) car on ne peut pas les cacher facilement
    if (event.request.method !== 'GET') return;

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Si la réponse est valide, on la clone et on la met en cache pour la prochaine fois
                // Cela permet de sauvegarder la page "livreur-dashboard" avec les dernières commandes vues
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    return response;
                }

                const responseToCache = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseToCache);
                });

                return response;
            })
            .catch(() => {
                // SI HORS-LIGNE : On essaie de servir la version en cache
                console.log('[Service Worker] Pas de réseau. Recherche dans le cache...');
                return caches.match(event.request).then((response) => {
                    if (response) {
                        return response;
                    }
                    // Si rien dans le cache, on pourrait renvoyer une page "offline.html" générique
                    // Pour l'instant, on laisse le navigateur gérer l'erreur standard si pas de cache
                });
            })
    );
});
