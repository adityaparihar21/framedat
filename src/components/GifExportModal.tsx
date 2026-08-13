import React, { useState } from 'react';
import type { FrameData } from '../types';
import { createAnimatedWebMOrGif } from '../utils/gifEncoder';
import { saveAs } from 'file-saver';
import { X, Film, Download, Loader2, Play } from 'lucide-react';

interface GifExportModalProps {
  selectedFrames: FrameData[];
  videoName: string;
  onClose: () => void;
}

export const GifExportModal: React.FC<GifExportModalProps> = ({
  selectedFrames,
  videoName,
  onClose,
}) => {
  const [fps, setFps] = useState(10);
  const [width, setWidth] = useState(480);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const blob = await createAnimatedWebMOrGif(selectedFrames, fps, width);
      setGeneratedBlob(blob);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (err: any) {
      alert(err.message || 'Failed to generate animation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedBlob) {
      const cleanName = `${videoName.replace(/\.[^/.]+$/, '')}_animation.webm`;
      saveAs(generatedBlob, cleanName);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-full max-w-xl p-5 flex flex-col relative bg-[--bg-surface-1] border border-[--border-subtle] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[--border-subtle] pb-3 mb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-[--text-primary]">
            <Film className="w-4 h-4 text-[--accent-blue]" />
            <span>Create Animated Loop</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-[--bg-surface-2] hover:bg-rose-500/20 hover:text-rose-400 border border-[--border-subtle] text-[--text-secondary]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 font-mono text-xs">
          <div>
            <label className="block text-[11px] font-bold text-[--text-secondary] mb-1">
              Speed: {fps} FPS
            </label>
            <input
              type="range"
              min="1"
              max="30"
              value={fps}
              onChange={(e) => setFps(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[--bg-surface-3] rounded accent-[--accent-blue]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[--text-secondary] mb-1">
              Width: {width}px
            </label>
            <input
              type="range"
              min="240"
              max="1080"
              step="40"
              value={width}
              onChange={(e) => setWidth(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[--bg-surface-3] rounded accent-[--accent-blue]"
            />
          </div>
        </div>

        <div className="aspect-video bg-black rounded overflow-hidden border border-[--border-subtle] flex items-center justify-center mb-4">
          {previewUrl ? (
            <video src={previewUrl} autoPlay loop muted playsInline className="w-full h-full object-contain" />
          ) : (
            <div className="text-center text-[--text-tertiary] text-xs font-mono p-6">
              Click "Generate" to build animation loop
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 font-mono text-xs">
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="btn btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-[--accent-blue]" />
                <span>Encoding...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-[--accent-blue]" />
                <span>{previewUrl ? 'Re-generate' : 'Generate'}</span>
              </>
            )}
          </button>

          {generatedBlob && (
            <button
              onClick={handleDownload}
              className="btn btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 font-mono"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
