export const ROUTES = {
  public: {
    home: '/',
    signin: '/auth/signin',
    signup: '/auth/signup',
    forgotPassword: '/auth/forgot-password',
  },
  protected: {
    dashboard: '/dashboard',
    products: '/products',
  },
} as const;
