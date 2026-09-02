import * as companySettingsRepository from "../repositories/companySettingsRepository";

export async function getCompanySettings(companyId: number) {
  return await companySettingsRepository.findCompanySettingsByCompanyId(companyId);
}

export async function createCompanySettings(data: {
  companyId: number;
  companyName: string;
  minDaysNoticeForLeave?: number;
  defaultAnnualLeaveDays?: number;
  workWeekStartsMonday?: boolean;
}) {
  return await companySettingsRepository.createCompanySettings(data);
}

export async function updateCompanySettings(
  companyId: number,
  data: {
    companyName?: string;
    minDaysNoticeForLeave?: number;
    defaultAnnualLeaveDays?: number;
    workWeekStartsMonday?: boolean;
  }
) {
  return await companySettingsRepository.updateCompanySettings(companyId, data);
}