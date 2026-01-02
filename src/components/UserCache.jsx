
import { User } from '@/entities/all';

// Constants for localStorage caching
const CACHE_KEY = 'user_cache';
const CACHE_TIMESTAMP_KEY = 'user_cache_timestamp';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

let cachedUser = null;
let userPromise = null;

const UserCache = {
  /**
   * Internal helper to set user data in localStorage.
   * @param {object} userData - The user data to cache.
   */
  _setLocalStorageUser: async (userData) => { // Kept async as per outline, though no await currently.
    if (typeof window === 'undefined') return;

    try {
      const cacheData = {
        user: userData,
        timestamp: Date.now(),
        language: userData?.preferred_language || 'en' // Store language separately for quick access
      };

      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Error caching user data to localStorage:', error);
    }
  },

  /**
   * Internal helper to get user data from localStorage.
   * @returns {object|null} The cached user object from localStorage, or null if not found/expired.
   */
  _getLocalStorageUser: () => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(CACHE_KEY);
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);

      if (!cached || !timestamp) return null;

      const age = Date.now() - parseInt(timestamp);

      // For language changes, use a shorter cache or no cache
      // Check if we just updated language (within last 2 seconds)
      const justUpdated = age < 2000;

      if (age > CACHE_DURATION && !justUpdated) {
        UserCache._clearLocalStorageUser(); // Clear expired cache
        return null;
      }

      const cacheData = JSON.parse(cached);
      return cacheData.user;
    } catch (error) {
      console.error('Error reading user cache from localStorage:', error);
      UserCache._clearLocalStorageUser(); // Clear potentially corrupt cache
      return null;
    }
  },

  /**
   * Internal helper to clear user data from localStorage.
   */
  _clearLocalStorageUser: () => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem(CACHE_KEY);
      localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.error('Error clearing user cache from localStorage:', error);
    }
  },

  /**
   * Gets the current user. Prioritizes in-memory, then localStorage, then fetches from the server.
   * @param {boolean} forceRefresh - If true, fetches user data from the server again, bypassing caches.
   * @returns {Promise<object|null>} The user object.
   */
  async getUser(forceRefresh = false) {
    // 1. Try in-memory cache first
    if (!forceRefresh && cachedUser) {
      return cachedUser;
    }

    // 2. If an API fetch is already in progress, return its promise to avoid duplicate fetches
    if (!forceRefresh && userPromise) {
      return userPromise;
    }

    // 3. Try localStorage if not forced to refresh
    if (!forceRefresh) {
      const localStorageUser = this._getLocalStorageUser();
      if (localStorageUser) {
        cachedUser = localStorageUser; // Populate in-memory cache from localStorage
        return localStorageUser;
      }
    }

    // 4. If no cache hit or forced refresh, fetch from API
    userPromise = User.me()
      .then(user => {
        cachedUser = user;
        this._setLocalStorageUser(user); // Also update localStorage
        userPromise = null;
        return user;
      })
      .catch(error => {
        console.error("Error fetching user for cache:", error);
        userPromise = null;
        // On API fetch error, clear local caches to avoid serving stale data from memory/localStorage
        cachedUser = null;
        this._clearLocalStorageUser();
        return null;
      });

    return userPromise;
  },

  /**
   * Updates the user data on the server and in all caches (in-memory and localStorage).
   * @param {object} data - The data to update.
   * @returns {Promise<object|null>} The updated user object.
   */
  async updateUser(data) {
    // Ensure we have a user loaded before attempting to update, to avoid merging with null/undefined.
    if (!cachedUser) {
      await this.getUser();
    }

    // Store original cached user for potential revert on error
    const originalCachedUser = { ...cachedUser };

    try {
      // Optimistically update local in-memory cache
      cachedUser = { ...(cachedUser || {}), ...data };
      // Optimistically update localStorage cache
      await this._setLocalStorageUser(cachedUser);

      const updatedUser = await User.updateMyUserData(data);

      // Final update with server response for both in-memory and localStorage
      cachedUser = { ...cachedUser, ...updatedUser };
      await this._setLocalStorageUser(cachedUser);

      return cachedUser;
    } catch (error) {
      console.error("Error updating user cache:", error);
      // Revert in-memory cache to original state on error
      cachedUser = originalCachedUser;
      // Force a fresh fetch from the server to ensure consistency and correct localStorage
      await this.getUser(true);
      throw error; // Re-throw the error so the caller knows the update failed
    }
  },

  /**
   * Clears all user caches (in-memory, ongoing promise, and localStorage).
   */
  clearCache() {
    cachedUser = null;
    userPromise = null;
    this._clearLocalStorageUser(); // Also clear localStorage
  },
};

export default UserCache;
