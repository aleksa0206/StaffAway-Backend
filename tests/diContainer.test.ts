import { setContainer, resetContainer } from '../src/container';
import * as attachmentService from '../src/services/attachmentService';
import { NotFoundError } from '../src/errors/NotFoundError';

jest.mock('../src/repositories/leaveRequestRepository', () => ({
  findLeaveRequestById: jest.fn(),
}));
jest.mock('../src/repositories/attachmentRepository', () => ({
  createAttachment: jest.fn(),
}));

import * as leaveRequestRepository from '../src/repositories/leaveRequestRepository';
import * as attachmentRepository from '../src/repositories/attachmentRepository';

describe('DI container - attachmentService koristi zamenjivi fileStorage', () => {
  afterEach(() => {
    resetContainer();
    jest.clearAllMocks();
  });

  it('poziva mock fileStorage umesto pravog S3, bez mrezenog poziva', async () => {
    const mockUploadFile = jest.fn().mockResolvedValue('mock-key.pdf');

    setContainer({
      fileStorage: {
        uploadFile: mockUploadFile,
        deleteFile: jest.fn(),
        getSignedFileUrl: jest.fn().mockResolvedValue('https://mock-url.test'),
      } as any,
    });

    (leaveRequestRepository.findLeaveRequestById as jest.Mock).mockResolvedValue({
      id: 1,
      companyId: 10,
    });
    (attachmentRepository.createAttachment as jest.Mock).mockResolvedValue({
      id: 1,
      fileName: 'test.pdf',
      filePath: 'mock-key.pdf',
    });

    await attachmentService.createAttachment(
      {
        leaveRequestId: 1,
        fileBuffer: Buffer.from('x'),
        originalFileName: 'test.pdf',
        mimeType: 'application/pdf',
      },
      10
    );

    expect(mockUploadFile).toHaveBeenCalledTimes(1);
    expect(mockUploadFile).toHaveBeenCalledWith(Buffer.from('x'), 'test.pdf', 'application/pdf');
  });

  it('baca NotFoundError ako leaveRequest ne postoji, bez pozivanja fileStorage', async () => {
    const mockUploadFile = jest.fn();
    setContainer({
      fileStorage: {
        uploadFile: mockUploadFile,
        deleteFile: jest.fn(),
        getSignedFileUrl: jest.fn(),
      } as any,
    });

    (leaveRequestRepository.findLeaveRequestById as jest.Mock).mockResolvedValue(null);

    await expect(
      attachmentService.createAttachment(
        {
          leaveRequestId: 999,
          fileBuffer: Buffer.from('x'),
          originalFileName: 'test.pdf',
          mimeType: 'application/pdf',
        },
        10
      )
    ).rejects.toThrow(NotFoundError);

    expect(mockUploadFile).not.toHaveBeenCalled();
  });
});
