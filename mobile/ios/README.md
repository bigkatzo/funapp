# FUN iOS App

Native iOS app built with Swift and SwiftUI for vertical video streaming.

## Requirements

- macOS 13.0 or later
- Xcode 15.0 or later
- CocoaPods
- iOS 15.0+ deployment target

## Setup

1. Install dependencies:
```bash
cd mobile/ios
pod install
```

2. Open workspace:
```bash
open FUN.xcworkspace
```

3. Configure backend URL:
- Open `FUN/Core/Constants/Config.swift`
- Set appropriate base URL for your environment

4. Run the app:
- Select a simulator or device
- Press Cmd+R or click Run

## Project Structure

```
FUN/
├── App/                    # App entry point
├── Core/                   # Core functionality
│   ├── Network/           # API client, endpoints
│   ├── Auth/              # Authentication manager
│   ├── Storage/           # UserDefaults, Keychain
│   └── Constants/         # Colors, config
├── Models/                # Data models
├── ViewModels/            # MVVM view models
├── Views/                 # SwiftUI views
│   ├── Components/        # Reusable components
│   ├── Tabs/              # Main tab views
│   └── Auth/              # Login, signup
└── Resources/             # Assets, Info.plist
```

## Dependencies

- **Alamofire**: HTTP networking
- **Kingfisher**: Image loading and caching
- **KeychainAccess**: Secure token storage
- **Socket.IO-Client-Swift**: Real-time communication
- **Google-Mobile-Ads-SDK**: AdMob integration

## Features

### Phase 1 (Completed)
- [x] Project structure
- [x] Design system (colors, fonts)
- [x] API client with authentication
- [x] Models for all API responses
- [x] Auth flow (login, signup)
- [x] 5-tab navigation
- [x] Profile screen
- [x] Credits screen placeholder

### Phase 2 (TODO)
- [ ] Vertical video player with AVPlayer
- [ ] HLS streaming
- [ ] Custom player controls
- [ ] Gesture handling

### Phase 3 (TODO)
- [ ] Episode unlock system
- [ ] AdMob rewarded ads
- [ ] StoreKit 2 IAP integration
- [ ] Credits purchase flow

### Phase 4 (TODO)
- [ ] Socket.IO real-time features
- [ ] Comments UI
- [ ] Live like updates

## Configuration

### Development
- Base URL: `http://localhost:8000/api`
- Socket URL: `http://localhost:3002`
- Test AdMob IDs enabled

### Production
- Update `Config.swift` with production URLs
- Replace AdMob IDs
- Configure Apple IAP products

## Testing

Run tests:
```bash
xcodebuild test -workspace FUN.xcworkspace -scheme FUN -destination 'platform=iOS Simulator,name=iPhone 15'
```

## Building for Release

1. Set Config.current to `.production`
2. Update version in Info.plist
3. Archive: Product > Archive
4. Upload to TestFlight

## Troubleshooting

### CocoaPods Issues
```bash
pod deintegrate
pod install
```

### Build Errors
- Clean build folder: Cmd+Shift+K
- Delete DerivedData: ~/Library/Developer/Xcode/DerivedData

## License

Proprietary - All rights reserved
