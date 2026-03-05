import express from 'express';
import EmailController from '../controllers/EmailController.js';

const router = express.Router();
const emailController = new EmailController();

/**
 * POST /api/email/send
 * Send quote request email to a single company with variation
 * Body: { company, clientInfo, useAlternateDomain }
 */
router.post('/email/send', (req, res) => emailController.sendQuote(req, res));

/**
 * POST /api/email/send-batch
 * Send quote requests to multiple companies with variations
 * Body: { companies, clientInfo, useAlternateDomain }
 */
router.post('/email/send-batch', (req, res) => emailController.sendBatch(req, res));

/**
 * POST /api/email/send-to-search-results
 * Send quote requests to all companies from search results
 * Body: { searchResults, clientInfo, useAlternateDomain }
 */
router.post('/email/send-to-search-results', (req, res) => emailController.sendToSearchResults(req, res));

// Legacy routes for backwards compatibility
router.post('/send-quote', (req, res) => emailController.sendQuote(req, res));
router.post('/send-batch', (req, res) => emailController.sendBatch(req, res));
router.post('/send-to-search-results', (req, res) => emailController.sendToSearchResults(req, res));

export default router;
