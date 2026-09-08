import { prisma } from '../../src/config/prismaClient';

export async function cleanDatabase() {
  await prisma.rateLimitEntry.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.statusHistory.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.leaveRequest.deleteMany();
  await prisma.leaveBalance.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.apiKey.deleteMany();
  await prisma.workSchedule.deleteMany();
  await prisma.companySettings.deleteMany();
  await prisma.user.deleteMany();
  await prisma.leaveType.deleteMany();
  await prisma.holiday.deleteMany();
  await prisma.department.deleteMany();
  await prisma.company.deleteMany();
}

export async function disconnectDb() {
  await prisma.$disconnect();
}
