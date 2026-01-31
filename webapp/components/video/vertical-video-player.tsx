'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Hls from 'hls.js';
import { Play, Heart, MessageCircle, Share2, ArrowLeft, ChevronUp, ChevronDown } from 'lucide-react';
import { Episode, Series, PlaylistMode } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VerticalVideoPlayerProps {
  episode: Episode;
  series?: Series;
  mode?: PlaylistMode;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onVideoEnd?: () => void;
  onBackClick?: () => void;
  onSeriesTitleClick?: () => void;
  onNextEpisode?: () => void;
  onPrevEpisode?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  currentPosition?: { current: number; total: number };
  autoPlay?: boolean;
  className?: string;
}

export function VerticalVideoPlayer({
  episode,
  series,
  mode = 'discover',
  onLike,
  onComment,
  onShare,
  onVideoEnd,
  onBackClick,
  onSeriesTitleClick,
  onNextEpisode,
  onPrevEpisode,
  hasNext = false,
  hasPrevious = false,
  currentPosition,
  autoPlay = false,
  className,
}: VerticalVideoPlayerProps) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showSeekAnimation, setShowSeekAnimation] = useState<'forward' | 'backward' | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [speedLocked, setSpeedLocked] = useState(false);
  const [isSeekingHover, setIsSeekingHover] = useState(false);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekPosition, setSeekPosition] = useState(0);
  const [seekTime, setSeekTime] = useState(0);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const unlockTimerRef = useRef<NodeJS.Timeout | null>(null);
  const seekingRef = useRef(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [duration, setDuration] = useState(0);

  // Initialize video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !episode.videoUrl) return;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      
      hls.loadSource(episode.videoUrl);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => {
            setIsPlaying(false);
          });
        }
      });

      hlsRef.current = hls;

      return () => {
        hls.destroy();
      };
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = episode.videoUrl;
      if (autoPlay) {
        video.play().catch(() => setIsPlaying(false));
      }
    }
  }, [episode.videoUrl, autoPlay]);

  // Video event listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      // Don't update progress bar while user is actively seeking
      if (seekingRef.current) return;
      
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
      setCurrentTime(video.currentTime);
    };
    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onVideoEnd?.();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onVideoEnd]);

  // Auto-hide controls
  useEffect(() => {
    if (showControls && isPlaying) {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [showControls, isPlaying]);

  // Desktop hover detection - show controls on mouse movement
  useEffect(() => {
    let mouseIdleTimer: NodeJS.Timeout | null = null;
    let lastMouseMoveTime = Date.now();

    const handleMouseMove = () => {
      const now = Date.now();
      // Debounce: only update if >100ms since last move
      if (now - lastMouseMoveTime < 100) return;
      
      lastMouseMoveTime = now;
      
      // Show controls on mouse movement
      if (!showControls) {
        setShowControls(true);
      }
      
      // Clear existing timer
      if (mouseIdleTimer) {
        clearTimeout(mouseIdleTimer);
      }
      
      // Hide controls after 3 seconds of no mouse movement (only when playing)
      if (isPlaying) {
        mouseIdleTimer = setTimeout(() => {
          setShowControls(false);
        }, 3000);
      }
    };

    // Only add listener on desktop (devices with mouse)
    const isDesktop = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    
    if (isDesktop) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      if (isDesktop) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      if (mouseIdleTimer) {
        clearTimeout(mouseIdleTimer);
      }
    };
  }, [showControls, isPlaying]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      video.requestFullscreen();
    }
  };

  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    
    // Double tap detection (within 300ms)
    if (timeSinceLastTap < 300) {
      // Double tap detected
      const video = videoRef.current;
      if (!video) return;
      
      if (x < width / 3) {
        // Double tap left side - rewind 5s
        video.currentTime = Math.max(0, video.currentTime - 5);
        setShowSeekAnimation('backward');
        setTimeout(() => setShowSeekAnimation(null), 500);
      } else if (x > (width * 2) / 3) {
        // Double tap right side - forward 5s
        video.currentTime = Math.min(video.duration, video.currentTime + 5);
        setShowSeekAnimation('forward');
        setTimeout(() => setShowSeekAnimation(null), 500);
      }
      
      lastTapRef.current = 0; // Reset to prevent triple tap
    } else {
      // Single tap - toggle play/pause
      lastTapRef.current = now;
      setTimeout(() => {
        if (lastTapRef.current === now) {
          // Confirmed single tap (no double tap followed)
          togglePlay();
          setShowControls(true);
        }
      }, 300);
    }
  };

  const handleTouchStart = () => {
    const video = videoRef.current;
    if (!video) return;

    if (speedLocked) {
      // If speed is locked, start unlock timer (2 seconds)
      setIsUnlocking(true);
      unlockTimerRef.current = setTimeout(() => {
        // Unlock after 2 seconds
        setSpeedLocked(false);
        setPlaybackSpeed(1);
        video.playbackRate = 1;
        setIsUnlocking(false);
        setIsLongPressing(false);
      }, 2000);
    } else {
      // Start 2x speed after 500ms
      longPressTimerRef.current = setTimeout(() => {
        setIsLongPressing(true);
        setPlaybackSpeed(2);
        video.playbackRate = 2;
        
        // After 3 seconds of holding, lock the speed
        lockTimerRef.current = setTimeout(() => {
          setSpeedLocked(true);
        }, 3000);
      }, 500);
    }
  };

  const handleTouchEnd = () => {
    // Clear all timers
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (lockTimerRef.current) {
      clearTimeout(lockTimerRef.current);
      lockTimerRef.current = null;
    }
    if (unlockTimerRef.current) {
      clearTimeout(unlockTimerRef.current);
      unlockTimerRef.current = null;
    }
    
    // If was unlocking, cancel it
    if (isUnlocking) {
      setIsUnlocking(false);
      return;
    }
    
    // If speed is not locked and was pressing, return to normal
    if (isLongPressing && !speedLocked) {
      setIsLongPressing(false);
      setPlaybackSpeed(1);
      const video = videoRef.current;
      if (video) video.playbackRate = 1;
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleSeekBarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = (parseFloat(e.target.value) / 100) * video.duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSeekStart = () => {
    setIsSeeking(true);
    seekingRef.current = true;
  };

  const handleSeekEnd = () => {
    setIsSeeking(false);
    seekingRef.current = false;
  };

  const handleSeekBarInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const percentage = parseFloat(e.target.value);
    const newTime = (percentage / 100) * video.duration;
    
    // Update states for UI - INCLUDING progress for visual feedback
    setProgress(percentage);
    setSeekPosition(percentage);
    setSeekTime(newTime);
    setCurrentTime(newTime);
    
    // Smooth scrubbing: update video time during drag
    video.currentTime = newTime;
  };

  const seriesTitle = series?.title || episode.title;
  const episodeLabel = currentPosition 
    ? `Episode ${currentPosition.current} of ${currentPosition.total}`
    : `S${episode.seasonNumber}E${episode.episodeNumber}`;

  return (
    <div className={cn('relative h-full w-full bg-black overflow-hidden', className)}>
      {/* Video Element - No event handlers */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain"
        playsInline
      />

      {/* Gesture Capture Overlay - Handles all tap/touch interactions */}
      <div
        className="absolute inset-0 z-10"
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      />


      {/* Seek Animation Overlays (non-interactive) */}
      {showSeekAnimation === 'backward' && (
        <div className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-center pointer-events-none z-30">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-6 animate-ping">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </div>
        </div>
      )}
      
      {showSeekAnimation === 'forward' && (
        <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-center pointer-events-none z-30">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-6 animate-ping">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </div>
        </div>
      )}

      {/* Long Press Speed Indicator (non-interactive) */}
      {(isLongPressing || speedLocked || isUnlocking) && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30">
          <div className="bg-black/70 backdrop-blur-md rounded-full px-6 py-3 text-white font-bold text-xl">
            {isUnlocking ? 'Unlocking...' : speedLocked ? '2x Speed (Locked)' : '2x Speed'}
          </div>
        </div>
      )}

      {/* Overlay Controls (with proper pointer events) */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60 transition-opacity duration-300 pointer-events-none',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Top Bar */}
        <div className="absolute top-0 left-0 right-0 p-4 pt-safe z-40">
          <div className="flex items-start justify-between">
            {/* Left: Back button only */}
            {onBackClick && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 pointer-events-auto"
                onClick={onBackClick}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            )}
            
            {/* Right: Episode counter + Mute button */}
            <div className="flex items-center gap-2">
              {currentPosition && (
                <div className="text-white text-xs font-medium bg-black/30 px-2 py-1 rounded-full pointer-events-none">
                  {currentPosition.current}/{currentPosition.total}
                </div>
              )}
              
              {/* Mute/Unmute Button - TikTok style */}
              <button
                onClick={toggleMute}
                className="pointer-events-auto p-2 rounded-full hover:bg-white/20 transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Center Play/Pause (only show when paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-10 w-10 text-white ml-1" />
            </div>
          </div>
        )}

        {/* Right Side: Profile + Social Actions (TikTok Style) */}
        <div className="absolute right-4 bottom-24 flex flex-col gap-6 z-40 pointer-events-auto">
          {/* Series Profile Bubble - TikTok style */}
          {series && onSeriesTitleClick && (
            <button
              onClick={onSeriesTitleClick}
              className="flex flex-col items-center relative"
            >
              <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-white/10">
                <img
                  src={series.thumbnailUrl || series.creator?.profileImage || 'https://api.dicebear.com/7.x/initials/svg?seed=' + series.title}
                  alt={series.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Plus icon overlay like TikTok */}
              <div className="absolute -bottom-2 bg-red-500 rounded-full p-1">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
              </div>
            </button>
          )}
          
          {/* Like Button - Minimalist */}
          <button
            onClick={onLike}
            className="flex flex-col items-center gap-1"
          >
            <Heart
              className={cn(
                'h-8 w-8 transition-all',
                episode.isLiked 
                  ? 'text-red-500 fill-red-500' 
                  : 'text-white drop-shadow-lg'
              )}
              strokeWidth={1.5}
            />
            <span className="text-white text-xs font-semibold drop-shadow-lg">
              {formatCount(episode.stats.likes)}
            </span>
          </button>

          {/* Comment Button - Minimalist */}
          <button
            onClick={onComment}
            className="flex flex-col items-center gap-1"
          >
            <MessageCircle
              className="h-8 w-8 text-white drop-shadow-lg"
              strokeWidth={1.5}
            />
            <span className="text-white text-xs font-semibold drop-shadow-lg">
              {formatCount(episode.stats.comments)}
            </span>
          </button>

          {/* Share Button - Minimalist */}
          <button
            onClick={onShare}
            className="flex flex-col items-center gap-1"
          >
            <Share2
              className="h-8 w-8 text-white drop-shadow-lg"
              strokeWidth={1.5}
            />
          </button>

          {/* Episode navigation arrows */}
          {(hasNext || hasPrevious) && (
            <div className="flex flex-col gap-3 mt-4 border-t border-white/20 pt-4">
              {hasPrevious && onPrevEpisode && (
                <button
                  onClick={onPrevEpisode}
                  className="rounded-full bg-white/20 hover:bg-white/30 p-2.5 md:p-3 backdrop-blur-sm transition-colors"
                  aria-label="Previous episode"
                >
                  <ChevronUp className="h-6 w-6 text-white" />
                </button>
              )}
              {hasNext && onNextEpisode && (
                <button
                  onClick={onNextEpisode}
                  className="rounded-full bg-white/20 hover:bg-white/30 p-2.5 md:p-3 backdrop-blur-sm transition-colors animate-bounce"
                  aria-label="Next episode"
                >
                  <ChevronDown className="h-6 w-6 text-white" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Bottom Info - Reordered: Info First, Seek Below */}
        <div className="absolute bottom-0 left-0 right-0 pb-20 z-40 px-4">
          {/* Episode Info First - Clickable */}
          <button
            onClick={onSeriesTitleClick}
            className="pointer-events-auto mb-6 text-left w-full hover:opacity-80 transition-opacity"
          >
            <h3 className="text-white font-bold text-base mb-0.5 truncate">{episode.title}</h3>
            <p className="text-white/80 text-sm truncate">
              {seriesTitle} • {episodeLabel}
            </p>
          </button>
          
          {/* Seek Bar with Larger Touch Target */}
          <div className="pointer-events-auto relative py-3 -my-3">
            {/* Time bubble follows thumb - TikTok style */}
            {isSeeking && (
              <div 
                className="absolute -top-10 pointer-events-none z-50"
                style={{
                  left: `${seekPosition}%`,
                  transform: 'translateX(-50%)'
                }}
              >
                <div className="bg-white text-black px-2.5 py-1 rounded-md text-xs font-semibold shadow-lg">
                  {formatTime(seekTime)}
                </div>
                {/* Small arrow pointing down */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-white rotate-45"></div>
              </div>
            )}
            
            <input
              type="range"
              min="0"
              max="100"
              value={isNaN(progress) ? 0 : progress}
              onInput={handleSeekBarInput}
              onChange={handleSeekBarChange}
              onMouseDown={handleSeekStart}
              onMouseUp={handleSeekEnd}
              onTouchStart={handleSeekStart}
              onTouchEnd={handleSeekEnd}
              className={cn(
                "w-full appearance-none cursor-pointer transition-all duration-200",
                isSeeking ? "seek-slider-active" : "seek-slider"
              )}
              style={{
                '--progress': `${isNaN(progress) ? 0 : progress}%`
              } as React.CSSProperties}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
