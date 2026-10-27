import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prismaClient';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import {
  createRawLeaveRequest,
  createTestCompany,
  createTestLeaveBalance,
  createTestLeaveType,
  createTestUser,
} from './helpers/testFactory';

const auth = (user: { id: number; role: string; companyId: number }) => `Bearer ${tokenFor(user)}`;

async function loginWithTwoFactor() {
  const company = await createTestCompany();
  const { user, rawPassword } = await createTestUser({ companyId: company.id });
  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabled: true, twoFactorSecret: 'MOCKSECRET' },
  });
  const loginRes = await request(app)
    .post('/auth/login')
    .send({ email: user.email, password: rawPassword });
  return { user, rawPassword, tempToken: loginRes.body.tempToken as string };
}

async function setupTeam() {
  const company = await createTestCompany();
  const { user: hr } = await createTestUser({ companyId: company.id, role: 'Hr' });
  const { user: manager } = await createTestUser({ companyId: company.id, role: 'Manager' });
  const { user: otherManager } = await createTestUser({ companyId: company.id, role: 'Manager' });
  const { user: employee } = await createTestUser({
    companyId: company.id,
    role: 'Employee',
    managerId: manager.id,
  });
  const leaveType = await createTestLeaveType(company.id);
  return { company, hr, manager, otherManager, employee, leaveType };
}

describe('Fixes from the code review', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  describe('2FA', () => {
    it('the 2FA temp token is not accepted as an access token', async () => {
      const { tempToken } = await loginWithTwoFactor();
      expect(tempToken).toBeDefined();

      const usersRes = await request(app).get('/users').set('Authorization', `Bearer ${tempToken}`);
      expect(usersRes.status).toBe(401);

      const setupRes = await request(app)
        .post('/auth/2fa/setup')
        .set('Authorization', `Bearer ${tempToken}`);
      expect(setupRes.status).toBe(401);
    });

    it('setup cannot replace the secret while 2FA is enabled', async () => {
      const { user } = await loginWithTwoFactor();

      const res = await request(app).post('/auth/2fa/setup').set('Authorization', auth(user));

      expect(res.status).toBe(409);
      const stored = await prisma.user.findUnique({ where: { id: user.id } });
      expect(stored?.twoFactorSecret).toBe('MOCKSECRET');
    });

    it('a code cannot log in twice', async () => {
      const { user, rawPassword, tempToken } = await loginWithTwoFactor();

      const first = await request(app)
        .post('/auth/2fa/verify-login')
        .send({ tempToken, code: '123456' });
      expect(first.status).toBe(200);

      const secondLogin = await request(app)
        .post('/auth/login')
        .send({ email: user.email, password: rawPassword });
      const second = await request(app)
        .post('/auth/2fa/verify-login')
        .send({ tempToken: secondLogin.body.tempToken, code: '123456' });
      expect(second.status).toBe(401);
    });

    it('wrong codes lock the account like wrong passwords', async () => {
      const { tempToken } = await loginWithTwoFactor();

      const statuses: number[] = [];
      for (let i = 0; i < 6; i++) {
        const res = await request(app)
          .post('/auth/2fa/verify-login')
          .send({ tempToken, code: '000000' });
        statuses.push(res.status);
      }

      expect(statuses).toEqual([401, 401, 401, 401, 423, 423]);
    });
  });

  it('a rotated refresh token used again later revokes every session of that user', async () => {
    const company = await createTestCompany();
    const { user, rawPassword } = await createTestUser({ companyId: company.id });
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: rawPassword });
    const oldCookies = loginRes.headers['set-cookie'];

    const refreshRes = await request(app).post('/auth/refresh').set('Cookie', oldCookies);
    const newCookies = refreshRes.headers['set-cookie'];
    // Pretend the rotation happened long enough ago to rule out two tabs racing.
    await prisma.refreshToken.updateMany({
      where: { userId: user.id, revoked: true },
      data: { updatedAt: new Date(Date.now() - 5 * 60 * 1000) },
    });

    const replayRes = await request(app).post('/auth/refresh').set('Cookie', oldCookies);
    expect(replayRes.status).toBe(401);

    const legitimateRes = await request(app).post('/auth/refresh').set('Cookie', newCookies);
    expect(legitimateRes.status).toBe(401);
  });

  it('a user can rename themselves but not pick their own manager', async () => {
    const { otherManager, employee } = await setupTeam();

    const renameRes = await request(app)
      .put(`/users/${employee.id}`)
      .set('Authorization', auth(employee))
      .send({ firstName: 'Renamed', email: employee.email, managerId: employee.managerId });
    expect(renameRes.status).toBe(200);
    expect(renameRes.body.firstName).toBe('Renamed');

    const managerRes = await request(app)
      .put(`/users/${employee.id}`)
      .set('Authorization', auth(employee))
      .send({ managerId: otherManager.id });
    expect(managerRes.status).toBe(403);
  });

  describe('leave approval', () => {
    it('two concurrent approvals count the days once', async () => {
      const { company, hr, manager, employee, leaveType } = await setupTeam();
      const balance = await createTestLeaveBalance({
        userId: employee.id,
        leaveTypeId: leaveType.id,
        companyId: company.id,
        year: 2027,
      });
      const leaveRequest = await createRawLeaveRequest({
        userId: employee.id,
        leaveTypeId: leaveType.id,
        companyId: company.id,
      });

      const results = await Promise.all(
        [hr, manager].map((decider) =>
          request(app)
            .put(`/leave-requests/${leaveRequest.id}`)
            .set('Authorization', auth(decider))
            .send({ status: 'Approval' })
        )
      );

      expect(results.map((r) => r.status).sort()).toEqual([200, 409]);
      const after = await prisma.leaveBalance.findUnique({ where: { id: balance.id } });
      expect(after?.usedDays).toBe(5);
    });

    it('approval is refused when it would exceed the balance', async () => {
      const { company, hr, employee, leaveType } = await setupTeam();
      await createTestLeaveBalance({
        userId: employee.id,
        leaveTypeId: leaveType.id,
        companyId: company.id,
        year: 2027,
        totalDays: 20,
        usedDays: 18,
      });
      const leaveRequest = await createRawLeaveRequest({
        userId: employee.id,
        leaveTypeId: leaveType.id,
        companyId: company.id,
      });

      const res = await request(app)
        .put(`/leave-requests/${leaveRequest.id}`)
        .set('Authorization', auth(hr))
        .send({ status: 'Approval' });

      expect(res.status).toBe(409);
    });

    it('a missing balance for the leave year is created from the company default', async () => {
      const { company, hr, employee, leaveType } = await setupTeam();
      const leaveRequest = await createRawLeaveRequest({
        userId: employee.id,
        leaveTypeId: leaveType.id,
        companyId: company.id,
      });

      const res = await request(app)
        .put(`/leave-requests/${leaveRequest.id}`)
        .set('Authorization', auth(hr))
        .send({ status: 'Approval' });

      expect(res.status).toBe(200);
      const balance = await prisma.leaveBalance.findFirst({
        where: { userId: employee.id, year: 2027 },
      });
      expect(balance).toMatchObject({ totalDays: 20, usedDays: 5 });
    });

    it("a manager cannot edit or delete requests of someone else's report", async () => {
      const { company, otherManager, employee, leaveType } = await setupTeam();
      const leaveRequest = await createRawLeaveRequest({
        userId: employee.id,
        leaveTypeId: leaveType.id,
        companyId: company.id,
      });

      const editRes = await request(app)
        .put(`/leave-requests/${leaveRequest.id}`)
        .set('Authorization', auth(otherManager))
        .send({ comment: 'changed' });
      expect(editRes.status).toBe(403);

      const deleteRes = await request(app)
        .delete(`/leave-requests/${leaveRequest.id}`)
        .set('Authorization', auth(otherManager));
      expect(deleteRes.status).toBe(403);
    });
  });

  it('employees only see their own balances, managers also their reports', async () => {
    const { company, manager, otherManager, employee, leaveType } = await setupTeam();
    const own = await createTestLeaveBalance({
      userId: employee.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });
    const foreign = await createTestLeaveBalance({
      userId: otherManager.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });

    const listRes = await request(app).get('/leave-balances').set('Authorization', auth(employee));
    expect(listRes.body.data.map((b: { id: number }) => b.id)).toEqual([own.id]);

    const foreignRes = await request(app)
      .get(`/leave-balances/${foreign.id}`)
      .set('Authorization', auth(employee));
    expect(foreignRes.status).toBe(403);

    const managerRes = await request(app)
      .get(`/leave-balances?userIds=${employee.id},${otherManager.id}`)
      .set('Authorization', auth(manager));
    expect(managerRes.body.data.map((b: { id: number }) => b.id)).toEqual([own.id]);
  });

  it('a notification can only be marked read, not rewritten', async () => {
    const { employee } = await setupTeam();
    const notification = await prisma.notification.create({
      data: { userId: employee.id, message: 'Original', type: 'General' },
    });

    const res = await request(app)
      .put(`/notifications/${notification.id}`)
      .set('Authorization', auth(employee))
      .send({ isRead: true, message: 'Your leave request has been approved.' });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ isRead: true, message: 'Original' });
  });

  it('an upload whose content does not match its type is rejected', async () => {
    const { company, employee, leaveType } = await setupTeam();
    const leaveRequest = await createRawLeaveRequest({
      userId: employee.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });

    const fake = await request(app)
      .post('/attachments')
      .set('Authorization', auth(employee))
      .field('leaveRequestId', leaveRequest.id)
      .attach('file', Buffer.from('<html>not a pdf</html>'), {
        filename: 'a.pdf',
        contentType: 'application/pdf',
      });
    expect(fake.status).toBe(400);

    const real = await request(app)
      .post('/attachments')
      .set('Authorization', auth(employee))
      .field('leaveRequestId', leaveRequest.id)
      .attach('file', Buffer.from('%PDF-1.7 content'), {
        filename: 'a.pdf',
        contentType: 'application/pdf',
      });
    expect(real.status).toBe(201);
  });
});
