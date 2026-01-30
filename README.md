# FUN App - Vertical Video Streaming Platform

A mobile-first vertical video streaming application with freemium content, credits-based monetization, and integrated commerce. Built with native iOS (Swift/SwiftUI) and Android (Kotlin/Compose) clients, backed by Node.js microservices.

## 🎯 Project Overview

**FUN** is a TikTok-style vertical video platform for short-form episodic dramas (2-5 minute episodes). Features include:

- **Vertical Video Streaming**: 9:16 aspect ratio, auto-advancing episodes, adaptive HLS streaming
- **Freemium Model**: Free episodes + premium unlocks via ads, credits, or subscription
- **Credits System**: In-app currency for unlocking episodes and purchasing merchandise
- **Commerce Integration**: In-video product tagging and integrated marketplace
- **Real-time Engagement**: Likes, comments, live view counts
- **Future-Ready**: Architecture designed for easy Web3/token integration

## 📁 Repository Structure

```
fun-app/
├── mobile/
│   ├── ios/                    # Swift/SwiftUI iOS app
│   └── android/                # Kotlin/Compose Android app
├── backend/
│   ├── services/
│   │   ├── auth/              # Authentication & user management
│   │   ├── content/           # Series, episodes, feed, unlocks
│   │   ├── media/             # Video upload & HLS transcoding
│   │   └── payment/           # Stripe, IAP, credits, subscriptions
│   ├── shared/                # Common utilities & types
│   └── gateway/               # Kong API Gateway configuration
├── infrastructure/
│   ├── docker/                # Docker Compose for local dev
│   ├── k8s/                   # Kubernetes manifests for production
│   └── terraform/             # AWS infrastructure as code
├── docs/
│   ├── api/                   # API documentation (Swagger/OpenAPI)
│   └── architecture/          # Architecture diagrams & decisions
└── .github/
    └── workflows/             # CI/CD pipelines
```

## 🚀 Quick Start

### Prerequisites

**For Mobile Development:**
- **iOS**: macOS 13+, Xcode 15+, CocoaPods
- **Android**: Android Studio Hedgehog+, JDK 17

**For Backend Development:**
- Node.js 22+
- Docker Desktop
- MongoDB Compass (optional, for database GUI)

### Local Development Setup

1. **Clone the repository:**
```bash
git clone <repo-url>
cd fun-app
```

2. **Start backend services:**
```bash
cd infrastructure/docker
docker-compose up -d
```

This starts:
- MongoDB (port 27017)
- Redis (port 6379)
- Auth Service (port 3001)
- Content Service (port 3002)
- Media Service (port 3003)
- Payment Service (port 3004)

3. **Run iOS app:**
```bash
cd mobile/ios
pod install
open FUN.xcworkspace
# Press Cmd+R to run in Simulator
```

4. **Run Android app:**
```bash
cd mobile/android
./gradlew build
# Open in Android Studio and run
```

## 🏗️ Architecture

### Tech Stack

**Mobile:**
- iOS: Swift 5.9+, SwiftUI, Combine, AVPlayer, StoreKit 2
- Android: Kotlin 1.9+, Jetpack Compose, Coroutines, ExoPlayer, Play Billing

**Backend:**
- Runtime: Node.js 22, Express 4.x
- Databases: MongoDB 7.0 (primary), Redis 7.x (cache/sessions)
- Storage: AWS S3 + CloudFront CDN
- Video: FFmpeg for HLS transcoding
- Queue: Bull for background jobs
- Gateway: Kong for API routing & rate limiting

**External Services:**
- Payments: Stripe, Apple IAP, Google Play Billing
- Ads: Google AdMob (rewarded video)
- Auth: Firebase (OAuth, push notifications)
- Commerce: Custom API or integration with external store

### Microservices

| Service | Port | Responsibility |
|---------|------|----------------|
| Auth | 3001 | User signup/login, JWT tokens, profile management |
| Content | 3002 | Series/episodes, feed, unlocks, likes/comments |
| Media | 3003 | Video upload, HLS transcoding, CDN distribution |
| Payment | 3004 | Credits, IAP verification, subscriptions, Stripe |

## 🎨 Design System

**Brand Colors:**
- Primary: `#007BFF` (FUN Blue)
- Background: `#000000` (Pure Black)
- Surface: `#1A1A1A` (Dark Gray)
- Text: `#FFFFFF` (White), `#A0A0A0` (Gray)

**Typography:**
- iOS: SF Pro Display (headings), SF Pro Text (body)
- Android: Roboto (all text)

## 💳 Monetization

### Credit Packages
- 100 credits: $0.99
- 500 credits: $4.99
- 1000 credits: $8.99 (10% bonus)
- 2500 credits: $19.99 (20% bonus)

### Subscriptions
- Monthly Premium: $9.99 (unlimited access)
- Annual Premium: $99.99 (2 months free)

### Episode Unlock Methods
1. **Watch Ad**: Free unlock via 15-30s rewarded video
2. **Spend Credits**: 50-100 credits per episode
3. **Direct Purchase**: $0.99 IAP for single episode
4. **Premium Subscription**: Unlimited access to all episodes

## 📊 Database Schema

See `docs/architecture/database-schema.md` for complete MongoDB schemas:
- Users (auth, credits, watch history)
- Series & Episodes (content, pricing, tags)
- Unlocks (user access tracking)
- Transactions (payment history)
- Products (commerce catalog)

## 🧪 Testing

### Run Tests

**Backend:**
```bash
cd backend/services/auth
npm test                    # Unit tests
npm run test:integration    # Integration tests
```

**iOS:**
```bash
cd mobile/ios
xcodebuild test -workspace FUN.xcworkspace -scheme FUN -destination 'platform=iOS Simulator,name=iPhone 15'
```

**Android:**
```bash
cd mobile/android
./gradlew test              # Unit tests
./gradlew connectedAndroidTest  # Instrumented tests
```

## 🚢 Deployment

### Staging
```bash
kubectl apply -f infrastructure/k8s/staging/
```

### Production
```bash
kubectl apply -f infrastructure/k8s/production/
```

## 🔐 Environment Variables

Each service requires environment variables. See `.env.example` files in each service directory.

**Key variables:**
- `MONGO_URI`: MongoDB connection string
- `REDIS_URI`: Redis connection string
- `JWT_SECRET`: Secret for signing JWT tokens
- `STRIPE_SECRET_KEY`: Stripe API key
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`: For S3 uploads
- `FIREBASE_ADMIN_SDK`: Firebase service account JSON

## 📝 API Documentation

Interactive API docs available at:
- Local: http://localhost:3000/api-docs
- Staging: https://api-staging.fun.app/docs
- Production: https://api.fun.app/docs

## 🔮 Future Roadmap

### Phase 2: Web3 Integration (Post-MVP)
- Solana wallet integration (WalletConnect for iOS, MWA for Android)
- $FUN token for premium unlocks
- NFT rewards for top fans
- Creator token earnings
- Token staking for free access

**Estimated effort:** 4-6 weeks after MVP launch

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and test thoroughly
3. Commit: `git commit -m "Add my feature"`
4. Push: `git push origin feature/my-feature`
5. Open a Pull Request

## 📄 License

Proprietary - All rights reserved

## 👥 Team

- **Mobile (iOS)**: TBD
- **Mobile (Android)**: TBD
- **Backend**: TBD
- **DevOps**: TBD
- **UI/UX**: TBD
- **QA**: TBD

## 📞 Support

- **Slack**: #fun-dev
- **Email**: dev@fun.app
- **Docs**: https://docs.fun.app
