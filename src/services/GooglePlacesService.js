import axios from 'axios';
import logger from '../utils/logger.js';

class GooglePlacesService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
    if (!apiKey) {
      logger.warn('Google Places API Key not configured');
    }
  }

  /**
   * Text Search - National search by keyword and location
   */
  async textSearch(query, location = 'France') {
    try {
      logger.info(`Text Search: "${query}" in ${location}`);
      
      const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
        params: {
          query: `${query} ${location}`,
          key: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data.status !== 'OK') {
        logger.error(`Text Search failed with status: ${response.data.status}`, {
          status: response.data.status,
          errorMessage: response.data.error_message,
        });
        return [];
      }

      const results = response.data.results || [];
      logger.info(`Text Search found ${results.length} results`);
      
      return results;
    } catch (error) {
      logger.error(`Text Search failed: ${error.message}`, { query });
      throw error;
    }
  }

  /**
   * Nearby Search - Search within radius
   */
  async nearbySearch(latitude, longitude, radius = 50000, keyword = '') {
    try {
      logger.info(`Nearby Search: ${keyword} at ${latitude},${longitude} (${radius}m)`);
      
      const response = await axios.get(`${this.baseUrl}/nearbysearch/json`, {
        params: {
          location: `${latitude},${longitude}`,
          radius,
          keyword,
          key: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data.status !== 'OK') {
        logger.error(`Nearby Search failed with status: ${response.data.status}`, {
          status: response.data.status,
          errorMessage: response.data.error_message,
        });
        return [];
      }

      const results = response.data.results || [];
      logger.info(`Nearby Search found ${results.length} results`);
      
      return results;
    } catch (error) {
      logger.error(`Nearby Search failed: ${error.message}`, { latitude, longitude });
      throw error;
    }
  }

  /**
   * Get Place Details - Retrieve full company information
   */
  async getPlaceDetails(placeId) {
    try {
      logger.info(`Getting details for place: ${placeId}`);
      
      const response = await axios.get(`${this.baseUrl}/details/json`, {
        params: {
          place_id: placeId,
          fields: [
            'name',
            'formatted_address',
            'international_phone_number',
            'website',
            'geometry',
            'rating',
            'user_ratings_total',
            'business_status',
            'opening_hours',
          ].join(','),
          key: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data.status !== 'OK') {
        logger.error(`Place Details failed with status: ${response.data.status}`, {
          status: response.data.status,
          errorMessage: response.data.error_message,
        });
        return null;
      }

      const result = response.data.result || {};
      logger.info(`Place details retrieved for: ${result.name}`);
      
      return {
        placeId,
        name: result.name || 'N/A',
        address: result.formatted_address || 'N/A',
        phone: result.international_phone_number || '',
        website: result.website || '',
        rating: result.rating || null,
        reviewCount: result.user_ratings_total || 0,
        lat: result.geometry?.location?.lat || null,
        lng: result.geometry?.location?.lng || null,
        businessStatus: result.business_status || 'UNKNOWN',
        openingHours: result.opening_hours?.weekday_text || [],
      };
    } catch (error) {
      logger.error(`Place Details failed: ${error.message}`, { placeId });
      throw error;
    }
  }

  /**
   * Comprehensive Search - Combine text and nearby searches
   */
  async comprehensiveSearch(keyword, location = 'France', maxRadius = 100) {
    try {
      logger.info(`Starting comprehensive search: ${keyword} in ${location}`);
      
      // Step 1: Text search for national results
      const textResults = await this.textSearch(keyword, location);
      logger.info(`Text search returned ${textResults.length} results`);
      
      // Limit to first 10 results for performance
      const limitedResults = textResults.slice(0, 10);
      
      // Step 2: Get details (especially website) for each company - parallel requests with delay
      logger.info(`Fetching website details for ${limitedResults.length} companies...`);
      
      const companies = [];
      const batchSize = 3; // Parallel requests per batch
      
      for (let i = 0; i < limitedResults.length; i += batchSize) {
        const batch = limitedResults.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (result) => {
          try {
            const details = await this.getPlaceDetails(result.place_id);
            logger.debug(`Got details for: ${details?.name || result.name}`);
            return {
              placeId: result.place_id,
              name: details?.name || result.name || 'N/A',
              address: details?.address || result.formatted_address || 'N/A',
              phone: details?.phone || '',
              website: details?.website || '', // This is the key field we need
              rating: details?.rating || result.rating || null,
              reviewCount: details?.reviewCount || result.user_ratings_total || 0,
              lat: details?.lat || result.geometry?.location?.lat || null,
              lng: details?.lng || result.geometry?.location?.lng || null,
              businessStatus: details?.businessStatus || 'UNKNOWN',
            };
          } catch (error) {
            logger.error(`Failed to get details for ${result.name}: ${error.message}`, { 
              placeId: result.place_id,
            });
            return {
              placeId: result.place_id,
              name: result.name || 'N/A',
              address: result.formatted_address || 'N/A',
              phone: '',
              website: '',
              rating: result.rating || null,
              reviewCount: result.user_ratings_total || 0,
              lat: result.geometry?.location?.lat || null,
              lng: result.geometry?.location?.lng || null,
              businessStatus: 'UNKNOWN',
            };
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        companies.push(...batchResults);
        
        // Add delay between batches to avoid rate limiting
        if (i + batchSize < limitedResults.length) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      logger.info(`Comprehensive search completed: ${companies.length} companies`);
      return companies;
    } catch (error) {
      logger.error(`Comprehensive search failed: ${error.message}`, { keyword, location });
      throw error;
    }
  }
}

export default GooglePlacesService;
