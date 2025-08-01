import axios from 'axios';

// ✅ CONFIGURACIÓN AUTOMÁTICA SEGÚN ENTORNO
const getApiBaseUrl = () => {
  // 1. Primero: Variable de entorno (la más importante)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // 2. Segundo: Detección automática según hostname
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:10000/api'; // Local development
  }
  
  // 3. Fallback: Para casos no previstos
  return 'http://localhost:10000/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ INTERCEPTOR PARA TOKEN
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log solo en desarrollo
    if (import.meta.env.DEV) {
      console.log(`🔄 ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

// ✅ INTERCEPTOR PARA RESPUESTAS
api.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      url: error.config?.url
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    
    // Si es error de conexión, mostrar mensaje útil
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.error('🚨 No se puede conectar con la API. Verifica que esté corriendo en localhost:10000');
    }
    
    return Promise.reject(error);
  }
);

// ✅ FUNCIÓN PARA TESTEAR CONECTIVIDAD
export const testApiConnection = async () => {
  try {
    console.log('🔍 Testing API connection...');
    const response = await api.get('/health');
    console.log('✅ API Connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ API Connection failed:', error.message);
    return false;
  }
};

export default api;