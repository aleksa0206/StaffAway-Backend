// Bootstraps an empty database: creates the platform company and its first Hr user.
// Does nothing if any company already exists. Runs from the compiled output, so it works in the
// runtime image:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... ADMIN_FIRST_NAME=... ADMIN_LAST_NAME=... COMPANY_NAME=... \
//     node dist/scripts/createAdmin.js
import bcrypt from 'bcrypt';
import { z } from 'zod';
import { PLATFORM_COMPANY_ID } from '../config/constants';
import { prisma } from '../config/prismaClient';

const inputSchema = z.object({
  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z.string().min(8).max(100),
  ADMIN_FIRST_NAME: z.string().min(1),
  ADMIN_LAST_NAME: z.string().min(1),
  COMPANY_NAME: z.string().min(1),
});

async function main() {
  const parsed = inputSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid input:\n${z.prettifyError(parsed.error)}`);
  }
  const input = parsed.data;

  if ((await prisma.company.count()) > 0) {
    console.log('The database already has a company. Nothing to do.');
    return;
  }

  const passwordHash = await bcrypt.hash(input.ADMIN_PASSWORD, 10);
  await prisma.$transaction(async (tx) => {
    const company = await tx.company.create({
      data: { id: PLATFORM_COMPANY_ID, name: input.COMPANY_NAME },
    });
    await tx.companySettings.create({
      data: { companyId: company.id, companyName: company.name },
    });
    await tx.user.create({
      data: {
        companyId: company.id,
        email: input.ADMIN_EMAIL,
        passwordHash,
        firstName: input.ADMIN_FIRST_NAME,
        lastName: input.ADMIN_LAST_NAME,
        role: 'Hr',
        hireDate: new Date(),
      },
    });
  });
  console.log(`Created company "${input.COMPANY_NAME}" with Hr user ${input.ADMIN_EMAIL}.`);
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
