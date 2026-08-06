import bcrypt from 'bcrypt';
import * as userRepository from '../repositories/userRepository';

export async function getAllUsers() {
    return await userRepository.findAll();
}

export async function createUser(input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: 'Employee' | 'Manager' | 'Hr';
    managerId: number | null;
    hireDate: Date;
    companyId: number;
}) {
    const passwordHash = await bcrypt.hash(input.password, 10);

    return await userRepository.create({
        firstName: input.firstName,
        lastName: input.lastName,
        email: input.email,
        passwordHash,
        role: input.role,
        managerId: input.managerId,
        hireDate: input.hireDate,
        companyId: input.companyId
    });
}
