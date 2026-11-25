// tests/health.test.js
const request = require('supertest');
const app = require('../src/app');
const { describe, test, expect } = require('@jest/globals');

describe('GET /v1/health', () => {
  test('should return 200 and status ok', async () => {
    const res = await request(app).get('/v1/health');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('status', 'ok');
    expect(typeof res.body.uptime).toBe('number');
  });
});
