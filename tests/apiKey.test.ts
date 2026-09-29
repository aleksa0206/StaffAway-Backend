import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import { createTestCompany, createTestUser, createTestApiKey } from './helpers/testFactory';

describe('ApiKey', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('POST returns 403 for the Employee role', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .post('/api-keys')
      .set('Authorization', `Bearer ${token}`)
      .send({ key: 'abc123', name: 'Test Key' });

    expect(res.status).toBe(403);
  });

  it('PUT .../revoke succeeds for the Hr role', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const apiKey = await createTestApiKey(company.id);
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .put(`/api-keys/${apiKey.id}/revoke`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.revoked).toBe(true);
  });
});
