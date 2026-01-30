# FUN Android App

Native Android app built with Kotlin and Jetpack Compose for vertical video streaming.

## Requirements

- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK 34
- Minimum SDK 24 (Android 7.0)

## Setup

1. Open project in Android Studio:
   - File > Open > Select `mobile/android` folder

2. Sync Gradle:
   - Android Studio will automatically prompt to sync
   - Or: File > Sync Project with Gradle Files

3. Configure backend URL:
   - Open `app/src/main/java/com/fun/app/core/constants/Config.kt`
   - Set appropriate base URL for your environment

4. Run the app:
   - Select an emulator or connected device
   - Click Run (▶) or Shift+F10

## Project Structure

```
app/src/main/java/com/fun/app/
├── FunApplication.kt          # App entry point
├── MainActivity.kt            # Main activity
├── core/
│   ├── network/              # API client, endpoints
│   ├── auth/                 # Auth manager
│   ├── storage/              # Preferences
│   └── constants/            # Config, colors
├── data/
│   ├── models/               # Data models
│   └── repository/           # Data repositories
├── ui/
│   ├── theme/                # Colors, typography
│   ├── components/           # Reusable composables
│   ├── navigation/           # Nav graph
│   ├── screens/              # Feature screens
│   └── viewmodels/           # ViewModels
└── utils/                    # Utility functions
```

## Dependencies

- **Jetpack Compose**: Modern UI toolkit
- **Navigation Compose**: Navigation component
- **Retrofit**: HTTP networking
- **Moshi**: JSON parsing
- **ExoPlayer (Media3)**: Video playback
- **Coroutines**: Asynchronous programming
- **Coil**: Image loading
- **Security Crypto**: Encrypted storage
- **AdMob**: Rewarded ads
- **Billing Library**: In-app purchases
- **Socket.IO**: Real-time communication

## Features

### Phase 1 (Completed)
- [x] Project structure
- [x] Material3 theme (dark mode)
- [x] Configuration system
- [x] Auth manager with encrypted storage
- [x] Preferences manager

### Phase 2 (TODO)
- [ ] API client with Retrofit
- [ ] All data models
- [ ] Repositories
- [ ] ViewModels
- [ ] Navigation graph
- [ ] Auth screens
- [ ] Main screens (Feed, Drama, Market, Credits, Profile)

### Phase 3 (TODO)
- [ ] ExoPlayer vertical video player
- [ ] HLS streaming
- [ ] Custom composable controls
- [ ] Gesture detection

### Phase 4 (TODO)
- [ ] Episode unlock system
- [ ] AdMob integration
- [ ] Google Play Billing integration
- [ ] Socket.IO real-time features

## Configuration

### Development
- Base URL: `http://10.0.2.2:8000/api` (emulator localhost)
- Socket URL: `http://10.0.2.2:3002`
- Test AdMob IDs enabled

### Production
- Update `Config.kt` with production URLs
- Replace AdMob IDs
- Configure Play Store IAP products

## Testing

Run tests:
```bash
./gradlew test                    # Unit tests
./gradlew connectedAndroidTest    # Instrumented tests
```

## Building for Release

1. Set Config.current to `.PRODUCTION`
2. Update version in `build.gradle.kts`
3. Generate signed APK/Bundle:
   - Build > Generate Signed Bundle / APK
4. Upload to Play Console

## Troubleshooting

### Gradle Sync Issues
```bash
./gradlew clean
./gradlew build --refresh-dependencies
```

### Build Errors
- Invalidate Caches: File > Invalidate Caches / Restart
- Clean project: Build > Clean Project
- Rebuild project: Build > Rebuild Project

## ProGuard

ProGuard rules are configured in `app/proguard-rules.pro`. All dependencies have appropriate keep rules.

## License

Proprietary - All rights reserved
