import { CompanySettings } from "@prisma/client";
import { prisma } from "../config/prismaClient";

export async function findCompanySettingsByCompanyId(companyId: number): Promise<CompanySettings | null> {
  return await prisma.companySettings.findUnique({ where: { companyId } });
}

export async function createCompanySettings(data: {
  companyId: number;
  companyName: string;
  minDaysNoticeForLeave?: number;
  defaultAnnualLeaveDays?: number;
  workWeekStartsMonday?: boolean;
}): Promise<CompanySettings> {
  return await prisma.companySettings.create({ data });
}

export async function updateCompanySettings(
  companyId: number,
  data: {
    companyName?: string;
    minDaysNoticeForLeave?: number;
    defaultAnnualLeaveDays?: number;
    workWeekStartsMonday?: boolean;
  },
): Promise<CompanySettings> {
  return await prisma.companySettings.update({ where: { companyId }, data });
}