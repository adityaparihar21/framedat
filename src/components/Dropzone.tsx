import React, { useState, useRef } from 'react';
import { Upload, FileVideo } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  onSelectSampleVideo: () => void;
  isLoadingSample?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelect,
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
    <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center text-center my-auto">
      {/* Centered Heading with Generous Breathing Space */}
      <div className="mb-14 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[--text-primary] mb-3 font-sans">
          Precision Frame Extraction
        </h1>
        <p className="text-sm text-[--text-secondary] max-w-sm mx-auto font-normal leading-relaxed">
          Extract exact video frames locally at native resolution.
        </p>
      </div>

      {/* Main Upload Focal Box — 460px Positioned Slightly Lower with Generous Gap */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full max-w-[460px] p-8 sm:p-10 text-center cursor-pointer rounded-2xl border transition-all duration-200 relative ${
          isDragOver
            ? 'border-[--accent-blue] bg-[--accent-blue-dim] scale-[1.01]'
            : 'border-[--border-subtle] bg-[--bg-surface-1] hover:border-[--border-hover] hover:bg-[--bg-surface-2]/40'
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
          <div className="w-12 h-12 mb-4 rounded-full bg-[--accent-blue-dim] border border-[--accent-blue-border] flex items-center justify-center text-[--accent-blue]">
            <Upload className="w-5 h-5" />
          </div>

          <h2 className="text-base font-bold text-[--text-primary] mb-1">
            {isDragOver ? 'Drop to load video' : 'Drop video here'}
          </h2>
          <p className="text-xs text-[--text-tertiary] mb-6">
            or choose a file from your computer
          </p>

          <button
            type="button"
            className="btn btn-primary text-xs py-2.5 px-6 font-semibold shadow-md shadow-[--accent-blue]/20"
          >
            <FileVideo className="w-4 h-4" />
            <span>Choose Video</span>
          </button>
        </div>
      </div>

      {/* Clean Format Label */}
      <div className="mt-6 text-center">
        <span className="text-xs font-mono text-[--text-tertiary]">
          MP4 · MOV · WebM · AVI · MKV &nbsp;•&nbsp; Up to 8K
        </span>
      </div>
    </div>
  );
};

function isVideoExtension(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v', 'flv', 'wmv'].includes(ext);
}
