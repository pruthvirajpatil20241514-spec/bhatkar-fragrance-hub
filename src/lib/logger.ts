/**
 * Frontend Logger Utility
 * Simple console-based logging for React components and hooks
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  /**
   * Log info level messages
   */
  info: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`ℹ️ [INFO] ${message}`, data || '');
    }
  },

  /**
   * Log warning level messages
   */
  warn: (message: string, data?: any) => {
    if (isDevelopment) {
      console.warn(`⚠️ [WARN] ${message}`, data || '');
    }
  },

  /**
   * Log error level messages
   */
  error: (message: string, data?: any) => {
    console.error(`❌ [ERROR] ${message}`, data || '');
  },

  /**
   * Log debug level messages
   */
  debug: (message: string, data?: any) => {
    if (isDevelopment) {
      console.debug(`🐛 [DEBUG] ${message}`, data || '');
    }
  },

  /**
   * Log success messages
   */
  success: (message: string, data?: any) => {
    if (isDevelopment) {
      console.log(`✅ [SUCCESS] ${message}`, data || '');
    }
  },

  /**
   * Log performance metrics
   */
  perf: (message: string, duration: number) => {
    if (isDevelopment) {
      console.log(`⏱️ [PERF] ${message} - ${duration}ms`);
    }
  }
};

export default logger;
