import React, { useEffect, useState } from 'react';
import type { FrameData } from '../types';
import { downloadSingleFrame } from '../utils/zipGenerator';
import { formatBytes } from '../utils/videoMetadata';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface LightboxModalProps {
  frame: FrameData | null;
  frames: FrameData[];
  onClose: () => void;
  onSelectFrame: (frame: FrameData) => void;
}

export const LightboxModal: React.FC<LightboxModalProps> = ({
  frame,
  frames,
  onClose,
  onSelectFrame,
}) => {
  const [zoomLevel, setZoomLevel] = useState(1.0);

  useEffect(() => {
    setZoomLevel(1.0);
  }, [frame?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!frame) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') navigatePrev();
      if (e.key === 'ArrowRight') navigateNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [frame, frames]);

  if (!frame) return null;

  const currentIndex = frames.findIndex((f) => f.id === frame.id);

  const navigatePrev = () => {
    if (currentIndex > 0) {
      onSelectFrame(frames[currentIndex - 1]);
    }
  };

  const navigateNext = () => {
    if (currentIndex < frames.length - 1) {
      onSelectFrame(frames[currentIndex + 1]);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-full max-w-5xl p-5 flex flex-col max-h-[95vh] relative bg-[--bg-surface-1] border border-[--border-subtle] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[--border-subtle] pb-3 mb-3">
          <div className="flex items-center gap-2.5 font-mono text-xs">
            <span className="px-2 py-0.5 rounded bg-[--accent-blue-dim] text-[--accent-blue] border border-[--accent-blue-border] font-bold">
              FRAME #{frame.index.toString().padStart(4, '0')}
            </span>
            <span className="text-[--text-primary] font-bold">{frame.timeString}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
              className="p-1 rounded bg-[--bg-surface-2] hover:bg-[--bg-surface-3] border border-[--border-subtle]"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5 text-[--text-primary]" />
            </button>
            <span className="font-mono text-xs text-[--text-secondary] w-10 text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.min(3.0, z + 0.25))}
              className="p-1 rounded bg-[--bg-surface-2] hover:bg-[--bg-surface-3] border border-[--border-subtle]"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5 text-[--text-primary]" />
            </button>
            <button
              onClick={() => setZoomLevel(1.0)}
              className="p-1 rounded bg-[--bg-surface-2] hover:bg-[--bg-surface-3] border border-[--border-subtle]"
              title="Reset Zoom"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[--text-tertiary]" />
            </button>

            <button
              onClick={() => downloadSingleFrame(frame)}
              className="btn btn-primary text-xs py-1 px-3 flex items-center gap-1.5 font-mono ml-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded bg-[--bg-surface-2] hover:bg-rose-500/20 hover:text-rose-400 border border-[--border-subtle] text-[--text-secondary] transition-colors ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Viewport */}
        <div className="relative flex-1 min-h-[420px] bg-black rounded overflow-hidden flex items-center justify-center border border-[--border-subtle] p-3">
          <img
            src={frame.url}
            alt={frame.filename}
            style={{ transform: `scale(${zoomLevel})` }}
            className="max-h-[68vh] max-w-full object-contain transition-transform duration-100"
          />

          {currentIndex > 0 && (
            <button
              onClick={navigatePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-[--accent-blue] text-white border border-white/20 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {currentIndex < frames.length - 1 && (
            <button
              onClick={navigateNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/70 hover:bg-[--accent-blue] text-white border border-white/20 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 text-[11px] font-mono text-[--text-tertiary]">
          <div>File: <span className="text-[--text-secondary]">{frame.filename}</span></div>
          <div>Specs: <span className="text-[--text-secondary]">{frame.width} × {frame.height}</span> ({formatBytes(frame.sizeBytes)})</div>
        </div>
      </div>
    </div>
  );
};
