import React, { useRef, useState, useEffect } from 'react';
import type { VideoMetadata, ExtractionOptions } from '../types';
import { formatSecondsToTimecode } from '../utils/videoMetadata';
import { calculateTimestamps } from '../utils/frameExtractor';
import { Play, Pause, ChevronLeft, ChevronRight, Camera, Scissors } from 'lucide-react';

interface VideoPlayerScrubberProps {
  metadata: VideoMetadata;
  options: ExtractionOptions;
  onChangeOptions: (newOptions: ExtractionOptions) => void;
  onSnapshotFrame: (timestamp: number) => void;
}

export const VideoPlayerScrubber: React.FC<VideoPlayerScrubberProps> = ({
  metadata,
  options,
  onChangeOptions,
  onSnapshotFrame,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentFrameNum, setCurrentFrameNum] = useState(1);
  const [draggingHandle, setDraggingHandle] = useState<'in' | 'out' | null>(null);

  const frameTime = 1 / metadata.fps;
  const startTime = options.startTime;
  const endTime = options.endTime > 0 ? options.endTime : metadata.duration;
  const trimDuration = Math.max(0, endTime - startTime);

  // Expected timestamps based on trim range and mode
  const expectedTimestamps = calculateTimestamps(metadata, options);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const t = videoRef.current.currentTime;
      setCurrentTime(t);
      const frameIdx = Math.max(1, Math.min(metadata.totalFrames, Math.round(t * metadata.fps) + 1));
      setCurrentFrameNum(frameIdx);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const stepFrame = (direction: 'prev' | 'next') => {
    if (videoRef.current) {
      videoRef.current.pause();
      setIsPlaying(false);
      const delta = direction === 'prev' ? -frameTime : frameTime;
      const targetTime = Math.max(0, Math.min(metadata.duration, videoRef.current.currentTime + delta));
      videoRef.current.currentTime = targetTime;
    }
  };

  const handlePlayheadSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Drag handles logic for Trim IN / OUT
  const handlePointerDown = (handle: 'in' | 'out') => (e: React.PointerEvent) => {
    e.preventDefault();
    setDraggingHandle(handle);
  };

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!draggingHandle || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
      const ratio = clickX / rect.width;
      const targetTime = ratio * metadata.duration;

      if (draggingHandle === 'in') {
        const newIn = Math.min(targetTime, endTime - 0.05);
        onChangeOptions({ ...options, startTime: newIn });
        if (videoRef.current) videoRef.current.currentTime = newIn;
      } else if (draggingHandle === 'out') {
        const newOut = Math.max(targetTime, startTime + 0.05);
        onChangeOptions({ ...options, endTime: newOut });
        if (videoRef.current) videoRef.current.currentTime = newOut;
      }
    };

    const handlePointerUp = () => {
      setDraggingHandle(null);
    };

    if (draggingHandle) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [draggingHandle, startTime, endTime, metadata.duration, options]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        stepFrame('prev');
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        stepFrame('next');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, metadata]);

  const startPercent = (startTime / metadata.duration) * 100;
  const endPercent = (endTime / metadata.duration) * 100;

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-[--text-tertiary] uppercase tracking-wider">
          01 — TRIM VIDEO
        </span>
        <div className="flex items-center gap-2 font-mono text-xs text-[--text-secondary]">
          <span>Trim Duration: <strong className="text-[--text-primary]">{formatSecondsToTimecode(trimDuration)}</strong></span>
        </div>
      </div>

      <div className="tool-surface p-4">
        {/* Main Video Preview Canvas */}
        <div className="relative aspect-video max-h-[440px] mx-auto rounded-lg overflow-hidden bg-black flex items-center justify-center border border-[--border-subtle] mb-3 select-none">
          <video
            ref={videoRef}
            src={metadata.objectUrl}
            onTimeUpdate={handleTimeUpdate}
            onEnded={() => setIsPlaying(false)}
            className="w-full h-full object-contain"
            playsInline
          />

          {/* Monospace Overlay: FRAME 124 • 00:05.166 • 3840 × 2160 */}
          <div className="absolute top-3 left-3 bg-black/85 backdrop-blur-sm px-3 py-1.5 rounded border border-white/10 font-mono text-xs text-[--text-primary] flex items-center gap-3">
            <div className="flex items-center gap-1">
              <span className="text-[--text-tertiary]">FRAME</span>
              <span className="font-bold text-[--accent-blue]">{currentFrameNum}</span>
            </div>
            <span className="text-white/20">•</span>
            <div className="font-semibold text-[--text-primary]">{formatSecondsToTimecode(currentTime)}</div>
            <span className="text-white/20">•</span>
            <div className="text-[--text-secondary]">{metadata.width} × {metadata.height}</div>
          </div>
        </div>

        {/* Frame Navigation Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => stepFrame('prev')}
              className="btn btn-secondary py-1.5 px-2.5 text-xs"
              title="Previous Frame (←)"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={togglePlay}
              className="btn btn-primary py-1.5 px-3 text-xs"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              onClick={() => stepFrame('next')}
              className="btn btn-secondary py-1.5 px-2.5 text-xs"
              title="Next Frame (→)"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Prominent Monospace Frame Counter */}
            <div className="ml-3 px-2.5 py-1 rounded bg-[--bg-surface-2] border border-[--border-subtle] font-mono text-xs text-[--text-secondary]">
              <span className="font-bold text-[--text-primary]">{currentFrameNum}</span>
              <span className="text-[--text-tertiary]"> / </span>
              <span>{metadata.totalFrames.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={() => onSnapshotFrame(currentTime)}
            className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            <Camera className="w-3.5 h-3.5 text-[--accent-blue]" />
            <span>Snapshot Frame</span>
          </button>
        </div>

        {/* Dual Handle Visual Trim Bar */}
        <div className="relative pt-4 pb-6 px-1">
          {/* Main Track */}
          <div ref={trackRef} className="relative h-6 bg-[--bg-surface-3] rounded overflow-hidden select-none border border-[--border-subtle]">
            {/* Dimmed Left Region */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-black/60 z-0"
              style={{ width: `${startPercent}%` }}
            />

            {/* Active Selected Trim Region */}
            <div
              className="absolute top-0 bottom-0 bg-[--accent-blue-dim] border-y border-[--accent-blue-border] z-0"
              style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
            />

            {/* Render Extraction Frame Markers inside active trim region */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none z-10 flex items-center"
              style={{ left: `${startPercent}%`, width: `${endPercent - startPercent}%` }}
            >
              {expectedTimestamps.slice(0, 100).map((t, idx) => {
                const markerPercent = ((t - startTime) / trimDuration) * 100;
                return (
                  <div
                    key={idx}
                    className="absolute w-1 h-3 rounded-full bg-[--accent-blue] -translate-x-1/2 opacity-80"
                    style={{ left: `${markerPercent}%` }}
                  />
                );
              })}
            </div>

            {/* Dimmed Right Region */}
            <div
              className="absolute top-0 bottom-0 right-0 bg-black/60 z-0"
              style={{ width: `${100 - endPercent}%` }}
            />

            {/* Playhead Indicator line */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white z-20 pointer-events-none"
              style={{ left: `${(currentTime / metadata.duration) * 100}%` }}
            />
          </div>

          {/* Draggable IN Handle */}
          <div
            onPointerDown={handlePointerDown('in')}
            className="absolute top-2 -translate-x-1/2 cursor-ew-resize z-30 flex flex-col items-center group"
            style={{ left: `${startPercent}%` }}
          >
            <div className="bg-[--accent-blue] text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
              IN
            </div>
            <div className="w-3 h-4 bg-[--accent-blue] rounded-b border border-white/40" />
          </div>

          {/* Draggable OUT Handle */}
          <div
            onPointerDown={handlePointerDown('out')}
            className="absolute top-2 -translate-x-1/2 cursor-ew-resize z-30 flex flex-col items-center group"
            style={{ left: `${endPercent}%` }}
          >
            <div className="bg-[--accent-blue] text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
              OUT
            </div>
            <div className="w-3 h-4 bg-[--accent-blue] rounded-b border border-white/40" />
          </div>

          {/* Playhead Seek Range Slider Input */}
          <input
            type="range"
            min="0"
            max={metadata.duration}
            step={frameTime}
            value={currentTime}
            onChange={handlePlayheadSeek}
            className="w-full h-2 bg-transparent appearance-none cursor-pointer accent-white opacity-0 absolute top-4 left-0 z-20"
          />
        </div>

        {/* Precision Numeric Trim Control Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[--border-subtle] text-xs font-mono">
          <div className="p-2.5 rounded bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-between">
            <span className="text-[--text-tertiary] flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[--accent-blue]" /> IN
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              max={endTime}
              value={parseFloat(startTime.toFixed(3))}
              onChange={(e) => onChangeOptions({ ...options, startTime: Math.max(0, parseFloat(e.target.value) || 0) })}
              className="w-24 bg-[--bg-app] border border-[--border-subtle] rounded px-2 py-1 text-right font-bold text-[--text-primary]"
            />
          </div>

          <div className="p-2.5 rounded bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-between">
            <span className="text-[--text-tertiary] flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[--accent-blue]" /> OUT
            </span>
            <input
              type="number"
              step="0.01"
              min={startTime}
              max={metadata.duration}
              value={parseFloat(endTime.toFixed(3))}
              onChange={(e) => onChangeOptions({ ...options, endTime: Math.min(metadata.duration, parseFloat(e.target.value) || metadata.duration) })}
              className="w-24 bg-[--bg-app] border border-[--border-subtle] rounded px-2 py-1 text-right font-bold text-[--text-primary]"
            />
          </div>

          <div className="p-2.5 rounded bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-between">
            <span className="text-[--text-tertiary]">DURATION</span>
            <span className="font-bold text-[--accent-blue]">{formatSecondsToTimecode(trimDuration)}</span>
          </div>
        </div>

        {/* Extraction Mode Explainer */}
        <div className="mt-3 text-xs font-mono text-[--text-secondary] bg-[--bg-surface-2]/40 p-2.5 rounded border border-[--border-subtle]">
          {options.mode === 'all' && (
            <span>Every frame ({expectedTimestamps.length} total) within the selected range ({formatSecondsToTimecode(startTime)} → {formatSecondsToTimecode(endTime)}) will be extracted.</span>
          )}
          {options.mode === 'count' && (
            <span>{options.frameCount} frames will be evenly distributed across the selected range ({formatSecondsToTimecode(startTime)} → {formatSecondsToTimecode(endTime)}).</span>
          )}
          {options.mode === 'interval' && (
            <span>One frame will be extracted every {options.intervalSeconds}s across the selected range ({formatSecondsToTimecode(startTime)} → {formatSecondsToTimecode(endTime)}).</span>
          )}
        </div>
      </div>
    </div>
  );
};
