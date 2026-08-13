import React, { useState, useEffect, useRef } from 'react';

interface CinematicIntroProps {
  onComplete: () => void;
}

type IntroPhase = 
  | 'start'           // 0.0 - 0.5s: Dark + thin line
  | 'every_moment'    // 0.5 - 1.3s: "Every moment..."
  | 'has_a_frame'     // 1.3 - 2.0s: "has a frame."
  | 'find_it'         // 2.0 - 2.6s: "Find it." + playhead
  | 'extract_it'      // 2.6 - 3.2s: "Extract it." + frame strip
  | 'review_it'       // 3.2 - 3.8s: "Review it."
  | 'keep_it'         // 3.8 - 4.4s: "Keep it."
  | 'title_reveal'    // 4.4 - 5.2s: "framedat — Precision Frame Extraction"
  | 'morph_uploader'  // 5.2 - 6.0s: Morph into upload box
  | 'done';

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<IntroPhase>('start');
  const [playheadPos, setPlayheadPos] = useState(10);
  const animationFrameRef = useRef<number | null>(null);

  // Keyboard shortcut for Esc -> Skip Intro
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.code === 'Space') {
        skipIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Main cinematic timeline sequence
  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    const t1 = setTimeout(() => setPhase('every_moment'), 500);
    const t2 = setTimeout(() => setPhase('has_a_frame'), 1300);
    const t3 = setTimeout(() => {
      setPhase('find_it');
      setPlayheadPos(30);
    }, 2000);
    const t4 = setTimeout(() => {
      setPhase('extract_it');
      setPlayheadPos(55);
    }, 2600);
    const t5 = setTimeout(() => {
      setPhase('review_it');
      setPlayheadPos(75);
    }, 3200);
    const t6 = setTimeout(() => setPhase('keep_it'), 3800);
    const t7 = setTimeout(() => setPhase('title_reveal'), 4400);
    const t8 = setTimeout(() => setPhase('morph_uploader'), 5200);
    const t9 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 6000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
      clearTimeout(t8);
      clearTimeout(t9);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [onComplete]);

  const skipIntro = () => {
    try {
      localStorage.setItem('framedat_intro_seen', 'true');
    } catch {}
    setPhase('done');
    onComplete();
  };

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#090B10] flex flex-col items-center justify-center select-none overflow-hidden font-sans">
      {/* Top Controls: Skip Intro button */}
      <div className="absolute top-4 right-6 z-20 flex items-center gap-3">
        <button
          onClick={skipIntro}
          className="btn btn-ghost text-xs font-mono text-[--text-tertiary] hover:text-[--text-primary] px-3 py-1 rounded border border-[--border-subtle]"
          title="Skip intro animation (Esc)"
        >
          Skip Intro <span className="text-[10px] text-[--text-tertiary] ml-1"><kbd>Esc</kbd></span>
        </button>
      </div>

      {/* Main Motion Composition Center */}
      <div className="relative w-full max-w-xl mx-auto px-6 flex flex-col items-center justify-center text-center">
        {/* PHASE 1 & 2: TEXT PHRASES */}
        <div className="h-20 flex items-center justify-center mb-8 relative overflow-hidden">
          {phase === 'every_moment' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-horizontal-reveal">
              Every moment...
            </div>
          )}

          {phase === 'has_a_frame' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-slide-fade">
              has a frame.
            </div>
          )}

          {phase === 'find_it' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-slide-fade">
              Find it.
            </div>
          )}

          {phase === 'extract_it' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--accent-blue] tracking-tight animate-slide-fade font-mono">
              [EX] [TR] [AC] [T] [IT]
            </div>
          )}

          {phase === 'review_it' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-slide-fade">
              Review it.
            </div>
          )}

          {phase === 'keep_it' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-slide-fade">
              Keep it.
            </div>
          )}

          {(phase === 'title_reveal' || phase === 'morph_uploader') && (
            <div className="flex flex-col items-center animate-slide-fade">
              <div className="text-3xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight">
                framedat
              </div>
              <div className="text-xs font-mono text-[--text-secondary] mt-1">
                Precision Frame Extraction
              </div>
            </div>
          )}
        </div>

        {/* TIMELINE TRACK & PLAYHEAD MOTION */}
        <div className={`w-full max-w-md transition-all duration-700 relative ${
          phase === 'morph_uploader' ? 'h-[220px] max-w-[460px] rounded-2xl bg-[--bg-surface-1] border border-[--accent-blue-border] p-8' : 'h-10'
        }`}>
          {phase !== 'morph_uploader' ? (
            <div className="relative w-full h-1 bg-[--bg-surface-3] rounded-full overflow-visible my-auto">
              {/* Active track bar */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-[--accent-blue] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${playheadPos}%` }}
              />

              {/* Moving Playhead Dot */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[--accent-blue] border-2 border-white shadow-md transition-all duration-500 ease-out"
                style={{ left: `${playheadPos}%` }}
              />

              {/* Subtle Frame Stepping Ticks */}
              {(phase === 'extract_it' || phase === 'review_it' || phase === 'keep_it') && (
                <div className="absolute top-[-14px] left-0 right-0 flex justify-between px-2 text-[9px] font-mono text-[--text-tertiary]">
                  <span>001</span>
                  <span>002</span>
                  <span>003</span>
                  <span>004</span>
                  <span>005</span>
                </div>
              )}
            </div>
          ) : (
            /* MORPH INTO UPLOADER BOX */
            <div className="flex flex-col items-center justify-center text-center animate-fadeIn">
              <div className="w-10 h-10 mb-3 rounded-full bg-[--accent-blue-dim] border border-[--accent-blue-border] flex items-center justify-center text-[--accent-blue]">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div className="text-sm font-bold text-[--text-primary] mb-1">Drop video here</div>
              <div className="text-xs text-[--text-tertiary] mb-4">or choose a file</div>
              <div className="btn btn-primary text-xs py-2 px-5">Choose Video</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
