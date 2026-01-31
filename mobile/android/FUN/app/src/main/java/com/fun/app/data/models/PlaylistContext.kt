/**
 * FUN App - Playlist Context Models
 */

package com.fun.app.data.models

import com.squareup.moshi.JsonClass

enum class PlaylistMode {
    DISCOVER,
    BINGE,
    SERIES
}

data class PlaylistContext(
    val mode: PlaylistMode,
    val episodes: List<Episode>,
    var currentIndex: Int,
    val seriesId: String?,
    val seriesTitle: String?
) {
    val currentEpisode: Episode?
        get() = episodes.getOrNull(currentIndex)
    
    val nextEpisode: Episode?
        get() = episodes.getOrNull(currentIndex + 1)
    
    val previousEpisode: Episode?
        get() = episodes.getOrNull(currentIndex - 1)
    
    val hasNext: Boolean
        get() = currentIndex + 1 < episodes.size
    
    val hasPrevious: Boolean
        get() = currentIndex > 0
    
    val position: Pair<Int, Int>
        get() = Pair(currentIndex + 1, episodes.size)
    
    fun moveNext(): Boolean {
        return if (hasNext) {
            currentIndex++
            true
        } else {
            false
        }
    }
    
    fun movePrevious(): Boolean {
        return if (hasPrevious) {
            currentIndex--
            true
        } else {
            false
        }
    }
}
