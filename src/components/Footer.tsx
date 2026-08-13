import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[--border-subtle] bg-[#090B10] px-4 sm:px-8 py-3 text-xs font-mono text-[--text-tertiary] select-none">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        {/* Left Shortcuts Indicator (Image 1 UI) */}
        <div className="flex items-center gap-3">
          <span><kbd className="px-1.5 py-0.5 rounded bg-[--bg-surface-2] border border-[--border-subtle] text-[10px]">Space</kbd> Play/Pause</span>
          <span className="text-[--border-strong]">•</span>
          <span><kbd className="px-1.5 py-0.5 rounded bg-[--bg-surface-2] border border-[--border-subtle] text-[10px]">Esc</kbd> Close Viewer</span>
        </div>

        {/* Right Brand Copyright (Image 1 UI) */}
        <div>
          <span>© 2024 framedat</span>
        </div>
      </div>
    </footer>
  );
};
