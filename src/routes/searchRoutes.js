import express from 'express';
import SearchController from '../controllers/searchController.js';
import { validateBody } from '../middleware/validation.js';
import config from '../config.js';

const router = express.Router();
const searchController = new SearchController();

/**
 * GET /api/config
 * Get configuration info (including test mode)
 */
router.get('/config', (req, res) => {
  return res.json({
    testMode: config.testMode,
    testEmail: config.testMode ? config.testEmail : null,
    environment: config.nodeEnv,
    mockEmailMode: config.mockEmailMode,
  });
});

/**
 * GET /api/diagnostic
 * Check API configuration and credentials
 */
router.get('/diagnostic', (req, res) => {
  const apiKey = config.googlePlacesApiKey;
  return res.json({
    status: 'ok',
    googlePlacesApiConfigured: !!apiKey,
    googlePlacesApiKeyPreview: apiKey 
      ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}` 
      : 'NOT SET',
    environment: config.nodeEnv,
    nodeVersion: process.version,
    testMode: config.testMode,
    mockEmailMode: config.mockEmailMode,
  });
});

/**
 * GET /api/test-google-places
 * Test Google Places API with a simple query
 */
router.get('/test-google-places', (req, res, next) => 
  searchController.testGooglePlaces(req, res, next)
);

/**
 * POST /api/search
 * Search for companies and scrape their emails
 * Body: { keyword, location, radius }
 */
router.post('/search', 
  validateBody('searchRequest'),
  (req, res, next) => searchController.search(req, res, next)
);

/**
 * POST /api/scrape-emails
 * Alias for /api/search (backward compatibility)
 */
router.post('/scrape-emails',
  validateBody('searchRequest'),
  (req, res, next) => searchController.search(req, res, next)
);

/**
 * POST /api/scrape-url
 * Scrape emails from a single URL
 * Body: { url }
 */
router.post('/scrape-url',
  validateBody('scrapeRequest'),
  (req, res, next) => searchController.scrapeUrl(req, res, next)
);

/**
 * GET /api/place/:placeId
 * Get place details by Google Place ID
 */
router.get('/place/:placeId', 
  (req, res, next) => searchController.getPlaceDetails(req, res, next)
);

export default router;
