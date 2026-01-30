/**
 * FUN App - Preferences Manager
 */

package com.fun.app.core.storage

import android.content.Context
import android.content.SharedPreferences

class PreferencesManager(context: Context) {

    private val prefs: SharedPreferences = context.getSharedPreferences(
        "fun_preferences",
        Context.MODE_PRIVATE
    )

    var hasCompletedOnboarding: Boolean
        get() = prefs.getBoolean(KEY_ONBOARDING, false)
        set(value) = prefs.edit().putBoolean(KEY_ONBOARDING, value).apply()

    var videoQuality: VideoQuality
        get() {
            val value = prefs.getString(KEY_VIDEO_QUALITY, VideoQuality.AUTO.name)
            return VideoQuality.valueOf(value ?: VideoQuality.AUTO.name)
        }
        set(value) = prefs.edit().putString(KEY_VIDEO_QUALITY, value.name).apply()

    var notificationsEnabled: Boolean
        get() = prefs.getBoolean(KEY_NOTIFICATIONS, true)
        set(value) = prefs.edit().putBoolean(KEY_NOTIFICATIONS, value).apply()

    var autoplayEnabled: Boolean
        get() = prefs.getBoolean(KEY_AUTOPLAY, true)
        set(value) = prefs.edit().putBoolean(KEY_AUTOPLAY, value).apply()

    companion object {
        private const val KEY_ONBOARDING = "has_completed_onboarding"
        private const val KEY_VIDEO_QUALITY = "video_quality"
        private const val KEY_NOTIFICATIONS = "notifications_enabled"
        private const val KEY_AUTOPLAY = "autoplay_enabled"
    }
}

enum class VideoQuality {
    AUTO,
    QUALITY_360P,
    QUALITY_540P,
    QUALITY_720P,
    QUALITY_1080P;

    val displayName: String
        get() = when (this) {
            AUTO -> "Auto"
            QUALITY_360P -> "360p"
            QUALITY_540P -> "540p"
            QUALITY_720P -> "720p"
            QUALITY_1080P -> "1080p"
        }
}
