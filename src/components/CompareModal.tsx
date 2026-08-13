import React, { useState } from 'react';
import type { FrameData } from '../types';
import { X, Split } from 'lucide-react';

interface CompareModalProps {
  selectedFrames: FrameData[];
  onClose: () => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({ selectedFrames, onClose }) => {
  const [indexA, setIndexA] = useState(0);
  const [indexB, setIndexB] = useState(selectedFrames.length > 1 ? 1 : 0);
  const [sliderPos, setSliderPos] = useState(50);
  const [mode, setMode] = useState<'split' | 'sideBySide'>('split');

  if (selectedFrames.length < 2) return null;

  const frameA = selectedFrames[indexA] || selectedFrames[0];
  const frameB = selectedFrames[indexB] || selectedFrames[1];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-full max-w-5xl p-5 flex flex-col max-h-[95vh] bg-[--bg-surface-1] border border-[--border-subtle] rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[--border-subtle] pb-3 mb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-[--text-primary]">
            <Split className="w-4 h-4 text-[--accent-blue]" />
            <span>Frame Comparison</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="segmented-control">
              <button
                onClick={() => setMode('split')}
                className={mode === 'split' ? 'active' : ''}
              >
                Split
              </button>
              <button
                onClick={() => setMode('sideBySide')}
                className={mode === 'sideBySide' ? 'active' : ''}
              >
                Side-by-Side
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded bg-[--bg-surface-2] hover:bg-rose-500/20 hover:text-rose-400 border border-[--border-subtle] text-[--text-secondary]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3 font-mono text-xs">
          <div className="flex items-center gap-2 bg-[--bg-surface-2] p-2 rounded border border-[--border-subtle]">
            <span className="font-bold text-[--accent-blue]">A:</span>
            <select
              value={indexA}
              onChange={(e) => setIndexA(parseInt(e.target.value))}
              className="bg-[--bg-app] border border-[--border-subtle] rounded px-2 py-1 flex-1 text-[--text-primary] font-mono text-xs"
            >
              {selectedFrames.map((f, i) => (
                <option key={f.id} value={i}>
                  #{f.index} — {f.timeString}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-[--bg-surface-2] p-2 rounded border border-[--border-subtle]">
            <span className="font-bold text-[--text-secondary]">B:</span>
            <select
              value={indexB}
              onChange={(e) => setIndexB(parseInt(e.target.value))}
              className="bg-[--bg-app] border border-[--border-subtle] rounded px-2 py-1 flex-1 text-[--text-primary] font-mono text-xs"
            >
              {selectedFrames.map((f, i) => (
                <option key={f.id} value={i}>
                  #{f.index} — {f.timeString}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative flex-1 min-h-[420px] bg-black rounded overflow-hidden border border-[--border-subtle] flex items-center justify-center p-2">
          {mode === 'split' ? (
            <div className="relative w-full h-[58vh] overflow-hidden select-none">
              <img
                src={frameA.url}
                alt="Frame A"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none"
              />

              <div
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${sliderPos}%` }}
              >
                <img
                  src={frameB.url}
                  alt="Frame B"
                  className="absolute inset-0 w-full h-full object-contain max-w-none pointer-events-none"
                />
              </div>

              <div
                className="absolute top-0 bottom-0 w-0.5 bg-[--accent-blue] cursor-ew-resize flex items-center justify-center"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="w-5 h-5 rounded-full bg-[--accent-blue] border border-white flex items-center justify-center text-white text-[10px] font-bold">
                  ↔
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(parseFloat(e.target.value))}
                className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 w-full h-[58vh]">
              <div className="relative bg-black rounded overflow-hidden border border-[--accent-blue-border] flex items-center justify-center p-1">
                <img src={frameA.url} alt="Frame A" className="w-full h-full object-contain" />
                <div className="absolute top-2 left-2 bg-[--accent-blue] text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                  Frame #{frameA.index} ({frameA.timeString})
                </div>
              </div>

              <div className="relative bg-black rounded overflow-hidden border border-[--border-subtle] flex items-center justify-center p-1">
                <img src={frameB.url} alt="Frame B" className="w-full h-full object-contain" />
                <div className="absolute top-2 left-2 bg-[--bg-surface-3] text-white px-2 py-0.5 rounded text-[10px] font-mono font-bold">
                  Frame #{frameB.index} ({frameB.timeString})
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
