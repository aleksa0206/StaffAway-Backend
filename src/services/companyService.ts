import * as companyRepository from '../repositories/companyRepository';
import * as auditLogRepository from '../repositories/auditLogRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { PLATFORM_COMPANY_ID } from '../config/constants';

function assertPlatformAdmin(companyId: number, role: string) {
  if (companyId !== PLATFORM_COMPANY_ID || role !== 'Hr') {
    throw new ForbiddenError('Only platform administrators can perform this action');
  }
}

export async function getAllCompanies(
  requestingCompanyId: number,
  role: string,
  pagination: { skip: number; take: number }
) {
  assertPlatformAdmin(requestingCompanyId, role);
  return await companyRepository.findAllCompanies(pagination);
}

export async function getOwnCompany(companyId: number) {
  const company = await companyRepository.findCompanyById(companyId);
  if (!company) {
    throw new NotFoundError('Company');
  }
  return company;
}

export async function createCompany(
  data: { name: string },
  requestingCompanyId: number,
  role: string
) {
  assertPlatformAdmin(requestingCompanyId, role);
  return await companyRepository.createCompany(data);
}

export async function updateOwnCompany(
  companyId: number,
  data: { name?: string },
  role: string,
  performedById: number
) {
  if (role !== 'Hr') {
    throw new ForbiddenError('Only Hr role can update the company');
  }

  const existing = await companyRepository.findCompanyById(companyId);
  if (!existing) {
    throw new NotFoundError('Company');
  }

  const updated = await companyRepository.updateCompany(companyId, data);

  if (data.name !== undefined && data.name !== existing.name) {
    await auditLogRepository.createAuditLog({
      performedById,
      entityId: companyId,
      entityType: 'Company',
      action: 'UPDATE_COMPANY_NAME',
      oldValue: existing.name,
      newValue: data.name,
      companyId,
    });
  }

  return updated;
}

export async function deleteOwnCompany(companyId: number, role: string, performedById: number) {
  if (role !== 'Hr') {
    throw new ForbiddenError('Only Hr role can delete the company');
  }

  const existing = await companyRepository.findCompanyById(companyId);
  if (!existing) {
    throw new NotFoundError('Company');
  }

  const deleted = await companyRepository.removeCompany(companyId);

  await auditLogRepository.createAuditLog({
    performedById,
    entityId: companyId,
    entityType: 'Company',
    action: 'DELETE_COMPANY',
    oldValue: existing.name,
    companyId,
  });

  return deleted;
}
