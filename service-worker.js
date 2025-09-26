const CACHE_NAME = 'garvis-os-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/types.ts',
  '/services/geminiService.ts',
  '/services/storageService.ts',
  '/components/AuthScreen.tsx',
  '/components/CommandBar.tsx',
  '/components/Dashboard.tsx',
  '/components/DesktopIcon.tsx',
  '/components/EnterpriseWorkspace.tsx',
  '/components/FileExplorer.tsx',
  '/components/FormProcessor.tsx',
  '/components/LoadingIndicator.tsx',
  '/components/SkeletonLoader.tsx',
  '/components/StartMenu.tsx',
  '/components/SystemAnatomy.tsx',
  '/components/Taskbar.tsx',
  '/components/TopicInput.tsx',
  '/components/UserAccounts.tsx',
  '/components/Window.tsx',
  '/components/icons.tsx',
  '/components/NexusBrowser.tsx',
  '/components/BitcoinMiner.tsx',
  '/components/Codex.tsx',
  '/components/FinanceWorkspace.tsx',
  '/components/InvoiceEditor.tsx',
  '/components/NexusForge.tsx',
  '/components/formTypes.ts',
  '/components/AegisCommand.tsx',
  'https://cdn.tailwindcss.com'
];

// On install, cache the core application shell.
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[GARVIS PWA] Opened cache and caching core assets.');
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Intercept network requests and serve from cache if available.
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          response => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Clean up old caches to ensure the latest version is served.
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[GARVIS PWA] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});