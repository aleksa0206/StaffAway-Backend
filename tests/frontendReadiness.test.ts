import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import {
  createTestCompany,
  createTestUser,
  createTestLeaveType,
  createRawLeaveRequest,
  createTestComment,
} from './helpers/testFactory';

async function setupTeam() {
  const company = await createTestCompany();
  const { user: hr } = await createTestUser({ companyId: company.id, role: 'Hr' });
  const { user: manager } = await createTestUser({ companyId: company.id, role: 'Manager' });
  const { user: employee } = await createTestUser({
    companyId: company.id,
    managerId: manager.id,
  });
  const { user: outsider } = await createTestUser({ companyId: company.id });
  const leaveType = await createTestLeaveType(company.id, { countsTowardBalance: false });
  const auth = (user: { id: number; role: string }) =>
    `Bearer ${tokenFor({ id: user.id, role: user.role, companyId: company.id })}`;
  return { company, hr, manager, employee, outsider, leaveType, auth };
}

describe('Phase 0: filters, relations, approval rules', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('GET /leave-requests filters by userId/status and returns user and leave type names', async () => {
    const { company, employee, outsider, leaveType, auth } = await setupTeam();
    await createRawLeaveRequest({
      userId: employee.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });
    await createRawLeaveRequest({
      userId: outsider.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
      status: 'Rejected',
    });

    const res = await request(app)
      .get(`/leave-requests?userId=${employee.id}&status=Pending`)
      .set('Authorization', auth(employee));

    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(1);
    expect(res.body.data[0].user).toEqual({ id: employee.id, firstName: 'Test', lastName: 'User' });
    expect(res.body.data[0].leaveType).toEqual({ id: leaveType.id, name: leaveType.name });
  });

  it("GET /leave-requests?managerId returns only direct reports' requests", async () => {
    const { company, manager, employee, outsider, leaveType, auth } = await setupTeam();
    await createRawLeaveRequest({
      userId: employee.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });
    await createRawLeaveRequest({
      userId: outsider.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });

    const res = await request(app)
      .get(`/leave-requests?managerId=${manager.id}`)
      .set('Authorization', auth(manager));

    expect(res.body.data.map((r: { userId: number }) => r.userId)).toEqual([employee.id]);
  });

  it('an invalid query parameter returns 400 with structured details', async () => {
    const { employee, auth } = await setupTeam();

    const res = await request(app)
      .get('/leave-requests?status=Unknown')
      .set('Authorization', auth(employee));

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual([
      {
        path: 'status',
        message: 'must be a comma-separated list of: Pending, Approval, Rejected, Cancelled',
      },
    ]);
  });

  it('a body validation error returns per-field details', async () => {
    const { employee, auth } = await setupTeam();

    const res = await request(app)
      .post('/leave-requests')
      .set('Authorization', auth(employee))
      .send({ startDate: '2027-06-10', endDate: '2027-06-01', totalDays: 1, leaveTypeId: 1 });

    expect(res.status).toBe(400);
    expect(res.body.details).toEqual([
      { path: 'endDate', message: 'endDate must be on or after startDate' },
    ]);
  });

  it('the direct manager approves and the server sets approvedById', async () => {
    const { company, manager, employee, outsider, leaveType, auth } = await setupTeam();
    const leaveRequest = await createRawLeaveRequest({
      userId: employee.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });

    const res = await request(app)
      .put(`/leave-requests/${leaveRequest.id}`)
      .set('Authorization', auth(manager))
      .send({ status: 'Approval', approvedById: outsider.id });

    expect(res.status).toBe(200);
    expect(res.body.approvedById).toBe(manager.id);
    expect(res.body.approvedBy.id).toBe(manager.id);
  });

  it('a Manager cannot decide on a request from someone outside their team', async () => {
    const { company, manager, outsider, leaveType, auth } = await setupTeam();
    const leaveRequest = await createRawLeaveRequest({
      userId: outsider.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });

    const res = await request(app)
      .put(`/leave-requests/${leaveRequest.id}`)
      .set('Authorization', auth(manager))
      .send({ status: 'Approval' });

    expect(res.status).toBe(403);
  });

  it('nobody, not even Hr, can approve their own request', async () => {
    const { company, hr, leaveType, auth } = await setupTeam();
    const leaveRequest = await createRawLeaveRequest({
      userId: hr.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });

    const res = await request(app)
      .put(`/leave-requests/${leaveRequest.id}`)
      .set('Authorization', auth(hr))
      .send({ status: 'Approval' });

    expect(res.status).toBe(403);
  });

  it('an approved request cannot be edited or deleted (409), only its status can change', async () => {
    const { company, hr, employee, leaveType, auth } = await setupTeam();
    const leaveRequest = await createRawLeaveRequest({
      userId: employee.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
      status: 'Approval',
    });

    const editRes = await request(app)
      .put(`/leave-requests/${leaveRequest.id}`)
      .set('Authorization', auth(employee))
      .send({ endDate: '2027-05-03', totalDays: 3 });
    expect(editRes.status).toBe(409);

    const deleteRes = await request(app)
      .delete(`/leave-requests/${leaveRequest.id}`)
      .set('Authorization', auth(employee));
    expect(deleteRes.status).toBe(409);

    const cancelRes = await request(app)
      .put(`/leave-requests/${leaveRequest.id}`)
      .set('Authorization', auth(hr))
      .send({ status: 'Rejected' });
    expect(cancelRes.status).toBe(200);
  });

  it("commenting on another company's request is forbidden", async () => {
    const { company, employee, leaveType } = await setupTeam();
    const leaveRequest = await createRawLeaveRequest({
      userId: employee.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });
    const otherCompany = await createTestCompany('Other');
    const { user: stranger } = await createTestUser({ companyId: otherCompany.id, role: 'Hr' });
    const strangerToken = tokenFor({
      id: stranger.id,
      role: stranger.role,
      companyId: otherCompany.id,
    });

    const res = await request(app)
      .post('/comments')
      .set('Authorization', `Bearer ${strangerToken}`)
      .send({ leaveRequestId: leaveRequest.id, text: 'intrusion' });

    expect(res.status).toBe(403);
  });

  it("an Employee cannot comment on or attach files to someone else's request, but the owner can comment", async () => {
    const { company, employee, outsider, leaveType, auth } = await setupTeam();
    const leaveRequest = await createRawLeaveRequest({
      userId: employee.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });

    const commentRes = await request(app)
      .post('/comments')
      .set('Authorization', auth(outsider))
      .send({ leaveRequestId: leaveRequest.id, text: 'not mine' });
    expect(commentRes.status).toBe(403);

    const attachmentRes = await request(app)
      .post('/attachments')
      .set('Authorization', auth(outsider))
      .field('leaveRequestId', leaveRequest.id)
      .attach('file', Buffer.from('pdf'), { filename: 'a.pdf', contentType: 'application/pdf' });
    expect(attachmentRes.status).toBe(403);

    const ownRes = await request(app)
      .post('/comments')
      .set('Authorization', auth(employee))
      .send({ leaveRequestId: leaveRequest.id, text: 'mine' });
    expect(ownRes.status).toBe(201);
    expect(ownRes.body.author.id).toBe(employee.id);
  });

  it("GET /comments?leaveRequestId returns only that request's comments, in chronological order", async () => {
    const { company, employee, leaveType, auth } = await setupTeam();
    const first = await createRawLeaveRequest({
      userId: employee.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });
    const second = await createRawLeaveRequest({
      userId: employee.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
      startDate: new Date('2027-06-01'),
      endDate: new Date('2027-06-02'),
    });
    await createTestComment({
      leaveRequestId: first.id,
      authorId: employee.id,
      companyId: company.id,
      text: 'a',
    });
    await createTestComment({
      leaveRequestId: second.id,
      authorId: employee.id,
      companyId: company.id,
    });
    await createTestComment({
      leaveRequestId: first.id,
      authorId: employee.id,
      companyId: company.id,
      text: 'b',
    });

    const res = await request(app)
      .get(`/comments?leaveRequestId=${first.id}`)
      .set('Authorization', auth(employee));

    expect(res.body.data.map((c: { text: string }) => c.text)).toEqual(['a', 'b']);
  });

  it('GET /notifications?isRead=false gives the unread count via meta.total', async () => {
    const { employee, manager, company, leaveType, auth } = await setupTeam();
    const leaveRequest = await createRawLeaveRequest({
      userId: employee.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });
    await request(app)
      .put(`/leave-requests/${leaveRequest.id}`)
      .set('Authorization', auth(manager))
      .send({ status: 'Approval' });

    const res = await request(app)
      .get('/notifications?isRead=false&limit=1')
      .set('Authorization', auth(employee));

    expect(res.body.meta.total).toBe(1);
  });

  it('GET /auth/me returns a safe profile including twoFactorEnabled', async () => {
    const { employee, auth } = await setupTeam();

    const res = await request(app).get('/auth/me').set('Authorization', auth(employee));

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(employee.id);
    expect(res.body.twoFactorEnabled).toBe(false);
    expect(res.body.passwordHash).toBeUndefined();
    expect(res.body.twoFactorSecret).toBeUndefined();
  });
});
