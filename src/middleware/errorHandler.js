/**
 * Express Error Handler Middleware
 * Centralizes error handling across the application
 */

import logger from '../utils/logger.js';
import { AppError, ErrorTypes } from '../constants/errors.js';

export const errorHandler = (err, req, res, next) => {
  // Default error response
  let statusCode = 500;
  let respond = {
    status: 'error',
    error: 'Internal Server Error',
    type: ErrorTypes.INTERNAL_ERROR,
  };

  if (err instanceof AppError) {
    // Custom application error
    statusCode = err.statusCode;
    respond = {
      status: 'error',
      error: err.message,
      type: err.type,
      timestamp: err.timestamp,
    };
  } else if (err.response?.data) {
    // External API error (axios)
    statusCode = err.response.status || 500;
    respond = {
      status: 'error',
      error: err.message,
      type: ErrorTypes.API_ERROR,
      apiError: err.response.data,
    };
  } else if (err.message) {
    // Generic error with message
    statusCode = err.statusCode || 500;
    respond = {
      status: 'error',
      error: err.message,
      type: ErrorTypes.INTERNAL_ERROR,
    };
  }

  // Log error appropriately
  if (statusCode >= 500) {
    logger.error(`[${statusCode}] ${respond.error}`, {
      path: req.path,
      method: req.method,
      error: err.message,
      stack: err.stack,
    });
  } else {
    logger.warn(`[${statusCode}] ${respond.error}`, {
      path: req.path,
      method: req.method,
    });
  }

  return res.status(statusCode).json(respond);
};

export default errorHandler;
