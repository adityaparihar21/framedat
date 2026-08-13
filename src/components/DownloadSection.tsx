import React, { useState } from 'react';
import type { FrameData } from '../types';
import { downloadFramesAsZip } from '../utils/zipGenerator';
import { formatBytes } from '../utils/videoMetadata';
import { Download, CheckCircle2 } from 'lucide-react';

interface DownloadSectionProps {
  frames: FrameData[];
  videoName: string;
}

export const DownloadSection: React.FC<DownloadSectionProps> = ({ frames, videoName }) => {
  const [isZipping, setIsZipping] = useState(false);
  const [zipProgress, setZipProgress] = useState(0);

  const selectedFrames = frames.filter((f) => f.selected);
  const count = selectedFrames.length > 0 ? selectedFrames.length : frames.length;
  const targetFrames = selectedFrames.length > 0 ? selectedFrames : frames;

  const totalBytes = targetFrames.reduce((sum, f) => sum + f.sizeBytes, 0);
  const format = targetFrames[0]?.format.toUpperCase() || 'PNG';
  const dimensions = targetFrames[0] ? `${targetFrames[0].width} × ${targetFrames[0].height}` : '';

  const handleDownload = async () => {
    try {
      setIsZipping(true);
      const zipName = `${videoName.replace(/\.[^/.]+$/, '')}_frames.zip`;
      await downloadFramesAsZip(targetFrames, zipName, (percent) => setZipProgress(percent));
    } catch (err: any) {
      alert(err.message || 'Failed to generate ZIP file.');
    } finally {
      setIsZipping(false);
      setZipProgress(0);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-[--text-tertiary] uppercase tracking-wider">
          04 — DOWNLOAD
        </span>
        <span className="text-xs font-mono text-[--accent-blue] font-semibold">
          Ready to export
        </span>
      </div>

      <div className="tool-surface p-5 border-[--accent-blue-border] bg-[--accent-blue-dim] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-[--accent-blue] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm text-[--text-primary] font-sans mb-0.5">
              Ready to Download ({count} {format} Frames)
            </h4>
            <p className="text-xs font-mono text-[--text-secondary]">
              {dimensions} &nbsp;•&nbsp; Total Size: {formatBytes(totalBytes)}
            </p>
          </div>
        </div>

        <button
          onClick={handleDownload}
          disabled={isZipping}
          className="btn btn-primary text-xs py-2.5 px-6 font-mono font-bold shrink-0 shadow-lg shadow-[--accent-blue]/20"
        >
          <Download className="w-4 h-4" />
          <span>
            {isZipping ? `Zipping (${zipProgress}%)...` : `Download ${count} Frames (.ZIP)`}
          </span>
        </button>
      </div>
    </div>
  );
};
