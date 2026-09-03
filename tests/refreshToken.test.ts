import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import { createTestCompany, createTestUser, createTestRefreshToken } from './helpers/testFactory';

describe('RefreshToken', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('vlasnik vidi sopstveni refresh token zapis', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const rt = await createTestRefreshToken({ userId: user.id });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).get(`/refresh-tokens/${rt.id}`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('drugi korisnik ne vidi tudji refresh token (403)', async () => {
    const company = await createTestCompany();
    const { user: userA } = await createTestUser({ companyId: company.id });
    const { user: userB } = await createTestUser({ companyId: company.id });
    const rt = await createTestRefreshToken({ userId: userA.id });
    const tokenB = tokenFor({ id: userB.id, role: userB.role, companyId: company.id });

    const res = await request(app).get(`/refresh-tokens/${rt.id}`).set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
  });

  it('vlasnik moze da opozove sopstveni token', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const rt = await createTestRefreshToken({ userId: user.id });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).put(`/refresh-tokens/${rt.id}/revoke`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.revoked).toBe(true);
  });
});
