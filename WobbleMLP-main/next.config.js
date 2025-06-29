/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable both App Router and Pages Router
  experimental: {
    serverActions: true,
    appDir: true,
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  // Disable static optimization to ensure we get server-side logs
  output: 'standalone',
  // Add custom webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
  // Better error logging
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    pagesBufferLength: 5,
  },
  // Disable unnecessary features
  poweredByHeader: false,
  generateEtags: true,
  compress: true,
  staticPageGenerationTimeout: 60,
  // Enable experimental features
  experimental: {
    scrollRestoration: true,
  },
  // Add logging for debugging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  // Enable source maps in development
  productionBrowserSourceMaps: true,
  // Custom error handling
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Debug-Mode',
            value: 'true',
          },
        ],
      },
    ];
  }
};

module.exports = nextConfig;
