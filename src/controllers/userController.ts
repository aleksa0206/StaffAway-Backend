import type { Request, Response, NextFunction } from 'express';
import * as userService from '../services/userService';
import { buildPaginationMeta, parsePagination } from '../utils/pagination';
import { USER_SORTS } from '../repositories/userRepository';
import {
  parseOptionalEnumQuery,
  parseOptionalIdQuery,
  parseOptionalSearchQuery,
} from '../utils/queryParams';

const ROLES = ['Employee', 'Manager', 'Hr'] as const;

export async function getAllUsersHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const pagination = parsePagination(req);
    const filters = {
      managerId: parseOptionalIdQuery(req, 'managerId'),
      departmentId: parseOptionalIdQuery(req, 'departmentId'),
      role: parseOptionalEnumQuery(req, 'role', ROLES),
      search: parseOptionalSearchQuery(req, 'search'),
      sort: parseOptionalEnumQuery(req, 'sort', USER_SORTS),
    };
    const { data, total } = await userService.getAllUsers(req.user!.companyId, filters, pagination);
    res.json({ data, meta: buildPaginationMeta(total, pagination.page, pagination.limit) });
  } catch (err) {
    next(err);
  }
}

export async function getUserByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = Number(req.params.userId);
    const user = await userService.getUserById(userId, req.user!.companyId);
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function createUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { firstName, lastName, email, password, role, managerId, hireDate } = req.body;
    const newUser = await userService.createUser(
      { firstName, lastName, email, password, role, managerId, hireDate: new Date(hireDate) },
      { companyId: req.user!.companyId, role: req.user!.role }
    );
    res.status(201).json(newUser);
  } catch (err) {
    next(err);
  }
}

export async function updateUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const targetUserId = Number(req.params.userId);
    const { firstName, lastName, email, role, managerId, departmentId, hireDate } = req.body;
    const updated = await userService.updateUser(
      targetUserId,
      {
        firstName,
        lastName,
        email,
        role,
        managerId,
        departmentId,
        hireDate: hireDate && new Date(hireDate),
      },
      { userId: req.user!.userId, companyId: req.user!.companyId, role: req.user!.role }
    );
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

export async function deleteUserHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const targetUserId = Number(req.params.userId);
    const deleted = await userService.deleteUser(targetUserId, {
      userId: req.user!.userId,
      companyId: req.user!.companyId,
      role: req.user!.role,
    });
    res.json(deleted);
  } catch (err) {
    next(err);
  }
}
