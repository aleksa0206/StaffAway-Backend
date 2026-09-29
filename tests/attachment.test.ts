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
} from './helpers/testFactory';

describe('Attachment', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('a user of the owning company can view the attachment', async () => {
    const companyA = await createTestCompany('A');
    const { user } = await createTestUser({ companyId: companyA.id });
    const leaveType = await createTestLeaveType(companyA.id);
    const leaveRequest = await createRawLeaveRequest({
      userId: user.id,
      leaveTypeId: leaveType.id,
      companyId: companyA.id,
    });
    const attachment = await createTestAttachment(leaveRequest.id);
    const token = tokenFor({ id: user.id, role: user.role, companyId: companyA.id });

    const res = await request(app)
      .get(`/attachments/${attachment.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it("a user cannot attach a file to another company's leave request (403)", async () => {
    const companyA = await createTestCompany('A');
    const companyB = await createTestCompany('B');
    const { user: userA } = await createTestUser({ companyId: companyA.id });
    const { user: userB } = await createTestUser({ companyId: companyB.id });
    const leaveType = await createTestLeaveType(companyA.id);
    const leaveRequest = await createRawLeaveRequest({
      userId: userA.id,
      leaveTypeId: leaveType.id,
      companyId: companyA.id,
    });
    const tokenB = tokenFor({ id: userB.id, role: userB.role, companyId: companyB.id });

    const res = await request(app)
      .post('/attachments')
      .set('Authorization', `Bearer ${tokenB}`)
      .field('leaveRequestId', leaveRequest.id)
      .attach('file', Buffer.from('test pdf content'), {
        filename: 'test.pdf',
        contentType: 'application/pdf',
      });

    expect(res.status).toBe(403);
  });

  it('a non-existent attachment returns 404', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .get('/attachments/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('the owner can delete an attachment; GET returns 404 afterwards', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const leaveType = await createTestLeaveType(company.id);
    const leaveRequest = await createRawLeaveRequest({
      userId: user.id,
      leaveTypeId: leaveType.id,
      companyId: company.id,
    });
    const attachment = await createTestAttachment(leaveRequest.id);
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const delRes = await request(app)
      .delete(`/attachments/${attachment.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(200);

    const getRes = await request(app)
      .get(`/attachments/${attachment.id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(getRes.status).toBe(404);
  });
});
