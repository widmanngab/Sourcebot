/**
 * Error definitions and constants
 */

export const ErrorTypes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_ERROR: 'SERVICE_ERROR',
  API_ERROR: 'API_ERROR',
};

export const ErrorMessages = {
  KEYWORD_REQUIRED: 'Keyword is required',
  LOCATION_REQUIRED: 'Location is provided in query',
  COMPANY_REQUIRED: 'Company with emails is required',
  CLIENT_INFO_REQUIRED: 'Client info with email is required',
  INVALID_URL: 'Invalid URL provided',
  SEARCH_FAILED: 'Search failed',
  SCRAPING_FAILED: 'Scraping failed',
  EMAIL_SEND_FAILED: 'Failed to send email',
  CONFIGURATION_MISSING: 'Required configuration is missing',
  API_NOT_CONFIGURED: 'API endpoint not configured',
  INTERNAL_SERVER_ERROR: 'Internal server error',
};

export class AppError extends Error {
  constructor(message, type = ErrorTypes.INTERNAL_ERROR, statusCode = 500) {
    super(message);
    this.type = type;
    this.statusCode = statusCode;
    this.timestamp = new Date().toISOString();
  }
}

export default {
  ErrorTypes,
  ErrorMessages,
  AppError,
};
