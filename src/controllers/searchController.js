import GooglePlacesService from '../services/GooglePlacesService.js';
import ScrapingService from '../services/ScrapingService.js';
import logger from '../utils/logger.js';
import config from '../config.js';

class SearchController {
  constructor() {
    this.placesService = new GooglePlacesService(config.googlePlacesApiKey);
    this.scrapingService = new ScrapingService();
  }

  /**
   * Search for companies and scrape their emails
   * POST /api/search
   * Body: { keyword, location, radius }
   */
  async search(req, res, next) {
    try {
      const { keyword, location, radius } = req.body;

      logger.info(`Search request: keyword="${keyword}", location="${location}", radius=${radius}`);

      // Perform search
      const results = await this.placesService.comprehensiveSearch(
        keyword,
        location,
        radius
      );

      logger.info(`Found ${results.length} companies, starting email scraping...`);

      // Scrape emails for each company
      const enrichedResults = await Promise.all(
        results.map(async (company) => {
          if (company.website) {
            logger.debug(`Scraping website for ${company.name}: ${company.website}`);
            try {
              const emails = await this.scrapingService.scrapeEmail(company.website);
              logger.debug(`Found ${emails.length} emails for ${company.name}`);
              return {
                ...company,
                emails,
                emailCount: emails.length,
              };
            } catch (error) {
              logger.warn(`Failed to scrape emails for ${company.website}: ${error.message}`);
              return {
                ...company,
                emails: [],
                emailCount: 0,
              };
            }
          } else {
            logger.debug(`No website for ${company.name}`);
            return {
              ...company,
              emails: [],
              emailCount: 0,
            };
          }
        })
      );

      logger.info(`Email scraping complete for ${enrichedResults.length} results`);

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
      logger.error(`Search failed: ${error.message}`, { 
        errorType: error.constructor.name,
      });
      next(error);
    }
  }

  /**
   * Scrape emails from a single URL
   * POST /api/scrape-url
   * Body: { url }
   */
  async scrapeUrl(req, res, next) {
    try {
      const { url } = req.body;

      logger.info(`Scraping URL: ${url}`);

      const emails = await this.scrapingService.scrapeEmail(url);

      return res.status(200).json({
        status: 'success',
        url,
        emails,
        found: emails.length,
      });
    } catch (error) {
      logger.error(`URL scraping failed: ${error.message}`);
      next(error);
    }
  }

  /**
   * Get company details by Google Place ID
   * GET /api/place/:placeId
   */
  async getPlaceDetails(req, res, next) {
    try {
      const { placeId } = req.params;

      if (!placeId) {
        return res.status(400).json({ 
          error: 'Place ID is required',
          status: 'error'
        });
      }

      logger.info(`Getting details for place: ${placeId}`);

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
      logger.error(`Get place details failed: ${error.message}`);
      next(error);
    }
  }

  /**
   * Test Google Places API connectivity
   * GET /api/test-google-places
   */
  async testGooglePlaces(req, res, next) {
    try {
      logger.info('Testing Google Places API...');
      
      // Simple test query
      const results = await this.placesService.textSearch('restaurant', 'Paris');
      
      if (results.length === 0) {
        logger.warn('Google Places API returned 0 results for test query');
        return res.status(200).json({
          success: false,
          message: 'API returned 0 results - API key might not have correct permissions',
          query: 'restaurant in Paris',
          resultCount: 0,
        });
      }

      logger.info(`Google Places API test successful: ${results.length} results`);
      
      return res.status(200).json({
        success: true,
        message: `API responding correctly - found ${results.length} results`,
        query: 'restaurant in Paris',
        resultCount: results.length,
        sampleResult: results[0]?.name || 'N/A',
      });
    } catch (error) {
      logger.error(`Google Places API test failed: ${error.message}`, {
        status: error.response?.status,
      });
      next(error);
    }
  }
}

export default SearchController;
