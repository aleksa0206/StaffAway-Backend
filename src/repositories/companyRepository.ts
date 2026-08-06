import { Company } from "@prisma/client";
import { prisma } from "../config/prismaClient";

export async function findAllCompanies(): Promise<Company[]> {
  return await prisma.company.findMany();
}

export async function findCompanyById(
  companyId: number,
): Promise<Company | null> {
  return await prisma.company.findUnique({ where: { id: companyId } });
}

export async function createCompany(data: { name: string }): Promise<Company> {
  return await prisma.company.create({ data });
}

export async function updateCompany(
  companyId: number,
  data: {
    name?: string;
  },
): Promise<Company> {
  return await prisma.company.update({ where: { id: companyId }, data });
}

export async function removeCompany(companyId: number): Promise<Company> {
  return await prisma.company.delete({ where: { id: companyId } });
}
