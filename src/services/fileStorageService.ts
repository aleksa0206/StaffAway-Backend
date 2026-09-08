import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import crypto from 'crypto';
import { s3Client, S3_BUCKET } from '../config/s3Client';

export async function uploadFile(buffer: Buffer, originalName: string, mimeType: string) {
  const ext = originalName.split('.').pop();
  const key = `attachments/${crypto.randomUUID()}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
    })
  );

  return key;
}

export async function getSignedFileUrl(key: string) {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  return await getSignedUrl(s3Client, command, { expiresIn: 300 }); // 5 minuta
}

export async function deleteFile(key: string) {
  await s3Client.send(new DeleteObjectCommand({ Bucket: S3_BUCKET, Key: key }));
} 