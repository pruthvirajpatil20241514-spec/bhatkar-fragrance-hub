import axios from "axios";
import { toast } from "sonner";

const baseURL = import.meta.env.VITE_API_BASE_URL || "https://bhatkar-fragrance-hub-1.onrender.com/api";

console.log(`API Base URL: ${baseURL}`);

const api = axios.create({
  baseURL,
  timeout: 15000, // 15 second timeout (was 30s - backend cold start finishes in 15s)
  withCredentials: false,
});

// ===== REQUEST INTERCEPTOR =====
// Add auth token and handle FormData
api.interceptors.request.use(
  (config) => {
    // Log request details for debugging
    const fullUrl = `${config.baseURL || ''}${config.url}`;
    const method = config.method?.toUpperCase() || 'GET';
    const timestamp = new Date().toISOString();

    console.log(`📡 [${timestamp}] ${method} ${fullUrl}`);

    // ===== AUTHENTICATION HANDLING =====
    // Public GET endpoints (read-only operations - POST/PUT/DELETE need auth)
    const publicGetEndpoints = [
      "/auth/signin",
      "/auth/signup",
      "/products",
      "/variants",
      "/reviews",
    ];

    const requestMethod = config.method?.toLowerCase() || 'get';
    const url = config.url || '';

    // Only treat as public if it's a GET request to a public endpoint
    const isPublicGetEndpoint = publicGetEndpoints.some(endpoint =>
      url.includes(endpoint) && requestMethod === 'get'
    );

    // Add token for ALL protected requests (POST, PUT, DELETE)
    if (!isPublicGetEndpoint) {
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(`  🔐 Auth: Token attached`);
      } else {
        console.warn(`  ⚠️ Auth: No token found for protected endpoint`);
      }
    } else {
      console.log(`  🌍 Auth: Public endpoint (no token needed)`);
    }

    // ===== CONTENT-TYPE HANDLING =====
    // Handle FormData (for file uploads)
    if (config.data instanceof FormData) {
      // Let axios set Content-Type with proper boundary
      delete config.headers["Content-Type"];
      console.log(`  📦 Content-Type: multipart/form-data (auto)`);
    } else if (config.data) {
      // Set Content-Type for JSON requests
      config.headers["Content-Type"] = "application/json";
      console.log(`  📄 Content-Type: application/json`);
    }

    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error.message);
    return Promise.reject(error);
  }
);

// ===== RESPONSE INTERCEPTOR =====
// Handle success and error responses with detailed logging
api.interceptors.response.use(
  (response) => {
    const { status, config } = response;
    const method = config.method?.toUpperCase() || 'GET';
    const url = config.url;

    // Success logging
    if (status >= 200 && status < 300) {
      console.log(`✅ Success [${status}] ${method} ${url}`);
    } else {
      console.warn(`⚠️ Status [${status}] ${method} ${url}`);
    }

    return response;
  },
  (error) => {
    // ===== ERROR RESPONSE =====
    if (error.response) {
      const { status, data, config } = error.response;
      const method = config?.method?.toUpperCase() || 'UNKNOWN';
      const url = config?.url || 'unknown';

      // Log detailed error information
      console.error(`❌ HTTP Error [${status}] ${method} ${url}`);

      // ===== GLOBAL AUTH HANDLING (401/403) =====
      if (status === 401 || status === 403) {
        console.error(`   ℹ️ Session expired or unauthorized. Redirecting to login...`);

        // Clear tokens from storage
        localStorage.removeItem("token");
        localStorage.removeItem("adminToken");
        localStorage.removeItem("role");
        localStorage.removeItem("user");
        localStorage.removeItem("admin");
        localStorage.removeItem("userEmail");
        localStorage.removeItem("userPhone");

        // Inform user
        toast.error("Session expired, please login again");

        // Force redirect to home page, since there is no standalone /login page
        if (window.location.pathname !== '/') {
          setTimeout(() => {
            window.location.href = '/';
          }, 1500);
          return new Promise(() => { }); // Stop the promise chain
        } else {
          // If already on home, just reload to clear UI state safely
          setTimeout(() => {
            window.location.reload();
          }, 1500);
          return new Promise(() => { });
        }
      }

      // Log error message from backend if available
      if (data?.error) {
        console.error(`   Backend Error: ${data.error}`);
      } else if (data?.message) {
        console.error(`   Message: ${data.message}`);
      }
    }
    // ===== NO RESPONSE (Network Error) =====
    else if (error.request) {
      console.error('❌ Network Error: No response from server');
    }

    return Promise.reject(error);
  }
);

export default api;
