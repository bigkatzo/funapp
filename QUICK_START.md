# ⚡ Quick Start - 5 Minutes to Running App

Get the FUN app running in 5 minutes!

---

## 🚀 Step 1: Start Backend (2 minutes)

```bash
# Navigate to project
cd "/Users/arik/fun/repo/fun app"

# Start all services
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Verify (wait ~30 seconds for startup)
curl http://localhost:8000/health
```

✅ **Expected:** `{"status":"ok"}`

---

## 📱 Step 2A: Run iOS App (2 minutes)

```bash
# Install dependencies
cd mobile/ios
pod install

# Open Xcode
open FUN.xcworkspace
```

**In Xcode:**
1. Select any iPhone simulator
2. Press ⌘R (Run)
3. App launches! 🎉

---

## 🤖 Step 2B: Run Android App (2 minutes)

```bash
# Open Android Studio
cd mobile/android/FUN
open -a "Android Studio" .
```

**In Android Studio:**
1. Wait for Gradle sync
2. Click Run ▶️
3. App launches! 🎉

---

## 🧪 Step 3: Test Login (1 minute)

**Create Test Account:**
```
1. Tap "Create Account"
2. Email: test@example.com
3. Password: Password123
4. Name: Test User
5. Tap "Sign Up"
```

✅ **You're in!** Feed screen appears.

---

## 🎬 Step 4: Add Sample Video (Optional)

```bash
# Connect to MongoDB
docker exec -it fun_mongodb mongosh

# Use database
use fun_db

# Insert test series
db.series.insertOne({
  title: "Test Drama",
  genre: "Romance",
  description: "Test series",
  thumbnailUrl: "https://via.placeholder.com/400x600",
  isFeatured: true,
  episodes: [{
    episodeNum: 1,
    title: "Episode 1",
    videoUrl: "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4",
    thumbnailUrl: "https://via.placeholder.com/400x600",
    duration: 10,
    isFree: true,
    isUnlocked: true
  }]
})

# Exit
exit
```

Refresh feed → Video plays! 🎥

---

## ✅ That's It!

**You now have:**
- ✅ Backend running (4 services + MongoDB + Redis + Kong)
- ✅ iOS or Android app running
- ✅ Test account created
- ✅ Sample video playing

**Next Steps:**
- See `DEPLOYMENT_GUIDE.md` for full testing checklist
- See `MONETIZATION_COMPLETE.md` for ad/IAP setup
- See `BACKEND_COMPLETE.md` for API documentation

---

## 🐛 Issues?

**Backend not starting:**
```bash
# Check Docker is running
docker ps

# Restart services
docker-compose -f infrastructure/docker/docker-compose.yml restart
```

**iOS build fails:**
```bash
cd mobile/ios
rm -rf Pods
pod install
```

**Android build fails:**
```bash
# In Android Studio: File → Invalidate Caches → Restart
```

**Can't connect to backend:**
- iOS Simulator: Use `http://localhost:8000`
- Android Emulator: Use `http://10.0.2.2:8000`
- Real Device: Use your Mac's IP (e.g., `http://192.168.1.100:8000`)

---

## 🎯 Quick Commands Reference

```bash
# Start backend
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Stop backend
docker-compose -f infrastructure/docker/docker-compose.yml down

# View logs
docker-compose -f infrastructure/docker/docker-compose.yml logs -f

# Reset database
docker-compose -f infrastructure/docker/docker-compose.yml down -v
docker-compose -f infrastructure/docker/docker-compose.yml up -d

# Check backend health
curl http://localhost:8000/health
```

---

**Happy Testing! 🚀**
