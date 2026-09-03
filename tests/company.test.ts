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

  it('GET /companies/me vraca sopstvenu firmu', async () => {
    const company = await createTestCompany('Acme');
    const { user } = await createTestUser({ companyId: company.id });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).get('/companies/me').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Acme');
  });

  it('PUT /companies vraca 403 za Employee rolu', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .put('/companies')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Novo ime' });

    expect(res.status).toBe(403);
  });

  it('PUT /companies uspeva za Hr rolu i menja ime', async () => {
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

  it('DELETE /companies vraca 403 za Manager rolu', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Manager' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).delete('/companies').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('GET /companies (lista svih) vraca 403 za obicnu firmu (nije Platform admin)', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).get('/companies').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });
});
