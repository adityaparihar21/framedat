import React, { useState, useRef } from 'react';
import { Film, Mic, ArrowRight, Grid } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  onSelectSampleVideo: () => void;
  onOpenAudioCleaner?: () => void;
  onOpenImageStudio?: () => void;
  isLoadingSample?: boolean;
}

export const Dropzone: React.FC<DropzoneProps> = ({
  onFileSelect,
  onSelectSampleVideo,
  onOpenAudioCleaner,
  onOpenImageStudio,
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
    <div className="w-full max-w-[1280px] mx-auto min-h-[calc(100vh-140px)] flex flex-col justify-between py-16 sm:py-24 px-6 sm:px-10 font-sans relative overflow-hidden select-none">
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*,.mp4,.mov,.webm,.avi,.mkv,.m4v,.flv"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ABSTRACT FILMSTRIP BACKGROUND VISUAL */}
      <div className="absolute top-24 right-0 left-0 pointer-events-none opacity-[0.035] flex items-center justify-between gap-8 whitespace-nowrap font-mono text-xs overflow-hidden select-none">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
          <div key={num} className="flex items-center gap-3 border border-white/40 px-5 py-2.5 rounded">
            <span>FRAME {num.toString().padStart(3, '0')}</span>
            <div className="w-4 h-3 border border-white/60 bg-white/20 rounded-sm"></div>
            <span>00:0{num}.00</span>
          </div>
        ))}
      </div>

      {/* MAIN HERO COMPOSITION WITH SPACIOUS EDITORIAL PADDING */}
      <div className="my-auto pt-6 sm:pt-12 pb-12 animate-hero-fade">
        <div className="font-mono text-xs tracking-[0.18em] text-[--text-tertiary] uppercase mb-5 flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-[--accent-blue]"></span>
          <span>LOCAL • PRIVATE • CREATIVE MEDIA STUDIO</span>
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[84px] font-extrabold tracking-tight mb-8 leading-[1.05] max-w-[920px]">
          <span className="text-[--text-primary] block">Frame your footage.</span>
          <span className="text-[--text-secondary] block font-bold mt-1">One frame at a time.</span>
        </h1>

        <p className="text-lg sm:text-xl text-[--text-secondary] max-w-[700px] font-normal leading-relaxed mb-16 sm:mb-20">
          Extract precise video frames, clean background audio noise, and convert images into Minecraft Voxel Blocks, Paper Cutout, and ASCII Art — 100% locally on your device.
        </p>

        {/* 3 SPACIOUS STUDIO ENTRY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[1280px] mb-16 text-left">
          {/* Studio Card 1: Precision Frame Extractor */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`tool-card-interactive p-8 cursor-pointer group flex flex-col justify-between relative min-h-[260px] ${
              isDragOver ? 'border-[--accent-blue] bg-[--accent-blue-dim] scale-[1.01]' : ''
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-center text-[--accent-blue] group-hover:scale-105 transition-transform">
                  <Film className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-[--text-tertiary] group-hover:text-[--text-primary] group-hover:translate-x-1 transition-all" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[--text-primary] mb-3 font-sans">
                Precision Frame Extractor
              </h2>

              <p className="text-xs sm:text-sm text-[--text-secondary] mb-8 leading-relaxed">
                Extract exact video frames based on timecode arrays or interval rates at native 8K resolution.
              </p>
            </div>

            <div>
              <div className="text-[11px] font-mono text-[--text-tertiary] mb-4 uppercase tracking-wider">
                MP4 · MOV · ProRes · 8K Frame Extraction
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[--text-primary] group-hover:text-[--accent-blue] transition-colors">
                <span>Open Extractor</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>

          {/* Studio Card 2: Voice & Audio Cleaner */}
          <div
            onClick={onOpenAudioCleaner}
            className="tool-card-interactive p-8 cursor-pointer group flex flex-col justify-between relative min-h-[260px]"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-center text-[--accent-blue] group-hover:scale-105 transition-transform">
                  <Mic className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-[--text-tertiary] group-hover:text-[--text-primary] group-hover:translate-x-1 transition-all" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[--text-primary] mb-3 font-sans">
                Voice & Audio Cleaner
              </h2>

              <p className="text-xs sm:text-sm text-[--text-secondary] mb-8 leading-relaxed">
                Remove background noise, hums, and hiss. Boost vocal presence and sharpness on your device.
              </p>
            </div>

            <div>
              <div className="text-[11px] font-mono text-[--text-tertiary] mb-4 uppercase tracking-wider">
                WAV · MP3 · AAC · Clean Voice DSP
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[--accent-blue] group-hover:text-[--accent-blue-hover] transition-colors">
                <span>Open Audio Studio</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>

          {/* Studio Card 3: Image Studio & Converter */}
          <div
            onClick={onOpenImageStudio}
            className="tool-card-interactive p-8 cursor-pointer group flex flex-col justify-between relative min-h-[260px]"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-xl bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-center text-[--accent-blue] group-hover:scale-105 transition-transform">
                  <Grid className="w-6 h-6" />
                </div>
                <ArrowRight className="w-5 h-5 text-[--text-tertiary] group-hover:text-[--text-primary] group-hover:translate-x-1 transition-all" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-[--text-primary] mb-3 font-sans">
                Image Studio & Converter
              </h2>

              <p className="text-xs sm:text-sm text-[--text-secondary] mb-8 leading-relaxed">
                Convert photos into Minecraft Voxel Blocks, Paper Cutout art, 1-bit dither, and ASCII art.
              </p>
            </div>

            <div>
              <div className="text-[11px] font-mono text-[--text-tertiary] mb-4 uppercase tracking-wider">
                Minecraft Blocks · Paper Cut · ASCII · Dither
              </div>

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[--accent-blue] group-hover:text-[--accent-blue-hover] transition-colors">
                <span>Open Image Studio</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>

        {/* Demo Video Action Link */}
        <div className="flex items-center gap-4 text-xs font-mono pt-4">
          <button
            type="button"
            onClick={onSelectSampleVideo}
            disabled={isLoadingSample}
            className="text-[--text-tertiary] hover:text-[--text-primary] flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Film className="w-4 h-4 text-[--accent-blue]" />
            <span>{isLoadingSample ? 'Generating demo clip...' : 'Load Sample Video Clip'}</span>
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
