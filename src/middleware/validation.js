/**
 * Request Validation Middleware
 * Validates incoming requests with Joi schemas
 */

import Joi from 'joi';
import logger from '../utils/logger.js';
import { AppError, ErrorTypes } from '../constants/errors.js';

// Validation schemas
export const schemas = {
  searchRequest: Joi.object({
    keyword: Joi.string().required().trim().min(2).max(100),
    location: Joi.string().optional().trim().default('France').max(100),
    radius: Joi.number().optional().integer().min(1).max(50000).default(100),
  }),

  scrapeRequest: Joi.object({
    url: Joi.string().required().uri(),
  }),

  emailSendRequest: Joi.object({
    company: Joi.object({
      name: Joi.string().required(),
      emails: Joi.array().items(Joi.string().email()).min(1).required(),
      address: Joi.string().optional(),
      phone: Joi.string().optional(),
      website: Joi.string().optional(),
    }).required(),
    clientInfo: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      company: Joi.string().optional(),
      service: Joi.string().optional(),
      description: Joi.string().optional(),
      budget: Joi.string().optional(),
      urgency: Joi.string().optional(),
      phone: Joi.string().optional(),
    }).required(),
    attachments: Joi.array().optional(),
    useAlternateDomain: Joi.boolean().optional().default(false),
  }),

  emailBatchRequest: Joi.object({
    companies: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          emails: Joi.array().items(Joi.string().email()).min(1).required(),
        })
      )
      .min(1)
      .required(),
    clientInfo: Joi.object().required(),
  }),
};

/**
 * Middleware factory to validate request body against a Joi schema
 */
export const validateBody = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      logger.error(`Unknown validation schema: ${schemaName}`);
      return next(new AppError('Validation schema not found', ErrorTypes.INTERNAL_ERROR, 500));
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      logger.warn(`Validation error: ${messages}`, { path: req.path });
      return res.status(400).json({
        status: 'error',
        error: 'Validation failed',
        type: ErrorTypes.VALIDATION_ERROR,
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      });
    }

    // Replace request body with validated value
    req.body = value;
    next();
  };
};

/**
 * Validate query parameters
 */
export const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const messages = error.details.map((detail) => detail.message).join(', ');
      logger.warn(`Query validation error: ${messages}`, { path: req.path });
      return res.status(400).json({
        status: 'error',
        error: 'Invalid query parameters',
        type: ErrorTypes.VALIDATION_ERROR,
        details: error.details.map((d) => ({
          field: d.path.join('.'),
          message: d.message,
        })),
      });
    }

    req.query = value;
    next();
  };
};

export default {
  validateBody,
  validateQuery,
  schemas,
};
