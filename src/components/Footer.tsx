import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[--border-subtle] bg-[--bg-app] py-3 px-4 text-xs text-[--text-tertiary] transition-colors">
      <div className="page-container flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px]">
          <span className="w-2 h-2 rounded-full bg-[--accent-blue]" />
          <span className="text-[--text-secondary]">Local processing</span>
        </div>

        {/* Compact Shortcuts */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[--text-secondary] font-mono text-[11px]">
          <span className="flex items-center gap-1.5">
            <kbd>Space</kbd> Play/Pause
          </span>
          <span className="flex items-center gap-1.5">
            <kbd>←</kbd> <kbd>→</kbd> Step Frame
          </span>
          <span className="flex items-center gap-1.5">
            <kbd>Esc</kbd> Close Viewer
          </span>
        </div>

        <div className="font-mono text-[11px] text-[--text-tertiary]">
          framedat Studio
        </div>
      </div>
    </footer>
  );
};
