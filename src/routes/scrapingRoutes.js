import express from 'express';
import ScrapingController from '../controllers/ScrapingController.js';

const router = express.Router();
const scrapingController = new ScrapingController();

/**
 * POST /api/scrape-emails
 * Search companies and scrape their emails
 * Body: { keyword, location, radius }
 */
router.post('/scrape-emails', (req, res) => scrapingController.scrapeEmails(req, res));

/**
 * POST /api/scrape-url
 * Scrape emails from a single URL
 * Body: { url }
 */
router.post('/scrape-url', (req, res) => scrapingController.scrapeUrl(req, res));

export default router;
