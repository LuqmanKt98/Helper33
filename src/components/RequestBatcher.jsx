// Request batching utility to reduce API calls
class RequestBatcher {
  constructor() {
    this.queue = new Map();
    this.timeouts = new Map();
    this.batchDelay = 100; // 100ms batch window
  }

  batch(key, request) {
    return new Promise((resolve, reject) => {
      // Add to queue
      if (!this.queue.has(key)) {
        this.queue.set(key, []);
      }
      
      this.queue.get(key).push({ request, resolve, reject });

      // Clear existing timeout
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key));
      }

      // Set new timeout to execute batch
      const timeout = setTimeout(() => {
        this.executeBatch(key);
      }, this.batchDelay);

      this.timeouts.set(key, timeout);
    });
  }

  async executeBatch(key) {
    const batch = this.queue.get(key);
    if (!batch || batch.length === 0) return;

    // Get first request (they should all be similar)
    const { request } = batch[0];

    try {
      // Execute single request
      const result = await request();

      // Resolve all promises with same result
      batch.forEach(({ resolve }) => resolve(result));
    } catch (error) {
      // Reject all promises with error
      batch.forEach(({ reject }) => reject(error));
    } finally {
      // Clean up
      this.queue.delete(key);
      this.timeouts.delete(key);
    }
  }
}

export const requestBatcher = new RequestBatcher();

// Usage example:
export const batchedRequest = (key, requestFn) => {
  return requestBatcher.batch(key, requestFn);
};