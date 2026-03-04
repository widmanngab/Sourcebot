import axios from 'axios';
import logger from '../utils/logger.js';

class GooglePlacesService {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
    if (!apiKey) {
      logger.warn('⚠️ Google Places API Key not configured');
    }
  }

  /**
   * Text Search - National search by keyword and location
   */
  async textSearch(query, location = 'France') {
    try {
      logger.info(`🔍 Text Search: "${query}" in ${location}`);
      
      const response = await axios.get(`${this.baseUrl}/textsearch/json`, {
        params: {
          query: `${query} ${location}`,
          key: this.apiKey,
        },
        timeout: 10000,
      });

      if (response.data.status !== 'OK') {
        logger.warn(`⚠️ Text Search status: ${response.data.status}`);
        return [];
      }

      const results = response.data.results || [];
      logger.info(`✅ Text Search found ${results.length} results`);
      
      return results;
    } catch (error) {
      logger.error('❌ Text Search failed', { query, error: error.message });
      throw error;
    }
  }

  /**
   * Nearby Search - Search within radius
   */
  async nearbySearch(latitude, longitude, radius = 50000, keyword = '') {
    try {
      logger.info(`🔍 Nearby Search: ${keyword} at ${latitude},${longitude} (${radius}m)`);
      
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
        logger.warn(`⚠️ Nearby Search status: ${response.data.status}`);
        return [];
      }

      const results = response.data.results || [];
      logger.info(`✅ Nearby Search found ${results.length} results`);
      
      return results;
    } catch (error) {
      logger.error('❌ Nearby Search failed', { 
        latitude, 
        longitude, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get Place Details - Retrieve full company information
   */
  async getPlaceDetails(placeId) {
    try {
      logger.info(`📋 Getting details for place: ${placeId}`);
      
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
        logger.warn(`⚠️ Place Details status: ${response.data.status}`);
        return null;
      }

      const result = response.data.result || {};
      logger.info(`✅ Place details retrieved for: ${result.name}`);
      
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
      logger.error('❌ Place Details failed', { 
        placeId, 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Comprehensive Search - Combine text and nearby searches
   */
  async comprehensiveSearch(keyword, location = 'France', maxRadius = 100) {
    try {
      logger.info(`🚀 Starting comprehensive search: ${keyword} in ${location}`);
      
      const companies = new Map();
      
      // Step 1: Text search for national results
      const textResults = await this.textSearch(keyword, location);
      logger.info(`📍 Text search returned ${textResults.length} results`);
      
      for (const result of textResults) {
        const details = await this.getPlaceDetails(result.place_id);
        if (details) {
          companies.set(result.place_id, details);
        }
        // Rate limiting: 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      logger.info(`✅ Comprehensive search completed: ${companies.size} unique companies`);
      return Array.from(companies.values());
    } catch (error) {
      logger.error('❌ Comprehensive search failed', { 
        keyword, 
        location, 
        error: error.message 
      });
      throw error;
    }
  }
}

export default GooglePlacesService;
