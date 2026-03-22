import axios from 'axios';

// The backend swagger is at http://127.0.0.1:8000/docs#/
const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
