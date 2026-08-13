import React from 'react';
import { SlidersHorizontal, Settings, Film, RefreshCw } from 'lucide-react';

export type AppToolMode = 'extractor' | 'audio_cleaner' | 'image_studio';

interface HeaderProps {
  theme: 'dark' | 'light';
  toolMode: AppToolMode;
  onChangeToolMode: (mode: AppToolMode) => void;
  onToggleTheme: () => void;
  onReset: () => void;
  onReplayIntro?: () => void;
  onExportAction?: () => void;
  hasVideo: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  toolMode,
  onChangeToolMode,
  onToggleTheme,
  onReset,
  onReplayIntro,
  onExportAction,
  hasVideo,
}) => {
  return (
    <header className="border-b border-[--border-subtle] bg-[#08090C]/90 backdrop-blur-md px-6 sm:px-10 py-4 transition-colors select-none sticky top-0 z-50">
      <div className="max-w-[1280px] mx-auto flex items-center justify-between">
        {/* Left: Brand Logo & 3 Main Studio Navigation Links */}
        <div className="flex items-center gap-10 sm:gap-12">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={onReset}>
            <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-[--text-primary] font-sans group-hover:text-[--accent-blue] transition-colors">
              framedat
            </span>
            <span className="font-mono text-[10px] text-[--text-tertiary] bg-[--bg-surface-2] px-2 py-0.5 rounded border border-[--border-subtle] hidden sm:inline">
              v1.0
            </span>
          </div>

          {/* Understated Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-sans text-xs">
            <button
              onClick={() => onChangeToolMode('extractor')}
              className={`py-1 transition-all relative ${
                toolMode === 'extractor'
                  ? 'text-[--text-primary] font-semibold border-b-2 border-[--accent-blue]'
                  : 'text-[--text-secondary] hover:text-[--text-primary]'
              }`}
            >
              Extractor
            </button>
            <button
              onClick={() => onChangeToolMode('audio_cleaner')}
              className={`py-1 transition-all relative ${
                toolMode === 'audio_cleaner'
                  ? 'text-[--text-primary] font-semibold border-b-2 border-[--accent-blue]'
                  : 'text-[--text-secondary] hover:text-[--text-primary]'
              }`}
            >
              Audio Cleaner
            </button>
            <button
              onClick={() => onChangeToolMode('image_studio')}
              className={`py-1 transition-all relative ${
                toolMode === 'image_studio'
                  ? 'text-[--text-primary] font-semibold border-b-2 border-[--accent-blue]'
                  : 'text-[--text-secondary] hover:text-[--text-primary]'
              }`}
            >
              Image Studio
            </button>
          </nav>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4 sm:gap-5">
          <div
            className="hidden sm:flex items-center gap-2 text-xs text-[--text-secondary] font-sans relative group cursor-help px-2.5 py-1 rounded hover:bg-[--bg-surface-2] transition-colors"
            title="Your files stay on your device. Zero cloud uploads."
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-medium text-[11px] text-[--text-secondary]">Local processing</span>
          </div>

          {!hasVideo && onReplayIntro && toolMode === 'extractor' && (
            <button
              onClick={onReplayIntro}
              className="btn btn-ghost text-xs py-1.5 px-3 hidden sm:flex items-center gap-1.5 text-[--text-secondary]"
              title="Replay intro animation"
            >
              <Film className="w-3.5 h-3.5 text-[--accent-blue]" />
              <span className="font-mono text-[11px]">Replay Intro</span>
            </button>
          )}

          {hasVideo && (
            <button
              onClick={onReset}
              className="btn btn-secondary text-xs py-1.5 px-3 hidden sm:flex items-center gap-1.5"
              title="Open another video file"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[--text-secondary]" />
              <span>Open Video</span>
            </button>
          )}

          {onExportAction && (
            <button
              onClick={onExportAction}
              className="btn btn-primary text-xs py-1.5 px-4 font-mono font-bold uppercase tracking-wider shadow-md shadow-[--accent-blue]/20"
            >
              Export
            </button>
          )}

          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded-lg bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-center hover:bg-[--bg-surface-3] text-[--text-secondary] hover:text-[--text-primary] transition-all"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            <SlidersHorizontal className="w-4 h-4 hidden sm:block" />
            <Settings className="w-4 h-4 sm:hidden" />
          </button>
        </div>
      </div>
    </header>
  );
};
