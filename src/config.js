/**
 * Application Configuration
 * Centralizes all environment variables and constants
 */

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  baseUrl: process.env.BASE_URL || 'http://localhost:3000',

  // API Keys
  googlePlacesApiKey: process.env.GOOGLE_PLACES_API_KEY,

  // Email Service
  mailjet: {
    apiKey: process.env.MAILJET_API_KEY,
    apiSecret: process.env.MAILJET_API_SECRET,
    fromEmail: process.env.MAILJET_FROM_EMAIL || 'noreply@sourcebot.com',
    fromName: 'SourceBot - Demande de Devis',
  },

  // SMTP Fallback
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },

  // Test Mode
  testMode: process.env.TEST_MODE === 'true',
  testEmail: process.env.TEST_EMAIL || 'test@example.com',

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',

  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Scraping
  scraping: {
    timeout: parseInt(process.env.SCRAPING_TIMEOUT || '10000', 10),
    delayMs: parseInt(process.env.SCRAPING_DELAY_MS || '3000', 10),
    maxParallel: parseInt(process.env.SCRAPING_MAX_PARALLEL || '10', 10),
  },

  // Email Mock Mode
  mockEmailMode: process.env.MOCK_EMAIL_MODE === 'true',

  // Validation
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
};

export default config;
