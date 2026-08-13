import React from 'react';
import type { ExtractionProgress } from '../types';
import { Loader2, XCircle } from 'lucide-react';

interface ProgressBarProps {
  progress: ExtractionProgress;
  onCancel: () => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, onCancel }) => {
  const estSecs = Math.max(0, Math.round(progress.estimatedTimeRemainingMs / 1000));

  return (
    <div className="tool-surface p-4 mb-6 border-[--accent-blue-border] bg-[--accent-blue-dim]">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-[--accent-blue] animate-spin" />
          <h4 className="font-bold text-xs text-[--text-primary] font-sans">
            Extracting Frames ({progress.currentFrame} / {progress.totalFrames})
          </h4>
        </div>

        <button
          onClick={onCancel}
          className="btn btn-ghost text-xs py-1 px-2 text-rose-400 hover:bg-rose-500/10 font-mono"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Cancel</span>
        </button>
      </div>

      <div className="w-full bg-[--bg-surface-3] h-1.5 rounded overflow-hidden mb-2">
        <div
          className="h-full bg-[--accent-blue] rounded transition-all duration-150"
          style={{ width: `${Math.min(100, Math.max(2, progress.percentage))}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] font-mono text-[--text-secondary]">
        <span>Speed: {progress.fpsSpeed} fps</span>
        <span className="font-bold text-[--accent-blue]">{progress.percentage}%</span>
        <span>ETA: {estSecs}s</span>
      </div>
    </div>
  );
};
