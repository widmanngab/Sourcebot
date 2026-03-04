import express from 'express';
import EmailController from '../controllers/EmailController.js';

const router = express.Router();
const emailController = new EmailController();

/**
 * POST /api/send-quote
 * Send quote request to a single company
 * Body: { company, userEmail, keyword, description, budget, deadline }
 */
router.post('/send-quote', (req, res) => emailController.sendQuote(req, res));

/**
 * POST /api/send-batch
 * Send quote requests to multiple companies
 * Body: { companies, userEmail, keyword, description, budget, deadline }
 */
router.post('/send-batch', (req, res) => emailController.sendBatch(req, res));

/**
 * POST /api/send-to-search-results
 * Send quote requests to all companies from search results
 * Body: { searchResults, userEmail, keyword, description, budget, deadline }
 */
router.post('/send-to-search-results', (req, res) =>
  emailController.sendToSearchResults(req, res)
);

export default router;
