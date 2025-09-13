const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://visitor-management-frontend-eight.vercel.app/api';
const APP_TITLE = import.meta.env.VITE_APP_TITLE || 'Visitor Management System';

export { API_BASE_URL, APP_TITLE };

// You can also add other configuration here
export const APP_CONFIG = {
  API_BASE_URL,
  // Add other config options
  CAMERA_QUALITY: 0.8,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
};