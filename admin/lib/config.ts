export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    authService: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001',
    contentService: process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || 'http://localhost:3002',
    mediaService: process.env.NEXT_PUBLIC_MEDIA_SERVICE_URL || 'http://localhost:3003',
    paymentService: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:3004',
  },
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
    videoUpload: process.env.NEXT_PUBLIC_ENABLE_VIDEO_UPLOAD === 'true',
  },
} as const;
