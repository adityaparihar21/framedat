import React, { useState, useEffect, useRef } from 'react';
import type { BitmapAsciiOptions, CreativeEffectType } from '../utils/bitmapAsciiGenerator';
import { processCreativeEffect, generateAsciiText } from '../utils/bitmapAsciiGenerator';
import { saveAs } from 'file-saver';
import { Download, Copy, Sliders, RefreshCw, ArrowRight, Box, Shield } from 'lucide-react';

interface BitmapAsciiStudioProps {
  initialImageBlob?: Blob | null;
  onShowToast?: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const BitmapAsciiStudio: React.FC<BitmapAsciiStudioProps> = ({
  initialImageBlob,
  onShowToast,
}) => {
  const [sourceBlob, setSourceBlob] = useState<Blob | null>(initialImageBlob || null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [asciiText, setAsciiText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const [options, setOptions] = useState<BitmapAsciiOptions>({
    effect: 'minecraft_blocks',
    resolutionScale: 0.35,
    threshold: 128,
    dotSize: 12,
    contrast: 0,
    protectSubject: true,
    subjectSensitivity: 40,
    asciiCharset: '@#S%?*+;:,. ',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Reactive source blob listener
  }, [sourceBlob]);

  // Reactive Effect Processing
  useEffect(() => {
    if (!sourceBlob) return;

    let isSubscribed = true;
    const process = async () => {
      try {
        setIsProcessing(true);
        if (options.effect === 'ascii_art') {
          const txt = await generateAsciiText(sourceBlob, options);
          if (isSubscribed) setAsciiText(txt);
        }

        const pngBlob = await processCreativeEffect(sourceBlob, options);
        if (isSubscribed) {
          if (resultUrl) URL.revokeObjectURL(resultUrl);
          setResultBlob(pngBlob);
          setResultUrl(URL.createObjectURL(pngBlob));
        }
      } catch (err: any) {
        console.error('Creative effect error:', err);
      } finally {
        if (isSubscribed) setIsProcessing(false);
      }
    };

    const timer = setTimeout(process, 120);
    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [sourceBlob, options]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSourceBlob(e.target.files[0]);
    }
  };

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
      setSourceBlob(e.dataTransfer.files[0]);
    }
  };

  const handleCopyAscii = () => {
    if (asciiText) {
      navigator.clipboard.writeText(asciiText);
      if (onShowToast) onShowToast('Copied ASCII Art text to clipboard', 'success');
    }
  };

  const handleDownload = () => {
    if (resultBlob) {
      saveAs(resultBlob, `framedat_${options.effect}_art.png`);
      if (onShowToast) onShowToast('Downloaded PNG Art render', 'success');
    }
  };

  return (
    <div className="w-full flex flex-col justify-between min-h-[calc(100vh-140px)]">
      {!sourceBlob ? (
        /* CREATIVE IMAGE STUDIO EMPTY STATE WORKSPACE */
        <div className="w-full max-w-[1180px] mx-auto flex flex-col items-center justify-between my-auto px-6 py-12 sm:py-20 text-center select-none font-sans relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="mb-12 sm:mb-16 max-w-[720px] animate-hero-fade">
            <div className="font-mono text-xs tracking-[0.15em] text-[--text-tertiary] uppercase mb-4 flex items-center justify-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-[--accent-blue]"></span>
              <span>STUDIO / IMAGE CONVERTER & ART CREATOR</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-[--text-primary] mb-6 leading-[1.06] font-sans">
              Image Studio & Converter
            </h1>

            <p className="text-base sm:text-lg text-[--text-secondary] font-normal leading-relaxed max-w-[640px] mx-auto">
              Convert photos and video frames into Minecraft Voxel Blocks, Paper Cutout Art, 1-Bit Dither, and ASCII Art.
            </p>
          </div>

          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-[820px] min-h-[320px] sm:min-h-[360px] p-10 sm:p-14 text-center cursor-pointer rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center relative mb-12 group ${
              isDragOver
                ? 'border-[--accent-blue] bg-[--accent-blue-dim] scale-[1.01] shadow-2xl shadow-[--accent-blue]/10'
                : 'border-[--border-subtle] bg-[#10131B] hover:border-[--border-hover] hover:bg-[#161A24] shadow-2xl'
            }`}
          >
            <div className="w-14 h-14 mb-6 rounded-2xl bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-center text-[--accent-blue] group-hover:scale-110 transition-transform">
              <Box className="w-6 h-6" />
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-[--text-primary] mb-3 font-sans">
              {isDragOver ? 'Release image to open Image Studio' : 'Drop photo or image here'}
            </h2>

            <p className="text-xs sm:text-sm text-[--text-tertiary] mb-8 font-normal">
              or choose an image file from your device
            </p>

            <button
              type="button"
              className="btn btn-primary text-xs py-3 px-7 font-semibold flex items-center gap-2.5 shadow-lg shadow-[--accent-blue]/20"
            >
              <span>Choose Photo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      ) : (
        /* ACTIVE CREATIVE WORKSPACE */
        <div className="page-container py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-5 border-b border-[--border-subtle]">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[--accent-blue-dim] border border-[--accent-blue-border] flex items-center justify-center text-[--accent-blue]">
                <Box className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[--text-primary] font-sans">
                  Image Studio & Converter
                </h2>
                <p className="text-xs text-[--text-secondary] font-mono">
                  Minecraft Blocks • Paper Cutout • 1-Bit Dither • ASCII Art
                </p>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary text-xs py-2 px-4 font-mono flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Change Photo
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Controls Panel */}
            <div className="lg:col-span-4 tool-surface p-5 flex flex-col gap-5 font-mono text-xs">
              <div className="font-bold text-sm text-[--text-primary] border-b border-[--border-subtle] pb-3 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[--accent-blue]" />
                <span>Creative Effect Presets</span>
              </div>

              {/* Effect Mode Selector */}
              <div className="flex flex-col gap-2.5">
                {[
                  { id: 'minecraft_blocks', label: '📦 Minecraft Voxel Blocks' },
                  { id: 'paper_cutout', label: '✂️ Paper Cutout Art' },
                  { id: 'bitmap_dither', label: '▒ 1-Bit Bitmap Dither' },
                  { id: 'ascii_art', label: '🔤 ASCII Text Art' },
                  { id: 'halftone_dots', label: '⚪ Halftone Dot Matrix' },
                  { id: 'pixelate', label: '🕹️ 8-Bit Pixelate' },
                  { id: 'line_sketch', label: '✏️ Monochrome Line Sketch' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setOptions({ ...options, effect: item.id as CreativeEffectType })}
                    className={`px-3.5 py-2.5 rounded-lg text-left transition-all ${
                      options.effect === item.id
                        ? 'bg-[--accent-blue-dim] border border-[--accent-blue-border] text-[--accent-blue] font-bold'
                        : 'bg-[--bg-surface-2] border border-[--border-subtle] text-[--text-secondary] hover:text-[--text-primary]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* SUBJECT PROTECTION CHECKBOX & SLIDER */}
              {options.effect === 'minecraft_blocks' && (
                <div className="p-3.5 rounded-xl bg-[--bg-surface-2]/40 border border-[--accent-blue-border]">
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-1.5 font-semibold text-[--text-primary] cursor-pointer">
                      <Shield className="w-4 h-4 text-[--accent-blue]" />
                      <span>Protect Main Subject</span>
                    </label>
                    <input
                      type="checkbox"
                      checked={options.protectSubject}
                      onChange={(e) => setOptions({ ...options, protectSubject: e.target.checked })}
                      className="custom-checkbox"
                    />
                  </div>

                  {options.protectSubject && (
                    <div className="mt-2 pt-2 border-t border-[--border-subtle]/50">
                      <div className="flex items-center justify-between mb-1.5 text-[11px]">
                        <span className="text-[--text-tertiary]">Subject Bounds</span>
                        <span className="font-bold text-[--accent-blue]">{options.subjectSensitivity}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        value={options.subjectSensitivity}
                        onChange={(e) => setOptions({ ...options, subjectSensitivity: parseInt(e.target.value) || 30 })}
                        className="w-full h-1.5 bg-[--bg-surface-3] rounded appearance-none cursor-pointer accent-[--accent-blue]"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Voxel Block Size / Grid Density Slider */}
              {(options.effect === 'minecraft_blocks' || options.effect === 'halftone_dots' || options.effect === 'pixelate' || options.effect === 'ascii_art') && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] text-[--text-tertiary] uppercase">
                      {options.effect === 'minecraft_blocks' ? 'Voxel Block Size' : 'Grid Density'}
                    </label>
                    <span className="font-bold text-[--accent-blue]">{options.dotSize}px</span>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    value={options.dotSize}
                    onChange={(e) => setOptions({ ...options, dotSize: parseInt(e.target.value) || 12 })}
                    className="w-full h-1.5 bg-[--bg-surface-3] rounded appearance-none cursor-pointer accent-[--accent-blue]"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-auto pt-5 border-t border-[--border-subtle] flex flex-col gap-2.5">
                {options.effect === 'ascii_art' && (
                  <button
                    onClick={handleCopyAscii}
                    className="btn btn-secondary w-full text-xs py-2.5 font-mono"
                  >
                    <Copy className="w-4 h-4 text-[--accent-blue]" />
                    <span>Copy ASCII Text</span>
                  </button>
                )}

                <button
                  onClick={handleDownload}
                  disabled={!resultBlob || isProcessing}
                  className="btn btn-primary w-full text-xs py-3 font-bold font-mono shadow-md shadow-[--accent-blue]/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Art Render PNG</span>
                </button>
              </div>
            </div>

            {/* Display Canvas & ASCII View */}
            <div className="lg:col-span-8 tool-surface p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4 text-xs font-mono">
                <span className="text-[--text-tertiary] uppercase">Rendered Output Canvas</span>
                <span className="text-[--accent-blue]">{isProcessing ? 'Rendering effect...' : 'Render Ready'}</span>
              </div>

              {options.effect === 'ascii_art' ? (
                <div className="relative aspect-video rounded-xl bg-[#08090C] overflow-auto p-5 border border-[--border-subtle] font-mono text-[9px] leading-[9px] text-[--accent-blue] whitespace-pre select-all">
                  {asciiText}
                </div>
              ) : (
                <div className="relative aspect-video rounded-xl bg-black flex items-center justify-center overflow-hidden border border-[--border-subtle]">
                  {resultUrl && (
                    <img src={resultUrl} alt="Creative Effect Output" className="w-full h-full object-contain select-none" />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
