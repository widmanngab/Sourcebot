import express from 'express';
import SearchController from '../controllers/SearchController.js';

const router = express.Router();
const searchController = new SearchController();

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
