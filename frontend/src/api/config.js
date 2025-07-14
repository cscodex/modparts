import axios from 'axios';

// Use relative path for API calls
// The API URL should match your server setup
// For local development, use localhost:3000/api
// For Vercel deployment, use relative path /api
const isDevelopment = process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost'
export const API_URL = isDevelopment ? "http://localhost:3000/api" : "/api";
// Temporarily disable cache-busting to debug issues
export const API_VERSION = null; // Disabled for debugging

// Log API URL for debugging
console.log('=== API CONFIGURATION ===');
console.log('API URL:', API_URL);
console.log('API Version:', API_VERSION);
console.log('=== API CONFIGURATION END ===');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Enable cookies for session handling
  // Temporarily disable cache-busting params for debugging
  // params: {
  //   v: API_VERSION // Add cache-busting version parameter to all requests
  // }
});

// Add a request interceptor to include the token in all requests and log requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request details
    console.log(`=== API REQUEST: ${config.method.toUpperCase()} ${config.url} ===`);
    console.log('Request headers:', config.headers);

    if (config.data) {
      console.log('Request payload:', config.data);
    }

    if (config.params) {
      console.log('Request params:', config.params);
    }

    return config;
  },
  (error) => {
    console.error('=== API REQUEST ERROR ===');
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors and log responses
api.interceptors.response.use(
  (response) => {
    // Log response details
    console.log(`=== API RESPONSE: ${response.status} ${response.statusText} ===`);
    console.log('Response URL:', response.config.url);
    console.log('Response headers:', response.headers);
    console.log('Response data:', response.data);
    console.log('=== API RESPONSE END ===');

    return response;
  },
  (error) => {
    // Log error details
    console.error('=== API RESPONSE ERROR ===');
    console.error('Error:', error);

    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
      console.error('Response data:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);

      // Log the error for debugging
      console.error('No response received for request to:', error.config.url);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Request setup error:', error.message);
    }
    console.error('Request config:', error.config);
    console.error('=== API RESPONSE ERROR END ===');

    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      console.log('Unauthorized access detected, redirecting to login');
      // Clear local storage and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
