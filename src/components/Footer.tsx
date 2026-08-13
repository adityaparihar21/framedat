import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-[--border-subtle] bg-[#08090C] px-6 sm:px-8 py-4 text-xs font-sans text-[--text-tertiary] select-none">
      <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left Brand Wordmark (Section 12 Directive) */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-xs text-[--text-primary] tracking-tight">
            Framedat
          </span>
          <span className="text-[--text-tertiary] font-mono text-[11px]">• Local-first creative tooling</span>
        </div>

        {/* Right Copyright Notice (Section 12 Directive) */}
        <div className="font-mono text-[11px]">
          <span>© 2026 Framedat</span>
        </div>
      </div>
    </footer>
  );
};
