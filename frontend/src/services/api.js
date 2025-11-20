import axios from "axios";
import { API_BASE_URL, ENDPOINTS } from "../constants/config";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Log requests for debugging route issues
apiClient.interceptors.request.use((config) => {
  try {
    // eslint-disable-next-line no-console
    console.debug("API Request:", config.method?.toUpperCase(), `${config.baseURL}${config.url}`);
  } catch (e) {}
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const productService = {
  getAll: () => apiClient.get(ENDPOINTS.PRODUCTS),
  getById: (id) => apiClient.get(`${ENDPOINTS.PRODUCTS}/${id}`),
  create: (payload) => {
    // If payload is FormData (for file upload), don't override Content-Type
    if (payload instanceof FormData) {
      return apiClient.post(ENDPOINTS.PRODUCTS, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    // Otherwise, send as JSON
    return apiClient.post(ENDPOINTS.PRODUCTS, payload);
  },
  update: (id, payload) => {
    // If payload is FormData (for file upload), don't override Content-Type
    if (payload instanceof FormData) {
      return apiClient.put(`${ENDPOINTS.PRODUCTS}/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    }
    // Otherwise, send as JSON
    return apiClient.put(`${ENDPOINTS.PRODUCTS}/${id}`, payload);
  },
  remove: (id) => apiClient.delete(`${ENDPOINTS.PRODUCTS}/${id}`),

  // Product Images CRUD
  images: {
    getAll: (productId) => apiClient.get(`${ENDPOINTS.PRODUCTS}/${productId}/images`),
    add: (productId, payload) => {
      if (payload instanceof FormData) {
        return apiClient.post(`${ENDPOINTS.PRODUCTS}/${productId}/images`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      return apiClient.post(`${ENDPOINTS.PRODUCTS}/${productId}/images`, payload);
    },
    update: (productId, imageId, payload) => 
      apiClient.put(`${ENDPOINTS.PRODUCTS}/${productId}/images/${imageId}`, payload),
    replace: (productId, imageId, payload) => {
      if (payload instanceof FormData) {
        return apiClient.put(`${ENDPOINTS.PRODUCTS}/${productId}/images/${imageId}/replace`, payload, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      return apiClient.put(`${ENDPOINTS.PRODUCTS}/${productId}/images/${imageId}/replace`, payload);
    },
    remove: (productId, imageId) => 
      apiClient.delete(`${ENDPOINTS.PRODUCTS}/${productId}/images/${imageId}`),
  },
};

export const categoryService = {
  getAll: () => apiClient.get(ENDPOINTS.CATEGORIES),
  getById: (id) => apiClient.get(`${ENDPOINTS.CATEGORIES}/${id}`),
  getBySlug: (slug) => apiClient.get(`${ENDPOINTS.CATEGORIES}/slug/${slug}`),
  create: (payload, token) => {
    // If payload is FormData (for file upload), set multipart headers
    if (payload instanceof FormData) {
      return apiClient.post(ENDPOINTS.CATEGORIES, payload, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}` 
        }
      });
    }
    // Otherwise, send as JSON
    return apiClient.post(ENDPOINTS.CATEGORIES, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  update: (id, payload, token) => {
    // If payload is FormData (for file upload), set multipart headers
    if (payload instanceof FormData) {
      return apiClient.put(`${ENDPOINTS.CATEGORIES}/${id}`, payload, {
        headers: { 
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}` 
        }
      });
    }
    // Otherwise, send as JSON
    return apiClient.put(`${ENDPOINTS.CATEGORIES}/${id}`, payload, {
      headers: { Authorization: `Bearer ${token}` }
    });
  },
  remove: (id, token) => apiClient.delete(`${ENDPOINTS.CATEGORIES}/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  }),
};

export const cartService = {
  get: () => apiClient.get(ENDPOINTS.CART),
  add: (product) => apiClient.post(ENDPOINTS.CART, product),
  remove: (productId) => apiClient.delete(`${ENDPOINTS.CART}/${productId}`),
};

export default apiClient;
