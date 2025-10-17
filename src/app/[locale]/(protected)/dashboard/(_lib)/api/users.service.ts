import { API_ROUTES } from '@/shared/config/api';
import { httpDelete, httpGet, httpPost, httpPut } from '@/shared/infra/http/http.client';

import type { TCreateUserPayload, TUpdateUserPayload, TUser, TUserListResponse } from '../model/users.schemas';
import { createUserPayloadSchema, updateUserPayloadSchema, userListResponseSchema, userSchema } from '../model/users.schemas';

export const userService = {
  async getAll(params: { page?: number; pageSize?: number; keyword?: string } = {}): Promise<TUserListResponse> {
    const { page = 1, pageSize = 10, keyword = '' } = params;

    const queryParams: Record<string, string> = {
      page: String(page),
      pageSize: String(pageSize),
    };
    if (keyword) {
      queryParams.keyword = keyword;
    }

    return httpGet<TUserListResponse>(API_ROUTES.users.list, {
      params: queryParams,
      schema: userListResponseSchema,
      meta: { showErrorNotification: false },
    });
  },

  async getById(id: string): Promise<TUser> {
    return httpGet<TUser>(API_ROUTES.users.byId(id), {
      schema: userSchema,
      meta: { showErrorNotification: false },
    });
  },

  async create(payload: TCreateUserPayload): Promise<TUser> {
    const validPayload = createUserPayloadSchema.parse(payload);

    return httpPost<TUser>(API_ROUTES.users.list, {
      body: validPayload,
      schema: userSchema,
      meta: { showErrorNotification: false },
    });
  },

  async update(id: string, payload: TUpdateUserPayload): Promise<TUser> {
    const validPayload = updateUserPayloadSchema.parse(payload);

    return httpPut<TUser>(API_ROUTES.users.byId(id), {
      body: validPayload,
      schema: userSchema,
      meta: { showErrorNotification: false },
    });
  },

  async delete(id: string): Promise<void> {
    return httpDelete<void>(API_ROUTES.users.byId(id), {
      meta: { showErrorNotification: false },
    });
  },
};
