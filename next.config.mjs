import bundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['api.example.com', 'i.pravatar.cc', 'cous-dev.fra1.digitaloceanspaces.com'],
    formats: ['image/avif', 'image/webp'],
  },
  async rewrites() {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

    // Only add rewrites if API_BASE_URL is configured
    if (!apiBaseUrl) {
      console.warn('[next.config.mjs] No API_BASE_URL configured, skipping rewrites');
      return [];
    }

    // Normalize API base URL (remove trailing slash)
    const normalizedBase = apiBaseUrl.trim().replace(/\/+$/, '');

    console.log(
      `[next.config.mjs] Configuring API rewrite: /api/v1/* -> ${normalizedBase}/api/v1/*`
    );

    return [
      {
        source: '/api/v1/:path*',
        destination: `${normalizedBase}/api/v1/:path*`,
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

export default withNextIntl(withBundleAnalyzer(nextConfig));
