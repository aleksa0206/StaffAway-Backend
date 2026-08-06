import type { Request, Response } from 'express';
import * as userService from '../services/userServices';

export async function getAllUsersHandler(req: Request, res: Response) {
    try {
        const users = await userService.getAllUsers();
        res.json(users);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}

export async function createUserHandler(req: Request, res: Response) {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            role,
            managerId,
            hireDate,
            companyId,
        } = req.body;

        const newUser = await userService.createUser({
            firstName,
            lastName,
            email,
            password,
            role,
            managerId,
            hireDate: new Date(hireDate),
            companyId,
        });

        res.status(201).json(newUser);
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
}
