import * as departmentRepository from '../repositories/departmentRepository';

export async function getAllDepartments() {
    return await departmentRepository.findAll();
}

export async function getDepartmentById(id: number) {
    return await departmentRepository.findById(id);
}

export async function createDepartment(data: {
    name: string;
    companyId: number;
}) {
    return await departmentRepository.create(data);
}

export async function updateDepartment(
    id: number,
    data: { name?: string; companyId?: number },
) {
    return await departmentRepository.update(id, data);
}

export async function deleteDepartment(id: number) {
    return await departmentRepository.remove(id);
}
