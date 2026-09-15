import request from 'supertest';
import app from '../src/app';
import { cleanDatabase, disconnectDb } from './helpers/testDb';
import { createTestCompany, createTestUser } from './helpers/testFactory';
import { setContainer, resetContainer } from '../src/container';

describe('Password reset flow', () => {
  afterEach(async () => {
    resetContainer();
    await cleanDatabase();
  });

  afterAll(async () => {
    await disconnectDb();
  });

  it('forgot-password za postojeci email salje token preko email servisa (mock, bez pravog SMTP-a)', async () => {
    const sendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
    setContainer({ email: { sendPasswordResetEmail } as any });

    const company = await createTestCompany();
    const { user } = await createTestUser({ companyId: company.id });

    const res = await request(app).post('/auth/forgot-password').send({ email: user.email });

    expect(res.status).toBe(200);
    expect(sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    expect(sendPasswordResetEmail).toHaveBeenCalledWith(user.email, expect.any(String));
  });

  it('forgot-password za nepostojeci email vraca isti odgovor i NE zove email servis (sprecava enumeraciju)', async () => {
    const sendPasswordResetEmail = jest.fn().mockResolvedValue(undefined);
    setContainer({ email: { sendPasswordResetEmail } as any });

    const res = await request(app)
      .post('/auth/forgot-password')
      .send({ email: 'nepostojeci@test.com' });

    expect(res.status).toBe(200);
    expect(sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it('kompletan flow: forgot-password -> reset-password sa ispravnim tokenom menja lozinku i opoziva refresh tokene', async () => {
    let capturedToken = '';
    const sendPasswordResetEmail = jest.fn().mockImplementation(async (_to: string, token: string) => {
      capturedToken = token;
    });
    setContainer({ email: { sendPasswordResetEmail } as any });

    const company = await createTestCompany();
    const { user, rawPassword } = await createTestUser({ companyId: company.id });

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: rawPassword });
    const oldRefreshCookie = loginRes.headers['set-cookie'];
    expect(oldRefreshCookie).toBeDefined();

    await request(app).post('/auth/forgot-password').send({ email: user.email });
    expect(capturedToken).not.toBe('');

    const newPassword = 'novaLozinka123';
    const resetRes = await request(app)
      .post('/auth/reset-password')
      .send({ token: capturedToken, newPassword });
    expect(resetRes.status).toBe(204);

    const oldPasswordLoginRes = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: rawPassword });
    expect(oldPasswordLoginRes.status).toBe(401);

    const newPasswordLoginRes = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: newPassword });
    expect(newPasswordLoginRes.status).toBe(200);

    const refreshWithOldCookieRes = await request(app)
      .post('/auth/refresh')
      .set('Cookie', oldRefreshCookie);
    expect(refreshWithOldCookieRes.status).toBe(401);
  });

  it('reset-password sa netacnim/izmisljenim tokenom vraca 401 i ne menja lozinku', async () => {
    const company = await createTestCompany();
    const { user, rawPassword } = await createTestUser({ companyId: company.id });

    const resetRes = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'izmisljen-token-koji-ne-postoji', newPassword: 'novaLozinka123' });
    expect(resetRes.status).toBe(401);

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: user.email, password: rawPassword });
    expect(loginRes.status).toBe(200);
  });

  it('reset-password odbija lozinku kracu od 8 karaktera (Zod validacija)', async () => {
    const res = await request(app)
      .post('/auth/reset-password')
      .send({ token: 'bilo-sta', newPassword: 'kratka' });
    expect(res.status).toBe(400);
  });
});
