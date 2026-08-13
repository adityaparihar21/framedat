import React from 'react';
import { Sun, Moon, Lock, RefreshCw, Film } from 'lucide-react';

interface HeaderProps {
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  onReset: () => void;
  onReplayIntro?: () => void;
  hasVideo: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onToggleTheme,
  onReset,
  onReplayIntro,
  hasVideo,
}) => {
  return (
    <header className="border-b border-[--border-subtle] bg-[--bg-app] px-4 sm:px-6 py-3 transition-colors">
      <div className="page-container flex items-center justify-between">
        {/* Left: Minimal Wordmark & Version */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={onReset}>
          <span className="font-extrabold text-base tracking-tight text-[--text-primary] font-sans">
            framedat
          </span>
          <span className="font-mono text-[10px] font-medium text-[--text-tertiary] bg-[--bg-surface-2] px-1.5 py-0.5 rounded border border-[--border-subtle]">
            v1.0
          </span>
        </div>

        {/* Right: Controls & Status */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5 text-xs text-[--text-secondary]">
            <Lock className="w-3.5 h-3.5 text-[--text-tertiary]" />
            <span className="hidden sm:inline font-mono">Local processing</span>
          </div>

          {!hasVideo && onReplayIntro && (
            <button
              onClick={onReplayIntro}
              className="btn btn-ghost text-xs py-1 px-2.5 flex items-center gap-1.5 text-[--text-secondary]"
              title="Replay cinematic intro animation"
            >
              <Film className="w-3.5 h-3.5 text-[--accent-blue]" />
              <span className="hidden sm:inline font-mono text-[11px]">Replay Intro</span>
            </button>
          )}

          {hasVideo && (
            <button
              onClick={onReset}
              className="btn btn-secondary text-xs py-1 px-2.5 flex items-center gap-1.5"
              title="Open another video file"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[--text-secondary]" />
              <span className="hidden sm:inline">Open Video</span>
            </button>
          )}

          <button
            onClick={onToggleTheme}
            className="w-7 h-7 rounded bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-center hover:bg-[--bg-surface-3] text-[--text-secondary] hover:text-[--text-primary] transition-all"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5" />
            ) : (
              <Moon className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
