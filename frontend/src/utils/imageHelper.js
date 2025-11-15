import { API_BASE_URL } from "../constants/config";

// Helper function to get proper image URL
export const getImageUrl = (imagePath) => {
  if (!imagePath) return "assets/img/placeholder.jpg";
  
  // If image path starts with /, it's an uploaded image (full path from backend)
  if (imagePath.startsWith("/")) {
    return `${API_BASE_URL}${imagePath}`;
  }
  
  // If image path starts with http, it's already a full URL
  if (imagePath.startsWith("http")) {
    return imagePath;
  }
  
  // Otherwise, treat it as a static asset path
  return `assets/img/${imagePath}`;
};

// Get API base URL (supports environment variable)
export const getApiBaseUrl = () => {
  return API_BASE_URL;
};

// Helper to construct backend image URL
export const getBackendImageUrl = (filename) => {
  if (!filename) return null;
  if (filename.startsWith("/")) {
    return `${API_BASE_URL}${filename}`;
  }
  return `${API_BASE_URL}/uploads/${filename}`;
};
