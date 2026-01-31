# Android UX Implementation Guide

## Overview
Complete implementation guide for applying all UX improvements to Android app to match web and iOS.

---

## FILES TO MODIFY

### 1. EnhancedVerticalVideoPlayer.kt
**Path**: `mobile/android/FUN/app/src/main/java/com/fun/app/ui/components/video/EnhancedVerticalVideoPlayer.kt`

#### Changes Needed:

**A. Minimalist Social Buttons (Remove IconButton backgrounds)**

FIND (around line 344-369):
```kotlin
IconButton(onClick = { /* TODO: Like */ }) {
    Icon(
        imageVector = if (currentEpisode.isLiked == true) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
        contentDescription = "Like",
        tint = if (currentEpisode.isLiked == true) Color.Red else Color.White,
        modifier = Modifier.size(28.dp)
    )
}
```

REPLACE WITH:
```kotlin
// Minimalist button - NO background
Column(
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.spacedBy(4.dp)
) {
    Icon(
        imageVector = if (currentEpisode.isLiked == true) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
        contentDescription = "Like",
        tint = if (currentEpisode.isLiked == true) Color.Red else Color.White,
        modifier = Modifier
            .size(32.dp)
            .shadow(2.dp)
            .clickable { /* TODO: Like */ }
    )
    
    Text(
        text = formatCount(currentEpisode.stats?.likes ?: 0),
        style = MaterialTheme.typography.labelSmall,
        color = Color.White,
        fontWeight = FontWeight.Bold,
        modifier = Modifier.shadow(elevation = 1.dp)
    )
}
```

Apply same pattern to Comment and Share buttons.

**B. Add Profile Bubble (TikTok-style)**

ADD before Like button (around line 343):
```kotlin
// Profile Bubble (TikTok-style)
if (series != null) {
    Box(
        modifier = Modifier.size(48.dp),
        contentAlignment = Alignment.BottomCenter
    ) {
        AsyncImage(
            model = series.thumbnailUrl,
            contentDescription = "Series",
            modifier = Modifier
                .size(48.dp)
                .clip(CircleShape)
                .border(2.dp, Color.White, CircleShape)
                .clickable { onSeriesTitleTap() }
        )
        
        // Plus icon overlay
        Box(
            modifier = Modifier
                .size(20.dp)
                .offset(y = 8.dp)
                .background(Color.Red, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.Add,
                contentDescription = "Follow",
                tint = Color.White,
                modifier = Modifier.size(12.dp)
            )
        }
    }
    
    Spacer(modifier = Modifier.height(24.dp))
}
```

**C. Add Mute Button to Top Bar**

FIND controls overlay top bar (around line 230):
```kotlin
Row(
    modifier = Modifier
        .fillMaxWidth()
        .padding(16.dp)
        .padding(top = 24.dp),
    horizontalArrangement = Arrangement.SpaceBetween
) {
    // Back button
    IconButton(onClick = onBackClick) {
        Icon(...)
    }
    
    // Series title
    Text(...)
}
```

REPLACE WITH:
```kotlin
Row(
    modifier = Modifier
        .fillMaxWidth()
        .padding(16.dp)
        .padding(top = 24.dp),
    horizontalArrangement = Arrangement.SpaceBetween,
    verticalAlignment = Alignment.Top
) {
    // Left: Back button
    IconButton(onClick = onBackClick) {
        Icon(...)
    }
    
    Spacer(modifier = Modifier.weight(1f))
    
    // Right: Episode counter + Mute
    Row(
        horizontalArrangement = Arrangement.spacedBy(12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Episode counter
        if (context.currentIndex > 0 && context.totalEpisodes > 0) {
            Text(
                text = "${context.currentIndex}/${context.totalEpisodes}",
                style = MaterialTheme.typography.labelSmall,
                color = Color.White,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .background(Color.Black.copy(alpha = 0.3f), RoundedCornerShape(12.dp))
                    .padding(horizontal = 8.dp, vertical = 4.dp)
            )
        }
        
        // Mute button (TikTok-style)
        IconButton(onClick = { 
            isMuted = !isMuted
            exoPlayer.volume = if (isMuted) 0f else 1f
        }) {
            Icon(
                imageVector = if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                contentDescription = if (isMuted) "Unmute" else "Mute",
                tint = Color.White,
                modifier = Modifier.size(20.dp)
            )
        }
    }
}
```

**D. Update Seek Bar to White + Add Time Bubble**

FIND seek bar (around line 300):
```kotlin
Slider(
    value = playerState.progress,
    onValueChange = { newProgress ->
        val newPosition = (playerState.duration * newProgress).toLong()
        exoPlayer.seekTo(newPosition)
    },
    modifier = Modifier.fillMaxWidth(),
    colors = SliderDefaults.colors(
        thumbColor = Color.Red,
        activeTrackColor = Color.Red,
        inactiveTrackColor = Color.White.copy(alpha = 0.3f)
    )
)
```

REPLACE WITH:
```kotlin
// Add state at top of composable
var isSeeking by remember { mutableStateOf(false) }
var seekTime by remember { mutableStateOf(0L) }

// In seek bar section:
Box(modifier = Modifier.fillMaxWidth()) {
    // Time bubble (shows while seeking)
    if (isSeeking) {
        Text(
            text = formatTime(seekTime),
            style = MaterialTheme.typography.labelSmall,
            color = Color.Black,
            fontWeight = FontWeight.Bold,
            modifier = Modifier
                .align(Alignment.TopStart)
                .offset(
                    x = (sliderWidth * playerState.progress).dp,
                    y = (-40).dp
                )
                .background(Color.White, RoundedCornerShape(8.dp))
                .padding(horizontal = 10.dp, vertical = 6.dp)
                .shadow(4.dp, RoundedCornerShape(8.dp))
        )
    }
    
    Slider(
        value = playerState.progress,
        onValueChange = { newProgress ->
            isSeeking = true
            val newPosition = (playerState.duration * newProgress).toLong()
            seekTime = newPosition
            // Real-time scrubbing
            exoPlayer.seekTo(newPosition)
        },
        onValueChangeFinished = {
            isSeeking = false
        },
        modifier = Modifier
            .fillMaxWidth()
            .height(40.dp), // Larger touch target
        colors = SliderDefaults.colors(
            thumbColor = Color.White,
            activeTrackColor = Color.White,
            inactiveTrackColor = Color.White.copy(alpha = 0.3f)
        )
    )
}
```

**E. Add formatCount Helper**

ADD at bottom of file:
```kotlin
private fun formatCount(count: Int): String {
    return when {
        count >= 1_000_000 -> String.format("%.1fM", count / 1_000_000.0)
        count >= 1_000 -> String.format("%.1fK", count / 1_000.0)
        else -> count.toString()
    }
}

private fun formatTime(millis: Long): String {
    val seconds = (millis / 1000).toInt()
    val minutes = seconds / 60
    val secs = seconds % 60
    return String.format("%d:%02d", minutes, secs)
}
```

---

### 2. ShareIcon.kt (NEW FILE)
**Path**: `mobile/android/FUN/app/src/main/java/com/fun/app/ui/components/common/ShareIcon.kt`

CREATE NEW FILE:
```kotlin
package com.fun.app.ui.components.common

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.StrokeJoin
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun ShareIcon(
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp),
        modifier = modifier.clickable { onClick() }
    ) {
        Canvas(modifier = Modifier.size(32.dp)) {
            val path = Path().apply {
                // Box outline
                moveTo(8f, 16f)
                lineTo(8f, 24f)
                cubicTo(8f, 25.1f, 8.9f, 26f, 10f, 26f)
                lineTo(22f, 26f)
                cubicTo(23.1f, 26f, 24f, 25.1f, 24f, 24f)
                lineTo(24f, 16f)
                
                // Arrow polyline
                moveTo(20f, 10f)
                lineTo(16f, 6f)
                lineTo(12f, 10f)
                
                // Vertical line
                moveTo(16f, 6f)
                lineTo(16f, 19f)
            }
            
            drawPath(
                path = path,
                color = Color.White,
                style = Stroke(
                    width = 1.5.dp.toPx(),
                    cap = StrokeCap.Round,
                    join = StrokeJoin.Round
                )
            )
        }
    }
}
```

USE IN EnhancedVerticalVideoPlayer:
```kotlin
ShareIcon(onClick = { /* TODO: Share */ })
```

---

### 3. Theme.kt
**Path**: `mobile/android/FUN/app/src/main/java/com/fun/app/ui/theme/Theme.kt`

ADD text selection disabling:
```kotlin
import androidx.compose.foundation.text.selection.LocalTextSelectionColors
import androidx.compose.foundation.text.selection.TextSelectionColors

@Composable
fun FUNTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme
    
    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = {
            // Disable text selection globally for video screens
            CompositionLocalProvider(
                LocalTextSelectionColors provides TextSelectionColors(
                    handleColor = Color.Transparent,
                    backgroundColor = Color.Transparent
                )
            ) {
                content()
            }
        }
    )
}
```

---

### 4. MainActivity.kt
**Path**: `mobile/android/FUN/app/src/main/java/com/fun/app/MainActivity.kt`

ADD edge-to-edge display:
```kotlin
import androidx.core.view.WindowCompat

override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    
    // Enable edge-to-edge display
    WindowCompat.setDecorFitsSystemWindows(window, false)
    
    setContent {
        FUNTheme {
            Surface(
                modifier = Modifier.fillMaxSize(),
                color = MaterialTheme.colorScheme.background
            ) {
                NavGraph()
            }
        }
    }
}
```

---

### 5. WatchScreen.kt
**Path**: `mobile/android/FUN/app/src/main/java/com/fun/app/ui/screens/watch/WatchScreen.kt`

ENSURE proper viewport handling:
```kotlin
import androidx.compose.foundation.layout.systemBarsPadding

@Composable
fun WatchScreen(...) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .systemBarsPadding() // Only for status bar
    ) {
        EnhancedVerticalVideoPlayer(...)
    }
}
```

---

## IMPLEMENTATION CHECKLIST

### Android Todo 6: Minimalist Buttons
- [ ] Remove IconButton from Like, Comment, Share
- [ ] Change to Column with Icon + Text
- [ ] Size 32.dp with shadow
- [ ] Add formatCount function
- [ ] Remove all circular backgrounds

### Android Todo 7: Profile Bubble & Mute
- [ ] Add profile bubble above social buttons
- [ ] AsyncImage in Circle with white border
- [ ] Red plus icon overlay
- [ ] Add mute button top-right
- [ ] Restructure top bar layout
- [ ] Add isMuted state
- [ ] Connect to ExoPlayer volume

### Android Todo 8: Seek Bar Improvements
- [ ] Change colors to white (thumb + active track)
- [ ] Add isSeeking state
- [ ] Add seekTime state
- [ ] Add time bubble Box overlay
- [ ] Implement real-time scrubbing in onValueChange
- [ ] Add onValueChangeFinished
- [ ] Increase touch target (height = 40.dp)
- [ ] Add formatTime function

### Android Todo 9: Share Icon
- [ ] Create ShareIcon.kt file
- [ ] Implement Canvas with Path drawing
- [ ] Box outline with curves
- [ ] Arrow polyline
- [ ] Vertical line
- [ ] White stroke with rounded caps
- [ ] Use in EnhancedVerticalVideoPlayer

### Android Todo 10: Touch & Viewport
- [ ] Add LocalTextSelectionColors to Theme
- [ ] WindowCompat in MainActivity
- [ ] systemBarsPadding in WatchScreen
- [ ] Verify AndroidManifest flags

---

## TESTING

After implementation:
1. Build and run on Android device/emulator
2. Test all gestures (tap, double-tap, long-press)
3. Verify minimalist buttons (no backgrounds)
4. Check profile bubble and mute button
5. Test seek bar with time bubble
6. Verify modern share icon
7. Check touch behavior (no text selection)
8. Verify viewport (no scroll, proper fit)

---

## ESTIMATED TIME
- Todo 6: 30 min
- Todo 7: 45 min
- Todo 8: 45 min
- Todo 9: 30 min
- Todo 10: 30 min
**Total**: ~3 hours

---

## STATUS
🚧 PENDING - Ready for implementation
