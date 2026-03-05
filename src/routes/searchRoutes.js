import express from 'express';
import SearchController from '../controllers/searchController.js';

const router = express.Router();
const searchController = new SearchController();

/**
 * GET /api/config
 * Get configuration info (including test mode)
 */
router.get('/config', (req, res) => {
  const testMode = process.env.TEST_MODE === 'true';
  const testEmail = process.env.TEST_EMAIL || 'fourchettetest@gmail.com';
  
  return res.json({
    testMode,
    testEmail: testMode ? testEmail : null,
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * GET /api/diagnostic
 * Check API configuration and credentials
 */
router.get('/diagnostic', (req, res) => {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  return res.json({
    status: 'ok',
    googlePlacesApiConfigured: !!apiKey,
    googlePlacesApiKeyPreview: apiKey ? `${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}` : 'NOT SET',
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
  });
});

/**
 * POST /api/search
 * Search for companies
 * Body: { keyword, location, radius }
 */
router.post('/search', (req, res) => searchController.search(req, res));

/**
 * GET /api/place/:placeId
 * Get place details
 */
router.get('/place/:placeId', (req, res) => searchController.getPlaceDetails(req, res));

export default router;
