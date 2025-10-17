const API_BASE = '/api/v1';

export const API_ROUTES = {
  // Auth endpoints
  auth: {
    login: `${API_BASE}/auth/login`,
    register: `${API_BASE}/auth/register`,
    verifyOtp: `${API_BASE}/auth/verify-otp`,
    resendOtp: `${API_BASE}/auth/resend-otp`,
    forgotPassword: `${API_BASE}/auth/forgot-password`,
    resetPassword: `${API_BASE}/auth/reset-password`,
    changePassword: `${API_BASE}/auth/change-password`,
    // Aliases for reset-password OTP flow (backward compatibility)
    verifyResetOtp: `${API_BASE}/auth/verify-otp`,
    resendResetOtp: `${API_BASE}/auth/resend-otp`,
    me: `${API_BASE}/auth/me`,
    refresh: `${API_BASE}/auth/refresh`,
  },

  // Profile
  profile: '/profile',

  // Users
  users: {
    list: `${API_BASE}/users`,
    byId: (id: string | number) => `${API_BASE}/users/${id}`,
    profile: `${API_BASE}/users/profile`,
  },

  // Products
  products: {
    list: `${API_BASE}/products`,
    byId: (id: string | number) => `${API_BASE}/products/${id}`,
  },

  // Projects
  projects: {
    list: `${API_BASE}/projects`,
    byId: (id: string | number) => `${API_BASE}/projects/${id}`,
  },

  // Scraping
  scraping: {
    list: (projectId: string | number) => `${API_BASE}/scraping/get-all-scrapings/${projectId}`,
    getById: (id: string | number) => `${API_BASE}/scraping/get-scraping/${id}`,
    create: (projectId: string | number) => `${API_BASE}/scraping/create-scraping/${projectId}`,
    update: (id: string | number) => `${API_BASE}/scraping/update-scraping/${id}`,
    duplicate: (id: string | number) => `${API_BASE}/scraping/duplicate-scraping/${id}`,
    delete: (id: string | number) => `${API_BASE}/scraping/delete-scraping/${id}`,
  },

  // S3
  s3: {
    presignedUrl: `${API_BASE}/s3/presigned-url`,
  },
} as const;
