import type { z } from 'zod';

import type {
  TCreateProjectPayload,
  TProject,
  TProjectListResponse,
  TUpdateProjectPayload,
} from '@/app/[locale]/(protected)/dashboard/(_lib)/model/projects.schemas';
import {
  apiResponseWrapperSchema,
  createProjectPayloadSchema,
  createProjectResponseSchema,
  transformProjectListResponse,
  updateProjectPayloadSchema,
} from '@/app/[locale]/(protected)/dashboard/(_lib)/model/projects.schemas';
import { API_ROUTES } from '@/shared/config/api';
import { httpGet, httpPost, httpPut } from '@/shared/infra/http/http.client';
import { uploadFileToS3 } from '@/shared/utils/s3';

type ProjectQueryParams = { page?: number; limit?: number; name?: string };
type ImageInput = File | string | null | undefined;

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 100;
const AVATAR_UPLOAD_PREFIX = 'uploads/avatar';

const buildQueryParams = ({ page = DEFAULT_PAGE, limit = DEFAULT_LIMIT, name }: ProjectQueryParams): Record<string, string> => {
  const params: Record<string, string> = {
    page: String(page),
    limit: String(limit),
  };

  const trimmedName = name?.trim();
  if (trimmedName) {
    params.name = trimmedName;
  }

  return params;
};

const resolveProjectImage = async (image: ImageInput): Promise<string | undefined> => {
  if (!image) return undefined;
  if (typeof image === 'string') return image;

  return uploadFileToS3({
    file: image,
    prefix: AVATAR_UPLOAD_PREFIX,
  });
};

const buildCreateBody = (name: string, avatar?: string) => ({
  name,
  ...(avatar ? { avatar } : {}),
});

const buildUpdateBody = (name?: string, avatar?: string) => {
  const body: { name?: string; avatar?: string } = {};

  if (name !== undefined) {
    body.name = name;
  }

  if (avatar !== undefined) {
    body.avatar = avatar;
  }

  return body;
};

export const projectService = {
  async getAll(params: ProjectQueryParams = {}): Promise<TProjectListResponse> {
    const rawResponse = await httpGet<z.infer<typeof apiResponseWrapperSchema>>(API_ROUTES.projects.list, {
      params: buildQueryParams(params),
      schema: apiResponseWrapperSchema,
      meta: { showErrorNotification: false },
    });

    return transformProjectListResponse(rawResponse);
  },

  async create(payload: TCreateProjectPayload): Promise<{ project: TProject; message: string }> {
    const parsed = createProjectPayloadSchema.parse(payload);
    const avatarUrl = await resolveProjectImage(parsed.image);

    const response = await httpPost<z.infer<typeof createProjectResponseSchema>>(API_ROUTES.projects.list, {
      body: buildCreateBody(parsed.name, avatarUrl),
      schema: createProjectResponseSchema,
      meta: { showErrorNotification: false },
    });

    return {
      project: response.body,
      message: response.message,
    };
  },

  async update(id: string, payload: TUpdateProjectPayload): Promise<{ project: TProject; message: string }> {
    const parsed = updateProjectPayloadSchema.parse(payload);
    const avatarUrl = await resolveProjectImage(parsed.image);

    const response = await httpPut<z.infer<typeof createProjectResponseSchema>>(API_ROUTES.projects.byId(id), {
      body: buildUpdateBody(parsed.name, avatarUrl),
      schema: createProjectResponseSchema,
      meta: { showErrorNotification: false },
    });

    return {
      project: response.body,
      message: response.message,
    };
  },
};
