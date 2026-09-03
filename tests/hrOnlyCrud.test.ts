import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { tokenFor } from './helpers/testHelpers';
import {
  createTestCompany,
  createTestUser,
  createTestDepartment,
  createTestHoliday,
  createTestWorkSchedule,
  createTestLeaveType,
} from './helpers/testFactory';

type ResourceCase = {
  name: string;
  basePath: string;
  createPayload: (ctx: { userId: number }) => Record<string, unknown>;
  seed: (companyId: number, userId: number) => Promise<{ id: number }>;
};

describe('Resursi ogranicени samo na Hr rolu (Department, LeaveType, Holiday, WorkSchedule)', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  const cases: ResourceCase[] = [
    {
      name: 'Department',
      basePath: '/departments',
      createPayload: () => ({ name: 'Sales' }),
      seed: (companyId) => createTestDepartment(companyId),
    },
    {
      name: 'LeaveType',
      basePath: '/leave-types',
      createPayload: () => ({ name: 'Sick Leave', requiresApproval: true, countsTowardBalance: true }),
      seed: (companyId) => createTestLeaveType(companyId),
    },
    {
      name: 'Holiday',
      basePath: '/holidays',
      createPayload: () => ({ name: 'Christmas', date: '2027-12-25', isRecurring: true }),
      seed: (companyId) => createTestHoliday(companyId),
    },
    {
      name: 'WorkSchedule',
      basePath: '/work-schedules',
      createPayload: (ctx) => ({ userId: ctx.userId, hoursPerWeek: 40, isPartTime: false }),
      seed: (companyId, userId) => createTestWorkSchedule({ userId, companyId }),
    },
  ];

  describe.each(cases)('$name', ({ basePath, createPayload, seed }) => {
    it('GET je dozvoljen Employee roli', async () => {
      const company = await createTestCompany();
      const { user } = await createTestUser({ companyId: company.id, role: 'Employee' });
      await seed(company.id, user.id);
      const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

      const res = await request(app).get(basePath).set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
    });

    it('POST vraca 403 za Employee rolu', async () => {
      const company = await createTestCompany();
      const { user } = await createTestUser({ companyId: company.id, role: 'Employee' });
      const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

      const res = await request(app)
        .post(basePath)
        .set('Authorization', `Bearer ${token}`)
        .send(createPayload({ userId: user.id }));

      expect(res.status).toBe(403);
    });

    it('POST uspeva za Hr rolu', async () => {
      const company = await createTestCompany();
      const { user } = await createTestUser({ companyId: company.id, role: 'Hr' });
      const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

      const res = await request(app)
        .post(basePath)
        .set('Authorization', `Bearer ${token}`)
        .send(createPayload({ userId: user.id }));

      expect(res.status).toBe(201);
    });

    it('DELETE vraca 403 za Manager rolu', async () => {
      const company = await createTestCompany();
      const { user } = await createTestUser({ companyId: company.id, role: 'Manager' });
      const seeded = await seed(company.id, user.id);
      const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

      const res = await request(app)
        .delete(`${basePath}/${seeded.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(403);
    });
  });
});
