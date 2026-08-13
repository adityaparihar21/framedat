import React, { useState, useEffect, useRef } from 'react';
import type { AudioEnhancerOptions } from '../utils/audioNoiseCleaner';
import { enhanceAudioTrack } from '../utils/audioNoiseCleaner';
import { saveAs } from 'file-saver';
import { Download, Play, Pause, Mic, Sliders, Shield, Volume2, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';

interface AudioCleanerProps {
  onShowToast?: (text: string, type?: 'success' | 'error' | 'info') => void;
}

export const AudioCleaner: React.FC<AudioCleanerProps> = ({ onShowToast }) => {
  const [audioFile, setAudioFile] = useState<Blob | null>(null);
  const [audioName, setAudioName] = useState<string>('audio_clip.wav');
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [playMode, setPlayMode] = useState<'clean' | 'original'>('clean');

  const [options, setOptions] = useState<AudioEnhancerOptions>({
    noiseReductionPercent: 75,
    vocalClarityPercent: 60,
    lowCutoffHz: 80,
    deEsserPercent: 40,
    normalizeGain: true,
  });

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (audioFile) {
      const url = URL.createObjectURL(audioFile);
      setOriginalUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [audioFile]);

  // Reactive Audio Enhancement
  useEffect(() => {
    if (!audioFile) return;

    let isSubscribed = true;
    const process = async () => {
      try {
        setIsProcessing(true);
        const res = await enhanceAudioTrack(audioFile, options);
        if (isSubscribed) {
          if (resultUrl) URL.revokeObjectURL(resultUrl);
          setResultBlob(res.wavBlob);
          const newUrl = URL.createObjectURL(res.wavBlob);
          setResultUrl(newUrl);
        }
      } catch (err: any) {
        console.error('Audio processing error:', err);
      } finally {
        if (isSubscribed) setIsProcessing(false);
      }
    };

    const timer = setTimeout(process, 150);
    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [audioFile, options]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setAudioFile(file);
      setAudioName(file.name);
      if (onShowToast) onShowToast(`Loaded ${file.name}`, 'info');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setAudioFile(file);
      setAudioName(file.name);
      if (onShowToast) onShowToast(`Loaded ${file.name}`, 'info');
    }
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleDownload = () => {
    if (resultBlob) {
      const cleanName = audioName.replace(/\.[^/.]+$/, '') + '_clean_voice.wav';
      saveAs(resultBlob, cleanName);
      if (onShowToast) onShowToast('Downloaded clean WAV audio file', 'success');
    }
  };

  const activeAudioUrl = playMode === 'clean' ? (resultUrl || originalUrl) : originalUrl;

  return (
    <div className="w-full flex flex-col justify-between min-h-[calc(100vh-140px)]">
      {!audioFile ? (
        /* ART-DIRECTED AUDIO CLEANER EMPTY STATE WORKSPACE */
        <div className="w-full max-w-[1100px] mx-auto flex flex-col items-center justify-between my-auto px-6 py-10 sm:py-16 text-center select-none font-sans relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*,video/*,.mp3,.wav,.m4a,.aac,.ogg,.flac,.mp4,.mov"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* PAGE HEADER */}
          <div className="mb-10 sm:mb-12 max-w-[680px] animate-hero-fade">
            <div className="font-mono text-xs tracking-[0.15em] text-[--text-tertiary] uppercase mb-3 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[--accent-blue]"></span>
              <span>STUDIO / VOICE & AUDIO DSP</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[--text-primary] mb-4 leading-[1.08] font-sans">
              Voice & Audio Noise Cleaner
            </h1>

            <p className="text-base sm:text-lg text-[--text-secondary] font-normal leading-relaxed">
              Remove background noise, hums, and hiss — boost voice clarity and sharpness entirely on your device.
            </p>
          </div>

          {/* UPLOAD HERO DROP ZONE */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full max-w-[780px] min-h-[300px] sm:min-h-[340px] p-8 sm:p-12 text-center cursor-pointer rounded-2xl border transition-all duration-200 flex flex-col items-center justify-center relative mb-8 group ${
              isDragOver
                ? 'border-[--accent-blue] bg-[--accent-blue-dim] scale-[1.01] shadow-2xl shadow-[--accent-blue]/10'
                : 'border-[--border-subtle] bg-[#10131B] hover:border-[--border-hover] hover:bg-[#161A24] shadow-2xl'
            }`}
          >
            <div className="w-12 h-12 mb-5 rounded-2xl bg-[--bg-surface-2] border border-[--border-subtle] flex items-center justify-center text-[--accent-blue] group-hover:scale-110 transition-transform">
              <Mic className="w-5 h-5" />
            </div>

            <h2 className="text-lg sm:text-xl font-bold text-[--text-primary] mb-2 font-sans">
              {isDragOver ? 'Release to clean audio' : 'Drop audio or video file here'}
            </h2>

            <p className="text-xs sm:text-sm text-[--text-tertiary] mb-6 font-normal">
              or choose an audio file from your device
            </p>

            <button
              type="button"
              className="btn btn-primary text-xs py-2.5 px-6 font-semibold flex items-center gap-2 shadow-lg shadow-[--accent-blue]/20"
            >
              <span>Choose Audio File</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <div className="mt-8 pt-6 border-t border-[--border-subtle]/50 w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[--text-tertiary]">
              <span>WAV &nbsp;·&nbsp; MP3 &nbsp;·&nbsp; M4A &nbsp;·&nbsp; AAC &nbsp;·&nbsp; FLAC</span>
              <span className="text-[--text-secondary] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[--accent-blue]" />
                Local Web Audio DSP engine
              </span>
            </div>
          </div>

          {/* 3-COLUMN CAPABILITY STRIP */}
          <div className="w-full max-w-[800px] grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 text-left font-sans">
            <div className="p-4 rounded-xl bg-[--bg-surface-1]/50 border border-[--border-subtle] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[--bg-surface-2] flex items-center justify-center text-[--accent-blue] shrink-0 mt-0.5">
                <Shield className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[--text-primary] mb-0.5">100% Private</div>
                <div className="text-[11px] text-[--text-tertiary]">Files processed on your device</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[--bg-surface-1]/50 border border-[--border-subtle] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[--bg-surface-2] flex items-center justify-center text-[--accent-blue] shrink-0 mt-0.5">
                <Volume2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[--text-primary] mb-0.5">Noise Floor Cut</div>
                <div className="text-[11px] text-[--text-tertiary]">Remove hiss, hums & room reverb</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[--bg-surface-1]/50 border border-[--border-subtle] flex items-start gap-3">
              <div className="w-7 h-7 rounded-lg bg-[--bg-surface-2] flex items-center justify-center text-[--accent-blue] shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[--text-primary] mb-0.5">Vocal Clarity</div>
                <div className="text-[11px] text-[--text-tertiary]">Crisp 3.5kHz presence boost</div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE AUDIO WORKSPACE */
        <div className="page-container py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[--border-subtle]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[--accent-blue-dim] border border-[--accent-blue-border] flex items-center justify-center text-[--accent-blue]">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[--text-primary] font-sans truncate max-w-sm">
                  {audioName}
                </h2>
                <p className="text-xs text-[--text-secondary] font-mono">
                  DSP Noise Suppressor & Vocal Enhancer
                </p>
              </div>
            </div>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn-secondary text-xs py-1.5 px-3 font-mono flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Change Audio
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*,video/*,.mp3,.wav,.m4a,.aac,.ogg,.flac"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* DSP Controls Panel */}
            <div className="lg:col-span-5 tool-surface p-5 flex flex-col gap-5 font-mono text-xs">
              <div className="font-bold text-sm text-[--text-primary] border-b border-[--border-subtle] pb-2 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[--accent-blue]" />
                <span>Audio DSP Parameters</span>
              </div>

              {/* Noise Reduction Slider */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-[--text-tertiary] uppercase">Background Noise Cut</label>
                  <span className="font-bold text-[--accent-blue]">{options.noiseReductionPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={options.noiseReductionPercent}
                  onChange={(e) => setOptions({ ...options, noiseReductionPercent: parseInt(e.target.value) || 0 })}
                  className="w-full h-1.5 bg-[--bg-surface-3] rounded appearance-none cursor-pointer accent-[--accent-blue]"
                />
                <p className="text-[10px] text-[--text-tertiary] mt-1 font-sans">
                  Suppresses background hums, hiss, fans, and room reverb.
                </p>
              </div>

              {/* Vocal Clarity & Presence Boost */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-[--text-tertiary] uppercase">Vocal Clarity & Sharpness</label>
                  <span className="font-bold text-[--accent-blue]">{options.vocalClarityPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={options.vocalClarityPercent}
                  onChange={(e) => setOptions({ ...options, vocalClarityPercent: parseInt(e.target.value) || 0 })}
                  className="w-full h-1.5 bg-[--bg-surface-3] rounded appearance-none cursor-pointer accent-[--accent-blue]"
                />
                <p className="text-[10px] text-[--text-tertiary] mt-1 font-sans">
                  High-shelf presence boost (3.2kHz) for crisp speech articulation.
                </p>
              </div>

              {/* Low-End Rumble Cutoff */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] text-[--text-tertiary] uppercase">Low-End Cutoff</label>
                  <span className="font-bold text-[--text-primary]">{options.lowCutoffHz} Hz</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="200"
                  value={options.lowCutoffHz}
                  onChange={(e) => setOptions({ ...options, lowCutoffHz: parseInt(e.target.value) || 20 })}
                  className="w-full h-1.5 bg-[--bg-surface-3] rounded appearance-none cursor-pointer accent-[--accent-blue]"
                />
              </div>

              {/* Volume Normalization Checkbox */}
              <div className="pt-3 border-t border-[--border-subtle]">
                <label className="flex items-center gap-2 cursor-pointer text-[--text-primary]">
                  <input
                    type="checkbox"
                    checked={options.normalizeGain}
                    onChange={(e) => setOptions({ ...options, normalizeGain: e.target.checked })}
                    className="custom-checkbox"
                  />
                  Peak Volume Normalization (-0.5 dB)
                </label>
              </div>

              {/* Download CTA */}
              <div className="mt-auto pt-4 border-t border-[--border-subtle]">
                <button
                  onClick={handleDownload}
                  disabled={!resultBlob || isProcessing}
                  className="btn btn-primary w-full text-xs py-3 font-bold font-mono shadow-md shadow-[--accent-blue]/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Clean WAV Audio</span>
                </button>
              </div>
            </div>

            {/* Audio Waveform Player & A/B Comparison */}
            <div className="lg:col-span-7 flex flex-col gap-5">
              <div className="tool-surface p-6 flex flex-col gap-6">
                {/* A/B Switcher */}
                <div className="flex items-center justify-between border-b border-[--border-subtle] pb-4">
                  <div className="segmented-control text-xs font-mono">
                    <button
                      onClick={() => setPlayMode('clean')}
                      className={playMode === 'clean' ? 'active font-bold' : ''}
                    >
                      Clean & Crisp Voice
                    </button>
                    <button
                      onClick={() => setPlayMode('original')}
                      className={playMode === 'original' ? 'active font-bold' : ''}
                    >
                      Original Audio
                    </button>
                  </div>

                  <span className="text-[11px] font-mono text-[--text-tertiary]">
                    {isProcessing ? 'Rendering DSP...' : 'Live Player Ready'}
                  </span>
                </div>

                {/* Player Controls & Waveform */}
                <div className="flex flex-col items-center justify-center py-8 bg-[#08090C] rounded-xl border border-[--border-subtle] relative">
                  <button
                    onClick={togglePlay}
                    className="w-16 h-16 rounded-full bg-[--accent-blue] hover:bg-[--accent-blue-hover] text-white flex items-center justify-center shadow-xl shadow-[--accent-blue]/30 mb-6 transition-transform hover:scale-105"
                  >
                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                  </button>

                  <audio
                    ref={audioRef}
                    src={activeAudioUrl || undefined}
                    onEnded={() => setIsPlaying(false)}
                    className="w-full max-w-md px-4"
                    controls
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
