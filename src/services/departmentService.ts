import * as departmentRepository from '../repositories/departmentRepository';

export async function getAllDepartments(companyId: number) {
    return await departmentRepository.findAllDepartments(companyId);
}

export async function getDepartmentById(
    departmentId: number,
    companyId: number,
) {
    const department =
        await departmentRepository.findDepartmentById(departmentId);

    if (!department || department.companyId !== companyId) {
        return null;
    }

    return department;
}

export async function createDepartment(data: {
    name: string;
    companyId: number;
}) {
    return await departmentRepository.createDepartment(data);
}
export async function updateDepartment(
    departmentId: number,
    companyId: number,
    data: { name?: string },
) {
    const department =
        await departmentRepository.findDepartmentById(departmentId);

    if (!department) {
        throw new Error('Odeljenje ne postoji');
    }

    if (department.companyId !== companyId) {
        throw new Error('Nemate pravo pristupa ovom odeljenju');
    }

    return await departmentRepository.updateDepartment(departmentId, data);
}


export async function deleteDepartment(
    departmentId: number,
    companyId: number,
) {
    const department =
        await departmentRepository.findDepartmentById(departmentId);
    if (!department) {
        throw new Error('Odeljenje ne postoji');
    }
    if (department.companyId !== companyId) {
        throw new Error('Nemate pravo pristupa ovom odeljenju');
    }
    return await departmentRepository.removeDepartment(departmentId);
}
