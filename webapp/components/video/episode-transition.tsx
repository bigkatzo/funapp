'use client';

import { useEffect, useState } from 'react';
import { Episode } from '@/types';
import { cn } from '@/lib/utils';

interface EpisodeTransitionProps {
  fromEpisode: Episode;
  toEpisode: Episode;
  onComplete: () => void;
  duration?: number; // ms
}

export function EpisodeTransition({
  fromEpisode,
  toEpisode,
  onComplete,
  duration = 500,
}: EpisodeTransitionProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onComplete, 300); // Wait for fade out
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'absolute inset-0 bg-black flex items-center justify-center z-50',
        'animate-in fade-in duration-200'
      )}
    >
      <div className="text-center max-w-md mx-4">
        {/* Episode transition indicator */}
        <div className="relative">
          {/* From episode fades out */}
          <div className="animate-out fade-out slide-out-to-left duration-300 mb-6">
            <div className="text-white/60 text-sm mb-2">Now leaving</div>
            <div className="text-white/80 font-semibold">{fromEpisode.title}</div>
          </div>

          {/* Arrow indicator */}
          <div className="my-4">
            <svg
              className="w-12 h-12 mx-auto text-purple-500 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {/* To episode fades in */}
          <div className="animate-in fade-in slide-in-from-right duration-300 mt-6">
            <div className="text-white/60 text-sm mb-2">Up next</div>
            <div className="text-white font-bold text-lg">{toEpisode.title}</div>
            <div className="text-purple-400 text-sm mt-1">
              S{toEpisode.seasonNumber}E{toEpisode.episodeNumber}
            </div>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="mt-8">
          <div className="w-16 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-purple-500 rounded-full animate-loading-bar" />
          </div>
        </div>
      </div>
    </div>
  );
}

{/* Add this to your globals.css if not already present */}
/* 
@keyframes loading-bar {
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
}

.animate-loading-bar {
  animation: loading-bar 0.5s ease-in-out forwards;
}
*/
