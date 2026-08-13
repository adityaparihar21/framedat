import React, { useState, useEffect, useRef } from 'react';
import type { BackgroundRemovalOptions } from '../utils/backgroundRemoval';
import { removeBackground, autoDetectKeyColor } from '../utils/backgroundRemoval';
import { saveAs } from 'file-saver';
import { Upload, Download, Pipette, RefreshCw, Scissors, Sparkles, Shield, ArrowRight, Layers, Sliders } from 'lucide-react';

interface BackgroundRemoverProps {
  initialImageBlob?: Blob | null;
  onBackToExtractor?: () => void;
  onShowToast?: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const BackgroundRemover: React.FC<BackgroundRemoverProps> = ({
  initialImageBlob,
  onBackToExtractor,
  onShowToast,
}) => {
  const [sourceBlob, setSourceBlob] = useState<Blob | null>(initialImageBlob || null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewViewMode, setPreviewViewMode] = useState<'split' | 'transparent' | 'original'>('split');

  const [options, setOptions] = useState<BackgroundRemovalOptions>({
    keyColor: { r: 9, g: 11, b: 16 },
    threshold: 25,
    feather: 4,
    protectSkinTones: true,
    skinProtectionStrength: 85,
    invertMask: false,
    smoothing: true,
  });

  const [isPipetteActive, setIsPipetteActive] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Set initial source URL
  useEffect(() => {
    if (sourceBlob) {
      const url = URL.createObjectURL(sourceBlob);
      setSourceUrl(url);

      autoDetectKeyColor(sourceBlob).then((col) => {
        setOptions((prev) => ({ ...prev, keyColor: col }));
      });

      return () => URL.revokeObjectURL(url);
    }
  }, [sourceBlob]);

  // Reactive Background Removal on Options Change
  useEffect(() => {
    if (!sourceBlob) return;

    let isSubscribed = true;
    const process = async () => {
      try {
        setIsProcessing(true);
        const transparentBlob = await removeBackground(sourceBlob, options);
        if (isSubscribed) {
          if (resultUrl) URL.revokeObjectURL(resultUrl);
          setResultBlob(transparentBlob);
          setResultUrl(URL.createObjectURL(transparentBlob));
        }
      } catch (err) {
        console.error('Background removal error:', err);
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
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSourceBlob(file);
      }
    }
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isPipetteActive || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * imageRef.current.naturalWidth);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * imageRef.current.naturalHeight);

    const canvas = document.createElement('canvas');
    canvas.width = imageRef.current.naturalWidth;
    canvas.height = imageRef.current.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(imageRef.current, 0, 0);
    const p = ctx.getImageData(x, y, 1, 1).data;
    setOptions((prev) => ({ ...prev, keyColor: { r: p[0], g: p[1], b: p[2] } }));
    setIsPipetteActive(false);

    if (onShowToast) {
      onShowToast(`Sampled background color RGB(${p[0]}, ${p[1]}, ${p[2]})`, 'info');
    }
  };

  const handleDownload = () => {
    if (resultBlob) {
      saveAs(resultBlob, 'framedat_transparent_subject.png');
      if (onShowToast) {
        onShowToast('Transparent PNG downloaded successfully', 'success');
      }
    }
  };

  return (
    <div className="w-full flex flex-col justify-between min-h-[calc(100vh-140px)]">
      {!sourceBlob ? (
        /* ART-DIRECTED STUDIO EMPTY STATE WORKSPACE */
        <div className="w-full max-w-[1100px] mx-auto flex flex-col items-center justify-between my-auto px-6 py-10 sm:py-16 text-center select-none font-sans relative">
          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* PAGE HEADER COMPOSITION (Sections 3 & 4 Directives) */}
          <div className="mb-10 sm:mb-12 max-w-[680px] animate-hero-fade">
            {/* Subtle Eyebrow */}
            <div className="font-mono text-xs tracking-[0.15em] text-[--text-tertiary] uppercase mb-3 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[--accent-blue]"></span>
              <span>STUDIO / ALPHA EXTRACTION</span>
            </div>

            {/* Desktop Headline (56-72px) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[--text-primary] mb-4 leading-[1.08] font-sans">
              Background Removal Studio
            </h1>

            {/* Benefit-Driven Supporting Description (17-19px) */}
            <p className="text-base sm:text-lg text-[--text-secondary] font-normal leading-relaxed">
              Extract clean subjects with transparent backgrounds — entirely on your device.
            </p>
          </div>

          {/* HERO UPLOAD DROP ZONE (Sections 5, 6, 7, 8, 9 Directives) */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-[780px] min-h-[300px] sm:min-h-[340px] p-8 sm:p-12 text-center cursor-pointer rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center relative mb-8 group ${
              isDragOver
                ? 'border-[--accent-blue] bg-[--accent-blue-dim] scale-[1.01] shadow-2xl shadow-[--accent-blue]/10'
                : 'border-[--border-subtle] bg-[#10131B] hover:border-[--border-hover] hover:bg-[#161A24] shadow-2xl'
            }`}
          >
            {/* Refined Upload Icon Container (Section 7 Directive) */}
            <div className="w-12 h-12 mb-5 rounded-2xl bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-center text-[--accent-blue] group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5" />
            </div>

            {/* Upload Instruction */}
            <h2 className="text-lg sm:text-xl font-bold text-[--text-primary] mb-2 font-sans">
              {isDragOver ? 'Release to remove background' : 'Drop image here'}
            </h2>

            <p className="text-xs sm:text-sm text-[--text-tertiary] mb-6 font-normal">
              or choose a file from your device
            </p>

            {/* Primary Action Button (Section 8 Directive) */}
            <button
              type="button"
              className="btn btn-primary text-xs py-2.5 px-6 font-semibold flex items-center gap-2 shadow-lg shadow-[--accent-blue]/20 group-hover:shadow-[--accent-blue]/30"
            >
              <span>Choose Photo</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Format Metadata Row (Section 10 Directive) */}
            <div className="mt-8 pt-6 border-t border-[--border-subtle]/50 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[--text-tertiary]">
              <span>PNG &nbsp;·&nbsp; JPEG &nbsp;·&nbsp; WebP &nbsp;·&nbsp; TIFF</span>
              <span className="text-[--text-secondary] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[--accent-blue]" />
                Private by design. Processed locally.
              </span>
            </div>
          </div>

          {/* SUBTLE 3-COLUMN PRODUCT CAPABILITY STRIP (Section 11 Directive) */}
          <div className="w-full max-w-[800px] grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left font-sans">
            {/* Capability 1: Local Processing */}
            <div className="p-4 rounded-xl bg-[--bg-surface-1]/50 border border-[--border-subtle] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[--bg-surface-2] flex items-center justify-center text-[--accent-blue] shrink-0 mt-0.5">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[--text-primary] mb-0.5">Local processing</div>
                <div className="text-[11px] text-[--text-tertiary]">Files stay on your device</div>
              </div>
            </div>

            {/* Capability 2: Alpha Output */}
            <div className="p-4 rounded-xl bg-[--bg-surface-1]/50 border border-[--border-subtle] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[--bg-surface-2] flex items-center justify-center text-[--accent-blue] shrink-0 mt-0.5">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[--text-primary] mb-0.5">Alpha output</div>
                <div className="text-[11px] text-[--text-tertiary]">Export clean transparent PNGs</div>
              </div>
            </div>

            {/* Capability 3: Edge Control */}
            <div className="p-4 rounded-xl bg-[--bg-surface-1]/50 border border-[--border-subtle] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[--bg-surface-2] flex items-center justify-center text-[--accent-blue] shrink-0 mt-0.5">
                <Sliders className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[--text-primary] mb-0.5">Edge control</div>
                <div className="text-[11px] text-[--text-tertiary]">Refine sensitivity & feathering</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE BACKGROUND REMOVAL WORKSPACE (Section 21 Directive) */
        <div className="page-container py-6">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[--border-subtle]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[--accent-blue-dim] border border-[--accent-blue-border] flex items-center justify-center text-[--accent-blue]">
                <Scissors className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[--text-primary] font-sans">
                  Local Background Removal Studio
                </h2>
                <p className="text-xs text-[--text-secondary] font-mono">
                  Extract subjects with alpha transparency — 100% client-side canvas engine
                </p>
              </div>
            </div>

            {onBackToExtractor && (
              <button
                onClick={onBackToExtractor}
                className="btn btn-secondary text-xs py-1.5 px-3 font-mono"
              >
                ← Back to Frame Extractor
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Controls Panel */}
            <div className="lg:col-span-4 tool-surface p-4 flex flex-col gap-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-[--border-subtle] pb-2">
                <span className="font-bold text-[--text-primary]">Mask Settings</span>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[11px] text-[--accent-blue] hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" /> Change Photo
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Key Color Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[11px] text-[--text-tertiary] uppercase">Key Background Color</label>
                  <button
                    onClick={() => setIsPipetteActive(!isPipetteActive)}
                    className={`btn text-[11px] py-0.5 px-2 flex items-center gap-1 ${
                      isPipetteActive
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    <Pipette className="w-3 h-3" />
                    <span>{isPipetteActive ? 'Click Image to Pick' : 'Pick Color'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 p-2 rounded bg-[--bg-app] border border-[--border-subtle]">
                  <div
                    className="w-6 h-6 rounded border border-white/20 shrink-0"
                    style={{
                      backgroundColor: `rgb(${options.keyColor.r}, ${options.keyColor.g}, ${options.keyColor.b})`,
                    }}
                  />
                  <span className="text-xs text-[--text-secondary]">
                    RGB({options.keyColor.r}, {options.keyColor.g}, {options.keyColor.b})
                  </span>
                </div>
              </div>

              {/* SKIN & SUBJECT PROTECTION SHIELD */}
              <div className="p-3 rounded bg-[--bg-surface-2]/40 border border-[--accent-blue-border]">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-1.5 font-semibold text-[--text-primary] cursor-pointer">
                    <Shield className="w-3.5 h-3.5 text-[--accent-blue]" />
                    <span>Subject & Skin Shield</span>
                  </label>
                  <input
                    type="checkbox"
                    checked={options.protectSkinTones}
                    onChange={(e) => setOptions({ ...options, protectSkinTones: e.target.checked })}
                    className="custom-checkbox"
                  />
                </div>

                {options.protectSkinTones && (
                  <div>
                    <div className="flex items-center justify-between mb-1 text-[11px]">
                      <span className="text-[--text-tertiary]">Skin Protection Strength</span>
                      <span className="font-bold text-[--accent-blue]">{options.skinProtectionStrength}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={options.skinProtectionStrength}
                      onChange={(e) => setOptions({ ...options, skinProtectionStrength: parseInt(e.target.value) || 50 })}
                      className="w-full h-1.5 bg-[--bg-surface-3] rounded appearance-none cursor-pointer accent-[--accent-blue]"
                    />
                    <p className="text-[10px] text-[--text-tertiary] mt-1 font-sans">
                      Shields human skin tones, faces, and hands from accidental removal when background hues are similar.
                    </p>
                  </div>
                )}
              </div>

              {/* Sensitivity Threshold Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-[--text-tertiary] uppercase">Sensitivity Threshold</label>
                  <span className="font-bold text-[--accent-blue]">{options.threshold}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={options.threshold}
                  onChange={(e) => setOptions({ ...options, threshold: parseInt(e.target.value) || 0 })}
                  className="w-full h-1.5 bg-[--bg-surface-3] rounded appearance-none cursor-pointer accent-[--accent-blue]"
                />
              </div>

              {/* Edge Feathering Slider */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] text-[--text-tertiary] uppercase">Edge Feathering</label>
                  <span className="font-bold text-[--text-primary]">{options.feather}px</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={options.feather}
                  onChange={(e) => setOptions({ ...options, feather: parseInt(e.target.value) || 0 })}
                  className="w-full h-1.5 bg-[--bg-surface-3] rounded appearance-none cursor-pointer accent-[--accent-blue]"
                />
              </div>

              {/* Invert Mask Checkbox */}
              <div className="pt-2 border-t border-[--border-subtle]">
                <label className="flex items-center gap-2 cursor-pointer text-[--text-primary]">
                  <input
                    type="checkbox"
                    checked={options.invertMask}
                    onChange={(e) => setOptions({ ...options, invertMask: e.target.checked })}
                    className="custom-checkbox"
                  />
                  Invert Removal Mask
                </label>
              </div>

              {/* Download CTA */}
              <div className="mt-auto pt-4 border-t border-[--border-subtle]">
                <button
                  onClick={handleDownload}
                  disabled={!resultBlob || isProcessing}
                  className="btn btn-primary w-full text-xs py-2.5 font-bold font-mono shadow-md shadow-[--accent-blue]/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Transparent PNG</span>
                </button>
              </div>
            </div>

            {/* Dual Preview Workspace */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {/* View Mode Switcher */}
              <div className="flex items-center justify-between bg-[--bg-surface-2] p-1.5 rounded-lg border border-[--border-subtle]">
                <div className="segmented-control text-xs">
                  <button
                    onClick={() => setPreviewViewMode('split')}
                    className={previewViewMode === 'split' ? 'active font-bold' : ''}
                  >
                    Split Compare
                  </button>
                  <button
                    onClick={() => setPreviewViewMode('transparent')}
                    className={previewViewMode === 'transparent' ? 'active font-bold' : ''}
                  >
                    Transparent Alpha
                  </button>
                  <button
                    onClick={() => setPreviewViewMode('original')}
                    className={previewViewMode === 'original' ? 'active font-bold' : ''}
                  >
                    Original
                  </button>
                </div>

                <span className="text-[10px] font-mono text-[--text-tertiary] hidden sm:inline">
                  {isProcessing ? 'Processing mask...' : 'Live Preview Ready'}
                </span>
              </div>

              <div className={`grid gap-4 ${previewViewMode === 'split' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Source Original Image */}
                {(previewViewMode === 'split' || previewViewMode === 'original') && (
                  <div className="tool-surface p-3 flex flex-col">
                    <div className="text-[11px] font-mono text-[--text-tertiary] uppercase mb-2">
                      Original Source {isPipetteActive && <span className="text-[--accent-blue] font-bold">(Click to pick color)</span>}
                    </div>
                    <div className={`relative aspect-square rounded bg-black flex items-center justify-center overflow-hidden border border-[--border-subtle] ${
                      isPipetteActive ? 'cursor-crosshair ring-2 ring-[--accent-blue]' : ''
                    }`}>
                      {sourceUrl && (
                        <img
                          ref={imageRef}
                          src={sourceUrl}
                          alt="Source"
                          onClick={handleCanvasClick}
                          className="w-full h-full object-contain select-none"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* Transparent Result Canvas */}
                {(previewViewMode === 'split' || previewViewMode === 'transparent') && (
                  <div className="tool-surface p-3 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-[--text-tertiary] uppercase">Transparent Alpha Output</span>
                      <span className="text-[10px] font-mono text-[--accent-blue] flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Alpha PNG
                      </span>
                    </div>
                    <div
                      className="relative aspect-square rounded flex items-center justify-center overflow-hidden border border-[--border-subtle]"
                      style={{
                        backgroundImage: `linear-gradient(45deg, #181c28 25%, transparent 25%), linear-gradient(-45deg, #181c28 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #181c28 75%), linear-gradient(-45deg, transparent 75%, #181c28 75%)`,
                        backgroundSize: '16px 16px',
                        backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                        backgroundColor: '#12151e',
                      }}
                    >
                      {resultUrl ? (
                        <img src={resultUrl} alt="Transparent Subject Result" className="w-full h-full object-contain select-none" />
                      ) : (
                        <span className="text-xs text-[--text-tertiary] font-mono">Processing mask...</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
