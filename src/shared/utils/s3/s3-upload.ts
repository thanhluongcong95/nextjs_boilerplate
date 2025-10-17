import { z } from 'zod';

import { API_ROUTES } from '@/shared/config/api';
import { httpGet } from '@/shared/infra/http/http.client';
import { parseApiResponse } from '@/shared/infra/validation/schemas';

export interface PresignedUrlParams {
  prefix: string;
  file_type: string;
  content_type: string;
}

// Schema for the response from the presigned URL API
const presignedUrlResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    presigned_url: z.string().min(1),
    file_key: z.string(),
  }),
  message: z.string(),
});

export type PresignedUrlResponse = z.infer<typeof presignedUrlResponseSchema>;

export interface S3UploadOptions {
  prefix?: string;
  file: File;
}

/**
 * Get a presigned URL from the backend to upload a file to S3
 */
export async function getPresignedUrl(params: PresignedUrlParams): Promise<PresignedUrlResponse> {
  const response = await httpGet<unknown>(API_ROUTES.s3.presignedUrl, {
    params: {
      prefix: params.prefix,
      file_type: params.file_type,
      content_type: params.content_type,
    },
    meta: { showErrorNotification: true },
  });

  // Parse and validate the response with the schema
  return parseApiResponse(presignedUrlResponseSchema, response);
}

/**
 * Upload a file to S3 using a presigned PUT URL
 * @param file File to upload
 * @param presignedUrl Presigned PUT URL from the backend (includes all query params)
 * @returns URL of the uploaded file on S3 (base URL without query params)
 */
export async function uploadToS3(file: File, presignedUrl: string): Promise<string> {
  // Upload the file to S3 using the PUT method (presigned PUT URL)
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to upload file to S3: ${response.statusText} (${response.status})`);
  }

  // If the response is 200/204, the upload succeeded
  // The file URL will be the presigned URL without query params
  const fileUrl = presignedUrl.split('?')[0];

  return fileUrl;
}

/**
 * Utility function to upload a file to S3 with the full flow:
 * 1. Get a presigned URL from the backend
 * 2. Upload the file to S3 using the PUT method
 * 3. Return the URL of the uploaded file
 *
 * @param options Upload options: file and prefix (optional)
 * @returns URL of the uploaded file on S3
 */
export async function uploadFileToS3(options: S3UploadOptions): Promise<string> {
  const { file, prefix = 'uploads/avatar' } = options;

  // Step 1: Get a presigned URL from the backend
  const presignedResponse = await getPresignedUrl({
    prefix,
    file_type: file.type.split('/')[1] || 'jpg', // Extract extension from MIME type (e.g., 'image/jpeg' -> 'jpeg')
    content_type: file.type,
  });

  const { presigned_url } = presignedResponse.data;

  // Step 2: Upload the file to S3 using the presigned PUT URL
  const fileUrl = await uploadToS3(file, presigned_url);

  // Step 3: Return the file URL (after a successful upload)
  // The URL will be the presigned_url without query params
  return fileUrl;
}
