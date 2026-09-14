import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import {
  createTestCompany,
  createTestUser,
  createTestLeaveType,
  createRawLeaveRequest,
  createTestStatusHistory,
} from './helpers/testFactory';

describe('Robustnost (cetvrta sesija) - Prisma greske, race-condition fixevi', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('Nevalidan (ne-brojcani) id parametar vraca 400, ne 500', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .get('/leave-requests/nije-broj')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  it('DELETE /companies vraca 409 (ne 500) kad firma ima korisnike', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).delete('/companies').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
  });

  it('DELETE /leave-requests/:id vraca 409 (ne 500) kad zahtev ima StatusHistory', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const leaveType = await createTestLeaveType(company.id);
    const leaveRequest = await createRawLeaveRequest({
      userId: user.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });
    await createTestStatusHistory({
      leaveRequestId: leaveRequest.id,
      changedById: user.id,
      companyId: company.id,
    });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .delete(`/leave-requests/${leaveRequest.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
  });

  it('DELETE /leave-types/:id vraca 409 (ne 500) kad postoji LeaveRequest koji ga koristi', async () => {
    const company = await createTestCompany();
    const { user: hr } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const leaveType = await createTestLeaveType(company.id);
    await createRawLeaveRequest({
      userId: hr.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });
    const token = tokenFor({ id: hr.id, role: hr.role, companyId: company.id });

    const res = await request(app)
      .delete(`/leave-types/${leaveType.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(409);
  });

  it('POST /leave-requests odbija totalDays veci od raspona datuma', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const leaveType = await createTestLeaveType(company.id);
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .post('/leave-requests')
      .set('Authorization', `Bearer ${token}`)
      .send({
        startDate: '2027-10-10',
        endDate: '2027-10-11',
        totalDays: 365,
        leaveTypeId: leaveType.id,
      });

    expect(res.status).toBe(400);
  });

  it('PUT /leave-requests/:id odbija totalDays veci od (izmenjenog) raspona datuma', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const leaveType = await createTestLeaveType(company.id);
    const leaveRequest = await createRawLeaveRequest({
      userId: user.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
      startDate: new Date('2027-11-01'),
      endDate: new Date('2027-11-05'),
      totalDays: 5,
    });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .put(`/leave-requests/${leaveRequest.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ endDate: '2027-11-02' });

    expect(res.status).toBe(400);
  });
});
