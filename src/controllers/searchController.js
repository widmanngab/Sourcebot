import GooglePlacesService from '../services/GooglePlacesService.js';
import ScrapingService from '../services/ScrapingService.js';
import logger from '../utils/logger.js';

class SearchController {
  constructor() {
    this.placesService = new GooglePlacesService(process.env.GOOGLE_PLACES_API_KEY);
    this.scrapingService = new ScrapingService();
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

      logger.info(`📧 Starting email scraping for ${results.length} companies...`);

      // Scrape emails for each company
      const enrichedResults = await Promise.all(
        results.map(async (company) => {
          if (company.website) {
            logger.info(`🕷️ Scraping website for ${company.name}: ${company.website}`);
            try {
              const emails = await this.scrapingService.scrapeEmail(company.website);
              logger.info(`✅ Found ${emails.length} emails for ${company.name}`);
              return {
                ...company,
                emails: emails,
                emailCount: emails.length,
              };
            } catch (error) {
              logger.warn(`⚠️ Failed to scrape emails for ${company.website}:`, error.message);
              return {
                ...company,
                emails: [],
                emailCount: 0,
              };
            }
          } else {
            logger.warn(`⚠️ No website for ${company.name}`);
            return {
              ...company,
              emails: [],
              emailCount: 0,
            };
          }
        })
      );

      logger.info(`✅ Email scraping complete`);

      // Return results
      return res.status(200).json({
        status: 'success',
        keyword,
        location,
        radius,
        count: enrichedResults.length,
        results: enrichedResults,
      });
    } catch (error) {
      logger.error('❌ Search controller error', { 
        error: error.message,
        stack: error.stack,
        errorType: error.constructor.name,
        details: error.response?.data || error.config,
      });
      
      return res.status(500).json({
        error: 'Search failed',
        status: 'error',
        message: error.message,
        errorType: error.constructor.name,
        apiError: error.response?.data || null,
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

  /**
   * Test Google Places API connectivity
   */
  async testGooglePlaces() {
    try {
      logger.info('🧪 Testing Google Places API...');
      
      // Simple test query
      const results = await this.placesService.textSearch('restaurant', 'Paris');
      
      if (results.length === 0) {
        logger.warn('⚠️ Google Places API returned 0 results for test query');
        return {
          success: false,
          message: 'API returned 0 results - API key might not have correct permissions',
          query: 'restaurant in Paris',
          resultCount: 0,
        };
      }

      logger.info(`✅ Google Places API test successful: ${results.length} results`);
      
      return {
        success: true,
        message: `API responding correctly - found ${results.length} results`,
        query: 'restaurant in Paris',
        resultCount: results.length,
        sampleResult: results[0]?.name || 'N/A',
      };
    } catch (error) {
      logger.error('❌ Google Places API test failed', {
        error: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });

      throw error;
    }
  }
}

export default SearchController;
