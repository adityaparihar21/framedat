import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { introSound } from '../utils/introSound';

interface CinematicIntroProps {
  onComplete: () => void;
}

type IntroPhase = 
  | 'start'           // 0.0 - 0.4s: Dark + thin line
  | 'every_moment'    // 0.4 - 1.1s: "Every moment..."
  | 'has_a_frame'     // 1.1 - 1.8s: "has a frame."
  | 'find_it'         // 1.8 - 2.4s: "Find it." + playhead
  | 'extract_it'      // 2.4 - 3.0s: "Extract it."
  | 'review_it'       // 3.0 - 3.6s: "Review it."
  | 'keep_it'         // 3.6 - 4.2s: "Keep it."
  | 'done';           // 4.2s: Immediately reveals main homepage (ZERO 3-step lag!)

export const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<IntroPhase>('start');
  const [playheadPos, setPlayheadPos] = useState(10);
  const [isMuted, setIsMuted] = useState(false);

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
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    introSound.playWarmAmbientPad(4.5);

    const t1 = setTimeout(() => {
      setPhase('every_moment');
      introSound.playHapticTap();
    }, 400);

    const t2 = setTimeout(() => {
      setPhase('has_a_frame');
      introSound.playHapticTap();
    }, 1100);

    const t3 = setTimeout(() => {
      setPhase('find_it');
      setPlayheadPos(30);
      introSound.playHapticTap();
    }, 1800);

    const t4 = setTimeout(() => {
      setPhase('extract_it');
      setPlayheadPos(55);
      introSound.playHapticTap();
    }, 2400);

    const t5 = setTimeout(() => {
      setPhase('review_it');
      setPlayheadPos(75);
      introSound.playHapticTap();
    }, 3000);

    const t6 = setTimeout(() => {
      setPhase('keep_it');
      setPlayheadPos(90);
      introSound.playHapticTap();
    }, 3600);

    const t7 = setTimeout(() => {
      setPhase('done');
      introSound.playSubtleChime();
      introSound.close();
      onComplete();
    }, 4200);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
    };
  }, [onComplete]);

  const toggleSound = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    introSound.setMuted(nextMuted);
  };

  const skipIntro = () => {
    introSound.close();
    setPhase('done');
    onComplete();
  };

  if (phase === 'done') return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#090B10] flex flex-col items-center justify-center select-none overflow-hidden font-sans">
      {/* Top Controls: Sound Toggle & Skip Intro */}
      <div className="absolute top-4 right-6 z-20 flex items-center gap-2 font-mono text-xs">
        <button
          onClick={toggleSound}
          className="btn btn-ghost py-1 px-2.5 flex items-center gap-1.5 text-[--text-tertiary] hover:text-[--text-primary] border border-[--border-subtle] rounded"
          title={isMuted ? 'Unmute intro audio' : 'Mute intro audio'}
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              <span>Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[--accent-blue]" />
              <span>Sound On</span>
            </>
          )}
        </button>

        <button
          onClick={skipIntro}
          className="btn btn-ghost text-xs font-mono text-[--text-tertiary] hover:text-[--text-primary] px-3 py-1 rounded border border-[--border-subtle]"
          title="Skip intro animation (Esc)"
        >
          Skip Intro <span className="text-[10px] text-[--text-tertiary] ml-1"><kbd>Esc</kbd></span>
        </button>
      </div>

      {/* Main Motion Composition Center — EXACT GEOMETRIC ALIGNMENT */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center text-center my-auto px-4">
        
        {/* HEADING BLOCK — LOCKED min-h-[76px] & mb-14 sm:mb-16 */}
        <div className="mb-14 sm:mb-16 min-h-[76px] flex flex-col items-center justify-center">
          {phase === 'every_moment' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-horizontal-reveal font-sans my-auto">
              Every moment...
            </div>
          )}

          {phase === 'has_a_frame' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-slide-fade font-sans my-auto">
              has a frame.
            </div>
          )}

          {phase === 'find_it' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-slide-fade font-sans my-auto">
              Find it.
            </div>
          )}

          {phase === 'extract_it' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--accent-blue] tracking-tight animate-slide-fade font-mono my-auto">
              [EX] [TR] [AC] [T] [IT]
            </div>
          )}

          {phase === 'review_it' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-slide-fade font-sans my-auto">
              Review it.
            </div>
          )}

          {phase === 'keep_it' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-slide-fade font-sans my-auto">
              Keep it.
            </div>
          )}
        </div>

        {/* TIMELINE TRACK & PLAYHEAD */}
        <div className="w-full max-w-md h-12 flex items-center justify-center relative">
          <div className="relative w-full h-1 bg-[--bg-surface-3] rounded-full overflow-visible my-auto">
            <div
              className="absolute left-0 top-0 bottom-0 bg-[--accent-blue] rounded-full transition-all duration-400 ease-out"
              style={{ width: `${playheadPos}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[--accent-blue] border-2 border-white shadow-md transition-all duration-400 ease-out"
              style={{ left: `${playheadPos}%` }}
            />

            {(phase === 'extract_it' || phase === 'review_it' || phase === 'keep_it') && (
              <div className="absolute top-[-16px] left-0 right-0 flex justify-between px-2 text-[9px] font-mono text-[--text-tertiary] animate-fadeIn">
                <span>001</span>
                <span>002</span>
                <span>003</span>
                <span>004</span>
                <span>005</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
