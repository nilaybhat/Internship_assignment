/**
 * Application configuration.
 * The API URL is provided through the VITE_API_URL environment variable
 * (see .env.example). No API URLs are hardcoded anywhere in the source.
 */
export const config = {
  apiBaseUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
};