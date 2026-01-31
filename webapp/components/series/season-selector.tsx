'use client';

import { Season } from '@/types';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface SeasonSelectorProps {
  seasons: Season[];
  currentSeason: number;
  onSeasonChange: (seasonNumber: number) => void;
  completedSeasons?: number[];
}

export function SeasonSelector({
  seasons,
  currentSeason,
  onSeasonChange,
  completedSeasons = [],
}: SeasonSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (seasons.length <= 1) {
    return null; // Don't show selector if only one season
  }

  const currentSeasonData = seasons.find((s) => s.seasonNumber === currentSeason);

  return (
    <div className="relative">
      {/* Selected Season Button */}
      <Button
        variant="outline"
        className="w-full justify-between text-left font-semibold"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>
          {currentSeasonData?.title || `Season ${currentSeason}`}
          {completedSeasons.includes(currentSeason) && (
            <Check className="inline ml-2 h-4 w-4 text-green-500" />
          )}
        </span>
        <ChevronDown
          className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Menu */}
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {seasons
              .sort((a, b) => a.seasonNumber - b.seasonNumber)
              .map((season) => {
                const isCompleted = completedSeasons.includes(season.seasonNumber);
                const isCurrent = season.seasonNumber === currentSeason;

                return (
                  <button
                    key={season.seasonNumber}
                    className={cn(
                      'w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors',
                      'border-b last:border-b-0',
                      isCurrent && 'bg-purple-50 dark:bg-purple-900/20'
                    )}
                    onClick={() => {
                      onSeasonChange(season.seasonNumber);
                      setIsOpen(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {season.title || `Season ${season.seasonNumber}`}
                          {isCompleted && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        {season.description && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {season.description}
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          {season.episodes.length} episode
                          {season.episodes.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      {isCurrent && (
                        <div className="w-2 h-2 rounded-full bg-purple-600 ml-3" />
                      )}
                    </div>
                  </button>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
