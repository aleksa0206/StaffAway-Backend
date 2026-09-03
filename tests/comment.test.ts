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

describe('Comment', () => {
  afterEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('vlasnik firme vidi komentar', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const leaveType = await createTestLeaveType(company.id);
    const leaveRequest = await createRawLeaveRequest({ userId: user.id, leaveTypeId: leaveType.id, companyId: company.id });
    const comment = await createTestComment({ leaveRequestId: leaveRequest.id, authorId: user.id, companyId: company.id });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).get(`/comments/${comment.id}`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('korisnik druge firme ne vidi tudji komentar (403)', async () => {
    const companyA = await createTestCompany('A');
    const companyB = await createTestCompany('B');
    const { user: userA } = await createTestUser({ companyId: companyA.id });
    const { user: userB } = await createTestUser({ companyId: companyB.id });
    const leaveType = await createTestLeaveType(companyA.id);
    const leaveRequest = await createRawLeaveRequest({ userId: userA.id, leaveTypeId: leaveType.id, companyId: companyA.id });
    const comment = await createTestComment({ leaveRequestId: leaveRequest.id, authorId: userA.id, companyId: companyA.id });
    const tokenB = tokenFor({ id: userB.id, role: userB.role, companyId: companyB.id });

    const res = await request(app).get(`/comments/${comment.id}`).set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
  });

  it('vlasnik moze da azurira sopstveni komentar', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const leaveType = await createTestLeaveType(company.id);
    const leaveRequest = await createRawLeaveRequest({ userId: user.id, leaveTypeId: leaveType.id, companyId: company.id });
    const comment = await createTestComment({ leaveRequestId: leaveRequest.id, authorId: user.id, companyId: company.id });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .put(`/comments/${comment.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Izmenjeno' });

    expect(res.status).toBe(200);
    expect(res.body.text).toBe('Izmenjeno');
  });

  it('nepostojeci komentar vraca 404', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app).delete('/comments/999999').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
