import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Upload, FileVideo } from 'lucide-react';
import { introSound } from '../utils/introSound';

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
  | 'title_reveal'    // 4.4 - 5.4s: "Precision Frame Extraction"
  | 'morph_uploader'  // 5.4 - 6.6s: Morph smoothly into uploader box
  | 'fade_out'        // 6.6 - 7.3s: Seamless opacity dissolve into main page
  | 'done';

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

  // Main cinematic timeline sequence + Sound triggers
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    // Play initial subtle ambient drone
    introSound.playAmbientDrone(7.2);

    const t1 = setTimeout(() => {
      setPhase('every_moment');
      introSound.playFrameTick(600);
    }, 500);

    const t2 = setTimeout(() => {
      setPhase('has_a_frame');
      introSound.playFrameTick(700);
    }, 1300);

    const t3 = setTimeout(() => {
      setPhase('find_it');
      setPlayheadPos(30);
      introSound.playFrameTick(800);
    }, 2000);

    const t4 = setTimeout(() => {
      setPhase('extract_it');
      setPlayheadPos(55);
      introSound.playFrameTick(900);
    }, 2600);

    const t5 = setTimeout(() => {
      setPhase('review_it');
      setPlayheadPos(75);
      introSound.playFrameTick(1000);
    }, 3200);

    const t6 = setTimeout(() => {
      setPhase('keep_it');
      introSound.playFrameTick(1100);
    }, 3800);

    const t7 = setTimeout(() => {
      setPhase('title_reveal');
      introSound.playTitleBloom();
    }, 4400);

    const t8 = setTimeout(() => {
      setPhase('morph_uploader');
      introSound.playMorphSwoosh();
    }, 5400);

    const t9 = setTimeout(() => {
      setPhase('fade_out');
    }, 6600);

    const t10 = setTimeout(() => {
      setPhase('done');
      introSound.close();
      onComplete();
    }, 7300);

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
      clearTimeout(t10);
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
    <div
      className={`fixed inset-0 z-[100] bg-[#090B10] flex flex-col items-center justify-center select-none overflow-hidden font-sans transition-opacity duration-700 ${
        phase === 'fade_out' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
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

      {/* Main Motion Composition Center — EXACT MATCH TO HOMEPAGE LAYOUT */}
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center text-center my-auto px-4">
        
        {/* HEADING BLOCK — IDENTICAL TO HOMEPAGE DROPZONE */}
        <div className="mb-14 sm:mb-16 min-h-[72px] flex flex-col items-center justify-center">
          {phase === 'every_moment' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-horizontal-reveal font-sans">
              Every moment...
            </div>
          )}

          {phase === 'has_a_frame' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-slide-fade font-sans">
              has a frame.
            </div>
          )}

          {phase === 'find_it' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-slide-fade font-sans">
              Find it.
            </div>
          )}

          {phase === 'extract_it' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--accent-blue] tracking-tight animate-slide-fade font-mono">
              [EX] [TR] [AC] [T] [IT]
            </div>
          )}

          {phase === 'review_it' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-slide-fade font-sans">
              Review it.
            </div>
          )}

          {phase === 'keep_it' && (
            <div className="text-2xl sm:text-4xl font-extrabold text-[--text-primary] tracking-tight animate-slide-fade font-sans">
              Keep it.
            </div>
          )}

          {(phase === 'title_reveal' || phase === 'morph_uploader' || phase === 'fade_out') && (
            <div className="animate-slide-fade">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[--text-primary] mb-3 font-sans">
                Precision Frame Extraction
              </h1>
              <p className="text-sm text-[--text-secondary] max-w-sm mx-auto font-normal leading-relaxed">
                Extract exact video frames locally at native resolution.
              </p>
            </div>
          )}
        </div>

        {/* CENTER FOCAL CONTAINER — MORPHS INTO HOMEPAGE UPLOAD BOX */}
        <div
          className={`w-full transition-all duration-1000 ease-out relative ${
            phase === 'morph_uploader' || phase === 'fade_out'
              ? 'max-w-[460px] p-8 sm:p-10 text-center rounded-2xl border border-[--border-subtle] bg-[--bg-surface-1]'
              : 'max-w-md h-12 flex items-center justify-center'
          }`}
        >
          {phase !== 'morph_uploader' && phase !== 'fade_out' ? (
            /* TIMELINE TRACK & PLAYHEAD */
            <div className="relative w-full h-1 bg-[--bg-surface-3] rounded-full overflow-visible my-auto">
              <div
                className="absolute left-0 top-0 bottom-0 bg-[--accent-blue] rounded-full transition-all duration-500 ease-out"
                style={{ width: `${playheadPos}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-[--accent-blue] border-2 border-white shadow-md transition-all duration-500 ease-out"
                style={{ left: `${playheadPos}%` }}
              />

              {/* Monospace Frame Sequence Numbers — Visible from initial phase */}
              <div className="absolute top-[-16px] left-0 right-0 flex justify-between px-2 text-[9px] font-mono transition-opacity duration-300">
                <span className={playheadPos >= 10 && playheadPos < 25 ? 'text-[--accent-blue] font-bold' : 'text-[--text-tertiary]'}>001</span>
                <span className={playheadPos >= 25 && playheadPos < 45 ? 'text-[--accent-blue] font-bold' : 'text-[--text-tertiary]'}>002</span>
                <span className={playheadPos >= 45 && playheadPos < 65 ? 'text-[--accent-blue] font-bold' : 'text-[--text-tertiary]'}>003</span>
                <span className={playheadPos >= 65 && playheadPos < 85 ? 'text-[--accent-blue] font-bold' : 'text-[--text-tertiary]'}>004</span>
                <span className={playheadPos >= 85 ? 'text-[--accent-blue] font-bold' : 'text-[--text-tertiary]'}>005</span>
              </div>
            </div>
          ) : (
            /* IDENTICAL MATCH TO HOMEPAGE DROPZONE BOX */
            <div className="flex flex-col items-center justify-center animate-fadeIn">
              <div className="w-12 h-12 mb-4 rounded-full bg-[--accent-blue-dim] border border-[--accent-blue-border] flex items-center justify-center text-[--accent-blue]">
                <Upload className="w-5 h-5" />
              </div>

              <h2 className="text-base font-bold text-[--text-primary] mb-1">
                Drop video here
              </h2>
              <p className="text-xs text-[--text-tertiary] mb-6">
                or choose a file from your computer
              </p>

              <button
                type="button"
                className="btn btn-primary text-xs py-2.5 px-6 font-semibold shadow-md shadow-[--accent-blue]/20"
              >
                <FileVideo className="w-4 h-4" />
                <span>Choose Video</span>
              </button>
            </div>
          )}
        </div>

        {/* FOOTER FORMAT SPECIFIER — APPEARS ON MORPH */}
        {(phase === 'morph_uploader' || phase === 'fade_out') && (
          <div className="mt-6 text-center animate-fadeIn">
            <span className="text-xs font-mono text-[--text-tertiary]">
              MP4 · MOV · WebM · AVI · MKV &nbsp;•&nbsp; Up to 8K
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
