import React, { useState, useRef } from 'react';
import { Upload, FileVideo, Scissors, Film, ShieldCheck, Sparkles, Box } from 'lucide-react';

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
    <div className="w-full max-w-6xl mx-auto flex flex-col justify-between my-auto py-6 sm:py-10 px-4 sm:px-8 font-sans">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mp4,.mov,.webm,.avi,.mkv,.m4v,.flv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* DESKTOP UI LAYOUT (Matching Image 1) */}
      <div className="hidden md:block text-left mb-12">
        {/* Main Hero Headline */}
        <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight text-[--text-primary] mb-4 leading-[1.08]">
          Frame your footage. <br />
          One frame at a time.
        </h1>

        {/* Subtitle */}
        <p className="text-sm lg:text-base text-[--text-secondary] max-w-2xl font-normal leading-relaxed mb-6">
          Professional grade extraction and masking utility for high-end digital intermediate workflows. Designed for precision, built for speed.
        </p>

        {/* Monospace Status Badges (Image 1 UI) */}
        <div className="flex items-center gap-3 font-mono text-xs mb-10">
          <span className="px-2.5 py-1 rounded bg-[--bg-surface-2] border border-[--border-subtle] text-[--text-tertiary]">
            v2.4.1_STABLE
          </span>
          <span className="px-2.5 py-1 rounded bg-[--bg-surface-2] border border-[--border-subtle] text-[--text-secondary] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ENGINE_IDLE
          </span>
        </div>

        {/* Side-by-Side Dual Tool Cards (Image 1 UI) */}
        <div className="grid grid-cols-2 gap-6">
          {/* Card 1: Precision Frame Extractor */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`p-6 sm:p-8 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between relative ${
              isDragOver
                ? 'border-[--accent-blue] bg-[--accent-blue-dim] scale-[1.01] shadow-2xl shadow-[--accent-blue]/10'
                : 'border-[--border-subtle] bg-[--bg-surface-1] hover:border-[--border-hover] hover:bg-[--bg-surface-2]/40 shadow-xl'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-xl font-bold text-[--text-primary]">
                  <Box className="w-6 h-6 text-[--accent-blue]" />
                  <span>Precision Frame Extractor</span>
                </div>
                <Box className="w-8 h-8 text-[--text-tertiary]/20 pointer-events-none" />
              </div>

              <p className="text-xs text-[--text-secondary] mb-6 leading-relaxed">
                Batch export exact frames based on timecode arrays. Supports uncompressed sequential output.
              </p>

              {/* Monospace Input/Output Specification Rows (Image 1 UI) */}
              <div className="flex flex-col gap-2 font-mono text-xs border-t border-b border-[--border-subtle] py-3 mb-6">
                <div className="flex items-center justify-between text-[--text-tertiary]">
                  <span className="uppercase text-[10px]">INPUT</span>
                  <span className="text-[--text-primary] font-bold">MP4 MOV ProRes 8K</span>
                </div>
                <div className="flex items-center justify-between text-[--text-tertiary]">
                  <span className="uppercase text-[10px]">OUTPUT</span>
                  <span className="text-[--text-primary] font-bold">PNG TIFF DPX</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-secondary w-full text-xs py-3 font-mono font-bold uppercase tracking-wider text-[--text-primary]"
            >
              LAUNCH EXTRACTOR
            </button>
          </div>

          {/* Card 2: Background Removal Studio */}
          <div
            onClick={onOpenBackgroundRemover}
            className="p-6 sm:p-8 rounded-xl border border-[--border-subtle] bg-[--bg-surface-1] hover:border-[--border-hover] hover:bg-[--bg-surface-2]/40 transition-all duration-200 cursor-pointer flex flex-col justify-between relative shadow-xl"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 text-xl font-bold text-[--text-primary]">
                  <Sparkles className="w-6 h-6 text-[--accent-blue]" />
                  <span>Background Removal Studio</span>
                </div>
                <Sparkles className="w-8 h-8 text-[--text-tertiary]/20 pointer-events-none" />
              </div>

              <p className="text-xs text-[--text-secondary] mb-6 leading-relaxed">
                AI-assisted rotoscoping and alpha channel generation. Perfect for rapid compositing prep.
              </p>

              {/* Monospace Engine/Format Specification Rows (Image 1 UI) */}
              <div className="flex flex-col gap-2 font-mono text-xs border-t border-b border-[--border-subtle] py-3 mb-6">
                <div className="flex items-center justify-between text-[--text-tertiary]">
                  <span className="uppercase text-[10px]">ENGINE</span>
                  <span className="text-[--text-primary] font-bold">Neural Alpha v3</span>
                </div>
                <div className="flex items-center justify-between text-[--text-tertiary]">
                  <span className="uppercase text-[10px]">FORMAT</span>
                  <span className="text-[--text-primary] font-bold">RGBA (16-bit)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="btn btn-primary w-full text-xs py-3 font-mono font-bold uppercase tracking-wider text-white shadow-md shadow-[--accent-blue]/20"
            >
              OPEN STUDIO
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE UI LAYOUT (Matching Image 2) */}
      <div className="block md:hidden text-center">
        {/* Top Outline Pill Tag (Image 2 UI) */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[--bg-surface-2] border border-[--border-subtle] text-[10px] font-mono text-[--text-secondary] mb-6">
          <ShieldCheck className="w-3.5 h-3.5 text-[--accent-blue]" />
          <span>100% CLIENT-SIDE LOCAL PROCESSING</span>
        </div>

        {/* Hero Title (Image 2 UI) */}
        <h1 className="text-3xl font-extrabold tracking-tight text-[--text-primary] mb-3 leading-tight font-sans">
          Frame your footage. <br />
          <span className="text-[--accent-blue]">One frame at a time.</span>
        </h1>

        <p className="text-xs text-[--text-secondary] max-w-xs mx-auto mb-8 font-normal leading-relaxed">
          Extract precise video frames and remove backgrounds entirely locally on your device.
        </p>

        {/* Mobile Stacked Tool Cards (Image 2 UI) */}
        <div className="flex flex-col gap-5 text-left mb-8">
          {/* Card 1: Precision Frame Extractor */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-5 rounded-2xl border border-[--border-subtle] bg-[--bg-surface-1] flex flex-col gap-3 shadow-lg"
          >
            <div className="w-10 h-10 rounded-lg bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-center text-[--text-primary]">
              <FileVideo className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[--text-primary] mb-1 font-sans">
                Precision Frame Extractor
              </h2>
              <p className="text-xs text-[--text-secondary] leading-relaxed">
                Extract every frame or time intervals at native resolution.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary w-full text-xs py-2.5 font-semibold flex items-center justify-center gap-2 mt-2"
            >
              <Upload className="w-4 h-4" />
              <span>Open Video File</span>
            </button>

            <div className="text-center font-mono text-[9px] text-[--text-tertiary] uppercase tracking-wider">
              MP4 &nbsp;•&nbsp; MOV &nbsp;•&nbsp; UP TO 8K SUPPORT
            </div>
          </div>

          {/* Card 2: Background Removal Studio */}
          <div
            onClick={onOpenBackgroundRemover}
            className="p-5 rounded-2xl border border-[--border-subtle] bg-[--bg-surface-1] flex flex-col gap-3 shadow-lg"
          >
            <div className="w-10 h-10 rounded-lg bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-center text-[--text-primary]">
              <Scissors className="w-5 h-5" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-[--text-primary] mb-1 font-sans">
                Background Removal Studio
              </h2>
              <p className="text-xs text-[--text-secondary] leading-relaxed">
                Extract subjects with alpha transparency using human skin & contour protection.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-secondary w-full text-xs py-2.5 font-semibold flex items-center justify-center gap-2 mt-2 font-mono text-[--text-primary]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[--accent-blue]" />
              <span>Try Background Remover</span>
            </button>

            <div className="text-center font-mono text-[9px] text-[--text-tertiary] uppercase tracking-wider">
              PNG &nbsp;•&nbsp; JPEG &nbsp;•&nbsp; WEBP &nbsp;•&nbsp; TIFF
            </div>
          </div>
        </div>

        {/* Demo Video Option */}
        <div className="flex items-center justify-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={onSelectSampleVideo}
            disabled={isLoadingSample}
            className="text-[--text-secondary] hover:text-[--text-primary] underline flex items-center gap-1.5 font-medium disabled:opacity-50"
          >
            <Film className="w-3.5 h-3.5 text-[--accent-blue]" />
            <span>{isLoadingSample ? 'Loading clip...' : 'Load Sample Video Clip'}</span>
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
