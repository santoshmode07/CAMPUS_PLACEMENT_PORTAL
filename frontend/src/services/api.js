import axios from 'axios';

// Create an instance of axios with standard configurations
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Points to our Node.js backend port
  withCredentials: true, // IMPORTANT: Allows browser to automatically send and receive cookies for cross-origin requests
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
