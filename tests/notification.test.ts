import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import {
  createTestCompany,
  createTestUser,
  createTestLeaveType,
  createTestNotification,
} from './helpers/testFactory';

describe('Notification', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('the owner can view their own notification', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const notification = await createTestNotification({ userId: user.id });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .get(`/notifications/${notification.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("another user cannot view someone else's notification (403)", async () => {
    const company = await createTestCompany();
    const { user: userA } = await createTestUser({ companyId: company.id });
    const { user: userB } = await createTestUser({ companyId: company.id });
    const notification = await createTestNotification({ userId: userA.id });
    const tokenB = tokenFor({ id: userB.id, role: userB.role, companyId: company.id });

    const res = await request(app)
      .get(`/notifications/${notification.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
  });

  it('a notification is created automatically when a Manager approves a LeaveRequest', async () => {
    const company = await createTestCompany();
    const { user: manager } = await createTestUser({ companyId: company.id, role: 'Manager' });
    const { user: employee } = await createTestUser({
      companyId: company.id,
      role: 'Employee',
      managerId: manager.id,
    });
    const leaveType = await createTestLeaveType(company.id, { countsTowardBalance: false });
    const employeeToken = tokenFor({ id: employee.id, role: employee.role, companyId: company.id });
    const managerToken = tokenFor({ id: manager.id, role: manager.role, companyId: company.id });

    const createRes = await request(app)
      .post('/leave-requests')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        startDate: '2027-09-01',
        endDate: '2027-09-03',
        totalDays: 3,
        leaveTypeId: leaveType.id,
      });

    await request(app)
      .put(`/leave-requests/${createRes.body.id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'Approval' });

    const notificationsRes = await request(app)
      .get('/notifications')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(notificationsRes.body.data.some((n: any) => n.type === 'LeaveRequestApproved')).toBe(
      true
    );
  });

  it('a notification is created automatically when a Manager rejects a LeaveRequest', async () => {
    const company = await createTestCompany();
    const { user: manager } = await createTestUser({ companyId: company.id, role: 'Manager' });
    const { user: employee } = await createTestUser({
      companyId: company.id,
      role: 'Employee',
      managerId: manager.id,
    });
    const leaveType = await createTestLeaveType(company.id, { countsTowardBalance: false });
    const employeeToken = tokenFor({ id: employee.id, role: employee.role, companyId: company.id });
    const managerToken = tokenFor({ id: manager.id, role: manager.role, companyId: company.id });

    const createRes = await request(app)
      .post('/leave-requests')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        startDate: '2027-09-10',
        endDate: '2027-09-12',
        totalDays: 3,
        leaveTypeId: leaveType.id,
      });

    await request(app)
      .put(`/leave-requests/${createRes.body.id}`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ status: 'Rejected' });

    const notificationsRes = await request(app)
      .get('/notifications')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(notificationsRes.body.data.some((n: any) => n.type === 'LeaveRequestRejected')).toBe(
      true
    );
  });
});
