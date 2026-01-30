# FUN Web App

User-facing web application for the FUN short drama streaming platform.

## Features

- **Vertical Video Player**: TikTok-style vertical video experience with HLS streaming
- **Authentication**: User signup, login, and JWT-based auth
- **Video Feed**: Infinite scroll feed with swipe/scroll navigation
- **Real-time Updates**: Socket.IO for live likes and viewer counts
- **Monetization**: Stripe integration for credits and subscriptions
- **Profile Management**: View credits, transaction history, manage subscriptions
- **Responsive Design**: Mobile-first, works great on desktop too

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/UI
- **Video Player**: HLS.js for adaptive streaming
- **State Management**: Zustand
- **Real-time**: Socket.IO Client
- **Payments**: Stripe
- **HTTP Client**: Axios

## Getting Started

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
NEXT_PUBLIC_AUTH_SERVICE_URL=http://localhost:3001
NEXT_PUBLIC_CONTENT_SERVICE_URL=http://localhost:3002
NEXT_PUBLIC_PAYMENT_SERVICE_URL=http://localhost:3004
NEXT_PUBLIC_SOCKET_URL=http://localhost:3002
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
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
docker build -t fun-webapp .
docker run -p 3000:3000 fun-webapp
```

## Project Structure

```
webapp/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home/Feed page
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   ├── profile/           # Profile & monetization
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── video/            # Video player components
│   └── ui/               # Shadcn UI components
├── lib/                  # Utilities
│   ├── api-client.ts    # API client
│   ├── config.ts        # Configuration
│   ├── socket-manager.ts # Socket.IO manager
│   └── utils.ts         # Helpers
├── store/               # Zustand stores
│   └── auth-store.ts   # Auth state
└── types/              # TypeScript types
    └── index.ts        # Type definitions
```

## Features Guide

### Video Player
- Vertical format (9:16 aspect ratio)
- HLS adaptive streaming
- Touch controls (tap to pause/play)
- Swipe or scroll to navigate between videos
- Like, comment, share buttons
- Progress bar and duration

### Authentication
- Email/password signup and login
- JWT token-based authentication
- Persistent sessions
- Auto-redirect to login if not authenticated

### Monetization
- **Credits System**: Purchase credit packages
- **Subscriptions**: Monthly or annual premium plans
- **Stripe Integration**: Secure payment processing
- **Transaction History**: View all purchases

### Real-time Features
- Live like counts using Socket.IO
- Real-time viewer counts
- Instant updates across users

## API Integration

The webapp connects to the following backend services:

- **Auth Service** (port 3001): User authentication
- **Content Service** (port 3002): Episodes, feed, likes, Socket.IO
- **Payment Service** (port 3004): Transactions, Stripe integration

## Performance

- Server-side rendering with Next.js
- Optimized video streaming with HLS
- Lazy loading and code splitting
- Progressive Web App (PWA) ready

## License

Proprietary - FUN App
