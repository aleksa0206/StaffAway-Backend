import { S3Client } from '@aws-sdk/client-s3';

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Nedostaje env promenljiva: ${key}`);
  return value;
}

export const s3Client = new S3Client({
  region: requireEnv('S3_REGION'),
  credentials: {
    accessKeyId: requireEnv('S3_ACCESS_KEY_ID'),
    secretAccessKey: requireEnv('S3_SECRET_ACCESS_KEY'),
  },
});

export const S3_BUCKET = requireEnv('S3_BUCKET');