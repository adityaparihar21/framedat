import React from 'react';
import type { FrameData } from '../types';
import { downloadSingleFrame } from '../utils/zipGenerator';
import { formatBytes } from '../utils/videoMetadata';
import { Download, Maximize2, Sparkles, Copy } from 'lucide-react';

interface FrameCardProps {
  frame: FrameData;
  onToggleSelect: (id: string, e: React.MouseEvent) => void;
  onOpenLightbox: (frame: FrameData) => void;
}

export const FrameCard: React.FC<FrameCardProps> = ({
  frame,
  onToggleSelect,
  onOpenLightbox,
}) => {
  return (
    <div
      onClick={(e) => onToggleSelect(frame.id, e)}
      className={`rounded-lg overflow-hidden group cursor-pointer transition-all duration-150 relative flex flex-col border ${
        frame.selected
          ? 'border-[--accent-blue] bg-[--accent-blue-dim]'
          : 'border-[--border-subtle] bg-[--bg-surface-1] hover:border-[--border-hover]'
      }`}
    >
      {/* Top Overlay Badges */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-1.5">
          <input
            type="checkbox"
            checked={frame.selected}
            onChange={() => {}}
            className="custom-checkbox pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          />

          <span className="bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-[--text-primary] border border-white/10">
            #{frame.index.toString().padStart(4, '0')}
          </span>
        </div>

        {frame.isKeyframeCandidate && (
          <span className="px-1.5 py-0.5 rounded bg-[--accent-blue-dim] text-[--accent-blue] border border-[--accent-blue-border] text-[9px] font-mono font-bold flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> Cut
          </span>
        )}

        {frame.isDuplicate && (
          <span className="px-1.5 py-0.5 rounded bg-[--bg-surface-3] text-[--text-tertiary] border border-[--border-subtle] text-[9px] font-mono flex items-center gap-1">
            <Copy className="w-2.5 h-2.5" /> Dup
          </span>
        )}
      </div>

      {/* Thumbnail */}
      <div className="relative aspect-video bg-black overflow-hidden flex items-center justify-center">
        <img
          src={frame.url}
          alt={`Frame ${frame.index}`}
          className="w-full h-full object-contain"
          loading="lazy"
        />

        {/* Hover inspect button */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenLightbox(frame);
            }}
            className="p-1.5 rounded bg-white/20 hover:bg-white/30 text-white border border-white/20 transition-all"
            title="Inspect Full Resolution"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Info Footer */}
      <div className="p-2.5 bg-[--bg-surface-1] border-t border-[--border-subtle] flex items-center justify-between text-xs">
        <div>
          <div className="font-mono font-bold text-[--text-primary] text-[11px]">{frame.timeString}</div>
          <div className="text-[10px] text-[--text-tertiary] font-mono">
            {frame.width}×{frame.height} • {formatBytes(frame.sizeBytes)}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            downloadSingleFrame(frame);
          }}
          className="p-1 rounded bg-[--bg-surface-2] hover:bg-[--accent-blue] hover:text-white border border-[--border-subtle] text-[--text-secondary] transition-colors"
          title="Download Frame"
        >
          <Download className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
