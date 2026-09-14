import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import { createTestCompany, createTestUser } from './helpers/testFactory';

describe('User', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('passwordHash se nikad ne vraca u odgovoru', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).get('/users').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    for (const u of res.body.data) {
      expect(u.passwordHash).toBeUndefined();
    }
  });

  it('POST /users vraca 403 ako nije Hr', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).post('/users').set('Authorization', `Bearer ${token}`).send({
      firstName: 'Novi',
      lastName: 'Zaposleni',
      email: 'novi@test.com',
      password: 'password123',
      role: 'Employee',
      managerId: null,
      hireDate: '2026-01-01',
    });

    expect(res.status).toBe(403);
  });

  it('Employee ne sme da promeni sopstvenu rolu', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .put(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'Hr' });

    expect(res.status).toBe(403);
  });

  it('Employee sme da menja sopstveno ime (ne rolu)', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .put(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ firstName: 'Promenjeno' });

    expect(res.status).toBe(200);
    expect(res.body.firstName).toBe('Promenjeno');
  });

  it('Hr ne sme da obrise sopstveni nalog', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('Hr sme da obrise drugog korisnika', async () => {
    const company = await createTestCompany();
    const { user: hr } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const { user: employee } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const token = tokenFor({ id: hr.id, role: hr.role, companyId: company.id });

    const res = await request(app)
      .delete(`/users/${employee.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });
});
