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

  it('vlasnik firme moze da vidi attachment', async () => {
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

  it('korisnik iz druge firme ne moze da vidi tudji attachment (403)', async () => {
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
    const attachment = await createTestAttachment(leaveRequest.id);
    const tokenB = tokenFor({ id: userB.id, role: userB.role, companyId: companyB.id });

    const res = await request(app)
      .get(`/attachments/${attachment.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(403);
  });

  it('nepostojeci attachment vraca 404', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });
    const token = tokenFor({ id: user.id, role: user.role, companyId: company.id });

    const res = await request(app)
      .get('/attachments/999999')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });

  it('korisnik ne sme da zakaci fajl na leaveRequest tudje firme (403)', async () => {
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
      .send({ leaveRequestId: leaveRequest.id, fileName: 'x.pdf', filePath: '/x.pdf' });

    expect(res.status).toBe(403);
  });

  it('vlasnik moze da obrise attachment, posle brisanja GET vraca 404', async () => {
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
