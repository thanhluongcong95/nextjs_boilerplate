import { http } from '@/shared/lib/http/http.client';

import type { TLoginPayload } from '../model/auth.schemas';

import { authService } from './auth.service';

jest.mock('@/shared/lib/http/http.client');

const mockedHttp = jest.mocked(http);

describe('authService', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('logs in with valid payload', async () => {
    const payload: TLoginPayload = {
      email: 'test@example.com',
      password: 'password123',
    };
    mockedHttp.mockResolvedValue({ accessToken: 'token', expiresIn: 3600 });

    const response = await authService.login(payload);

    expect(mockedHttp).toHaveBeenCalledWith('/auth/login', {
      method: 'POST',
      body: payload,
      schema: expect.anything(),
      meta: { skipAuth: true },
    });
    expect(response.accessToken).toBe('token');
  });
});
