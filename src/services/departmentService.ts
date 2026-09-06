import * as departmentRepository from '../repositories/departmentRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';

export async function getAllDepartments(
  companyId: number,
  pagination: { skip: number; take: number }
) {
  return await departmentRepository.findAllDepartments(companyId, pagination);
}

export async function getDepartmentById(departmentId: number, companyId: number) {
  const department = await departmentRepository.findDepartmentById(departmentId);

  if (!department) throw new NotFoundError('Department');
  if (department.companyId !== companyId) throw new ForbiddenError();

  return department;
}

export async function createDepartment(data: { name: string; companyId: number }) {
  return await departmentRepository.createDepartment(data);
}

export async function updateDepartment(
  departmentId: number,
  companyId: number,
  data: { name?: string }
) {
  const department = await departmentRepository.findDepartmentById(departmentId);

  if (!department) throw new NotFoundError('Department');
  if (department.companyId !== companyId) throw new ForbiddenError();

  return await departmentRepository.updateDepartment(departmentId, data);
}

export async function deleteDepartment(departmentId: number, companyId: number) {
  const department = await departmentRepository.findDepartmentById(departmentId);

  if (!department) throw new NotFoundError('Department');
  if (department.companyId !== companyId) throw new ForbiddenError();

  return await departmentRepository.removeDepartment(departmentId);
}
