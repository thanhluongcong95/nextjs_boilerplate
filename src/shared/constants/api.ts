export const API_ROUTES = {
  auth: {
    login: '/auth/login',
    me: '/auth/me',
    refresh: '/auth/refresh',
  },
  users: {
    root: '/users',
  },
  products: {
    root: '/products',
  },
} as const;
