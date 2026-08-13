import React from 'react';
import { Lock, SlidersHorizontal, Settings, Film, RefreshCw } from 'lucide-react';

export type AppToolMode = 'extractor' | 'bg_remover' | 'assets' | 'settings';

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
    <header className="border-b border-[--border-subtle] bg-[#090B10] px-4 sm:px-8 py-3 transition-colors select-none sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left: Brand Wordmark & Nav Items (Desktop matching Image 1) */}
        <div className="flex items-center gap-6 sm:gap-10">
          <div className="flex items-center gap-2 cursor-pointer" onClick={onReset}>
            <span className="font-extrabold text-lg tracking-tight text-[--text-primary] font-sans">
              framedat
            </span>
            <span className="font-mono text-[10px] font-medium text-[--text-tertiary] bg-[--bg-surface-2] px-1.5 py-0.5 rounded border border-[--border-subtle] hidden sm:inline">
              v1.0
            </span>
          </div>

          {/* Desktop Navigation Links (Image 1 UI) */}
          <nav className="hidden md:flex items-center gap-6 font-sans text-xs">
            <button
              onClick={() => onChangeToolMode('extractor')}
              className={`py-1 transition-all relative ${
                toolMode === 'extractor'
                  ? 'text-[--text-primary] font-bold border-b-2 border-[--accent-blue]'
                  : 'text-[--text-secondary] hover:text-[--text-primary]'
              }`}
            >
              Extractor
            </button>
            <button
              onClick={() => onChangeToolMode('bg_remover')}
              className={`py-1 transition-all relative ${
                toolMode === 'bg_remover'
                  ? 'text-[--text-primary] font-bold border-b-2 border-[--accent-blue]'
                  : 'text-[--text-secondary] hover:text-[--text-primary]'
              }`}
            >
              Studio
            </button>
            <button
              onClick={() => onChangeToolMode('assets')}
              className={`py-1 transition-all relative ${
                toolMode === 'assets'
                  ? 'text-[--text-primary] font-bold border-b-2 border-[--accent-blue]'
                  : 'text-[--text-secondary] hover:text-[--text-primary]'
              }`}
            >
              Assets
            </button>
            <button
              onClick={() => onChangeToolMode('settings')}
              className={`py-1 transition-all relative ${
                toolMode === 'settings'
                  ? 'text-[--text-primary] font-bold border-b-2 border-[--accent-blue]'
                  : 'text-[--text-secondary] hover:text-[--text-primary]'
              }`}
            >
              Settings
            </button>
          </nav>
        </div>

        {/* Right: Controls, Local Status & Export CTA (Desktop & Mobile matching Image 1 & 2) */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-[--text-tertiary] font-mono">
            <Lock className="w-3.5 h-3.5" />
            <span>Local processing</span>
          </div>

          {!hasVideo && onReplayIntro && toolMode === 'extractor' && (
            <button
              onClick={onReplayIntro}
              className="btn btn-ghost text-xs py-1 px-2.5 hidden sm:flex items-center gap-1.5 text-[--text-secondary]"
              title="Replay intro animation"
            >
              <Film className="w-3.5 h-3.5 text-[--accent-blue]" />
              <span className="font-mono text-[11px]">Replay Intro</span>
            </button>
          )}

          {hasVideo && (
            <button
              onClick={onReset}
              className="btn btn-secondary text-xs py-1 px-2.5 hidden sm:flex items-center gap-1.5"
              title="Open another video file"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[--text-secondary]" />
              <span>Open Video</span>
            </button>
          )}

          {/* Export Button (Matching Image 1 Desktop CTA) */}
          {onExportAction && (
            <button
              onClick={onExportAction}
              className="btn btn-primary text-xs py-1.5 px-4 font-mono font-bold uppercase tracking-wider shadow-md shadow-[--accent-blue]/20"
            >
              Export
            </button>
          )}

          {/* Settings & Theme Toggle Button (Matching Image 1 & Image 2 UI) */}
          <button
            onClick={onToggleTheme}
            className="w-8 h-8 rounded bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-center hover:bg-[--bg-surface-3] text-[--text-secondary] hover:text-[--text-primary] transition-all"
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
