jest.mock('@/shared/config/api', () => ({
  API_ROUTES: { s3: { presignedUrl: '/api/s3/presigned-url' } },
}));

jest.mock('@/shared/infra/http/http.client', () => ({
  httpGet: jest.fn(),
}));

jest.mock('@/shared/infra/validation/schemas', () => ({
  parseApiResponse: jest.fn(),
}));

import { httpGet } from '@/shared/infra/http/http.client';
import { parseApiResponse } from '@/shared/infra/validation/schemas';
import { getPresignedUrl, type PresignedUrlResponse, uploadFileToS3, uploadToS3 } from '../s3-upload';

function createTestFile(contents: string, name = 'avatar.jpg', type = 'image/jpeg'): File {
  const blob = new Blob([contents], { type });

  if (typeof File !== 'undefined') {
    return new File([blob], name, { type });
  }

  return Object.assign(blob, {
    name,
    lastModified: Date.now(),
    type,
  }) as unknown as File;
}

describe('s3-upload utilities', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('getPresignedUrl', () => {
    it('calls httpGet with expected params and returns parsed response', async () => {
      const rawResponse = { foo: 'bar' };
      const parsed: PresignedUrlResponse = {
        success: true,
        data: {
          presigned_url: 'https://bucket.s3.amazonaws.com/uploads/avatar/file.jpg?signature=abc',
          file_key: 'uploads/avatar/file.jpg',
        },
        message: 'ok',
      };

      (httpGet as jest.Mock).mockResolvedValue(rawResponse);
      (parseApiResponse as jest.Mock).mockReturnValue(parsed);

      const result = await getPresignedUrl({
        prefix: 'uploads/avatar',
        file_type: 'jpeg',
        content_type: 'image/jpeg',
      });

      expect(httpGet).toHaveBeenCalledWith('/api/s3/presigned-url', {
        params: {
          prefix: 'uploads/avatar',
          file_type: 'jpeg',
          content_type: 'image/jpeg',
        },
        meta: { showErrorNotification: true },
      });
      expect(parseApiResponse).toHaveBeenCalledTimes(1);
      expect(result).toEqual(parsed);
    });

    it('throws when parsing fails', async () => {
      (httpGet as jest.Mock).mockResolvedValue({ bad: 'shape' });
      (parseApiResponse as jest.Mock).mockImplementation(() => {
        throw new Error('Schema validation error');
      });

      await expect(
        getPresignedUrl({
          prefix: 'uploads',
          file_type: 'jpg',
          content_type: 'image/jpeg',
        })
      ).rejects.toThrow('Schema validation error');
    });
  });

  describe('uploadToS3', () => {
    it('performs PUT upload and returns URL without query params', async () => {
      const file = createTestFile('content');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const presignedUrl = 'https://bucket.s3.amazonaws.com/uploads/avatar/file.jpg?signature=abc';

      const result = await uploadToS3(file, presignedUrl);

      expect(global.fetch).toHaveBeenCalledWith(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      expect(result).toBe('https://bucket.s3.amazonaws.com/uploads/avatar/file.jpg');
    });

    it('throws when upload response is not ok', async () => {
      const file = createTestFile('nope');
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 403,
        statusText: 'Forbidden',
      });

      await expect(uploadToS3(file, 'https://bucket/file?signature=abc')).rejects.toThrow(
        'Failed to upload file to S3: Forbidden (403)'
      );
    });
  });

  describe('uploadFileToS3', () => {
    it('requests presigned URL using defaults and returns stripped URL', async () => {
      const file = createTestFile('image data', 'avatar.jpg', 'image/jpeg');

      (httpGet as jest.Mock).mockResolvedValue({ raw: true });
      (parseApiResponse as jest.Mock).mockReturnValue({
        success: true,
        data: {
          presigned_url: 'https://bucket.s3.amazonaws.com/uploads/avatar/avatar.jpg?signature=xyz',
          file_key: 'uploads/avatar/avatar.jpg',
        },
        message: 'ok',
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await uploadFileToS3({ file });

      expect(httpGet).toHaveBeenCalledWith('/api/s3/presigned-url', {
        params: {
          prefix: 'uploads/avatar',
          file_type: 'jpeg',
          content_type: 'image/jpeg',
        },
        meta: { showErrorNotification: true },
      });
      expect(result).toBe('https://bucket.s3.amazonaws.com/uploads/avatar/avatar.jpg');
    });

    it('respects custom prefix and handles missing MIME type', async () => {
      const file = createTestFile('binary', 'avatar.bin', '');
      Object.defineProperty(file, 'type', { value: '' });

      (httpGet as jest.Mock).mockResolvedValue({ raw: true });
      (parseApiResponse as jest.Mock).mockReturnValue({
        success: true,
        data: {
          presigned_url: 'https://bucket.s3.amazonaws.com/uploads/custom/avatar.bin?signature=xyz',
          file_key: 'uploads/custom/avatar.bin',
        },
        message: 'ok',
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
        statusText: 'OK',
      });

      const result = await uploadFileToS3({ file, prefix: 'uploads/custom' });

      expect(httpGet).toHaveBeenCalledWith('/api/s3/presigned-url', {
        params: {
          prefix: 'uploads/custom',
          file_type: 'jpg',
          content_type: '',
        },
        meta: { showErrorNotification: true },
      });
      expect(result).toBe('https://bucket.s3.amazonaws.com/uploads/custom/avatar.bin');
    });

    it('propagates upload errors', async () => {
      const file = createTestFile('broken', 'avatar.jpg', 'image/jpeg');

      (httpGet as jest.Mock).mockResolvedValue({});
      (parseApiResponse as jest.Mock).mockReturnValue({
        success: true,
        data: {
          presigned_url: 'https://bucket.s3.amazonaws.com/uploads/avatar/avatar.jpg?signature=err',
          file_key: 'uploads/avatar/avatar.jpg',
        },
        message: 'ok',
      });
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      });

      await expect(uploadFileToS3({ file })).rejects.toThrow(
        'Failed to upload file to S3: Internal Server Error (500)'
      );
    });
  });
});
