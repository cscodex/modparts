/**
 * Utility functions for managing cache
 */

// Function to clear browser cache
export const clearCache = () => {
  console.log('=== CLEARING BROWSER CACHE ===');

  // Clear localStorage
  try {
    localStorage.clear();
    console.log('localStorage cleared');
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }

  // Clear sessionStorage
  try {
    sessionStorage.clear();
    console.log('sessionStorage cleared');
  } catch (error) {
    console.error('Error clearing sessionStorage:', error);
  }

  // Reload the page with cache-busting parameter
  const timestamp = new Date().getTime();
  window.location.href = `${window.location.pathname}?cache_bust=${timestamp}`;
};

// Function to force reload all assets
export const forceReload = () => {
  console.log('=== FORCE RELOADING ALL ASSETS ===');

  // Clear browser cache through the Cache API if available
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName);
        console.log(`Cache ${cacheName} deleted`);
      });
    });
  }

  // Clear localStorage and sessionStorage
  try {
    localStorage.clear();
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }

  // Reload the page with a unique cache-busting parameter
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000000);
  window.location.href = `${window.location.pathname}?force_reload=${timestamp}_${random}`;
};

// Function to check if the page needs to be reloaded
export const checkCacheReload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const cacheBust = urlParams.get('cache_bust');
  const forceReload = urlParams.get('force_reload');

  if (cacheBust || forceReload) {
    // Remove the cache parameters from the URL
    urlParams.delete('cache_bust');
    urlParams.delete('force_reload');
    const newUrl = window.location.pathname + (urlParams.toString() ? `?${urlParams.toString()}` : '');
    window.history.replaceState({}, document.title, newUrl);

    if (forceReload) {
      console.log('=== PAGE FORCE RELOADED ===');
    } else {
      console.log('=== PAGE RELOADED WITH CACHE BUST ===');
    }
    return true;
  }

  return false;
};
