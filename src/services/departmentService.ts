import * as departmentRepository from '../repositories/departmentRepository';

export async function getAllDepartments() {
    return await departmentRepository.findAllDepartments();
}

export async function getDepartmentById(departmentId: number) {
    return await departmentRepository.findDepartmentById(departmentId);
}

export async function createDepartment(data: {
    name: string;
    companyId: number;
}) {
    return await departmentRepository.createDepartment(data);
}

export async function updateDepartment(
    departmentId: number,
    data: { name?: string; companyId?: number },
) {
    return await departmentRepository.updateDepartment(departmentId, data);
}

export async function deleteDepartment(departmentId: number) {
    return await departmentRepository.removeDepartment(departmentId);
}
