# FUN Admin Dashboard

Admin dashboard for managing the FUN short drama streaming platform.

## Features

- **Authentication**: Secure JWT-based admin login
- **Dashboard**: Overview of platform stats and metrics
- **Content Management**: Create and manage series/episodes
- **Video Upload**: Upload videos with transcoding to HLS
- **User Management**: View users, manage credits, grant premium
- **Transactions**: Monitor all financial transactions
- **Analytics**: View platform analytics and insights

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Date Handling**: date-fns

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.local` and configure:

```bash
# Backend API URLs
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_CONTENT_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_MEDIA_SERVICE_URL=http://localhost:3003
NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost:3004

# Admin Credentials (development)
NEXT_PUBLIC_ADMIN_EMAIL=admin@fun.app
NEXT_PUBLIC_ADMIN_PASSWORD=Admin123!
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

### Docker

```bash
docker build -t fun-admin .
docker run -p 3000:3000 fun-admin
```

## Default Credentials

For development:
- **Email**: admin@fun.app
- **Password**: Admin123!

## Project Structure

```
admin/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # Protected dashboard pages
│   │   ├── content/       # Content management
│   │   ├── users/         # User management
│   │   ├── upload/        # Video upload
│   │   ├── transactions/  # Transaction history
│   │   └── analytics/     # Analytics dashboard
│   ├── login/            # Login page
│   └── layout.tsx        # Root layout
├── components/            # React components
│   ├── layout/           # Layout components
│   └── ui/               # Shadcn UI components
├── lib/                  # Utilities
│   ├── api-client.ts    # API client
│   ├── config.ts        # Configuration
│   └── utils.ts         # Helpers
├── store/               # Zustand stores
│   └── auth-store.ts   # Auth state
└── types/              # TypeScript types
    └── index.ts        # Type definitions
```

## API Integration

The admin dashboard connects to the following backend services:

- **Auth Service** (port 3001): User authentication and management
- **Content Service** (port 3002): Series/episode management
- **Media Service** (port 3003): Video upload and processing
- **Payment Service** (port 3004): Transactions and billing

## Features Guide

### Content Management
- Create new series with metadata
- Upload episodes and set unlock methods
- Manage episode pricing (credits/purchase)
- Mark content as active/inactive or featured

### User Management
- View all registered users
- Add credits to user accounts
- Grant/revoke premium status
- Ban/unban users

### Video Upload
- Multipart upload for large files
- Progress tracking
- Automatic HLS transcoding
- Thumbnail generation

### Transactions
- View all platform transactions
- Filter by type, status, platform
- Export financial reports
- Revenue analytics

## License

Proprietary - FUN App
