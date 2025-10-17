import type { TSignUpPayload } from './auth.schemas';

export type SignUpStep = 'form' | 'otp';

export const INITIAL_SIGN_UP_VALUES: TSignUpPayload = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export type SignUpFieldErrors = Partial<Record<keyof TSignUpPayload, string>>;
