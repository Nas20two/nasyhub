

# Add Service Worker for Offline PWA Support

## Overview
Add a lightweight service worker to cache app assets, enabling offline access and faster repeat loads. The service worker file itself is only ~1-2 KB.

## Changes

### 1. Create Service Worker (public/sw.js)
- Cache static assets (HTML, CSS, JS, images, fonts) on install
- Use a "cache-first, network-fallback" strategy for static assets
- Use "network-first" for API calls (so live data is preferred when online)
- Include a versioned cache name so updates can clear old caches
- Provide a basic offline fallback page

### 2. Register Service Worker (src/main.tsx)
- Add service worker registration after the app renders
- Only register in production or when available (`navigator.serviceWorker`)
- Log registration success/failure to console for debugging

### 3. Create Offline Fallback (public/offline.html)
- A simple, styled page shown when the user is offline and the requested page isn't cached
- Matches the site's warm color scheme

## Technical Details
- Cache strategy: "stale-while-revalidate" for assets, "network-first" for API/data requests
- Cache versioning via a `CACHE_VERSION` constant -- bump it to invalidate old caches
- The `activate` event cleans up outdated caches automatically
- No external libraries needed -- pure browser APIs
- Total added size: ~3 KB across all three changes

