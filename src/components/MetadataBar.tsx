import React from 'react';
import type { VideoMetadata } from '../types';

interface MetadataBarProps {
  metadata: VideoMetadata;
}

export const MetadataBar: React.FC<MetadataBarProps> = ({ metadata }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[--border-subtle] text-xs">
      <div className="flex items-center gap-2 font-mono truncate">
        <span className="font-bold text-[--text-primary] truncate max-w-sm" title={metadata.name}>
          {metadata.name}
        </span>
        <span className="text-[--text-tertiary]">•</span>
        <span className="text-[--text-secondary]">{metadata.mimeType || 'video/mp4'}</span>
      </div>

      {/* Monospace Telemetry Badges */}
      <div className="flex items-center gap-3 font-mono text-[11px] text-[--text-secondary]">
        <div>
          <span className="text-[--text-tertiary]">Res: </span>
          <span className="font-semibold text-[--text-primary]">{metadata.resolutionLabel}</span>
        </div>
        <span className="text-[--text-tertiary]">•</span>
        <div>
          <span className="text-[--text-tertiary]">FPS: </span>
          <span className="font-semibold text-[--text-primary]">{metadata.fps}</span>
        </div>
        <span className="text-[--text-tertiary]">•</span>
        <div>
          <span className="text-[--text-tertiary]">Dur: </span>
          <span className="font-semibold text-[--text-primary]">{metadata.formattedDuration}</span>
        </div>
        <span className="text-[--text-tertiary]">•</span>
        <div>
          <span className="text-[--text-tertiary]">Size: </span>
          <span className="font-semibold text-[--text-primary]">{metadata.formattedSize}</span>
        </div>
      </div>
    </div>
  );
};
