import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import {
  createTestCompany,
  createTestUser,
  createTestLeaveType,
  createRawLeaveRequest,
  createTestAttachment,
  createTestComment,
  createTestLeaveBalance,
} from './helpers/testFactory';

describe('Security fixes', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('LeaveBalance: POST returns 403 for the Employee role', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const leaveType = await createTestLeaveType(company.id);
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .post('/leave-balances')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: user.id, leaveTypeId: leaveType.id, year: 2027, totalDays: 20, usedDays: 0 });

    expect(res.status).toBe(403);
  });

  it('LeaveBalance: Hr cannot create a balance for a user from another company', async () => {
    const companyA = await createTestCompany('A');
    const companyB = await createTestCompany('B');
    const { user: hr } = await createTestUser({ companyId: companyA.id, role: 'Hr' });
    const { user: userB } = await createTestUser({ companyId: companyB.id });
    const leaveType = await createTestLeaveType(companyA.id);
    const token = tokenFor({ id: hr.id, role: hr.role, companyId: companyA.id });

    const res = await request(app)
      .post('/leave-balances')
      .set('Authorization', `Bearer ${token}`)
      .send({
        userId: userB.id,
        leaveTypeId: leaveType.id,
        year: 2027,
        totalDays: 20,
        usedDays: 0,
      });

    expect(res.status).toBe(403);
  });

  it("Attachment: an Employee cannot view a colleague's attachment in the same company, a Manager can", async () => {
    const company = await createTestCompany();
    const { user: owner } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const { user: colleague } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const { user: manager } = await createTestUser({ companyId: company.id, role: 'Manager' });
    const leaveType = await createTestLeaveType(company.id);
    const leaveRequest = await createRawLeaveRequest({
      userId: owner.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });
    const attachment = await createTestAttachment(leaveRequest.id);

    const colleagueToken = tokenFor({
      id: colleague.id,
      role: colleague.role,
      companyId: company.id,
    });
    const managerToken = tokenFor({ id: manager.id, role: manager.role, companyId: company.id });

    const colleagueRes = await request(app)
      .get(`/attachments/${attachment.id}`)
      .set('Authorization', `Bearer ${colleagueToken}`);
    expect(colleagueRes.status).toBe(403);

    const managerRes = await request(app)
      .get(`/attachments/${attachment.id}`)
      .set('Authorization', `Bearer ${managerToken}`);
    expect(managerRes.status).toBe(200);
  });

  it("LeaveRequest: an Employee cannot delete someone else's request, but can delete their own", async () => {
    const company = await createTestCompany();
    const { user: owner } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const { user: colleague } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const leaveType = await createTestLeaveType(company.id);
    const leaveRequest = await createRawLeaveRequest({
      userId: owner.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });

    const colleagueToken = tokenFor({
      id: colleague.id,
      role: colleague.role,
      companyId: company.id,
    });
    const ownerToken = tokenFor({ id: owner.id, role: owner.role, companyId: company.id });

    const forbiddenRes = await request(app)
      .delete(`/leave-requests/${leaveRequest.id}`)
      .set('Authorization', `Bearer ${colleagueToken}`);
    expect(forbiddenRes.status).toBe(403);

    const okRes = await request(app)
      .delete(`/leave-requests/${leaveRequest.id}`)
      .set('Authorization', `Bearer ${ownerToken}`);
    expect(okRes.status).toBe(200);
  });

  it("Comment: an Employee cannot edit or delete someone else's comment", async () => {
    const company = await createTestCompany();
    const { user: author } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const { user: other } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const leaveType = await createTestLeaveType(company.id);
    const leaveRequest = await createRawLeaveRequest({
      userId: author.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });
    const comment = await createTestComment({
      leaveRequestId: leaveRequest.id,
      authorId: author.id,
      companyId: company.id,
    });
    const otherToken = tokenFor({ id: other.id, role: other.role, companyId: company.id });

    const updateRes = await request(app)
      .put(`/comments/${comment.id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ text: 'tudje menjanje' });
    expect(updateRes.status).toBe(403);

    const deleteRes = await request(app)
      .delete(`/comments/${comment.id}`)
      .set('Authorization', `Bearer ${otherToken}`);
    expect(deleteRes.status).toBe(403);
  });

  it('Notification/StatusHistory/AuditLog: the public POST no longer exists (404)', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const notifRes = await request(app)
      .post('/notifications')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: user.id, message: 'x', isRead: false, type: 'General' });
    expect(notifRes.status).toBe(404);

    const statusRes = await request(app)
      .post('/status-histories')
      .set('Authorization', `Bearer ${token}`)
      .send({ leaveRequestId: 1, oldStatus: 'Pending', newStatus: 'Approval' });
    expect(statusRes.status).toBe(404);

    const auditRes = await request(app)
      .post('/audit-logs')
      .set('Authorization', `Bearer ${token}`)
      .send({ entityType: 'User', entityId: 1, action: 'X' });
    expect(auditRes.status).toBe(404);
  });

  it('Disable 2FA: requires a valid TOTP code', async () => {
    const company = await createTestCompany();
    const { user, rawPassword } = await createTestUser({ companyId: company.id });
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: rawPassword });
    const accessToken = loginRes.body.token;

    await request(app).post('/auth/2fa/setup').set('Authorization', `Bearer ${accessToken}`);
    await request(app)
      .post('/auth/2fa/confirm')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code: '123456' });

    const noCodeRes = await request(app)
      .delete('/auth/2fa')
      .set('Authorization', `Bearer ${accessToken}`);
    expect(noCodeRes.status).toBe(400);

    const wrongCodeRes = await request(app)
      .delete('/auth/2fa')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code: '000000' });
    expect(wrongCodeRes.status).toBe(401);
  });

  it('ApiKey: GET returns 403 for the Employee role', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Employee' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).get('/api-keys').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('ApiKey: the server generates the key; a client-supplied "key" in the body is ignored', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .post('/api-keys')
      .set('Authorization', `Bearer ${token}`)
      .send({ key: 'attacker-chosen-key', name: 'Test Key' });

    expect(res.status).toBe(201);
    expect(res.body.key).not.toBe('attacker-chosen-key');
    expect(res.body.key).toHaveLength(64);
  });

  it('LeaveBalance: Hr can still legitimately update a balance (positive case)', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id, role: 'Hr' });
    const leaveType = await createTestLeaveType(company.id);
    const balance = await createTestLeaveBalance({
      userId: user.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .put(`/leave-balances/${balance.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ usedDays: 3 });

    expect(res.status).toBe(200);
    expect(res.body.usedDays).toBe(3);
  });
});
