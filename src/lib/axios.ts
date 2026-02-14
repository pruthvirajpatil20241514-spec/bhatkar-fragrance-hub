import axios from "axios";

// Use environment variable or fallback to deployed backend
const baseURL = import.meta.env.VITE_API_BASE_URL || "https://bhatkar-fragrance-hub-1.onrender.com/api";

const api = axios.create({
  baseURL,
  // Don't set default Content-Type header - let axios auto-detect based on request body
  // This allows FormData to work properly with multipart/form-data
  headers: {
    // Content-Type will be set automatically by axios based on request data type
  },
});

// Add request interceptor to include Bearer token and handle FormData
api.interceptors.request.use(
  (config) => {
    // Don't add token to public endpoints (signin, signup)
    const publicEndpoints = ["/auth/signin", "/auth/signup"];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    // Always add authorization token for protected routes
    if (!isPublicEndpoint) {
      // Check for admin token first, then user token
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // If data is FormData, let axios handle the Content-Type header automatically
    // This ensures the boundary is properly set for multipart/form-data
    if (config.data instanceof FormData) {
      // Delete Content-Type header so axios sets it with proper boundary
      if (config.headers["Content-Type"] === "multipart/form-data") {
        delete config.headers["Content-Type"];
      }
    } else if (!config.headers["Content-Type"]) {
      // Set default Content-Type for JSON requests only
      config.headers["Content-Type"] = "application/json";
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
