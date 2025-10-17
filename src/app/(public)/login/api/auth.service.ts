import type {
  TAuthUser,
  TLoginPayload,
  TLoginResponse,
  TRefreshTokenPayload,
} from '../model/auth.schemas';
import { loginPayloadSchema, refreshTokenSchema } from '../model/auth.schemas';

import {
  generateMockToken,
  mockUserProfile,
  simulateDelay,
  validCredentials,
} from './mock-data';

export const authService = {
  async login(payload: TLoginPayload): Promise<TLoginResponse> {
    console.log('Auth service login called with:', payload);

    const validPayload = loginPayloadSchema.parse(payload);
    console.log('Validated payload:', validPayload);

    // Mock implementation - check credentials locally
    const user = validCredentials.find(
      u => u.email === validPayload.email && u.password === validPayload.password
    );

    console.log('Found user:', user);
    console.log('Available credentials:', validCredentials);

    if (!user) {
      console.error('Invalid credentials');
      throw new Error('Email hoặc mật khẩu không đúng');
    }

    // Simulate network delay
    await simulateDelay(500);

    // Return mock response
    const response = {
      accessToken: generateMockToken(),
      expiresIn: 3600, // 1 hour
    };

    console.log('Returning login response:', response);
    return response;
  },

  async getMe(): Promise<TAuthUser> {
    // Mock implementation - return mock user profile
    await simulateDelay(200);

    return mockUserProfile;
  },

  async refreshToken(payload: TRefreshTokenPayload): Promise<TLoginResponse> {
    refreshTokenSchema.parse(payload);

    // Mock implementation - just generate new token
    await simulateDelay(200);

    return {
      accessToken: generateMockToken(),
      expiresIn: 3600, // 1 hour
    };
  },
};
