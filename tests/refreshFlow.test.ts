import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { createTestCompany, createTestUser } from './helpers/testFactory';

describe('Refresh token flow', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('refresh token izdaje nov access token i rotira refresh cookie', async () => {
    const company = await createTestCompany();
    const { user, rawPassword } = await createTestUser({ companyId: company.id });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: rawPassword });

    const cookies = loginRes.headers['set-cookie'];

    const refreshRes = await request(app).post('/auth/refresh').set('Cookie', cookies);

    expect(refreshRes.status).toBe(200);
    expect(refreshRes.body.token).toBeDefined();

    const originalRefreshCookie = cookies.find((c: string) => c.startsWith('refreshToken='));
    const newRefreshCookie = refreshRes.headers['set-cookie'].find((c: string) =>
      c.startsWith('refreshToken=')
    );
    expect(newRefreshCookie).toBeDefined();
    expect(newRefreshCookie).not.toBe(originalRefreshCookie);
  });

  it('stari refresh token se ne moze ponovo iskoristiti posle rotacije', async () => {
    const company = await createTestCompany();
    const { user, rawPassword } = await createTestUser({ companyId: company.id });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: rawPassword });

    const originalCookies = loginRes.headers['set-cookie'];

    await request(app).post('/auth/refresh').set('Cookie', originalCookies);

    const secondAttemptRes = await request(app)
      .post('/auth/refresh')
      .set('Cookie', originalCookies);

    expect(secondAttemptRes.status).toBe(401);
  });

  it('refresh bez cookie-ja vraca 401', async () => {
    const res = await request(app).post('/auth/refresh');

    expect(res.status).toBe(401);
  });

  it('logout ponistava refresh token, naredni refresh pokusaj pada', async () => {
    const company = await createTestCompany();
    const { user, rawPassword } = await createTestUser({ companyId: company.id });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: rawPassword });

    const cookies = loginRes.headers['set-cookie'];

    const logoutRes = await request(app).post('/auth/logout').set('Cookie', cookies);
    expect(logoutRes.status).toBe(204);

    const refreshRes = await request(app).post('/auth/refresh').set('Cookie', cookies);
    expect(refreshRes.status).toBe(401);
  });
});
