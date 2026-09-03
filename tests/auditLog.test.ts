import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import { createTestCompany, createTestUser } from './helpers/testFactory';

describe('AuditLog', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('GET vraca 403 za Employee rolu', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).get('/audit-logs').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('GET uspeva za Manager rolu', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Manager' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).get('/audit-logs').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('automatski se kreira AuditLog kad Hr promeni rolu korisnika', async () => {
    const company = await createTestCompany();
    const { user: hr } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const { user: employee } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const token = tokenFor({ id: hr.id, role: hr.role, companyId: company.id });

    await request(app)
      .put(`/users/${employee.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'Manager' });

    const res = await request(app).get('/audit-logs').set('Authorization', `Bearer ${token}`);

    expect(res.body.some((log: any) => log.action === 'ROLE_CHANGE')).toBe(true);
  });
});
