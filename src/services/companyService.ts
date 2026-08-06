import * as companyRepository from "../repositories/companyRepository";

export async function getAllCompanies() {
  return await companyRepository.findAllCompanies();
}

export async function getCompanyById(companyId: number) {
  return await companyRepository.findCompanyById(companyId);
}

export async function createCompany(data: { name: string }) {
  return await companyRepository.createCompany(data);
}

export async function updateCompany(
  companyId: number,
  data: {
    name?: string;
  },
) {
  return await companyRepository.updateCompany(companyId, data);
}

export async function deleteCompany(companyId: number) {
  return await companyRepository.removeCompany(companyId);
}
