import React, { useState, useEffect } from 'react';
import type { FrameData, ContactSheetOptions } from '../types';
import { generateContactSheet } from '../utils/contactSheetGenerator';
import { saveAs } from 'file-saver';
import { X, Grid, Download, Loader2 } from 'lucide-react';

interface ContactSheetModalProps {
  frames: FrameData[];
  videoName: string;
  onClose: () => void;
}

export const ContactSheetModal: React.FC<ContactSheetModalProps> = ({
  frames,
  videoName,
  onClose,
}) => {
  const selectedFrames = frames.filter((f) => f.selected);
  const targetFrames = selectedFrames.length > 0 ? selectedFrames : frames;

  const [options, setOptions] = useState<ContactSheetOptions>({
    columns: 4,
    format: 'png',
    scaleRatio: 1.0,
    showFrameNumber: true,
    showTimecode: true,
    showFilename: false,
    namingTemplate: '{video}_contact_sheet.png',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedBlob, setGeneratedBlob] = useState<Blob | null>(null);
  const [generatedFilename, setGeneratedFilename] = useState<string>('');

  useEffect(() => {
    let isSubscribed = true;
    const buildSheet = async () => {
      try {
        setIsGenerating(true);
        const { blob, filename } = await generateContactSheet(targetFrames, videoName, options);
        if (isSubscribed) {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          setGeneratedBlob(blob);
          setGeneratedFilename(filename);
          setPreviewUrl(URL.createObjectURL(blob));
        }
      } catch (err: any) {
        console.error('Contact sheet preview error:', err);
      } finally {
        if (isSubscribed) setIsGenerating(false);
      }
    };

    buildSheet();

    return () => {
      isSubscribed = false;
    };
  }, [targetFrames, videoName, options]);

  const handleDownload = () => {
    if (generatedBlob) {
      saveAs(generatedBlob, generatedFilename || 'contact_sheet.png');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-full max-w-4xl p-5 flex flex-col bg-[--bg-surface-1] border border-[--border-subtle] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[--border-subtle] pb-3 mb-4">
          <div className="flex items-center gap-2 font-bold text-sm text-[--text-primary]">
            <Grid className="w-4 h-4 text-[--accent-blue]" />
            <span>Contact Sheet Generator</span>
            <span className="font-mono text-xs text-[--text-tertiary] font-normal">
              ({targetFrames.length} frames selected)
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded bg-[--bg-surface-2] hover:bg-rose-500/20 hover:text-rose-400 border border-[--border-subtle] text-[--text-secondary]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Configuration Toolbar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-4 font-mono text-xs">
          {/* Columns */}
          <div>
            <label className="block text-[11px] text-[--text-tertiary] uppercase mb-1">Columns</label>
            <div className="segmented-control w-full">
              {[3, 4, 5, 6].map((col) => (
                <button
                  key={col}
                  onClick={() => setOptions({ ...options, columns: col })}
                  className={options.columns === col ? 'active font-bold' : ''}
                >
                  {col}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-[11px] text-[--text-tertiary] uppercase mb-1">Format</label>
            <div className="segmented-control w-full uppercase">
              {(['png', 'jpeg'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setOptions({ ...options, format: fmt })}
                  className={options.format === fmt ? 'active font-bold' : ''}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Scale */}
          <div>
            <label className="block text-[11px] text-[--text-tertiary] uppercase mb-1">Scale</label>
            <div className="segmented-control w-full">
              <button
                onClick={() => setOptions({ ...options, scaleRatio: 1.0 })}
                className={options.scaleRatio === 1.0 ? 'active font-bold' : ''}
              >
                1× Native
              </button>
              <button
                onClick={() => setOptions({ ...options, scaleRatio: 2.0 })}
                className={options.scaleRatio === 2.0 ? 'active font-bold' : ''}
              >
                2× High-Res
              </button>
            </div>
          </div>

          {/* Filename Template */}
          <div>
            <label className="block text-[11px] text-[--text-tertiary] uppercase mb-1">Filename Template</label>
            <input
              type="text"
              value={options.namingTemplate}
              onChange={(e) => setOptions({ ...options, namingTemplate: e.target.value })}
              className="w-full px-2 py-1 rounded bg-[--bg-app] border border-[--border-subtle] text-[--text-primary] font-mono text-xs"
            />
          </div>
        </div>

        {/* Checkbox Labels */}
        <div className="flex flex-wrap items-center gap-4 p-2.5 rounded bg-[--bg-surface-2]/40 border border-[--border-subtle] mb-4 text-xs font-mono">
          <span className="text-[--text-tertiary]">Labels:</span>
          <label className="flex items-center gap-1.5 cursor-pointer text-[--text-primary]">
            <input
              type="checkbox"
              checked={options.showFrameNumber}
              onChange={(e) => setOptions({ ...options, showFrameNumber: e.target.checked })}
              className="custom-checkbox"
            />
            Frame Number (#0001)
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-[--text-primary]">
            <input
              type="checkbox"
              checked={options.showTimecode}
              onChange={(e) => setOptions({ ...options, showTimecode: e.target.checked })}
              className="custom-checkbox"
            />
            Timecode (00:05.120)
          </label>
          <label className="flex items-center gap-1.5 cursor-pointer text-[--text-primary]">
            <input
              type="checkbox"
              checked={options.showFilename}
              onChange={(e) => setOptions({ ...options, showFilename: e.target.checked })}
              className="custom-checkbox"
            />
            Filename
          </label>
        </div>

        {/* Live Preview Window */}
        <div className="relative aspect-video max-h-[460px] bg-black rounded overflow-hidden flex items-center justify-center border border-[--border-subtle] p-2 mb-4">
          {isGenerating && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10 font-mono text-xs text-[--accent-blue]">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Building Contact Sheet...
            </div>
          )}

          {previewUrl ? (
            <img src={previewUrl} alt="Contact Sheet Preview" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-[--text-tertiary] text-xs font-mono">Generating preview...</div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between font-mono text-xs">
          <div className="text-[--text-secondary]">
            Filename: <span className="text-[--text-primary] font-semibold">{generatedFilename}</span>
          </div>

          <button
            onClick={handleDownload}
            disabled={!generatedBlob || isGenerating}
            className="btn btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5 font-mono"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Contact Sheet</span>
          </button>
        </div>
      </div>
    </div>
  );
};
