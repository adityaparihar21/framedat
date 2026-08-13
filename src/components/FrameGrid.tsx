import React, { useState, useMemo } from 'react';
import type { FrameData } from '../types';
import { FrameCard } from './FrameCard';
import { downloadFramesAsZip } from '../utils/zipGenerator';
import { Download, Search, Split, Film, CheckSquare, Square } from 'lucide-react';

interface FrameGridProps {
  frames: FrameData[];
  onToggleSelectFrame: (id: string, e: React.MouseEvent) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onInvertSelection: () => void;
  onOpenLightbox: (frame: FrameData) => void;
  onOpenCompareModal: () => void;
  onOpenGifExportModal: () => void;
  videoName: string;
}

export const FrameGrid: React.FC<FrameGridProps> = ({
  frames,
  onToggleSelectFrame,
  onSelectAll,
  onDeselectAll,
  onInvertSelection,
  onOpenLightbox,
  onOpenCompareModal,
  onOpenGifExportModal,
  videoName,
}) => {
  const [filterSceneCutsOnly, setFilterSceneCutsOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const selectedCount = frames.filter((f) => f.selected).length;

  const filteredFrames = useMemo(() => {
    return frames.filter((f) => {
      if (filterSceneCutsOnly && !f.isKeyframeCandidate) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const numMatch = f.index.toString().includes(q);
        const timeMatch = f.timeString.toLowerCase().includes(q);
        return numMatch || timeMatch;
      }
      return true;
    });
  }, [frames, filterSceneCutsOnly, searchQuery]);

  const handleDownloadZip = async () => {
    if (selectedCount === 0) return;
    try {
      setIsZipping(true);
      const zipName = `${videoName.replace(/\.[^/.]+$/, '')}_frames.zip`;
      await downloadFramesAsZip(frames, zipName, (percent) => setZipProgress(percent));
    } catch (err: any) {
      alert(err.message || 'Failed to create ZIP file.');
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  return (
    <div className="tool-surface p-4 mb-6">
      {/* Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-[--border-subtle] pb-3 mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-sm text-[--text-primary]">
            Extracted Frames
          </h3>
          <span className="font-mono text-xs text-[--text-tertiary] bg-[--bg-surface-2] px-2 py-0.5 rounded border border-[--border-subtle]">
            {frames.length}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={onOpenCompareModal}
            disabled={selectedCount < 2}
            className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-40"
          >
            <Split className="w-3.5 h-3.5 text-[--accent-blue]" />
            <span>Compare ({selectedCount})</span>
          </button>

          <button
            onClick={onOpenGifExportModal}
            disabled={selectedCount === 0}
            className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5 disabled:opacity-40"
          >
            <Film className="w-3.5 h-3.5 text-[--accent-blue]" />
            <span>Export GIF / WebM</span>
          </button>

          <button
            onClick={handleDownloadZip}
            disabled={selectedCount === 0 || isZipping}
            className="btn btn-primary text-xs py-1.5 px-3.5 flex items-center gap-1.5 disabled:opacity-40 font-mono"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isZipping ? `Zipping (${zipProgress}%)...` : `Download (${selectedCount}) ZIP`}
            </span>
          </button>
        </div>
      </div>

      {/* Multi-Select & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 bg-[--bg-surface-2]/40 p-2.5 rounded border border-[--border-subtle] text-xs">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <button
            onClick={onSelectAll}
            className="px-2 py-1 rounded bg-[--bg-surface-2] hover:bg-[--bg-surface-3] border border-[--border-subtle] flex items-center gap-1 text-[--text-primary]"
          >
            <CheckSquare className="w-3 h-3 text-[--accent-blue]" /> All
          </button>

          <button
            onClick={onDeselectAll}
            className="px-2 py-1 rounded bg-[--bg-surface-2] hover:bg-[--bg-surface-3] border border-[--border-subtle] flex items-center gap-1 text-[--text-secondary]"
          >
            <Square className="w-3 h-3 text-[--text-tertiary]" /> None
          </button>

          <button
            onClick={onInvertSelection}
            className="px-2 py-1 rounded bg-[--bg-surface-2] hover:bg-[--bg-surface-3] border border-[--border-subtle] text-[--text-secondary]"
          >
            Invert
          </button>

          <span className="text-[--text-tertiary] ml-2">
            Selected: <strong className="text-[--accent-blue]">{selectedCount}</strong> / {frames.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterSceneCutsOnly(!filterSceneCutsOnly)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center gap-1 border ${
              filterSceneCutsOnly
                ? 'bg-[--accent-blue-dim] border-[--accent-blue-border] text-[--accent-blue]'
                : 'bg-[--bg-surface-2] border-[--border-subtle] text-[--text-secondary]'
            }`}
          >
            Scene Cuts Only
          </button>

          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[--text-tertiary] absolute left-2.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search timecode..."
              className="pl-7 pr-2.5 py-1 rounded bg-[--bg-app] border border-[--border-subtle] text-xs font-mono text-[--text-primary] placeholder-[--text-tertiary] focus:outline-none focus:border-[--accent-blue] w-36"
            />
          </div>
        </div>
      </div>

      {/* Grid Display */}
      {filteredFrames.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredFrames.map((frame) => (
            <FrameCard
              key={frame.id}
              frame={frame}
              onToggleSelect={onToggleSelectFrame}
              onOpenLightbox={onOpenLightbox}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-[--text-secondary] text-xs font-mono">
          No frames match active filter query.
        </div>
      )}
    </div>
  );
};
