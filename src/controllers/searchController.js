import GooglePlacesService from '../services/GooglePlacesService.js';
import logger from '../utils/logger.js';

class SearchController {
  constructor() {
    this.placesService = new GooglePlacesService(process.env.GOOGLE_PLACES_API_KEY);
  }

  /**
   * Handle search request
   * POST /api/search
   * Body: { keyword, location, radius }
   */
  async search(req, res) {
    try {
      const { keyword, location = 'France', radius = 100 } = req.body;

      // Validation
      if (!keyword || keyword.trim() === '') {
        logger.warn('❌ Search request without keyword');
        return res.status(400).json({ 
          error: 'Keyword is required',
          status: 'error'
        });
      }

      logger.info(`🔍 Search request: keyword="${keyword}", location="${location}", radius=${radius}`);

      // Perform search
      const results = await this.placesService.comprehensiveSearch(
        keyword,
        location,
        radius
      );

      // Return results
      return res.status(200).json({
        status: 'success',
        keyword,
        location,
        radius,
        count: results.length,
        results: results,
      });
    } catch (error) {
      logger.error('❌ Search controller error', { 
        error: error.message,
        stack: error.stack 
      });
      
      return res.status(500).json({
        error: 'Search failed',
        status: 'error',
        message: error.message,
      });
    }
  }

  /**
   * Get place details by ID
   * GET /api/place/:placeId
   */
  async getPlaceDetails(req, res) {
    try {
      const { placeId } = req.params;

      if (!placeId) {
        return res.status(400).json({ 
          error: 'Place ID is required',
          status: 'error'
        });
      }

      logger.info(`📋 Getting details for place: ${placeId}`);

      const details = await this.placesService.getPlaceDetails(placeId);

      if (!details) {
        return res.status(404).json({
          error: 'Place not found',
          status: 'error',
        });
      }

      return res.status(200).json({
        status: 'success',
        data: details,
      });
    } catch (error) {
      logger.error('❌ Get place details error', { 
        error: error.message,
      });

      return res.status(500).json({
        error: 'Failed to get place details',
        status: 'error',
        message: error.message,
      });
    }
  }
}

export default SearchController;
