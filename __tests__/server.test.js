const request = require('supertest');
const fs = require('fs');
const path = require('path');
let app;

beforeAll(() => {
  // remove existing db if any
  const dbFile = path.join(__dirname, '..', 'tickets.db');
  if (fs.existsSync(dbFile)) fs.unlinkSync(dbFile);
  app = require('../server');
});

test('POST and GET /api/tickets', async () => {
  const ticket = {driver: {name: 'John'}, vehicle: {plate: '123ABC'}, details: {violation: 'speeding'}};
  const postRes = await request(app).post('/api/tickets').send(ticket);
  expect(postRes.status).toBe(200);
  expect(postRes.body.id).toBeGreaterThan(0);

  const getRes = await request(app).get('/api/tickets');
  expect(getRes.status).toBe(200);
  expect(Array.isArray(getRes.body)).toBe(true);
  expect(getRes.body[0].driver.name).toBe('John');
});
