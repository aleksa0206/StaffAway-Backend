import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prismaClient';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import {
  createRawLeaveRequest,
  createTestComment,
  createTestCompany,
  createTestDepartment,
  createTestLeaveBalance,
  createTestLeaveType,
  createTestUser,
} from './helpers/testFactory';

async function setup() {
  const company = await createTestCompany();
  const department = await createTestDepartment(company.id);
  const { user: hr } = await createTestUser({ companyId: company.id, role: 'Hr' });
  const { user: manager } = await createTestUser({ companyId: company.id, role: 'Manager' });
  const { user: employee } = await createTestUser({ companyId: company.id, managerId: manager.id });
  const { user: colleague } = await createTestUser({
    companyId: company.id,
    managerId: manager.id,
  });
  await prisma.user.update({ where: { id: employee.id }, data: { departmentId: department.id } });
  const annual = await createTestLeaveType(company.id, { countsTowardBalance: true });
  const auth = (user: { id: number; role: string }) =>
    `Bearer ${tokenFor({ id: user.id, role: user.role, companyId: company.id })}`;
  return { company, department, hr, manager, employee, colleague, annual, auth };
}

const d = (value: string) => new Date(`${value}T00:00:00.000Z`);

describe('Team calendar and leave workflow', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('GET /leave-requests?from&to returns only requests overlapping the range', async () => {
    const { company, employee, annual, auth } = await setup();
    const base = { userId: employee.id, leaveTypeId: annual.id, companyId: company.id };
    const before = await createRawLeaveRequest({
      ...base,
      startDate: d('2027-05-01'),
      endDate: d('2027-05-05'),
    });
    const spanning = await createRawLeaveRequest({
      ...base,
      startDate: d('2027-05-28'),
      endDate: d('2027-06-03'),
    });
    const inside = await createRawLeaveRequest({
      ...base,
      startDate: d('2027-06-10'),
      endDate: d('2027-06-11'),
    });
    await createRawLeaveRequest({ ...base, startDate: d('2027-07-01'), endDate: d('2027-07-02') });

    const res = await request(app)
      .get('/leave-requests?from=2027-06-01&to=2027-06-30&sort=startDate')
      .set('Authorization', auth(employee));

    expect(res.status).toBe(200);
    expect(res.body.data.map((r: { id: number }) => r.id)).toEqual([spanning.id, inside.id]);
    expect(res.body.data.map((r: { id: number }) => r.id)).not.toContain(before.id);
  });

  it('GET /leave-requests filters by several statuses and by department', async () => {
    const { company, employee, colleague, department, annual, auth } = await setup();
    const base = { leaveTypeId: annual.id, companyId: company.id };
    const pending = await createRawLeaveRequest({ ...base, userId: employee.id });
    await createRawLeaveRequest({
      ...base,
      userId: employee.id,
      status: 'Rejected',
      startDate: d('2027-08-01'),
      endDate: d('2027-08-02'),
    });
    await createRawLeaveRequest({ ...base, userId: colleague.id });

    const res = await request(app)
      .get(`/leave-requests?status=Pending,Approval&departmentId=${department.id}`)
      .set('Authorization', auth(employee));

    expect(res.body.data.map((r: { id: number }) => r.id)).toEqual([pending.id]);
  });

  it('rejects a malformed date filter with 400', async () => {
    const { employee, auth } = await setup();
    const res = await request(app)
      .get('/leave-requests?from=01.06.2027')
      .set('Authorization', auth(employee));
    expect(res.status).toBe(400);
  });

  it('GET /users supports search, role and sort', async () => {
    const { hr, manager, auth } = await setup();
    await prisma.user.update({ where: { id: manager.id }, data: { lastName: 'Zimmermann' } });

    const byRole = await request(app).get('/users?role=Manager').set('Authorization', auth(hr));
    expect(byRole.body.data.map((u: { id: number }) => u.id)).toEqual([manager.id]);

    const bySearch = await request(app).get('/users?search=zimmer').set('Authorization', auth(hr));
    expect(bySearch.body.data.map((u: { id: number }) => u.id)).toEqual([manager.id]);

    const sorted = await request(app).get('/users?sort=-name').set('Authorization', auth(hr));
    expect(sorted.body.data[0].id).toBe(manager.id);
  });

  it('GET /leave-balances?userIds loads balances for several users at once', async () => {
    const { company, employee, colleague, hr, annual, auth } = await setup();
    await createTestLeaveBalance({
      userId: employee.id,
      leaveTypeId: annual.id,
      companyId: company.id,
    });
    await createTestLeaveBalance({
      userId: colleague.id,
      leaveTypeId: annual.id,
      companyId: company.id,
    });
    await createTestLeaveBalance({ userId: hr.id, leaveTypeId: annual.id, companyId: company.id });

    const res = await request(app)
      .get(`/leave-balances?userIds=${employee.id},${colleague.id}`)
      .set('Authorization', auth(hr));

    expect(res.body.data.map((b: { userId: number }) => b.userId).sort()).toEqual(
      [employee.id, colleague.id].sort()
    );
  });

  it('a leave type that does not require approval is approved on submission and uses the balance', async () => {
    const { company, employee, auth } = await setup();
    const sick = await createTestLeaveType(company.id, {
      name: 'Sick leave',
      requiresApproval: false,
      countsTowardBalance: true,
    });
    await createTestLeaveBalance({
      userId: employee.id,
      leaveTypeId: sick.id,
      companyId: company.id,
      year: 2027,
    });

    const res = await request(app)
      .post('/leave-requests')
      .set('Authorization', auth(employee))
      .send({ startDate: '2027-09-06', endDate: '2027-09-07', totalDays: 2, leaveTypeId: sick.id });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('Approval');
    const balance = await prisma.leaveBalance.findFirst({
      where: { userId: employee.id, leaveTypeId: sick.id },
    });
    expect(balance?.usedDays).toBe(2);
  });

  it('notifies the manager when a request is submitted', async () => {
    const { employee, manager, annual, auth } = await setup();

    await request(app).post('/leave-requests').set('Authorization', auth(employee)).send({
      startDate: '2027-09-06',
      endDate: '2027-09-07',
      totalDays: 2,
      leaveTypeId: annual.id,
    });

    const notifications = await prisma.notification.findMany({ where: { userId: manager.id } });
    expect(notifications.map((n) => n.type)).toEqual(['LeaveRequestSubmitted']);
  });

  it('rejects a leave type from another company', async () => {
    const { employee, auth } = await setup();
    const other = await createTestCompany('Other');
    const foreignType = await createTestLeaveType(other.id);

    const res = await request(app)
      .post('/leave-requests')
      .set('Authorization', auth(employee))
      .send({
        startDate: '2027-09-06',
        endDate: '2027-09-07',
        totalDays: 2,
        leaveTypeId: foreignType.id,
      });

    expect(res.status).toBe(404);
  });

  it('the owner can cancel an approved future request, which returns the days to the balance', async () => {
    const { company, employee, annual, auth } = await setup();
    await createTestLeaveBalance({
      userId: employee.id,
      leaveTypeId: annual.id,
      companyId: company.id,
      year: 2027,
      usedDays: 5,
    });
    const approved = await createRawLeaveRequest({
      userId: employee.id,
      leaveTypeId: annual.id,
      companyId: company.id,
      status: 'Approval',
      totalDays: 5,
    });

    const res = await request(app)
      .put(`/leave-requests/${approved.id}`)
      .set('Authorization', auth(employee))
      .send({ status: 'Cancelled' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('Cancelled');
    const balance = await prisma.leaveBalance.findFirst({ where: { userId: employee.id } });
    expect(balance?.usedDays).toBe(0);

    const again = await request(app)
      .put(`/leave-requests/${approved.id}`)
      .set('Authorization', auth(employee))
      .send({ status: 'Pending' });
    expect(again.status).toBe(409);
  });

  it('only the owner can cancel, and not after the leave has started', async () => {
    const { company, employee, manager, annual, auth } = await setup();
    const future = await createRawLeaveRequest({
      userId: employee.id,
      leaveTypeId: annual.id,
      companyId: company.id,
    });
    const started = await createRawLeaveRequest({
      userId: employee.id,
      leaveTypeId: annual.id,
      companyId: company.id,
      startDate: d('2020-01-01'),
      endDate: d('2020-01-02'),
      totalDays: 2,
    });

    const byManager = await request(app)
      .put(`/leave-requests/${future.id}`)
      .set('Authorization', auth(manager))
      .send({ status: 'Cancelled' });
    expect(byManager.status).toBe(403);

    const tooLate = await request(app)
      .put(`/leave-requests/${started.id}`)
      .set('Authorization', auth(employee))
      .send({ status: 'Cancelled' });
    expect(tooLate.status).toBe(409);
  });

  it('a cancelled request no longer blocks new requests for the same dates', async () => {
    const { company, employee, annual, auth } = await setup();
    await createRawLeaveRequest({
      userId: employee.id,
      leaveTypeId: annual.id,
      companyId: company.id,
      status: 'Cancelled',
      startDate: d('2027-10-04'),
      endDate: d('2027-10-05'),
      totalDays: 2,
    });

    const res = await request(app)
      .post('/leave-requests')
      .set('Authorization', auth(employee))
      .send({
        startDate: '2027-10-04',
        endDate: '2027-10-05',
        totalDays: 2,
        leaveTypeId: annual.id,
      });

    expect(res.status).toBe(201);
  });

  it("hides a colleague's note and comments from an Employee, but not from the manager", async () => {
    const { company, employee, colleague, manager, annual, auth } = await setup();
    const colleagueRequest = await prisma.leaveRequest.create({
      data: {
        userId: colleague.id,
        leaveTypeId: annual.id,
        companyId: company.id,
        status: 'Pending',
        startDate: d('2027-11-01'),
        endDate: d('2027-11-02'),
        totalDays: 2,
        comment: 'Medical appointment',
      },
    });
    await createTestComment({
      leaveRequestId: colleagueRequest.id,
      authorId: colleague.id,
      companyId: company.id,
    });

    const asEmployee = await request(app)
      .get(`/leave-requests/${colleagueRequest.id}`)
      .set('Authorization', auth(employee));
    expect(asEmployee.body.comment).toBeNull();

    const asManager = await request(app)
      .get(`/leave-requests/${colleagueRequest.id}`)
      .set('Authorization', auth(manager));
    expect(asManager.body.comment).toBe('Medical appointment');

    const comments = await request(app)
      .get(`/comments?leaveRequestId=${colleagueRequest.id}`)
      .set('Authorization', auth(employee));
    expect(comments.body.meta.total).toBe(0);
  });
});
