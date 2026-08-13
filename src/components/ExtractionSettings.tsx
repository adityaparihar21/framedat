import React, { useState } from 'react';
import type { ExtractionOptions, ExtractionMode, ExportFormat, NamingPattern, VideoMetadata } from '../types';
import { calculateTimestamps } from '../utils/frameExtractor';
import { ChevronDown, ChevronUp, Play, Settings2 } from 'lucide-react';

interface ExtractionSettingsProps {
  metadata: VideoMetadata;
  options: ExtractionOptions;
  onChangeOptions: (newOptions: ExtractionOptions) => void;
  onStartExtraction: () => void;
  isExtracting: boolean;
}

export const ExtractionSettings: React.FC<ExtractionSettingsProps> = ({
  metadata,
  options,
  onChangeOptions,
  onStartExtraction,
  isExtracting,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const calculatedTimestamps = calculateTimestamps(metadata, options);
  const estimatedFrameCount = calculatedTimestamps.length;

  const handleModeChange = (mode: ExtractionMode) => {
    onChangeOptions({ ...options, mode });
  };

  const handleFormatChange = (format: ExportFormat) => {
    onChangeOptions({ ...options, format });
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-[--text-tertiary] uppercase tracking-wider">
          02 — CHOOSE EXTRACTION
        </span>
        <div className="text-xs font-mono text-[--text-secondary]">
          Expected output: <strong className="text-[--accent-blue] font-bold">{estimatedFrameCount} frames</strong>
        </div>
      </div>

      <div className="tool-surface p-4">
        {/* Mode Segment Control & Format Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[--text-secondary] font-sans">Method:</span>
            <div className="segmented-control">
              <button
                onClick={() => handleModeChange('all')}
                className={options.mode === 'all' ? 'active' : ''}
              >
                All Frames
              </button>
              <button
                onClick={() => handleModeChange('count')}
                className={options.mode === 'count' ? 'active' : ''}
              >
                N Frames
              </button>
              <button
                onClick={() => handleModeChange('interval')}
                className={options.mode === 'interval' ? 'active' : ''}
              >
                Time Interval
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[--text-secondary] font-sans">Format:</span>
            <div className="segmented-control font-mono text-xs uppercase">
              {(['png', 'tiff', 'bmp'] as ExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => handleFormatChange(fmt)}
                  className={options.format === fmt ? 'active font-bold' : ''}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Mode Controls */}
        <div className="p-3 rounded bg-[--bg-surface-2]/40 border border-[--border-subtle] mb-4 text-xs font-mono">
          {options.mode === 'count' && (
            <div className="flex items-center gap-4">
              <label className="text-[--text-secondary] shrink-0">Number of frames (N):</label>
              <input
                type="range"
                min="2"
                max={Math.min(500, metadata.totalFrames)}
                value={options.frameCount}
                onChange={(e) => onChangeOptions({ ...options, frameCount: parseInt(e.target.value) || 10 })}
                className="w-full h-1.5 bg-[--bg-surface-3] rounded appearance-none cursor-pointer accent-[--accent-blue]"
              />
              <input
                type="number"
                min="1"
                max={metadata.totalFrames}
                value={options.frameCount}
                onChange={(e) => onChangeOptions({ ...options, frameCount: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-20 px-2 py-1 rounded bg-[--bg-app] border border-[--border-subtle] text-center font-bold text-[--text-primary]"
              />
            </div>
          )}

          {options.mode === 'interval' && (
            <div className="flex items-center gap-4">
              <label className="text-[--text-secondary] shrink-0">Interval (Seconds):</label>
              <input
                type="number"
                step="0.1"
                min="0.05"
                max={metadata.duration}
                value={options.intervalSeconds}
                onChange={(e) => onChangeOptions({ ...options, intervalSeconds: Math.max(0.05, parseFloat(e.target.value) || 1) })}
                className="w-24 px-2 py-1 rounded bg-[--bg-app] border border-[--border-subtle] font-bold text-[--text-primary]"
              />
              <span className="text-[--text-tertiary]">(e.g., 1.0 = 1 frame/sec, 0.5 = 2 frames/sec)</span>
            </div>
          )}

          {options.mode === 'all' && (
            <div className="text-[--text-secondary]">
              Extracting all <strong className="text-[--text-primary]">{estimatedFrameCount} frames</strong> sequentially at {metadata.fps} FPS.
            </div>
          )}
        </div>

        {/* Dynamic Action Button & Advanced Toggle */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn btn-ghost text-xs py-1.5 px-2.5 flex items-center gap-1 text-[--text-secondary]"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Advanced Options</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onStartExtraction}
            disabled={isExtracting || estimatedFrameCount === 0}
            className="btn btn-primary text-xs py-2 px-6 font-semibold"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isExtracting ? 'Extracting...' : `Export ${estimatedFrameCount.toLocaleString()} Frames`}</span>
          </button>
        </div>

        {/* Progressive Disclosure Advanced Options */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-[--border-subtle] grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[11px] font-mono text-[--text-tertiary] uppercase mb-1">
                Resolution Scale
              </label>
              <select
                value={options.scaleRatio}
                onChange={(e) => onChangeOptions({ ...options, scaleRatio: parseFloat(e.target.value) })}
                className="w-full px-2.5 py-1.5 rounded bg-[--bg-app] border border-[--border-subtle] font-mono text-[--text-primary]"
              >
                <option value={1.0}>100% Native ({metadata.width}×{metadata.height})</option>
                <option value={0.75}>75% Scale ({Math.round(metadata.width * 0.75)}×{Math.round(metadata.height * 0.75)})</option>
                <option value={0.5}>50% Scale ({Math.round(metadata.width * 0.5)}×{Math.round(metadata.height * 0.5)})</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-[--text-tertiary] uppercase mb-1">
                Naming Pattern
              </label>
              <select
                value={options.namingPattern}
                onChange={(e) => onChangeOptions({ ...options, namingPattern: e.target.value as NamingPattern })}
                className="w-full px-2.5 py-1.5 rounded bg-[--bg-app] border border-[--border-subtle] font-mono text-[--text-primary]"
              >
                <option value="frame_number">video_frame_0001.png</option>
                <option value="timestamp">video_00-01-23-450.png</option>
                <option value="seconds">video_12.50s.png</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
