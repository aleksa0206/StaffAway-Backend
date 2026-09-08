import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { createTestCompany, createTestUser } from './helpers/testFactory';

describe('Rate limiting', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('vraca 429 posle 10 pokusaja login-a u kratkom vremenskom periodu', async () => {
    const company = await createTestCompany();

    let lastStatus = 0;
    for (let i = 0; i < 11; i++) {
      const { user } = await createTestUser({ companyId: company.id, email: `ratelimit${i}@test.com` });
      const res = await request(app)
        .post('/auth/login')
        .send({ email: user.email, password: 'pogresna-lozinka' });
      lastStatus = res.status;
    }

    expect(lastStatus).toBe(429);
  });
});