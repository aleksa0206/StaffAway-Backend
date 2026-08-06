import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '@prisma/client';

function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Nedostaje env promenljiva: ${key}`);
    }
    return value;
}

const adapter = new PrismaMariaDb({
    host: requireEnv('DB_HOST'),
    port: Number(requireEnv('DB_PORT')),
    user: requireEnv('DB_USER'),
    password: requireEnv('DB_PASSWORD'),
    database: requireEnv('DB_NAME'),
    connectionLimit: 10,
});

export const prisma = new PrismaClient({ adapter });
