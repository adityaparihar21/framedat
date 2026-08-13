import React, { useState, useRef } from 'react';
import { Film, Scissors, ArrowRight } from 'lucide-react';

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
    <div className="w-full max-w-[1200px] mx-auto min-h-[calc(100vh-140px)] flex flex-col justify-between py-10 sm:py-16 px-6 sm:px-8 font-sans relative overflow-hidden select-none">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mp4,.mov,.webm,.avi,.mkv,.m4v,.flv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ABSTRACT FILMSTRIP BACKGROUND VISUAL (Section 5 Directive) */}
      <div className="absolute top-20 right-0 left-0 pointer-events-none opacity-[0.035] flex items-center justify-between gap-6 whitespace-nowrap font-mono text-xs overflow-hidden select-none">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
          <div key={num} className="flex items-center gap-3 border border-white/40 px-4 py-2 rounded">
            <span>FRAME {num.toString().padStart(3, '0')}</span>
            <div className="w-4 h-3 border border-white/60 bg-white/20 rounded-sm"></div>
            <span>00:0{num}.00</span>
          </div>
        ))}
      </div>

      {/* MAIN HERO COMPOSITION (Section 3 & 4 Directives) */}
      <div className="my-auto pt-4 sm:pt-8 pb-8 animate-hero-fade">
        {/* Subtle Eyebrow (Section 3 Directive) */}
        <div className="font-mono text-xs tracking-[0.15em] text-[--text-tertiary] uppercase mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[--accent-blue]"></span>
          <span>LOCAL • PRIVATE • FRAME ACCURATE</span>
        </div>

        {/* Large Editorial Headline (Section 3 Directive: 72-90px desktop) */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[80px] font-extrabold tracking-tight mb-6 leading-[1.04] max-w-[840px]">
          <span className="text-[--text-primary] block">Frame your footage.</span>
          <span className="text-[--text-secondary] block font-bold">One frame at a time.</span>
        </h1>

        {/* Hero Description (Section 4 Directive: 18-20px, 600-680px max-width) */}
        <p className="text-base sm:text-lg text-[--text-secondary] max-w-[640px] font-normal leading-relaxed mb-12 sm:mb-16">
          Extract precise frames, inspect motion, and create transparent assets — entirely on your device.
        </p>

        {/* TOOL ENTRY CARDS (Section 6 & 7 Directives) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[1100px] mb-10 text-left">
          {/* Card 1: Precision Frame Extractor */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`tool-card-interactive p-7 sm:p-8 cursor-pointer group flex flex-col justify-between relative ${
              isDragOver ? 'border-[--accent-blue] bg-[--accent-blue-dim] scale-[1.01]' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-center text-[--accent-blue] group-hover:scale-105 transition-transform">
                  <Film className="w-5 h-5" />
                </div>
                <ArrowRight className="w-5 h-5 text-[--text-tertiary] group-hover:text-[--text-primary] group-hover:translate-x-1 transition-all" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[--text-primary] mb-2 font-sans">
                Precision Frame Extractor
              </h2>

              <p className="text-xs sm:text-sm text-[--text-secondary] mb-6 leading-relaxed">
                Extract exact frames from video with precision controls and flexible export.
              </p>
            </div>

            <div>
              <div className="text-[11px] font-mono text-[--text-tertiary] mb-4 uppercase tracking-wider">
                MP4 &nbsp;·&nbsp; MOV &nbsp;·&nbsp; ProRes &nbsp;·&nbsp; 8K
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[--text-primary] group-hover:text-[--accent-blue] transition-colors">
                <span>Open Extractor</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>

          {/* Card 2: Background Removal Studio */}
          <div
            onClick={onOpenBackgroundRemover}
            className="tool-card-interactive p-7 sm:p-8 cursor-pointer group flex flex-col justify-between relative"
          >
            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-11 h-11 rounded-xl bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-center text-[--accent-blue] group-hover:scale-105 transition-transform">
                  <Scissors className="w-5 h-5" />
                </div>
                <ArrowRight className="w-5 h-5 text-[--text-tertiary] group-hover:text-[--text-primary] group-hover:translate-x-1 transition-all" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[--text-primary] mb-2 font-sans">
                Background Removal Studio
              </h2>

              <p className="text-xs sm:text-sm text-[--text-secondary] mb-6 leading-relaxed">
                Create clean transparent assets with local background removal and alpha output.
              </p>
            </div>

            <div>
              <div className="text-[11px] font-mono text-[--text-tertiary] mb-4 uppercase tracking-wider">
                RGBA &nbsp;·&nbsp; Alpha PNG &nbsp;·&nbsp; Local processing
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[--accent-blue] group-hover:text-[--accent-blue-hover] transition-colors">
                <span>Open Studio</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Video Action Link */}
        <div className="flex items-center gap-4 text-xs font-mono">
          <button
            type="button"
            onClick={onSelectSampleVideo}
            disabled={isLoadingSample}
            className="text-[--text-tertiary] hover:text-[--text-primary] flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Film className="w-3.5 h-3.5 text-[--accent-blue]" />
            <span>{isLoadingSample ? 'Generating demo video...' : 'Load Sample Video Clip'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

function isVideoExtension(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return ['mp4', 'mov', 'webm', 'avi', 'mkv', 'm4v', 'flv', 'wmv'].includes(ext);
}
