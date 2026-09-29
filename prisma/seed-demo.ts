// Creates a self-contained demo company with people, leave and balances around today's date.
// Runs once per database: if the demo company already exists it does nothing.
//   npm run seed:demo        -> database from .env
//   npm run seed:demo:test   -> database from .env.test (wiped by `npm test`)
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { LeaveStatus } from '@prisma/client';
import { prisma } from '../src/config/prismaClient';

const DEMO_PASSWORD = 'Password123';
const DAY_MS = 24 * 60 * 60 * 1000;

function utcToday(): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

/** The n-th weekday (Mon-Fri) from today; negative values go into the past. */
function workday(offset: number): Date {
  const step = offset < 0 ? -1 : 1;
  let date = utcToday();
  let remaining = Math.abs(offset);
  while (remaining > 0 || date.getUTCDay() === 0 || date.getUTCDay() === 6) {
    date = new Date(date.getTime() + step * DAY_MS);
    if (date.getUTCDay() !== 0 && date.getUTCDay() !== 6) remaining--;
  }
  return date;
}

function workdaysBetween(start: Date, end: Date): number {
  let count = 0;
  for (let t = start.getTime(); t <= end.getTime(); t += DAY_MS) {
    const day = new Date(t).getUTCDay();
    if (day !== 0 && day !== 6) count++;
  }
  return count;
}

async function main() {
  const email = (name: string) => `${name}@northwind.test`;
  if (await prisma.user.findUnique({ where: { email: email('hannah') } })) {
    console.log('Demo data already exists (hannah@northwind.test). Nothing to do.');
    return;
  }
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const year = utcToday().getUTCFullYear();

  const company = await prisma.company.create({ data: { name: 'Northwind Studio' } });
  const companyId = company.id;
  await prisma.companySettings.create({
    data: {
      companyId,
      companyName: company.name,
      minDaysNoticeForLeave: 1,
      defaultAnnualLeaveDays: 22,
    },
  });

  const [engineering, design, sales] = await Promise.all(
    ['Engineering', 'Design', 'Sales'].map((name) =>
      prisma.department.create({ data: { companyId, name } })
    )
  );

  const person = (
    firstName: string,
    lastName: string,
    role: 'Employee' | 'Manager' | 'Hr',
    departmentId: number | null,
    managerId: number | null,
    hireDate: string
  ) =>
    prisma.user.create({
      data: {
        companyId,
        passwordHash,
        firstName,
        lastName,
        role,
        departmentId,
        managerId,
        hireDate: new Date(hireDate),
        email: email(firstName.toLowerCase()),
      },
    });

  const hr = await person('Hannah', 'Reed', 'Hr', null, null, '2020-02-03');
  const manager = await person('Mark', 'Palmer', 'Manager', engineering.id, hr.id, '2021-05-17');
  const designLead = await person('Sofia', 'Lindqvist', 'Manager', design.id, hr.id, '2021-09-01');
  const team = await Promise.all([
    person('Emma', 'Jones', 'Employee', engineering.id, manager.id, '2023-03-01'),
    person('Liam', 'Carter', 'Employee', engineering.id, manager.id, '2022-11-14'),
    person('Noah', 'Fischer', 'Employee', engineering.id, manager.id, '2024-01-08'),
    person('Olivia', 'Brandt', 'Employee', engineering.id, manager.id, '2023-06-19'),
    person('Lucas', 'Moreau', 'Employee', design.id, designLead.id, '2022-04-04'),
    person('Mia', 'Novak', 'Employee', design.id, designLead.id, '2024-03-11'),
    person('Ethan', 'Kowalski', 'Employee', sales.id, hr.id, '2021-10-25'),
    person('Ava', 'Rossi', 'Employee', sales.id, hr.id, '2023-09-04'),
  ]);
  const [emma, liam, noah, olivia, lucas, mia, ethan, ava] = team;
  const everyone = [hr, manager, designLead, ...team];

  const annual = await prisma.leaveType.create({
    data: { companyId, name: 'Annual leave', requiresApproval: true, countsTowardBalance: true },
  });
  const sick = await prisma.leaveType.create({
    data: { companyId, name: 'Sick leave', requiresApproval: false, countsTowardBalance: false },
  });
  const training = await prisma.leaveType.create({
    data: { companyId, name: 'Training', requiresApproval: true, countsTowardBalance: false },
  });

  for (const user of everyone) {
    for (const y of [year, year + 1]) {
      await prisma.leaveBalance.create({
        data: {
          companyId,
          userId: user.id,
          leaveTypeId: annual.id,
          year: y,
          totalDays: 22,
          usedDays: 0,
        },
      });
    }
    await prisma.workSchedule.create({
      data: {
        companyId,
        userId: user.id,
        hoursPerWeek: user.id === mia!.id ? 24 : 40,
        isPartTime: user.id === mia!.id,
      },
    });
  }

  for (const [name, month, day, isRecurring] of [
    ["New Year's Day", 1, 1, true],
    ['Christmas Day', 12, 25, true],
    [
      'Company offsite',
      utcToday().getUTCMonth() + 1,
      Math.min(workday(12).getUTCDate(), 28),
      false,
    ],
  ] as const) {
    await prisma.holiday.create({
      data: { companyId, name, isRecurring, date: new Date(Date.UTC(year, month - 1, day)) },
    });
  }

  async function leave(
    user: { id: number },
    type: { id: number; countsTowardBalance: boolean },
    from: number,
    to: number,
    status: LeaveStatus,
    decidedBy?: { id: number },
    comment?: string
  ) {
    const startDate = workday(from);
    const endDate = workday(to);
    const totalDays = workdaysBetween(startDate, endDate);
    const request = await prisma.leaveRequest.create({
      data: {
        companyId,
        userId: user.id,
        leaveTypeId: type.id,
        status,
        startDate,
        endDate,
        totalDays,
        comment: comment ?? null,
        approvedById:
          status === 'Approval' || status === 'Rejected' ? (decidedBy?.id ?? null) : null,
      },
    });
    if (decidedBy && status !== 'Pending') {
      await prisma.statusHistory.create({
        data: {
          companyId,
          leaveRequestId: request.id,
          changedById: decidedBy.id,
          oldStatus: 'Pending',
          newStatus: status,
        },
      });
    }
    if (status === 'Approval' && type.countsTowardBalance) {
      await prisma.leaveBalance.updateMany({
        where: { userId: user.id, leaveTypeId: type.id, year: startDate.getUTCFullYear() },
        data: { usedDays: { increment: totalDays } },
      });
    }
    return request;
  }

  // Past leave.
  await leave(emma!, annual, -30, -26, 'Approval', manager);
  await leave(liam!, annual, -18, -16, 'Approval', manager);
  await leave(ethan!, sick, -6, -5, 'Approval');
  // Who is away right now and this week.
  await leave(olivia!, annual, -1, 3, 'Approval', manager, 'Family trip.');
  await leave(lucas!, sick, 0, 1, 'Approval');
  await leave(ava!, training, 1, 2, 'Approval', hr);
  // Upcoming: approved, pending (the approval queues) and a rejected one.
  const emmaApproved = await leave(emma!, annual, 8, 12, 'Approval', manager, 'Summer holiday.');
  await leave(emma!, annual, 20, 21, 'Pending', undefined, 'Long weekend.');
  await leave(liam!, annual, 9, 11, 'Pending', undefined, 'Overlaps with Emma, please check.');
  await leave(noah!, annual, 14, 18, 'Pending');
  await leave(noah!, annual, 4, 4, 'Rejected', manager);
  await leave(mia!, annual, 6, 10, 'Pending');
  await leave(manager, annual, 25, 29, 'Pending', undefined, 'Conference and a few days off.');
  await leave(designLead, annual, 15, 16, 'Approval', hr);

  await prisma.comment.create({
    data: {
      companyId,
      leaveRequestId: emmaApproved.id,
      authorId: manager.id,
      text: 'Approved, enjoy the break.',
    },
  });
  await prisma.notification.createMany({
    data: [
      {
        userId: emma!.id,
        type: 'LeaveRequestApproved',
        message: 'Your leave request has been approved.',
        isRead: false,
      },
      {
        userId: noah!.id,
        type: 'LeaveRequestRejected',
        message: 'Your leave request has been rejected.',
        isRead: false,
      },
      {
        userId: manager.id,
        type: 'LeaveRequestSubmitted',
        message: 'Liam Carter submitted a leave request.',
        isRead: false,
      },
      {
        userId: manager.id,
        type: 'LeaveRequestSubmitted',
        message: 'Noah Fischer submitted a leave request.',
        isRead: false,
      },
    ],
  });

  console.log(
    `Demo company "${company.name}" (id ${companyId}) created. Password for every account: ${DEMO_PASSWORD}`
  );
  console.log(`  Hr:       ${hr.email}`);
  console.log(`  Manager:  ${manager.email}`);
  console.log(`  Employee: ${emma!.email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
