import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/config/prismaClient';
import { setContainer, resetContainer } from '../src/container';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { createTestCompany, createTestUser } from './helpers/testFactory';

const signUp = {
  companyName: 'Acme',
  firstName: 'Ana',
  lastName: 'Admin',
  email: 'ana@acme.test',
  password: 'password123',
};

describe('Self-service registration', () => {
  let sentTokens: string[];

  beforeEach(() => {
    sentTokens = [];
    const sendVerificationEmail = jest.fn(async (_to: string, token: string) => {
      sentTokens.push(token);
    });
    setContainer({ email: { sendVerificationEmail } as any });
  });

  afterEach(async () => {
    resetContainer();
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('creates the organization, emails a link and only lets the user in once it is used', async () => {
    const res = await request(app).post('/auth/register').send(signUp);
    expect(res.status).toBe(201);
    expect(res.body.token).toBeUndefined();
    expect(sentTokens).toHaveLength(1);

    const user = await prisma.user.findUniqueOrThrow({ where: { email: signUp.email } });
    expect(user).toMatchObject({ role: 'Hr', emailVerified: false });
    const [company, settings, leaveTypes, balances] = await Promise.all([
      prisma.company.findUnique({ where: { id: user.companyId } }),
      prisma.companySettings.findUnique({ where: { companyId: user.companyId } }),
      prisma.leaveType.findMany({ where: { companyId: user.companyId } }),
      prisma.leaveBalance.findMany({ where: { userId: user.id } }),
    ]);
    expect(company?.name).toBe('Acme');
    expect(settings).not.toBeNull();
    expect(leaveTypes).toHaveLength(2);
    expect(balances).toHaveLength(1);

    const loginBefore = await request(app)
      .post('/auth/login')
      .send({ email: signUp.email, password: signUp.password });
    expect(loginBefore.status).toBe(403);

    const verifyRes = await request(app).post('/auth/verify-email').send({ token: sentTokens[0] });
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.token).toBeDefined();
    expect(verifyRes.headers['set-cookie'].some((c: string) => c.startsWith('refreshToken='))).toBe(
      true
    );

    const usersRes = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${verifyRes.body.token}`);
    expect(usersRes.status).toBe(200);
    expect(usersRes.body.data).toHaveLength(1);

    const reuseRes = await request(app).post('/auth/verify-email').send({ token: sentTokens[0] });
    expect(reuseRes.status).toBe(401);

    const loginAfter = await request(app)
      .post('/auth/login')
      .send({ email: signUp.email, password: signUp.password });
    expect(loginAfter.status).toBe(200);
  });

  it('an expired link is refused, and a new one can be requested', async () => {
    await request(app).post('/auth/register').send(signUp);
    await prisma.user.update({
      where: { email: signUp.email },
      data: { emailVerificationExpiresAt: new Date(Date.now() - 1000) },
    });

    const expiredRes = await request(app).post('/auth/verify-email').send({ token: sentTokens[0] });
    expect(expiredRes.status).toBe(401);

    const resendRes = await request(app)
      .post('/auth/resend-verification')
      .send({ email: signUp.email });
    expect(resendRes.status).toBe(200);
    expect(sentTokens).toHaveLength(2);

    const verifyRes = await request(app).post('/auth/verify-email').send({ token: sentTokens[1] });
    expect(verifyRes.status).toBe(200);
  });

  it('resending for an unknown or already verified email sends nothing', async () => {
    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });

    for (const email of [user.email, 'nobody@acme.test']) {
      const res = await request(app).post('/auth/resend-verification').send({ email });
      expect(res.status).toBe(200);
    }
    expect(sentTokens).toHaveLength(0);
  });

  it('the new organization cannot see other tenants', async () => {
    const other = await createTestCompany('Other');
    await createTestUser({ companyId: other.id });

    await request(app).post('/auth/register').send(signUp);
    const verifyRes = await request(app).post('/auth/verify-email').send({ token: sentTokens[0] });
    const usersRes = await request(app)
      .get('/users')
      .set('Authorization', `Bearer ${verifyRes.body.token}`);

    expect(usersRes.body.data.map((u: { email: string }) => u.email)).toEqual([signUp.email]);
  });

  it('an email that is already taken returns 409 and creates nothing', async () => {
    const existing = await createTestCompany('Existing');
    await createTestUser({ companyId: existing.id, email: signUp.email });

    const res = await request(app).post('/auth/register').send(signUp);

    expect(res.status).toBe(409);
    expect(await prisma.company.count()).toBe(1);
    expect(sentTokens).toHaveLength(0);
  });

  it('rejects missing fields and short passwords', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ ...signUp, companyName: '', password: 'short' });

    expect(res.status).toBe(400);
    expect(res.body.details.map((d: { path: string }) => d.path).sort()).toEqual([
      'companyName',
      'password',
    ]);
  });
});
