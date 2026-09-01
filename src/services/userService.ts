import bcrypt from 'bcrypt';
import * as userRepository from '../repositories/userRepository';
import { notFound, forbidden } from '../errors/AppError';

export async function getAllUsers(companyId: number) {
  return await userRepository.findAll(companyId);
}

export async function getUserById(userId: number, companyId: number) {
  const user = await userRepository.findById(userId);
  if (!user) throw notFound('User');
  if (user.companyId !== companyId) throw forbidden();
  return user;
}

export async function createUser(
  input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'Employee' | 'Manager' | 'Hr';
    managerId: number | null;
    hireDate: Date;
  },
  requestingUser: { companyId: number; role: string }
) {


  if (requestingUser.role !== 'Hr') {
    throw forbidden('Only Hr can create new users');
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  return await userRepository.create({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    passwordHash,
    role: input.role,
    managerId: input.managerId,
    hireDate: input.hireDate,
    companyId: requestingUser.companyId, // NIKAD iz req.body
  });
}

export async function updateUser(
  targetUserId: number,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: 'Employee' | 'Manager' | 'Hr';
    managerId?: number | null;
    departmentId?: number | null;
    hireDate?: Date;
  },
  requestingUser: { userId: number; companyId: number; role: string }
) {
  const existing = await userRepository.findById(targetUserId);
  if (!existing) throw notFound('User');
  if (existing.companyId !== requestingUser.companyId) throw forbidden();

  const isSelf = requestingUser.userId === targetUserId;
  const isHr = requestingUser.role === 'Hr';

  if (!isSelf && !isHr) {
    throw forbidden('You can only update your own profile');
  }
  if (!isHr && data.role !== undefined) {
    throw forbidden('Only Hr can change roles');
  }

  return await userRepository.update(targetUserId, data);
}

export async function deleteUser(
  targetUserId: number,
  requestingUser: { userId: number; companyId: number; role: string }
) {
  if (requestingUser.role !== 'Hr') {
    throw forbidden('Only Hr can delete users');
  }
  if (requestingUser.userId === targetUserId) {
    throw forbidden('You cannot delete your own account');
  }

  const existing = await userRepository.findById(targetUserId);
  if (!existing) throw notFound('User');
  if (existing.companyId !== requestingUser.companyId) throw forbidden();

  return await userRepository.remove(targetUserId);
}