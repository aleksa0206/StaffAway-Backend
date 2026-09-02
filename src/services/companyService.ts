import * as companyRepository from '../repositories/companyRepository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { PLATFORM_COMPANY_ID } from '../config/constants';

function assertPlatformAdmin(companyId: number) {
  if (companyId !== PLATFORM_COMPANY_ID) {
    throw new ForbiddenError('Only platform administrators can perform this action');
  }
}

export async function getAllCompanies(requestingCompanyId: number) {
  assertPlatformAdmin(requestingCompanyId);
  return await companyRepository.findAllCompanies();
}

export async function getOwnCompany(companyId: number) {
  const company = await companyRepository.findCompanyById(companyId);
  if (!company) throw new NotFoundError('Company');
  return company;
}

export async function createCompany(data: { name: string }, requestingCompanyId: number) {
  assertPlatformAdmin(requestingCompanyId);
  return await companyRepository.createCompany(data);
}

export async function updateOwnCompany(companyId: number, data: { name?: string }, role: string) {
  if (role !== 'Hr') {
    throw new ForbiddenError('Only Hr role can update the company');
  }
  const existing = await companyRepository.findCompanyById(companyId);
  if (!existing) throw new NotFoundError('Company');
  return await companyRepository.updateCompany(companyId, data);
}

export async function deleteOwnCompany(companyId: number, role: string) {
  if (role !== 'Hr') {
    throw new ForbiddenError('Only Hr role can delete the company');
  }
  const existing = await companyRepository.findCompanyById(companyId);
  if (!existing) throw new NotFoundError('Company');
  return await companyRepository.removeCompany(companyId);
}
