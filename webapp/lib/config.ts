export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
    authService: process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3001',
    contentService: process.env.NEXT_PUBLIC_CONTENT_SERVICE_URL || 'http://localhost:3002',
    paymentService: process.env.NEXT_PUBLIC_PAYMENT_SERVICE_URL || 'http://localhost:3004',
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
  },
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3002',
} as const;
