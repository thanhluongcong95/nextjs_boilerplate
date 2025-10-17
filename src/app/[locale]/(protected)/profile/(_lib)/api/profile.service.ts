import type { TProfile, TUpdateProfilePayload } from '@/app/[locale]/(protected)/profile/(_lib)/model/profile.schemas';
import { profileSchema, updateProfileSchema } from '@/app/[locale]/(protected)/profile/(_lib)/model/profile.schemas';
import { API_ROUTES } from '@/shared/config/api';
import { httpPut } from '@/shared/infra/http/http.client';
import type { HttpRequestOptions } from '@/shared/infra/http/http.types';

/**
 * Profile Service
 * Note: Profile data is sourced from auth user state
 * This service only handles profile updates which sync back to auth user
 */
export class ProfileService {
  /**
   * Update user profile
   * This will update the auth user data on backend
   */
  static async updateProfile(data: TUpdateProfilePayload, options?: HttpRequestOptions<TProfile, TUpdateProfilePayload>): Promise<TProfile> {
    // Validate payload
    const validatedData = updateProfileSchema.parse(data);

    return httpPut<TProfile, TUpdateProfilePayload>(API_ROUTES.users.profile, {
      ...options,
      body: validatedData,
      schema: profileSchema,
    });
  }
}
