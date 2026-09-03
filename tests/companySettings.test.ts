import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import { createTestCompany, createTestUser } from './helpers/testFactory';

describe('CompanySettings', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('POST vraca 403 za Manager rolu', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Manager' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .post('/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ companyName: 'Acme', defaultAnnualLeaveDays: 20 });

    expect(res.status).toBe(403);
  });

  it('POST uspeva za Hr rolu', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .post('/settings')
      .set('Authorization', `Bearer ${token}`)
      .send({ companyName: 'Acme', defaultAnnualLeaveDays: 20 });

    expect(res.status).toBe(201);
  });
});
