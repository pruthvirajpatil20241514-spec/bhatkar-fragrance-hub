import axios from "axios";

// Use environment variable or fallback to localhost
const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add request interceptor to include Bearer token
api.interceptors.request.use(
  (config) => {
    // Don't add token to public endpoints (signin, signup)
    const publicEndpoints = ["/auth/signin", "/auth/signup"];
    const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
    
    if (!isPublicEndpoint) {
      // Check for admin token first, then user token
      const token = localStorage.getItem("adminToken") || localStorage.getItem("token");
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
