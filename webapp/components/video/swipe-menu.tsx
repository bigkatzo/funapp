'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronUp, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeMenuProps {
  onPreviousEpisode?: () => void;
  onBackToDiscover?: () => void;
  onBackToSeries?: () => void;
  hasPrevious: boolean;
  mode: 'discover' | 'binge' | 'series';
  onClose: () => void;
}

export function SwipeMenu({
  onPreviousEpisode,
  onBackToDiscover,
  onBackToSeries,
  hasPrevious,
  mode,
  onClose,
}: SwipeMenuProps) {
  return (
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-40 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white/10 backdrop-blur-md rounded-2xl p-6 mx-4 max-w-sm w-full space-y-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-white text-center text-lg font-semibold mb-4">
          Where would you like to go?
        </div>

        {/* Previous Episode (if available) */}
        {hasPrevious && onPreviousEpisode && (
          <Button
            size="lg"
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={() => {
              onPreviousEpisode();
              onClose();
            }}
          >
            <ChevronUp className="mr-2 h-5 w-5" />
            Previous Episode
          </Button>
        )}

        {/* Back to Discover (in binge mode) */}
        {mode === 'binge' && onBackToDiscover && (
          <Button
            size="lg"
            variant="outline"
            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30"
            onClick={() => {
              onBackToDiscover();
              onClose();
            }}
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Discover
          </Button>
        )}

        {/* Back to Series (in series mode) */}
        {mode === 'series' && onBackToSeries && (
          <Button
            size="lg"
            variant="outline"
            className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30"
            onClick={() => {
              onBackToSeries();
              onClose();
            }}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Series
          </Button>
        )}

        {/* Cancel */}
        <Button
          size="lg"
          variant="ghost"
          className="w-full text-white/80 hover:text-white hover:bg-white/10"
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
