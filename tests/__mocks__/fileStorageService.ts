import crypto from 'crypto';

export async function uploadFile(_buffer: Buffer, _originalName: string, _mimeType: string) {
  return `attachments/${crypto.randomUUID()}`;
}

export async function getSignedFileUrl(key: string) {
  return `https://files.test/${key}`;
}

export async function deleteFile(_key: string) {}
