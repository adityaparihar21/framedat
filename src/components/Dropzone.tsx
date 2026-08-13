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
    <div className="w-full max-w-xl mx-auto py-12 px-4 flex flex-col items-center justify-center">
      {/* Intro Heading & Subheading */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[--text-primary] mb-1.5 font-sans">
          Precision Frame Extraction
        </h1>
        <p className="text-xs sm:text-sm text-[--text-secondary]">
          Extract exact video frames locally at native resolution.
        </p>
      </div>

      {/* Main Upload Box (480px Centered Focal Point) */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`w-full max-w-[480px] p-8 text-center cursor-pointer rounded-xl border transition-all duration-150 relative ${
          isDragOver
            ? 'border-[--accent-blue] bg-[--accent-blue-dim]'
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
          <div className="w-10 h-10 mb-4 rounded-lg bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-center text-[--accent-blue]">
            <Upload className="w-5 h-5" />
          </div>

          <h2 className="text-base font-bold text-[--text-primary] mb-1">
            {isDragOver ? 'Drop to load video' : 'Drop video here'}
          </h2>
          <p className="text-xs text-[--text-tertiary] mb-5">
            or choose a file
          </p>

          <button
            type="button"
            className="btn btn-primary text-xs py-2 px-5"
          >
            <FileVideo className="w-4 h-4" />
            <span>Choose Video</span>
          </button>
        </div>
      </div>

      {/* Metadata Format Tags below Upload Surface */}
      <div className="mt-4 text-center">
        <span className="text-[11px] font-mono text-[--text-tertiary]">
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
