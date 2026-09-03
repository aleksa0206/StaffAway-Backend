import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { createTestCompany, createTestUser } from './helpers/testFactory';

describe('Auth flow', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('uspesno prijavljuje korisnika sa tacnim kredencijalima', async () => {
    const company = await createTestCompany();
    const { user, rawPassword } = await createTestUser({ companyId: company.id });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: rawPassword });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('odbija login sa pogresnom lozinkom', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: 'pogresna-lozinka' });

    expect(res.status).toBe(401);
  });

  it('zakljucava nalog posle 5 neuspesnih pokusaja', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/auth/login')
        .send({ email: user.email, password: 'pogresna-lozinka' });
    }

    const res = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: 'pogresna-lozinka' });

    expect(res.status).toBe(423);
  });

  it('postavlja refresh token cookie nakon uspesnog login-a', async () => {
    const company = await createTestCompany();
    const { user, rawPassword } = await createTestUser({ companyId: company.id });

    const res = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: rawPassword });

    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies.some((c: string) => c.startsWith('refreshToken='))).toBe(true);
  });
});
