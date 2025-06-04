const request = require('supertest');
let app;

beforeAll(() => {
  app = require('../server');
});

test('successful login', async () => {
  const res = await request(app).post('/api/login').send({ username: 'officer', password: 'password' });
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
});

test('invalid login', async () => {
  const res = await request(app).post('/api/login').send({ username: 'officer', password: 'wrong' });
  expect(res.status).toBe(401);
});
