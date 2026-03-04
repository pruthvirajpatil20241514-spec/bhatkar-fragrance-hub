/**
 * API UTILITIES - Centralized API handling with caching + request deduplication
 * ============================================================================
 * 
 * Prevents:
 * - Duplicate polling of same endpoint
 * - Race conditions with concurrent requests
 * - Unnecessary API calls
 * 
 * Features:
 * - Request deduplication (same URL within 5 seconds = cached)
 * - Automatic error logging
 * - Consistent response format
 * - Built-in debug logging
 */

import api from './axios';

/**
 * In-memory cache for API responses
 * Key: endpoint URL
 * Value: { timestamp, data, promise }
 */
interface CacheEntry {
  timestamp: number;
  data: any;
  promise?: Promise<any>;
}

const apiCache = new Map<string, CacheEntry>();
const CACHE_DURATION_MS = 5000; // 5 second cache for same request

// Track pending requests to prevent duplicates
const pendingRequests = new Map<string, Promise<any>>();

/**
 * Check if request is already pending
 * If yes, return same promise (prevents duplicate request)
 * If no, create new request and store promise
 */
function getDedupedPromise<T>(
  url: string,
  makeRequest: () => Promise<T>,
  cacheKey: string = url
): Promise<T> {
  // Check if request is already pending
  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    console.debug(`♻️ API Dedupation: Returning pending request for ${url}`);
    return pending;
  }

  // Create new request
  const promise = makeRequest().finally(() => {
    // Remove from pending once completed (success or error)
    pendingRequests.delete(cacheKey);
  });

  // Store promise in pending map
  pendingRequests.set(cacheKey, promise);

  return promise;
}

/**
 * Centralized GET request with automatic caching
 * 
 * Features:
 * - Automatic deduplication (prevents duplicate calls)
 * - Cache hits within 5 seconds
 * - Error handling with logging
 * - Debug logs for tracing
 * 
 * @param url - API endpoint (e.g., '/products/1')
 * @param options - Optional { skipCache: true, cacheDuration: ms }
 */
export async function apiGet<T = any>(
  url: string,
  options?: {
    skipCache?: boolean;
    cacheDuration?: number;
  }
): Promise<T> {
  const cacheKey = `GET:${url}`;
  const cacheDuration = options?.cacheDuration ?? CACHE_DURATION_MS;
  const skipCache = options?.skipCache ?? false;

  // Check cache first (unless skipped)
  if (!skipCache && apiCache.has(cacheKey)) {
    const entry = apiCache.get(cacheKey)!;
    const age = Date.now() - entry.timestamp;

    if (age < cacheDuration) {
      console.log(`💾 API Cache Hit: ${url} (age: ${age}ms)`);
      return entry.data;
    }

    // Cache expired, remove it
    apiCache.delete(cacheKey);
  }

  // Get or create pending promise
  const promise = getDedupedPromise(cacheKey, async () => {
    try {
      console.log(`📡 GET ${url}`);
      const response = await api.get(url);

      const data = response.data?.data || response.data;

      // Store in cache
      apiCache.set(cacheKey, {
        timestamp: Date.now(),
        data,
      });

      console.log(`✅ GET ${url} → ${response.status}`);
      return data as T;
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;
      console.error(`❌ GET ${url} → ${status || 'Error'}: ${message}`);
      throw error;
    }
  });

  return promise as Promise<T>;
}

/**
 * Centralized POST request with automatic error handling
 */
export async function apiPost<T = any>(
  url: string,
  data: any,
  options?: {
    skipErrorToast?: boolean;
    debug?: boolean;
  }
): Promise<T> {
  try {
    if (options?.debug) {
      console.log(`📡 POST ${url}`, { data });
    } else {
      console.log(`📡 POST ${url}`);
    }

    const response = await api.post(url, data);
    const responseData = response.data?.data || response.data;

    console.log(`✅ POST ${url} → ${response.status}`);
    return responseData as T;
  } catch (error: any) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    console.error(`❌ POST ${url} → ${status || 'Error'}: ${message}`);
    throw error;
  }
}

/**
 * Clear API cache
 * Use when data needs to be refreshed immediately
 */
export function clearApiCache(urlPattern?: string): void {
  if (!urlPattern) {
    // Clear all cache
    apiCache.clear();
    console.log('🧹 API Cache cleared (all)');
  } else {
    // Clear matching patterns
    let count = 0;
    apiCache.forEach((_, key) => {
      if (key.includes(urlPattern)) {
        apiCache.delete(key);
        count++;
      }
    });
    console.log(`🧹 API Cache cleared (${count} entries matching '${urlPattern}')`);
  }
}

/**
 * Get cache stats for debugging
 */
export function getApiCacheStats(): {
  totalEntries: number;
  entries: Array<{ key: string; age: number }>;
} {
  const entries = Array.from(apiCache.entries()).map(([key, entry]) => ({
    key,
    age: Date.now() - entry.timestamp,
  }));

  return {
    totalEntries: apiCache.size,
    entries: entries.sort((a, b) => b.age - a.age),
  };
}

/**
 * Log cache stats to console
 */
export function debugApiCache(): void {
  const stats = getApiCacheStats();
  console.group('📊 API Cache Status');
  console.log(`Total entries: ${stats.totalEntries}`);
  console.table(
    stats.entries.map(e => ({
      endpoint: e.key.substring(0, 50),
      age: `${e.age}ms`,
    }))
  );
  console.groupEnd();
}

/**
 * Higher-level product API helpers
 * These use apiGet/apiPost under the hood
 */

export const productApi = {
  /**
   * Get all products
   */
  getAll: (skipCache?: boolean) =>
    apiGet('/products/with-images/all', { skipCache }),

  /**
   * Get single product with images
   */
  getById: (id: string) =>
    apiGet(`/products/${id}/with-images`),

  /**
   * Get product variants
   */
  getVariants: (productId: string) =>
    apiGet(`/variants/product/${productId}`),

  /**
   * Get variant images
   */
  getVariantImages: (variantId: string) =>
    apiGet(`/variant-images/${variantId}`),

  /**
   * Get product reviews
   */
  getReviews: (productId: string) =>
    apiGet(`/reviews/product/${productId}`),
};

export const paymentApi = {
  /**
   * Check payment route health
   */
  health: () =>
    apiGet('/payment/health', { skipCache: true }),

  /**
   * Create payment order
   */
  createOrder: (productId: string, quantity: number) =>
    apiPost('/payment/create-order', { productId, quantity }),

  /**
   * Verify payment
   */
  verify: (orderId: string, razorpay_payment_id: string, razorpay_signature: string) =>
    apiPost('/payment/verify', {
      orderId,
      razorpay_payment_id,
      razorpay_signature,
    }),

  /**
   * Get order status
   */
  getOrder: (orderId: string) =>
    apiGet(`/payment/order/${orderId}`, { skipCache: true }),
};

/**
 * Debug helper: Monitor all API requests
 * Call once in your App.tsx main component
 */
export function enableApiDebugLogging(): void {
  console.log('🔍 API Debug Logging enabled');
  console.log('Use debugApiCache() to see cache stats');
  console.log('Use clearApiCache() to clear cache');
  console.log('Check console for all API requests');
}

export default {
  apiGet,
  apiPost,
  clearApiCache,
  getApiCacheStats,
  debugApiCache,
  productApi,
  paymentApi,
  enableApiDebugLogging,
};
