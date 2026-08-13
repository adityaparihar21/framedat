import React, { useState, useEffect, useRef } from 'react';
import type { BackgroundRemovalOptions } from '../utils/backgroundRemoval';
import { removeBackground, autoDetectKeyColor } from '../utils/backgroundRemoval';
import { saveAs } from 'file-saver';
import { Upload, Download, Pipette, RefreshCw, Scissors, Sparkles, Shield } from 'lucide-react';

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
        /* Perfectly Centered Empty Upload State — Matched 1:1 to Frame Extractor */
        <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center text-center my-auto px-4 py-8">
          {/* Centered Heading with Generous Breathing Space */}
          <div className="mb-14 sm:mb-16 min-h-[76px] flex flex-col items-center justify-center">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[--text-primary] mb-3 font-sans">
              Background Removal Studio
            </h1>
            <p className="text-sm text-[--text-secondary] max-w-sm mx-auto font-normal leading-relaxed">
              Extract subjects with alpha transparency — 100% client-side canvas engine.
            </p>
          </div>

          {/* Main Upload Focal Box — 460px Positioned Centered with Generous Gap */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full max-w-[460px] p-8 sm:p-10 text-center cursor-pointer rounded-2xl border border-[--border-subtle] bg-[--bg-surface-1] hover:border-[--border-hover] hover:bg-[--bg-surface-2]/40 transition-all shadow-xl"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center">
              <div className="w-12 h-12 mb-4 rounded-full bg-[--accent-blue-dim] border border-[--accent-blue-border] flex items-center justify-center text-[--accent-blue]">
                <Upload className="w-5 h-5" />
              </div>

              <h2 className="text-base font-bold text-[--text-primary] mb-1">
                Drop image or photo here
              </h2>
              <p className="text-xs text-[--text-tertiary] mb-6">
                PNG, JPEG, WebP, TIFF or video frame
              </p>

              <button className="btn btn-primary text-xs py-2.5 px-6 font-semibold shadow-md shadow-[--accent-blue]/20">
                Choose Photo
              </button>
            </div>
          </div>

          {/* Clean Format Label */}
          <div className="mt-6 text-center">
            <span className="text-xs font-mono text-[--text-tertiary]">
              PNG · JPEG · WebP · TIFF &nbsp;•&nbsp; Alpha Transparency
            </span>
          </div>
        </div>
      ) : (
        /* Active Background Removal Workspace */
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
