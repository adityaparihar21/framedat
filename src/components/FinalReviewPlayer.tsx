import React, { useState, useEffect, useRef } from 'react';
import type { FrameData } from '../types';
import { Play, Pause, ChevronLeft, ChevronRight, Film, Grid } from 'lucide-react';

interface FinalReviewPlayerProps {
  frames: FrameData[];
  onOpenContactSheetModal: () => void;
}

export const FinalReviewPlayer: React.FC<FinalReviewPlayerProps> = ({
  frames,
  onOpenContactSheetModal,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.0);
  const timerRef = useRef<any>(null);

  const totalFrames = frames.length;
  const currentFrame = frames[currentIndex] || frames[0];

  // Auto-play extracted frame sequence
  useEffect(() => {
    if (isPlaying && totalFrames > 1) {
      const intervalMs = Math.max(40, Math.round(100 / speedMultiplier));
      timerRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalFrames);
      }, intervalMs);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, totalFrames, speedMultiplier]);

  if (totalFrames === 0) return null;

  const togglePlay = () => setIsPlaying(!isPlaying);

  const stepPrev = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + totalFrames) % totalFrames);
  };

  const stepNext = () => {
    setIsPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % totalFrames);
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-[--text-tertiary] uppercase tracking-wider">
          03 — FINAL REVIEW
        </span>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenContactSheetModal}
            className="btn btn-secondary text-xs py-1 px-3 flex items-center gap-1.5 font-mono"
          >
            <Grid className="w-3.5 h-3.5 text-[--accent-blue]" />
            <span>Create Contact Sheet</span>
          </button>

          <div className="text-xs font-mono text-[--text-secondary]">
            <span>{totalFrames} extracted frames  •  {currentFrame.width} × {currentFrame.height}  •  {currentFrame.format.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="tool-surface p-4">
        {/* Review Frame Canvas */}
        <div className="relative aspect-video max-h-[380px] mx-auto rounded bg-black flex items-center justify-center border border-[--border-subtle] mb-3 select-none">
          <img
            src={currentFrame.url}
            alt={currentFrame.filename}
            className="w-full h-full object-contain"
          />

          {/* Monospace Overlay */}
          <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-sm px-3 py-1.5 rounded border border-white/10 font-mono text-xs text-[--text-primary] flex items-center gap-3">
            <div>
              <span className="text-[--text-tertiary]">REVIEW FRAME: </span>
              <span className="font-bold text-[--accent-blue]">{currentIndex + 1}</span> / {totalFrames}
            </div>
            <span className="text-white/20">•</span>
            <div className="font-semibold text-[--text-primary]">{currentFrame.timeString}</div>
          </div>
        </div>

        {/* Review Navigation Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3 font-mono text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={stepPrev}
              className="btn btn-secondary py-1 px-2.5 text-xs"
              title="Previous Extracted Frame"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="btn btn-primary py-1 px-3 text-xs"
              title={isPlaying ? 'Pause Review' : 'Play Review'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={stepNext}
              className="btn btn-secondary py-1 px-2.5 text-xs"
              title="Next Extracted Frame"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <span className="ml-2 text-[--text-secondary]">
              Frame <strong className="text-[--text-primary]">{currentIndex + 1}</strong> of {totalFrames}
            </span>
          </div>

          {/* Playback Speed Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-[--text-tertiary] flex items-center gap-1">
              <Film className="w-3.5 h-3.5 text-[--accent-blue]" /> Speed:
            </span>
            <div className="segmented-control font-mono text-[11px]">
              {[0.5, 1.0, 2.0].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeedMultiplier(s)}
                  className={speedMultiplier === s ? 'active' : ''}
                >
                  {s}×
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Review Sequence Scrubber */}
        <div className="pt-2 border-t border-[--border-subtle]">
          <input
            type="range"
            min="0"
            max={totalFrames - 1}
            value={currentIndex}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentIndex(parseInt(e.target.value) || 0);
            }}
            className="w-full h-1.5 bg-[--bg-surface-3] rounded appearance-none cursor-pointer accent-[--accent-blue]"
          />
        </div>
      </div>
    </div>
  );
};
