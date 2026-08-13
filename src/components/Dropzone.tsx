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
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center text-center my-auto py-4 px-4">
      {/* Hero Headline & Positioning Statement */}
      <div className="mb-10 flex flex-col items-center">
        {/* Product Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[--accent-blue-dim] border border-[--accent-blue-border] text-[11px] font-mono text-[--accent-blue] mb-4">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>100% Client-Side Local Processing</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[--text-primary] mb-3 font-sans max-w-xl leading-[1.15]">
          Frame your footage. <br />
          <span className="text-[--accent-blue]">One frame at a time.</span>
        </h1>
        <p className="text-sm sm:text-base text-[--text-secondary] max-w-lg mx-auto font-normal leading-relaxed">
          Extract precise video frames, inspect motion, create transparent assets, and generate contact sheets — entirely locally on your device.
        </p>
      </div>

      {/* Main Upload Drop Zone Surface */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full max-w-[480px] p-8 sm:p-10 text-center cursor-pointer rounded-2xl border transition-all duration-200 relative mb-6 ${
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

        <div className="flex flex-col items-center justify-center">
          <div className="w-14 h-14 mb-4 rounded-full bg-[--accent-blue-dim] border border-[--accent-blue-border] flex items-center justify-center text-[--accent-blue] transition-transform duration-200 hover:scale-110">
            <Upload className="w-6 h-6" />
          </div>

          <h2 className="text-base font-bold text-[--text-primary] mb-1">
            {isDragOver ? 'Drop video to open' : 'Drop video here to begin'}
          </h2>
          <p className="text-xs text-[--text-tertiary] mb-6">
            or choose a video file from your computer
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              className="btn btn-primary text-xs py-2.5 px-6 font-semibold shadow-md shadow-[--accent-blue]/20"
            >
              <FileVideo className="w-4 h-4" />
              <span>Open Video</span>
            </button>

            {onOpenBackgroundRemover && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenBackgroundRemover();
                }}
                className="btn btn-secondary text-xs py-2.5 px-4 font-mono text-[--text-secondary]"
              >
                <Scissors className="w-3.5 h-3.5 text-[--accent-blue]" />
                <span>Try Background Remover</span>
              </button>
            )}
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
          <span>{isLoadingSample ? 'Generating demo video...' : 'Load Demo Sample Clip'}</span>
        </button>
      </div>

      {/* Format Metadata Line */}
      <div className="mt-6 text-center">
        <span className="text-xs font-mono text-[--text-tertiary]">
          MP4 · MOV · WebM · AVI · MKV &nbsp;•&nbsp; Up to 8K Native Resolution
        </span>
      </div>
    </div>
  );
};

function isVideoExtension(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v', 'flv', 'wmv'].includes(ext);
}
