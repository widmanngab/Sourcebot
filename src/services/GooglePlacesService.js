import logger from './logger.js';

class GooglePlacesService {
  constructor() {
    this.apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!this.apiKey) {
      logger.warn('GOOGLE_PLACES_API_KEY non configuré');
    }
  }

  async textSearch(query, location) {
    logger.info(`Google Places TextSearch: ${query} in ${location}`);
    // À implémenter en Phase 2
    throw new Error('Service non encore implémenté - Phase 2');
  }

  async nearbySearch(latitude, longitude, radius, keyword) {
    logger.info(`Google Places NearbySearch: ${keyword} at ${latitude},${longitude} (${radius}m)`);
    // À implémenter en Phase 2
    throw new Error('Service non encore implémenté - Phase 2');
  }

  async getPlaceDetails(placeId) {
    logger.info(`Google Places GetDetails: ${placeId}`);
    // À implémenter en Phase 2
    throw new Error('Service non encore implémenté - Phase 2');
  }
}

export default GooglePlacesService;
