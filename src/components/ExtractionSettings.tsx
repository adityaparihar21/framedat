import React, { useState } from 'react';
import type { ExtractionOptions, ExtractionMode, ExportFormat, VideoMetadata, OverlayPosition, OverlayStyle, OverlayFontSize } from '../types';
import { calculateTimestamps, parseSmartFilenamePattern } from '../utils/frameExtractor';
import { ChevronDown, ChevronUp, Play, Settings2, HelpCircle, Eye } from 'lucide-react';

interface ExtractionSettingsProps {
  metadata: VideoMetadata;
  options: ExtractionOptions;
  onChangeOptions: (newOptions: ExtractionOptions) => void;
  onStartExtraction: () => void;
  isExtracting: boolean;
}

export const ExtractionSettings: React.FC<ExtractionSettingsProps> = ({
  metadata,
  options,
  onChangeOptions,
  onStartExtraction,
  isExtracting,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTokenHelp, setShowTokenHelp] = useState(false);

  const calculatedTimestamps = calculateTimestamps(metadata, options);
  const estimatedFrameCount = calculatedTimestamps.length;

  const handleModeChange = (mode: ExtractionMode) => {
    onChangeOptions({ ...options, mode });
  };

  const handleFormatChange = (format: ExportFormat) => {
    onChangeOptions({ ...options, format });
  };

  const currentPattern = options.namingTemplate || '{video}_frame_{####}.png';

  // Live 3-line filename preview calculation
  const previewFilenames = [0, 1, 2].map((i) => {
    const t = calculatedTimestamps[i] || (i * (metadata.duration / 3));
    return parseSmartFilenamePattern(currentPattern, metadata.name, i, t, options.format, options);
  });

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-mono text-[--text-tertiary] uppercase tracking-wider">
          02 — CHOOSE EXTRACTION
        </span>
        <div className="text-xs font-mono text-[--text-secondary]">
          Expected output: <strong className="text-[--accent-blue] font-bold">{estimatedFrameCount} frames</strong>
        </div>
      </div>

      <div className="tool-surface p-4">
        {/* Mode Segment Control & Format Switcher */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[--text-secondary] font-sans">Method:</span>
            <div className="segmented-control">
              <button
                onClick={() => handleModeChange('all')}
                className={options.mode === 'all' ? 'active' : ''}
              >
                All Frames
              </button>
              <button
                onClick={() => handleModeChange('count')}
                className={options.mode === 'count' ? 'active' : ''}
              >
                N Frames
              </button>
              <button
                onClick={() => handleModeChange('interval')}
                className={options.mode === 'interval' ? 'active' : ''}
              >
                Time Interval
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[--text-secondary] font-sans">Format:</span>
            <div className="segmented-control font-mono text-xs uppercase">
              {(['png', 'tiff', 'bmp'] as ExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => handleFormatChange(fmt)}
                  className={options.format === fmt ? 'active font-bold' : ''}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Mode Parameters */}
        <div className="p-3 rounded bg-[--bg-surface-2]/40 border border-[--border-subtle] mb-4 text-xs font-mono">
          {options.mode === 'count' && (
            <div className="flex items-center gap-4">
              <label className="text-[--text-secondary] shrink-0">Number of frames (N):</label>
              <input
                type="range"
                min="2"
                max={Math.min(500, metadata.totalFrames)}
                value={options.frameCount}
                onChange={(e) => onChangeOptions({ ...options, frameCount: parseInt(e.target.value) || 10 })}
                className="w-full h-1.5 bg-[--bg-surface-3] rounded appearance-none cursor-pointer accent-[--accent-blue]"
              />
              <input
                type="number"
                min="1"
                max={metadata.totalFrames}
                value={options.frameCount}
                onChange={(e) => onChangeOptions({ ...options, frameCount: Math.max(1, parseInt(e.target.value) || 1) })}
                className="w-20 px-2 py-1 rounded bg-[--bg-app] border border-[--border-subtle] text-center font-bold text-[--text-primary]"
              />
            </div>
          )}

          {options.mode === 'interval' && (
            <div className="flex items-center gap-4">
              <label className="text-[--text-secondary] shrink-0">Interval (Seconds):</label>
              <input
                type="number"
                step="0.1"
                min="0.05"
                max={metadata.duration}
                value={options.intervalSeconds}
                onChange={(e) => onChangeOptions({ ...options, intervalSeconds: Math.max(0.05, parseFloat(e.target.value) || 1) })}
                className="w-24 px-2 py-1 rounded bg-[--bg-app] border border-[--border-subtle] font-bold text-[--text-primary]"
              />
              <span className="text-[--text-tertiary]">(e.g., 1.0 = 1 frame/sec, 0.5 = 2 frames/sec)</span>
            </div>
          )}

          {options.mode === 'all' && (
            <div className="text-[--text-secondary]">
              Extracting all <strong className="text-[--text-primary]">{estimatedFrameCount} frames</strong> sequentially at {metadata.fps} FPS.
            </div>
          )}
        </div>

        {/* Action Toolbar & Advanced Toggle */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn btn-ghost text-xs py-1.5 px-2.5 flex items-center gap-1 text-[--text-secondary]"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Advanced Options</span>
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onStartExtraction}
            disabled={isExtracting || estimatedFrameCount === 0}
            className="btn btn-primary text-xs py-2 px-6 font-semibold"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isExtracting ? 'Extracting...' : `Export ${estimatedFrameCount.toLocaleString()} Frames`}</span>
          </button>
        </div>

        {/* Progressive Disclosure: Advanced Options Panel */}
        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-[--border-subtle] flex flex-col gap-5 text-xs font-mono">
            {/* FEATURE 01: SMART FILENAME PATTERNS */}
            <div className="p-3.5 rounded bg-[--bg-surface-2]/40 border border-[--border-subtle]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 font-bold text-[--text-primary]">
                  <span>Naming Pattern</span>
                  <button
                    type="button"
                    onClick={() => setShowTokenHelp(!showTokenHelp)}
                    className="text-[--accent-blue] hover:underline flex items-center gap-0.5 ml-1"
                    title="View pattern variable tokens"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span className="text-[10px]">Variables</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[10px] text-[--text-tertiary]">Start #:</label>
                  <input
                    type="number"
                    min="0"
                    value={options.startNumber || 1}
                    onChange={(e) => onChangeOptions({ ...options, startNumber: parseInt(e.target.value) || 1 })}
                    className="w-14 px-1.5 py-0.5 rounded bg-[--bg-app] border border-[--border-subtle] text-center font-bold text-[--text-primary]"
                  />
                  <label className="text-[10px] text-[--text-tertiary]">Pad:</label>
                  <select
                    value={options.zeroPad || 4}
                    onChange={(e) => onChangeOptions({ ...options, zeroPad: parseInt(e.target.value) || 4 })}
                    className="bg-[--bg-app] border border-[--border-subtle] rounded px-1.5 py-0.5 text-[--text-primary]"
                  >
                    <option value={1}>1 digit</option>
                    <option value={2}>02 digits</option>
                    <option value={3}>003 digits</option>
                    <option value={4}>0004 digits</option>
                    <option value={5}>00005 digits</option>
                  </select>
                </div>
              </div>

              {/* Naming Pattern Input */}
              <input
                type="text"
                value={currentPattern}
                onChange={(e) => onChangeOptions({ ...options, namingPattern: 'smart_pattern', namingTemplate: e.target.value })}
                placeholder="{video}_frame_{####}.png"
                className="w-full px-3 py-1.5 rounded bg-[--bg-app] border border-[--border-subtle] text-[--text-primary] font-mono text-xs mb-2"
              />

              {/* Variable Token Help Guide */}
              {showTokenHelp && (
                <div className="p-2.5 mb-2 rounded bg-[--bg-app] border border-[--border-subtle] grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-[--text-secondary]">
                  <div><code className="text-[--accent-blue] font-bold">&#123;video&#125;</code> — Original filename</div>
                  <div><code className="text-[--accent-blue] font-bold">&#123;frame&#125;</code> — Frame number</div>
                  <div><code className="text-[--accent-blue] font-bold">&#123;####&#125;</code> — Padded frame #</div>
                  <div><code className="text-[--accent-blue] font-bold">&#123;time&#125;</code> — Timestamp (sec)</div>
                  <div><code className="text-[--accent-blue] font-bold">&#123;timecode&#125;</code> — Timecode (MM-SS)</div>
                  <div><code className="text-[--accent-blue] font-bold">&#123;scene&#125;</code> — Scene number</div>
                  <div><code className="text-[--accent-blue] font-bold">&#123;index&#125;</code> — Sequence index</div>
                  <div><code className="text-[--accent-blue] font-bold">&#123;date&#125;</code> — Current date</div>
                </div>
              )}

              {/* Live 3-Line Filename Preview */}
              <div className="text-[10px] text-[--text-tertiary]">
                <div className="font-semibold text-[--text-secondary] mb-0.5">Live Filename Preview:</div>
                {previewFilenames.map((fn, idx) => (
                  <div key={idx} className="text-[--accent-blue] truncate font-mono">
                    {fn}
                  </div>
                ))}
              </div>
            </div>

            {/* FEATURE 02: OPTIONAL FRAME METADATA OVERLAY */}
            <div className="p-3.5 rounded bg-[--bg-surface-2]/40 border border-[--border-subtle]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-[--accent-blue]" />
                  <span className="font-bold text-[--text-primary]">Metadata Overlay</span>
                </div>

                <div className="segmented-control">
                  <button
                    type="button"
                    onClick={() => onChangeOptions({
                      ...options,
                      metadataOverlay: { ...options.metadataOverlay, enabled: false }
                    })}
                    className={!options.metadataOverlay?.enabled ? 'active font-bold' : ''}
                  >
                    Off
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeOptions({
                      ...options,
                      metadataOverlay: {
                        enabled: true,
                        position: options.metadataOverlay?.position || 'bottom-left',
                        style: options.metadataOverlay?.style || 'dark',
                        opacity: options.metadataOverlay?.opacity || 0.8,
                        fontSize: options.metadataOverlay?.fontSize || 'small',
                        customLabel: options.metadataOverlay?.customLabel || '',
                        fields: options.metadataOverlay?.fields || {
                          frameNumber: true,
                          timecode: true,
                          timestamp: false,
                          filename: false,
                          resolution: true,
                          fps: true,
                          sceneNumber: false,
                          mode: false,
                          customLabel: true,
                        }
                      }
                    })}
                    className={options.metadataOverlay?.enabled ? 'active font-bold' : ''}
                  >
                    On
                  </button>
                </div>
              </div>

              {/* Reveal Overlay Settings when Enabled */}
              {options.metadataOverlay?.enabled && (
                <div className="flex flex-col gap-3 pt-3 border-t border-[--border-subtle]">
                  {/* Position & Style Controls */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] text-[--text-tertiary] uppercase mb-1">Position</label>
                      <select
                        value={options.metadataOverlay.position}
                        onChange={(e) => onChangeOptions({
                          ...options,
                          metadataOverlay: { ...options.metadataOverlay, position: e.target.value as OverlayPosition }
                        })}
                        className="w-full px-2 py-1 rounded bg-[--bg-app] border border-[--border-subtle] text-[--text-primary]"
                      >
                        <option value="bottom-left">Bottom Left</option>
                        <option value="bottom-center">Bottom Center</option>
                        <option value="bottom-right">Bottom Right</option>
                        <option value="top-left">Top Left</option>
                        <option value="top-center">Top Center</option>
                        <option value="top-right">Top Right</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[--text-tertiary] uppercase mb-1">Style</label>
                      <select
                        value={options.metadataOverlay.style}
                        onChange={(e) => onChangeOptions({
                          ...options,
                          metadataOverlay: { ...options.metadataOverlay, style: e.target.value as OverlayStyle }
                        })}
                        className="w-full px-2 py-1 rounded bg-[--bg-app] border border-[--border-subtle] text-[--text-primary]"
                      >
                        <option value="dark">Dark Label</option>
                        <option value="light">Light Label</option>
                        <option value="minimal">Minimal</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-[--text-tertiary] uppercase mb-1">Size</label>
                      <select
                        value={options.metadataOverlay.fontSize}
                        onChange={(e) => onChangeOptions({
                          ...options,
                          metadataOverlay: { ...options.metadataOverlay, fontSize: e.target.value as OverlayFontSize }
                        })}
                        className="w-full px-2 py-1 rounded bg-[--bg-app] border border-[--border-subtle] text-[--text-primary]"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                    </div>
                  </div>

                  {/* Custom Label Input */}
                  <div>
                    <label className="block text-[10px] text-[--text-tertiary] uppercase mb-1">Custom Label</label>
                    <input
                      type="text"
                      value={options.metadataOverlay.customLabel || ''}
                      onChange={(e) => onChangeOptions({
                        ...options,
                        metadataOverlay: { ...options.metadataOverlay, customLabel: e.target.value }
                      })}
                      placeholder="e.g. Animation Reference — Walk Cycle"
                      className="w-full px-2.5 py-1 rounded bg-[--bg-app] border border-[--border-subtle] text-[--text-primary] text-xs font-mono"
                    />
                  </div>

                  {/* Metadata Fields Checkboxes */}
                  <div>
                    <label className="block text-[10px] text-[--text-tertiary] uppercase mb-1.5">Displayed Fields</label>
                    <div className="flex flex-wrap items-center gap-3 text-[11px]">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={options.metadataOverlay.fields.frameNumber}
                          onChange={(e) => onChangeOptions({
                            ...options,
                            metadataOverlay: {
                              ...options.metadataOverlay,
                              fields: { ...options.metadataOverlay.fields, frameNumber: e.target.checked }
                            }
                          })}
                          className="custom-checkbox"
                        />
                        Frame Number
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={options.metadataOverlay.fields.timecode}
                          onChange={(e) => onChangeOptions({
                            ...options,
                            metadataOverlay: {
                              ...options.metadataOverlay,
                              fields: { ...options.metadataOverlay.fields, timecode: e.target.checked }
                            }
                          })}
                          className="custom-checkbox"
                        />
                        Timecode
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={options.metadataOverlay.fields.resolution}
                          onChange={(e) => onChangeOptions({
                            ...options,
                            metadataOverlay: {
                              ...options.metadataOverlay,
                              fields: { ...options.metadataOverlay.fields, resolution: e.target.checked }
                            }
                          })}
                          className="custom-checkbox"
                        />
                        Resolution
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={options.metadataOverlay.fields.fps}
                          onChange={(e) => onChangeOptions({
                            ...options,
                            metadataOverlay: {
                              ...options.metadataOverlay,
                              fields: { ...options.metadataOverlay.fields, fps: e.target.checked }
                            }
                          })}
                          className="custom-checkbox"
                        />
                        FPS Rate
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={options.metadataOverlay.fields.filename}
                          onChange={(e) => onChangeOptions({
                            ...options,
                            metadataOverlay: {
                              ...options.metadataOverlay,
                              fields: { ...options.metadataOverlay.fields, filename: e.target.checked }
                            }
                          })}
                          className="custom-checkbox"
                        />
                        Filename
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
