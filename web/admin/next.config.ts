import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudfront.net',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL + '/:path*',
      },
      {
        source: '/api/content/:path*',
        destination: process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL + '/:path*',
      },
      {
        source: '/api/media/:path*',
        destination: process.env.NEXT_PUBLIC_MEDIA_SERVICE_URL + '/:path*',
      },
      {
        source: '/api/payment/:path*',
        destination: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL + '/:path*',
      },
    ];
  },
};

export default nextConfig;
