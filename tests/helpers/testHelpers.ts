import jwt from 'jsonwebtoken';

export function tokenFor(user: { id: number; role: string; companyId: number }) {
  return jwt.sign(
    { userId: user.id, role: user.role, companyId: user.companyId },
    process.env.JWT_SECRET as string,
    { expiresIn: '15m' }
  );
}
