import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import { createTestCompany, createTestUser, createTestLeaveType } from './helpers/testFactory';

describe('Zod validation - rejects bad input', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('rejects a LeaveRequest when endDate is before startDate', async () => {
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

  it('rejects a LeaveRequest without leaveTypeId', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .post('/leave-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({ startDate: '2027-06-10', endDate: '2027-06-15', totalDays: 5 });

    expect(res.status).toBe(400);
  });

  it('rejects creating a user with an invalid email format', async () => {
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

  it('rejects creating a user with a password that is too short', async () => {
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

  it('rejects creating a Department without a name', async () => {
    const company = await createTestCompany();
    const { user: hr } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const token = tokenFor({ id: hr.id, role: hr.role, companyId: company.id });

    const res = await request(app)
      .post('/departments')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('rejects a LeaveType with a wrong field type (string instead of boolean)', async () => {
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
