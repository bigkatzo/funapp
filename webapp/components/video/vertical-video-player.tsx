'use client';

import { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Episode } from '@/types';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VerticalVideoPlayerProps {
  episode: Episode;
  onLike?: () => void;
  onComment?: () => void;
  onShare?: () => void;
  onVideoEnd?: () => void;
  autoPlay?: boolean;
  className?: string;
}

export function VerticalVideoPlayer({
  episode,
  onLike,
  onComment,
  onShare,
  onVideoEnd,
  autoPlay = false,
  className,
}: VerticalVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showSeekAnimation, setShowSeekAnimation] = useState<'forward' | 'backward' | null>(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

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
            // Auto-play was prevented
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onVideoEnd?.();
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onVideoEnd]);

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
        // Double tap left side - rewind 10s
        video.currentTime = Math.max(0, video.currentTime - 10);
        setShowSeekAnimation('backward');
        setTimeout(() => setShowSeekAnimation(null), 500);
      } else if (x > (width * 2) / 3) {
        // Double tap right side - forward 10s
        video.currentTime = Math.min(video.duration, video.currentTime + 10);
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
          setTimeout(() => setShowControls(false), 2000);
        }
      }, 300);
    }
  };

  const handleTouchStart = () => {
    // Long press detection
    longPressTimerRef.current = setTimeout(() => {
      setIsLongPressing(true);
      setPlaybackSpeed(2);
      const video = videoRef.current;
      if (video) video.playbackRate = 2;
    }, 500);
  };

  const handleTouchEnd = () => {
    // Cancel long press
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isLongPressing) {
      setIsLongPressing(false);
      setPlaybackSpeed(1);
      const video = videoRef.current;
      if (video) video.playbackRate = 1;
    }
  };

  return (
    <div className={cn('relative h-screen w-full bg-black overflow-hidden', className)}>
      {/* Video Element */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-contain"
        playsInline
        onClick={handleTap}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
      />

      {/* Seek Animation Overlays */}
      {showSeekAnimation === 'backward' && (
        <div className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-6 animate-ping">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
            </svg>
          </div>
        </div>
      )}
      
      {showSeekAnimation === 'forward' && (
        <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-center pointer-events-none">
          <div className="bg-black/50 backdrop-blur-sm rounded-full p-6 animate-ping">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
            </svg>
          </div>
        </div>
      )}

      {/* Long Press Speed Indicator */}
      {isLongPressing && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="bg-black/70 backdrop-blur-md rounded-full px-6 py-3 text-white font-bold text-xl">
            2x Speed
          </div>
        </div>
      )}

      {/* Overlay Controls */}
      <div
        className={cn(
          'absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 transition-opacity',
          showControls ? 'opacity-100' : 'opacity-0'
        )}
      >
        {/* Top Info */}
        <div className="absolute top-0 left-0 right-0 p-4">
          <h2 className="text-white text-xl font-bold mb-1">{episode.title}</h2>
          <p className="text-white/80 text-sm line-clamp-2">{episode.description}</p>
        </div>

        {/* Center Play/Pause (only show when controls visible and not playing) */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Play className="h-10 w-10 text-white ml-1" />
            </div>
          </div>
        )}

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-end justify-between">
            {/* Left: Video controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>

            {/* Right: Social actions */}
            <div className="flex flex-col gap-4">
              <button
                onClick={onLike}
                className="flex flex-col items-center gap-1"
              >
                <div className={cn(
                  'rounded-full p-3 backdrop-blur-sm transition-colors',
                  episode.isLiked ? 'bg-red-500' : 'bg-white/20 hover:bg-white/30'
                )}>
                  <Heart
                    className={cn(
                      'h-6 w-6',
                      episode.isLiked ? 'text-white fill-white' : 'text-white'
                    )}
                  />
                </div>
                <span className="text-white text-xs">{episode.stats.likes}</span>
              </button>

              <button
                onClick={onComment}
                className="flex flex-col items-center gap-1"
              >
                <div className="rounded-full bg-white/20 hover:bg-white/30 p-3 backdrop-blur-sm transition-colors">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <span className="text-white text-xs">{episode.stats.comments}</span>
              </button>

              <button
                onClick={onShare}
                className="flex flex-col items-center gap-1"
              >
                <div className="rounded-full bg-white/20 hover:bg-white/30 p-3 backdrop-blur-sm transition-colors">
                  <Share2 className="h-6 w-6 text-white" />
                </div>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 h-1 bg-white/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
