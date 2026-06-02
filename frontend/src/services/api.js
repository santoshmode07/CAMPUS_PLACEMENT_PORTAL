import axios from 'axios';

// Create an instance of axios with standard configurations
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Points to our Node.js backend port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: runs automatically before every HTTP request goes out
api.interceptors.request.use(
  (config) => {
    console.log(config);
    // Retrieve the token from localStorage
    const token = localStorage.getItem('token');
    
    // If the token exists, attach it to the Authorization header using Bearer scheme
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Handle request configuration errors
    return Promise.reject(error);
  }
);

export default api;
