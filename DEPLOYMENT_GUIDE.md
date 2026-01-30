# 🚀 FUN App - Deployment & Testing Guide

**Quick Start:** Get the app running locally in 15 minutes!

---

## 📋 Prerequisites

### Required Software
- **Docker Desktop** (for backend services)
- **Xcode 15+** (for iOS, macOS only)
- **Android Studio** (for Android)
- **Node.js 22+** (for backend)
- **Git** (version control)

### Optional Tools
- **Postman** (API testing)
- **MongoDB Compass** (database viewer)
- **Redis Commander** (Redis viewer)

---

## 🏃 Quick Start (Local Testing)

### Step 1: Start Backend Services (5 minutes)

```bash
# Navigate to project root
cd /Users/arik/fun/repo/fun\ app

# Start all backend services with Docker Compose
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Check if services are running
docker ps

# You should see 7 containers:
# - MongoDB
# - Redis
# - Auth Service (port 3001)
# - Content Service (port 3002)
# - Payment Service (port 3003)
# - Media Service (port 3004)
# - Kong Gateway (port 8000)
```

**Verify Backend:**
```bash
# Health check
curl http://localhost:8000/health

# Expected: {"status":"ok"}
```

### Step 2: Configure AppLovin MAX (10 minutes)

**Skip this for initial testing - test mode works without dashboard setup**

For production/real ads:

1. Visit https://dash.applovin.com/signup
2. Create account and add apps:
   - iOS: Bundle ID `com.fun.app`
   - Android: Package `com.fun.app`
3. Get SDK keys for each platform
4. Create 3 ad units:
   - Rewarded: `episode_unlock_rewarded`
   - Interstitial: `episode_transition_interstitial`
   - Banner: `credits_footer_banner`
5. Enable AdMob network in MAX dashboard

### Step 3: Run iOS App (5 minutes)

```bash
# Navigate to iOS project
cd mobile/ios

# Install dependencies
pod install

# Open workspace in Xcode
open FUN.xcworkspace
```

**In Xcode:**

1. Select your development team (Signing & Capabilities)
2. Change bundle identifier to your own (e.g., `com.yourname.fun`)
3. Select simulator or device
4. Press ⌘R to run

**Update Configuration:**

Edit `mobile/ios/FUN/FUN/Core/Constants/Config.swift`:

```swift
static var baseURL: String {
    switch current {
    case .development:
        return "http://localhost:8000/api"  // Your Mac's IP for real device
    // ...
    }
}
```

**For Real Device Testing:**

Find your Mac's local IP:
```bash
ipconfig getifaddr en0
# Example: 192.168.1.100
```

Update Config.swift:
```swift
return "http://192.168.1.100:8000/api"
```

### Step 4: Run Android App (5 minutes)

```bash
# Navigate to Android project
cd mobile/android/FUN

# Open in Android Studio
open -a "Android Studio" .
```

**In Android Studio:**

1. Wait for Gradle sync to complete
2. Select emulator or device
3. Click Run ▶️

**Update Configuration:**

Edit `mobile/android/FUN/app/src/main/java/com/fun/app/core/constants/Config.kt`:

```kotlin
val baseURL: String
    get() = when (current) {
        Environment.DEVELOPMENT -> "http://10.0.2.2:8000/api"  // Android emulator
        // For real device: "http://192.168.1.100:8000/api"
        // ...
    }
```

**Note:** Android emulator uses `10.0.2.2` to access host machine's localhost.

---

## 🧪 Testing Checklist

### 1. Authentication Flow

**Test Signup:**
```
1. Open app
2. Tap "Create Account"
3. Enter email: test@example.com
4. Enter password: Password123
5. Enter display name: Test User
6. Tap "Sign Up"
✓ Should create account and login automatically
```

**Test Login:**
```
1. Logout if logged in
2. Enter email: test@example.com
3. Enter password: Password123
4. Tap "Login"
✓ Should redirect to feed
```

### 2. Video Playback

**Prerequisites:** You need sample videos in MongoDB.

**Manual Data Insert:**
```javascript
// Connect to MongoDB
docker exec -it fun_mongodb mongosh

use fun_db

// Insert sample series with episodes
db.series.insertOne({
  title: "Test Drama",
  genre: "Romance",
  description: "A test drama series",
  thumbnailUrl: "https://via.placeholder.com/400x600",
  isFeatured: true,
  episodes: [
    {
      episodeNum: 1,
      title: "Episode 1",
      videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
      thumbnailUrl: "https://via.placeholder.com/400x600",
      duration: 10,
      isFree: true,
      isUnlocked: true
    },
    {
      episodeNum: 2,
      title: "Episode 2",
      videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
      thumbnailUrl: "https://via.placeholder.com/400x600",
      duration: 10,
      unlockCostCredits: 50,
      unlockCostUSD: 0.99,
      isFree: false
    }
  ]
})
```

**Test Video:**
```
1. Open app and login
2. Feed should load with video player
3. Swipe up/down to navigate episodes
4. Tap to pause/play
5. Double-tap to like
✓ Video should play smoothly
```

### 3. Episode Unlocking

**Test Watch Ad:**
```
1. Navigate to locked episode (Episode 2)
2. Tap locked episode overlay
3. Select "Watch Ad"
4. Ad displays (test ad in development)
5. Watch complete ad
✓ Episode unlocks and plays
```

**Test Credits Unlock:**
```
1. Give yourself credits via backend:
   docker exec -it fun_auth_service node
   > const User = require('./src/models/user.model')
   > User.findOneAndUpdate({email: 'test@example.com'}, {credits: 1000})
   
2. Navigate to locked episode
3. Select "Use Credits"
4. Credits deducted
✓ Episode unlocks
```

**Test IAP Unlock:**
```
Note: Requires App Store Connect / Play Console setup
1. Configure sandbox test account
2. Navigate to locked episode
3. Select "Buy for $0.99"
4. Complete sandbox purchase
✓ Episode unlocks, credits added
```

**Test Premium:**
```
1. Navigate to locked episode
2. Select "Premium Unlimited"
3. Subscription screen opens
4. Select plan (Monthly/Annual)
5. Complete sandbox purchase
✓ All episodes unlock, premium badge shows
```

### 4. Credits System

**Test Credits Purchase:**
```
1. Tap "Credits" tab
2. View credit packages
3. Tap any package (e.g., 500 Credits)
4. Complete sandbox IAP
5. Check backend logs for verification
✓ Credits added to account
✓ Transaction in history
```

**Test Restore Purchases:**
```
1. Purchase credits on Device A
2. Logout and login on Device B
3. Navigate to Credits tab
4. Tap "Restore Purchases"
✓ Credits restored
✓ Confirmation message
```

### 5. Profile Features

**Test Edit Profile:**
```
1. Tap "Profile" tab
2. Tap "Edit Profile"
3. Change display name
4. Add bio
5. Upload avatar (select from photos)
6. Tap "Save Changes"
✓ Profile updated
✓ Avatar appears throughout app
```

**Test Watch History:**
```
1. Watch several episodes
2. Tap "Profile" → "Watch History"
✓ Grid of watched episodes
✓ Thumbnails display
✓ "Time ago" formatting
```

**Test Settings:**
```
1. Tap "Profile" → "Settings"
2. Change video quality
3. Toggle autoplay
4. Toggle notifications
✓ Settings persist
```

### 6. Real-time Features

**Test Live Likes:**
```
1. Open app on Device A
2. Open app on Device B (same series)
3. Like episode on Device A
✓ Like count updates on Device B in real-time
✓ Animation plays
```

**Test Viewer Count:**
```
1. Open app on multiple devices
2. All watch same episode
✓ Viewer count increases
✓ Updates in real-time
```

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot connect to backend"

**Solution:**
```bash
# Check if backend is running
docker ps

# Check backend logs
docker logs fun_auth_service
docker logs fun_content_service

# Restart services
docker-compose -f infrastructure/docker/docker-compose.yml restart

# For iOS on real device, use Mac's IP instead of localhost
```

### Issue: "Pod install fails" (iOS)

**Solution:**
```bash
# Update CocoaPods
sudo gem install cocoapods

# Clean and reinstall
cd mobile/ios
rm -rf Pods Podfile.lock
pod install --repo-update
```

### Issue: "Gradle sync fails" (Android)

**Solution:**
```bash
# In Android Studio
File → Invalidate Caches → Invalidate and Restart

# Or clean build
cd mobile/android/FUN
./gradlew clean
./gradlew build
```

### Issue: "Video not playing"

**Solution:**
1. Check video URL is valid HLS stream
2. Check network permissions in Info.plist/Manifest
3. Use test video URLs from above
4. Check console logs for errors

### Issue: "IAP not working"

**Solution:**
1. Ensure you're signed into sandbox account
2. Check product IDs match App Store Connect
3. Products must be "Ready to Submit" in ASC
4. Wait 24 hours after creating products
5. Check backend verification logs

### Issue: "Ads not showing"

**Solution:**
1. Verify AppLovin SDK initialized
2. Check test mode is enabled
3. Real ads require dashboard setup
4. Check console logs for ad errors
5. Try different ad unit IDs

---

## 📱 Device Testing

### iOS Testing Options

**1. Simulator (Fastest)**
- Select any iPhone simulator in Xcode
- Limited: No camera, Face ID, push notifications
- Good for: UI testing, flow testing

**2. Real Device (Recommended)**
- Connect iPhone via cable
- Select device in Xcode
- Required for: Full testing, performance

**3. TestFlight (Beta)**
- Upload build to App Store Connect
- Invite testers via email
- Good for: External beta testing

### Android Testing Options

**1. Emulator (Fast)**
- Create AVD in Android Studio
- Select device configuration
- Good for: UI testing, flow testing

**2. Real Device (Recommended)**
- Enable Developer Mode on phone
- Connect via USB
- Required for: Full testing, performance

**3. Internal Testing (Beta)**
- Upload to Play Console
- Add tester emails
- Good for: External beta testing

---

## 🔧 Backend Configuration

### Environment Variables

Create `.env` files for each service:

**backend/services/auth/.env:**
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://mongodb:27017/fun_db
REDIS_URL=redis://redis:6379
JWT_SECRET=your_jwt_secret_here_change_in_production
JWT_REFRESH_SECRET=your_refresh_secret_here
```

**backend/services/content/.env:**
```env
NODE_ENV=development
PORT=3002
MONGODB_URI=mongodb://mongodb:27017/fun_db
REDIS_URL=redis://redis:6379
AUTH_SERVICE_URL=http://auth-service:3001
SOCKET_PORT=3012
```

**backend/services/payment/.env:**
```env
NODE_ENV=development
PORT=3003
MONGODB_URI=mongodb://mongodb:27017/fun_db
REDIS_URL=redis://redis:6379
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
AUTH_SERVICE_URL=http://auth-service:3001
```

**backend/services/media/.env:**
```env
NODE_ENV=development
PORT=3004
MONGODB_URI=mongodb://mongodb:27017/fun_db
REDIS_URL=redis://redis:6379
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
S3_BUCKET=fun-videos-dev
CLOUDFRONT_URL=https://your-cloudfront-url.cloudfront.net
```

### Database Initialization

The MongoDB container runs `infrastructure/docker/mongo-init.js` on first start, which:
- Creates collections
- Adds indexes
- Inserts sample data

**To reset database:**
```bash
# Stop and remove volumes
docker-compose -f infrastructure/docker/docker-compose.yml down -v

# Restart (will reinitialize)
docker-compose -f infrastructure/docker/docker-compose.yml up -d
```

---

## 🌐 Cloud Deployment (Production)

### Option 1: AWS (Recommended)

**Services Needed:**
- **ECS/EKS** - Container orchestration
- **RDS MongoDB** or **MongoDB Atlas** - Database
- **ElastiCache Redis** - Caching
- **S3** - Video storage
- **CloudFront** - CDN
- **Route 53** - DNS
- **Certificate Manager** - SSL

**Estimated Cost:** $100-300/month (small scale)

**Quick Deploy with AWS Copilot:**
```bash
# Install Copilot CLI
brew install aws/tap/copilot-cli

# Initialize app
copilot app init fun-app

# Deploy services
copilot svc deploy --name auth-service
copilot svc deploy --name content-service
copilot svc deploy --name payment-service
copilot svc deploy --name media-service
```

### Option 2: Google Cloud Platform

**Services Needed:**
- **GKE** - Kubernetes
- **Cloud SQL** - Database
- **Memorystore** - Redis
- **Cloud Storage** - Videos
- **Cloud CDN** - Content delivery

**Estimated Cost:** $100-250/month

### Option 3: DigitalOcean (Simplest)

**Services Needed:**
- **App Platform** - Container hosting
- **Managed MongoDB** - Database
- **Managed Redis** - Caching
- **Spaces** - Object storage

**Estimated Cost:** $50-150/month

**Quick Deploy:**
```bash
# Install doctl
brew install doctl

# Authenticate
doctl auth init

# Create app
doctl apps create --spec app.yaml
```

### Option 4: Railway.app (Fastest)

**One-Click Deploy:**
1. Push code to GitHub
2. Visit railway.app
3. Click "New Project" → "Deploy from GitHub"
4. Select repository
5. Railway auto-detects Docker Compose
6. Configure environment variables
7. Deploy!

**Estimated Cost:** $20-100/month

---

## 📊 Monitoring & Logs

### View Backend Logs

```bash
# All services
docker-compose -f infrastructure/docker/docker-compose.yml logs -f

# Specific service
docker logs -f fun_auth_service
docker logs -f fun_content_service

# Last 100 lines
docker logs --tail 100 fun_auth_service
```

### View Database

**MongoDB:**
```bash
# Connect with mongosh
docker exec -it fun_mongodb mongosh

# Or use MongoDB Compass
# Connection string: mongodb://localhost:27017
```

**Redis:**
```bash
# Connect with redis-cli
docker exec -it fun_redis redis-cli

# List all keys
> KEYS *

# Get value
> GET key_name
```

### API Testing with Postman

Import collection from: `docs/postman_collection.json` (create this)

**Sample Requests:**

**1. Register User:**
```http
POST http://localhost:8000/api/auth/signup
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123",
  "displayName": "Test User"
}
```

**2. Login:**
```http
POST http://localhost:8000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Password123"
}

// Save the accessToken from response
```

**3. Get Feed:**
```http
GET http://localhost:8000/api/content/feed?page=1
Authorization: Bearer YOUR_ACCESS_TOKEN
```

---

## 🎯 Performance Testing

### Backend Load Testing

```bash
# Install Apache Bench
brew install ab

# Test auth endpoint (100 requests, 10 concurrent)
ab -n 100 -c 10 http://localhost:8000/api/auth/health

# Test feed endpoint with auth
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN" \
   http://localhost:8000/api/content/feed
```

### Mobile Performance

**iOS:**
- Use Instruments (Xcode → Product → Profile)
- Monitor: CPU, Memory, Network, Energy

**Android:**
- Use Android Profiler (View → Tool Windows → Profiler)
- Monitor: CPU, Memory, Network, Battery

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] Change all default secrets (.env files)
- [ ] Use strong JWT secrets (64+ random characters)
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure CORS properly
- [ ] Set up rate limiting (Kong)
- [ ] Enable MongoDB authentication
- [ ] Enable Redis authentication
- [ ] Review IAM permissions (AWS)
- [ ] Set up firewall rules
- [ ] Enable logging and monitoring
- [ ] Back up database regularly
- [ ] Test IAP receipt verification
- [ ] Review API security (OWASP)

---

## 📋 Pre-Launch Checklist

### App Store Connect (iOS)
- [ ] Create App Store Connect app
- [ ] Configure IAP products (7 products)
- [ ] Set up sandbox test accounts
- [ ] Upload screenshots (5.5", 6.5", 12.9")
- [ ] Write app description
- [ ] Add privacy policy URL
- [ ] Submit for review

### Google Play Console (Android)
- [ ] Create Play Console app
- [ ] Configure IAP products (6 products)
- [ ] Set up test accounts
- [ ] Upload screenshots (phone, tablet)
- [ ] Write app description
- [ ] Add privacy policy URL
- [ ] Create store listing
- [ ] Upload to Internal Testing

### Backend Production
- [ ] Deploy to cloud provider
- [ ] Set up CDN for videos
- [ ] Configure monitoring (Datadog/Sentry)
- [ ] Set up error tracking
- [ ] Configure backups
- [ ] Test all endpoints
- [ ] Load test critical paths
- [ ] Set up CI/CD pipeline

---

## 🎉 You're Ready!

**Quick Summary:**
1. ✅ Start backend with Docker Compose
2. ✅ Run iOS app in Xcode
3. ✅ Run Android app in Android Studio
4. ✅ Test all features with checklist
5. ✅ Fix any issues
6. ✅ Deploy to production
7. ✅ Launch! 🚀

**Need Help?**
- Check logs: `docker-compose logs -f`
- Check this guide's troubleshooting section
- Review backend docs: `BACKEND_COMPLETE.md`
- Review monetization docs: `MONETIZATION_COMPLETE.md`

**Happy Testing! 🎬✨**
