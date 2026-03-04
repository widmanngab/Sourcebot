// Exemple d'un test d'intégration pour l'application
import request from 'supertest';
import app from '../src/app.js';

describe('App Integration Tests', () => {
  describe('GET /health', () => {
    test('should return 200 and ok status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('GET /api', () => {
    test('should return 200 and API info', async () => {
      const response = await request(app).get('/api');
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('SourceBot');
    });
  });

  describe('GET /nonexistent', () => {
    test('should return 404', async () => {
      const response = await request(app).get('/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
    });
  });
});
