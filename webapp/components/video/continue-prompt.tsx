'use client';

import { useState, useEffect } from 'react';
import { Episode, Series } from '@/types';
import { Button } from '@/components/ui/button';
import { Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContinuePromptProps {
  series: Series;
  nextEpisode: Episode;
  onContinue: () => void;
  onSkip: () => void;
  autoCloseDelay?: number; // ms before auto-skipping
}

export function ContinuePrompt({
  series,
  nextEpisode,
  onContinue,
  onSkip,
  autoCloseDelay = 10000,
}: ContinuePromptProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [countdown, setCountdown] = useState(Math.floor(autoCloseDelay / 1000));

  useEffect(() => {
    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          onSkip(); // Auto-skip when countdown reaches 0
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [onSkip]);

  const handleContinue = () => {
    setIsVisible(false);
    setTimeout(onContinue, 300); // Wait for animation
  };

  const handleSkip = () => {
    setIsVisible(false);
    setTimeout(onSkip, 300);
  };

  if (!isVisible) return null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-in fade-in duration-300">
      <div className="max-w-md w-full mx-4">
        {/* Series Thumbnail */}
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-6">
          <img
            src={nextEpisode.thumbnailUrl}
            alt={nextEpisode.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
            <div>
              <div className="text-white/80 text-sm mb-1">Next Episode</div>
              <div className="text-white font-bold text-lg">{nextEpisode.title}</div>
            </div>
          </div>
        </div>

        {/* Series Info */}
        <div className="text-center mb-6">
          <h3 className="text-white text-2xl font-bold mb-2">Continue watching?</h3>
          <p className="text-white/80 text-lg">{series.title}</p>
          <p className="text-white/60 text-sm mt-1">
            Season {nextEpisode.seasonNumber}, Episode {nextEpisode.episodeNumber}
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white text-lg h-14"
            onClick={handleContinue}
          >
            <Play className="mr-2 h-5 w-5" />
            Continue Watching
          </Button>

          <Button
            size="lg"
            variant="outline"
            className="w-full bg-white/10 border-white/30 text-white hover:bg-white/20 text-lg h-14"
            onClick={handleSkip}
          >
            <X className="mr-2 h-5 w-5" />
            Keep Discovering ({countdown}s)
          </Button>
        </div>

        {/* Episode Description */}
        {nextEpisode.description && (
          <p className="text-white/60 text-sm mt-6 text-center line-clamp-2">
            {nextEpisode.description}
          </p>
        )}
      </div>
    </div>
  );
}
