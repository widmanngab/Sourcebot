// Exemple d'un test unitaire pour GooglePlacesService
import GooglePlacesService from '../src/services/GooglePlacesService.js';

describe('GooglePlacesService', () => {
  let service;

  beforeEach(() => {
    service = new GooglePlacesService();
  });

  describe('initialization', () => {
    test('should initialize without errors', () => {
      expect(service).toBeDefined();
    });

    test('should have apiKey property', () => {
      expect(service).toHaveProperty('apiKey');
    });
  });

  describe('textSearch', () => {
    test('should throw error (not implemented)', async () => {
      await expect(service.textSearch('plombiers', 'France')).rejects.toThrow(
        'Service non encore implémenté - Phase 2'
      );
    });
  });

  describe('nearbySearch', () => {
    test('should throw error (not implemented)', async () => {
      await expect(
        service.nearbySearch(48.8566, 2.3522, 50000, 'plombiers')
      ).rejects.toThrow('Service non encore implémenté - Phase 2');
    });
  });

  describe('getPlaceDetails', () => {
    test('should throw error (not implemented)', async () => {
      await expect(service.getPlaceDetails('ChIJ...')).rejects.toThrow(
        'Service non encore implémenté - Phase 2'
      );
    });
  });
});
