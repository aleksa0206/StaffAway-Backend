import type { Request, Response } from 'express';
import * as userService from '../services/userServices';
import { handleControllerError } from '../errors/handleControllerError';

export async function getAllUsersHandler(req: Request, res: Response) {
  try {
    const users = await userService.getAllUsers(req.user!.companyId);
    res.json(users);
  } catch (err) {
    handleControllerError(err, res);
  }
}

export async function getUserByIdHandler(req: Request, res: Response) {
  try {
    const userId = Number(req.params.userId);
    const user = await userService.getUserById(userId, req.user!.companyId);
    res.json(user);
  } catch (err) {
    handleControllerError(err, res);
  }
}

export async function createUserHandler(req: Request, res: Response) {
  try {
    const { firstName, lastName, email, password, role, managerId, hireDate } = req.body;

    const newUser = await userService.createUser(
      { firstName, lastName, email, password, role, managerId, hireDate: new Date(hireDate) },
      { companyId: req.user!.companyId, role: req.user!.role }
    );

    res.status(201).json(newUser);
  } catch (err) {
    handleControllerError(err, res);
  }
}

export async function updateUserHandler(req: Request, res: Response) {
  try {
    const targetUserId = Number(req.params.userId);
    const { firstName, lastName, email, role, managerId, departmentId, hireDate } = req.body;

    const updated = await userService.updateUser(
      targetUserId,
      { firstName, lastName, email, role, managerId, departmentId, hireDate: hireDate && new Date(hireDate) },
      { userId: req.user!.userId, companyId: req.user!.companyId, role: req.user!.role }
    );

    res.json(updated);
  } catch (err) {
    handleControllerError(err, res);
  }
}

export async function deleteUserHandler(req: Request, res: Response) {
  try {
    const targetUserId = Number(req.params.userId);
    const deleted = await userService.deleteUser(targetUserId, {
      userId: req.user!.userId,
      companyId: req.user!.companyId,
      role: req.user!.role,
    });
    res.json(deleted);
  } catch (err) {
    handleControllerError(err, res);
  }
}