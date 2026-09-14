import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import { createTestCompany, createTestUser, createTestLeaveType } from './helpers/testFactory';

describe('Zod validacija - odbija los input', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('odbija LeaveRequest kad je endDate pre startDate', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const leaveType = await createTestLeaveType(company.id);
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .post('/leave-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        startDate: '2027-06-15',
        endDate: '2027-06-10',
        totalDays: 5,
        leaveTypeId: leaveType.id,
      });

    expect(res.status).toBe(400);
  });

  it('odbija LeaveRequest bez leaveTypeId', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .post('/leave-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ startDate: '2027-06-10', endDate: '2027-06-15', totalDays: 5 });

    expect(res.status).toBe(400);
  });

  it('odbija kreiranje korisnika sa nevalidnim email formatom', async () => {
    const company = await createTestCompany();
    const { user: hr } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const token = tokenFor({ id: hr.id, role: hr.role, companyId: company.id });

    const res = await request(app).post('/users').set('Authorization', `Bearer ${token}`).send({
      firstName: 'Test',
      lastName: 'User',
      email: 'nije-email',
      password: 'password123',
      role: 'Employee',
      managerId: null,
      hireDate: '2026-01-01',
    });

    expect(res.status).toBe(400);
  });

  it('odbija kreiranje korisnika sa prekratkom lozinkom', async () => {
    const company = await createTestCompany();
    const { user: hr } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const token = tokenFor({ id: hr.id, role: hr.role, companyId: company.id });

    const res = await request(app).post('/users').set('Authorization', `Bearer ${token}`).send({
      firstName: 'Test',
      lastName: 'User',
      email: 'novi@test.com',
      password: '123',
      role: 'Employee',
      managerId: null,
      hireDate: '2026-01-01',
    });

    expect(res.status).toBe(400);
  });

  it('odbija kreiranje Department-a bez imena', async () => {
    const company = await createTestCompany();
    const { user: hr } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const token = tokenFor({ id: hr.id, role: hr.role, companyId: company.id });

    const res = await request(app)
      .post('/departments')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('odbija LeaveType sa pogresnim tipom polja (string umesto boolean)', async () => {
    const company = await createTestCompany();
    const { user: hr } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const token = tokenFor({ id: hr.id, role: hr.role, companyId: company.id });

    const res = await request(app)
      .post('/leave-types')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Test', requiresApproval: 'da', countsTowardBalance: true });

    expect(res.status).toBe(400);
  });
});
