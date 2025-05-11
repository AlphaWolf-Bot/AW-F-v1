import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (initData: string) => api.post('/auth/login', { initData }),
  me: () => api.get('/auth/me'),
};

export const coinsAPI = {
  getBalance: () => api.get('/coins/balance'),
  tap: () => api.post('/coins/tap'),
  completeTask: (taskId: string) => api.post(`/coins/task/${taskId}/complete`),
  getTransactions: (page = 1, limit = 10) => 
    api.get('/coins/transactions', { params: { page, limit } }),
};

export const withdrawalsAPI = {
  getHistory: (page = 1, limit = 10) => 
    api.get('/withdrawals', { params: { page, limit } }),
  create: (amount: number, upiId: string) => 
    api.post('/withdrawals', { amount, upiId }),
};

export default api; 