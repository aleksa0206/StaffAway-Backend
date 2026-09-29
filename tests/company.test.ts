import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import { createTestCompany, createTestUser } from './helpers/testFactory';

describe('Company', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it("GET /companies/me returns the user's own company", async () => {
    const company = await createTestCompany('Acme');
    const { user } = await createTestUser({ companyId: company.id });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).get('/companies/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Acme');
  });

  it('PUT /companies returns 403 for the Employee role', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .put('/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Novo ime' });

    expect(res.status).toBe(403);
  });

  it('PUT /companies succeeds for the Hr role and changes the name', async () => {
    const company = await createTestCompany('Staro ime');
    const { user } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .put('/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Novo ime' });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Novo ime');
  });

  it('DELETE /companies returns 403 for the Manager role', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Manager' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).delete('/companies').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('GET /companies (list all) returns 403 for a regular company (not a platform admin)', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).get('/companies').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
