import React, { useState, useRef } from 'react';
import { Upload, FileVideo, Scissors, Film, ShieldCheck } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  onSelectSampleVideo: () => void;
  onOpenBackgroundRemover?: () => void;
  isLoadingSample?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelect,
  onSelectSampleVideo,
  onOpenBackgroundRemover,
  isLoadingSample,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('video/') || isVideoExtension(file.name)) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center justify-center text-center my-auto py-4 px-4">
      {/* Hero Headline & Positioning Statement */}
      <div className="mb-10 flex flex-col items-center">
        {/* Product Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[--accent-blue-dim] border border-[--accent-blue-border] text-[11px] font-mono text-[--accent-blue] mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Client-Side Local Processing</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[--text-primary] mb-3 font-sans max-w-2xl leading-[1.15]">
          Frame your footage. <br />
          <span className="text-[--accent-blue]">One frame at a time.</span>
        </h1>
        <p className="text-sm sm:text-base text-[--text-secondary] max-w-lg mx-auto font-normal leading-relaxed">
          Extract precise video frames, inspect motion, create transparent assets, and generate contact sheets — entirely locally on your device.
        </p>
      </div>

      {/* Two-Card Tool Showcase Window */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left">
        {/* Tool Card 1: Precision Frame Extractor */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`p-6 sm:p-8 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
            isDragOver
              ? 'border-[--accent-blue] bg-[--accent-blue-dim] scale-[1.01] shadow-2xl shadow-[--accent-blue]/10'
              : 'border-[--border-subtle] bg-[--bg-surface-1] hover:border-[--border-hover] hover:bg-[--bg-surface-2]/50 shadow-xl'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*,.mp4,.mov,.webm,.avi,.mkv,.m4v,.flv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div>
            <div className="w-12 h-12 mb-4 rounded-xl bg-[--accent-blue-dim] border border-[--accent-blue-border] flex items-center justify-center text-[--accent-blue]">
              <FileVideo className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-bold text-[--text-primary] mb-1 font-sans">
              Precision Frame Extractor
            </h2>
            <p className="text-xs text-[--text-secondary] mb-6 font-normal leading-relaxed">
              Extract every frame, N evenly-spaced frames, or time intervals at native resolution without re-encoding quality loss.
            </p>
          </div>

          <div>
            <button
              type="button"
              className="btn btn-primary w-full text-xs py-2.5 font-semibold shadow-md shadow-[--accent-blue]/20"
            >
              <Upload className="w-4 h-4" />
              <span>Open Video File</span>
            </button>
            <div className="mt-3 text-center">
              <span className="text-[10px] font-mono text-[--text-tertiary]">
                MP4 · MOV · WebM · AVI · MKV &nbsp;•&nbsp; Up to 8K
              </span>
            </div>
          </div>
        </div>

        {/* Tool Card 2: Background Removal Studio */}
        <div
          onClick={onOpenBackgroundRemover}
          className="p-6 sm:p-8 rounded-2xl border border-[--border-subtle] bg-[--bg-surface-1] hover:border-[--border-hover] hover:bg-[--bg-surface-2]/50 transition-all duration-200 cursor-pointer flex flex-col justify-between relative shadow-xl"
        >
          <div>
            <div className="w-12 h-12 mb-4 rounded-xl bg-[--accent-blue-dim] border border-[--accent-blue-border] flex items-center justify-center text-[--accent-blue]">
              <Scissors className="w-6 h-6" />
            </div>

            <h2 className="text-lg font-bold text-[--text-primary] mb-1 font-sans">
              Background Removal Studio
            </h2>
            <p className="text-xs text-[--text-secondary] mb-6 font-normal leading-relaxed">
              Extract subjects with alpha transparency using human skin & contour protection to preserve faces, hands, and bodies.
            </p>
          </div>

          <div>
            <button
              type="button"
              className="btn btn-secondary w-full text-xs py-2.5 font-semibold font-mono text-[--text-primary]"
            >
              <Scissors className="w-3.5 h-3.5 text-[--accent-blue]" />
              <span>Try Background Remover</span>
            </button>
            <div className="mt-3 text-center">
              <span className="text-[10px] font-mono text-[--text-tertiary]">
                PNG · JPEG · WebP · TIFF &nbsp;•&nbsp; Alpha Channel
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Demo Video Option */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <button
          type="button"
          onClick={onSelectSampleVideo}
          disabled={isLoadingSample}
          className="text-[--accent-blue] hover:underline flex items-center gap-1.5 font-medium disabled:opacity-50"
        >
          <Film className="w-3.5 h-3.5" />
          <span>{isLoadingSample ? 'Generating demo video...' : 'Load Sample Video Clip'}</span>
        </button>
      </div>
    </div>
  );
};

function isVideoExtension(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v', 'flv', 'wmv'].includes(ext);
}
