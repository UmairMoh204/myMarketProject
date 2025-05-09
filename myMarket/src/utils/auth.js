import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('Response error:', error.response?.data || error.message);
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.log('No refresh token found');
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('isAuthenticated');
          window.location.href = '/signin';
          return Promise.reject(error);
        }
        
        const response = await axios.post('http://localhost:8000/api/token/refresh/', {
          refresh: refreshToken
        });
        
        if (response.data && response.data.access) {
          console.log('Token refreshed successfully');
          localStorage.setItem('token', response.data.access);
          localStorage.setItem('isAuthenticated', 'true');
          
          originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
          
          return api(originalRequest);
        }
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/signin';
        return Promise.reject(refreshError);
      }
    }
    
    if (error.response) {
      console.error('Error response:', error.response.data);
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/signin';
      }
    }
    
    return Promise.reject(error);
  }
);

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const isAuth = localStorage.getItem('isAuthenticated');
  const isAuthenticated = !!(token && isAuth === 'true');
  console.log('Authentication status:', isAuthenticated);
  return isAuthenticated;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('isAuthenticated');
  window.location.href = '/signin';
};

export default api; 