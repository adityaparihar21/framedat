import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Header, type AppToolMode } from './components/Header';
import { Dropzone } from './components/Dropzone';
import { MetadataBar } from './components/MetadataBar';
import { VideoPlayerScrubber } from './components/VideoPlayerScrubber';
import { ExtractionSettings } from './components/ExtractionSettings';
import { ExtractionPreviewStrip } from './components/ExtractionPreviewStrip';
import { ProgressBar } from './components/ProgressBar';
import { FinalReviewPlayer } from './components/FinalReviewPlayer';
import { DownloadSection } from './components/DownloadSection';
import { FrameGrid } from './components/FrameGrid';
import { LightboxModal } from './components/LightboxModal';
import { CompareModal } from './components/CompareModal';
import { GifExportModal } from './components/GifExportModal';
import { ContactSheetModal } from './components/ContactSheetModal';
import { AudioCleaner } from './components/AudioCleaner';
import { BitmapAsciiStudio } from './components/BitmapAsciiStudio';
import { CinematicIntro } from './components/CinematicIntro';
import { ToastContainer, type ToastMessage } from './components/Toast';
import { Footer } from './components/Footer';
import { Video, Mic, Grid } from 'lucide-react';

import type { VideoMetadata, ExtractionOptions, FrameData, ExtractionProgress } from './types';
import { detectVideoMetadata } from './utils/videoMetadata';
import { extractFrames } from './utils/frameExtractor';
import { analyzeSceneChanges } from './utils/sceneDetection';
import { createDemoVideoFile } from './utils/sampleVideo';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toolMode, setToolMode] = useState<AppToolMode>('extractor');
  const [bitmapStudioInitialBlob, setBitmapStudioInitialBlob] = useState<Blob | null>(null);

  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);
  const [isLoadingSample, setIsLoadingLoadingSample] = useState(false);
  const [showIntro, setShowIntro] = useState<boolean>(true);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, text, type }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const [options, setOptions] = useState<ExtractionOptions>({
    mode: 'all',
    frameCount: 24,
    intervalSeconds: 1.0,
    startTime: 0,
    endTime: 0,
    format: 'png',
    jpegQuality: 0.95,
    namingPattern: 'smart_pattern',
    namingTemplate: '{video}_frame_{####}.png',
    customPrefix: 'frame',
    startNumber: 1,
    scaleRatio: 1.0,
    engine: 'browser',
    zeroPad: 4,
    metadataOverlay: {
      enabled: false,
      position: 'bottom-left',
      style: 'dark',
      opacity: 0.8,
      fontSize: 'small',
      customLabel: '',
      fields: {
        frameNumber: true,
        timecode: true,
        timestamp: false,
        filename: false,
        resolution: true,
        fps: true,
        sceneNumber: false,
        mode: false,
        customLabel: true,
      },
    },
  });

  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState<ExtractionProgress>({
    status: 'idle',
    currentFrame: 0,
    totalFrames: 0,
    percentage: 0,
    fpsSpeed: 0,
    elapsedTimeMs: 0,
    estimatedTimeRemainingMs: 0,
  });

  const [frames, setFrames] = useState<FrameData[]>([]);
  const [lightboxFrame, setLightboxFrame] = useState<FrameData | null>(null);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isGifExportOpen, setIsGifExportOpen] = useState(false);
  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastSelectedFrameIdRef = useRef<string | null>(null);

  // Sync theme with DOM body attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  const handleReset = () => {
    if (metadata?.objectUrl) {
      URL.revokeObjectURL(metadata.objectUrl);
    }
    frames.forEach((f) => URL.revokeObjectURL(f.url));
    setMetadata(null);
    setFrames([]);
    setLightboxFrame(null);
    setIsCompareOpen(false);
    setIsGifExportOpen(false);
    setIsContactSheetOpen(false);
  };

  const handleFileSelect = async (file: File) => {
    try {
      setIsLoadingMetadata(true);
      if (metadata?.objectUrl) {
        URL.revokeObjectURL(metadata.objectUrl);
      }
      setFrames([]);
      const meta = await detectVideoMetadata(file);
      setMetadata(meta);
      setOptions((prev) => ({ ...prev, startTime: 0, endTime: meta.duration }));
      showToast(`Loaded ${meta.name} (${meta.width}×${meta.height} • ${meta.fps} FPS)`, 'success');
    } catch (err: any) {
      alert(err.message || 'Failed to parse video file.');
    } finally {
      setIsLoadingMetadata(false);
    }
  };

  const handleSelectSampleVideo = async () => {
    try {
      setIsLoadingLoadingSample(true);
      const demoFile = await createDemoVideoFile();
      await handleFileSelect(demoFile);
    } catch (err: any) {
      alert(err.message || 'Failed to create sample video.');
    } finally {
      setIsLoadingLoadingSample(false);
    }
  };

  const handleStartExtraction = async () => {
    if (!metadata) return;

    try {
      setIsExtracting(true);
      setFrames([]);
      abortControllerRef.current = new AbortController();

      const extracted = await extractFrames(
        metadata,
        options,
        (progressData) => {
          setProgress(progressData);
        },
        abortControllerRef.current.signal
      );

      const analyzed = await analyzeSceneChanges(extracted);
      setFrames(analyzed);

      showToast(`Extracted ${analyzed.length} frames losslessly`, 'success');

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (err: any) {
      if (err.message?.includes('canceled')) {
        console.log('Extraction canceled by user.');
      } else {
        alert(`Extraction Error: ${err.message}`);
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCancelExtraction = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleSnapshotSingleFrame = async (timestamp: number) => {
    if (!metadata) return;
    try {
      const singleOptions: ExtractionOptions = {
        ...options,
        mode: 'interval',
        startTime: timestamp,
        endTime: timestamp + 0.001,
        intervalSeconds: 1.0,
      };

      const result = await extractFrames(metadata, singleOptions);
      if (result.length > 0) {
        setFrames((prev) => [result[0], ...prev]);
        showToast('Captured single frame snapshot', 'info');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to snapshot frame.');
    }
  };

  const handleToggleSelectFrame = (id: string, e: React.MouseEvent) => {
    if (e.shiftKey && lastSelectedFrameIdRef.current) {
      const idxA = frames.findIndex((f) => f.id === lastSelectedFrameIdRef.current);
      const idxB = frames.findIndex((f) => f.id === id);

      if (idxA !== -1 && idxB !== -1) {
        const start = Math.min(idxA, idxB);
        const end = Math.max(idxA, idxB);

        setFrames((prev) =>
          prev.map((f, i) => (i >= start && i <= end ? { ...f, selected: true } : f))
        );
        return;
      }
    }

    lastSelectedFrameIdRef.current = id;
    setFrames((prev) =>
      prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f))
    );
  };

  const handleSelectAll = () => setFrames((prev) => prev.map((f) => ({ ...f, selected: true })));
  const handleDeselectAll = () => setFrames((prev) => prev.map((f) => ({ ...f, selected: false })));
  const handleInvertSelection = () => setFrames((prev) => prev.map((f) => ({ ...f, selected: !f.selected })));

  const selectedFrames = frames.filter((f) => f.selected);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[--bg-app] text-[--text-primary] transition-colors duration-150 pb-16 md:pb-0">
      {showIntro && toolMode === 'extractor' && <CinematicIntro onComplete={handleIntroComplete} />}

      <Header
        theme={theme}
        toolMode={toolMode}
        onChangeToolMode={setToolMode}
        onToggleTheme={toggleTheme}
        onReset={handleReset}
        onReplayIntro={handleReplayIntro}
        onExportAction={metadata && frames.length > 0 ? () => handleStartExtraction() : undefined}
        hasVideo={!!metadata}
      />

      <main className={`flex-1 w-full flex flex-col ${toolMode === 'extractor' && !metadata ? 'items-center justify-center my-auto min-h-[calc(100vh-140px)]' : 'py-8 sm:py-12'}`}>
        {toolMode === 'audio_cleaner' ? (
          /* AUDIO NOISE CLEANER STUDIO */
          <AudioCleaner onShowToast={showToast} />
        ) : toolMode === 'image_studio' ? (
          /* IMAGE STUDIO & CREATIVE CONVERTER */
          <BitmapAsciiStudio
            initialImageBlob={bitmapStudioInitialBlob}
            onShowToast={showToast}
          />
        ) : !metadata ? (
          /* LANDING WORKSPACE */
          <Dropzone
            onFileSelect={handleFileSelect}
            onSelectSampleVideo={handleSelectSampleVideo}
            onOpenAudioCleaner={() => setToolMode('audio_cleaner')}
            onOpenImageStudio={() => setToolMode('image_studio')}
            isLoadingSample={isLoadingSample || isLoadingMetadata}
          />
        ) : (
          /* WORKSPACE STREAM */
          <div className="page-container">
            <MetadataBar metadata={metadata} />

            {/* 01 — TRIM VIDEO */}
            <VideoPlayerScrubber
              metadata={metadata}
              options={options}
              onChangeOptions={setOptions}
              onSnapshotFrame={handleSnapshotSingleFrame}
            />

            {/* 02 — CHOOSE EXTRACTION */}
            <ExtractionSettings
              metadata={metadata}
              options={options}
              onChangeOptions={setOptions}
              onStartExtraction={handleStartExtraction}
              isExtracting={isExtracting}
            />

            {/* EXTRACTION PREVIEW STRIP */}
            <ExtractionPreviewStrip
              metadata={metadata}
              options={options}
            />

            {isExtracting && (
              <ProgressBar progress={progress} onCancel={handleCancelExtraction} />
            )}

            {/* 03 — FINAL REVIEW PLAYER & 04 — DOWNLOAD SECTION */}
            {frames.length > 0 && (
              <>
                <FinalReviewPlayer
                  frames={frames}
                  onOpenContactSheetModal={() => setIsContactSheetOpen(true)}
                />

                <DownloadSection
                  frames={frames}
                  videoName={metadata.name}
                  onOpenContactSheetModal={() => setIsContactSheetOpen(true)}
                />

                <FrameGrid
                  frames={frames}
                  onToggleSelectFrame={handleToggleSelectFrame}
                  onSelectAll={handleSelectAll}
                  onDeselectAll={handleDeselectAll}
                  onInvertSelection={handleInvertSelection}
                  onOpenLightbox={(frame) => setLightboxFrame(frame)}
                  onOpenCompareModal={() => setIsCompareOpen(true)}
                  onOpenGifExportModal={() => setIsGifExportOpen(true)}
                  onOpenContactSheetModal={() => setIsContactSheetOpen(true)}
                  onRemoveFrameBackground={(blob) => {
                    setBitmapStudioInitialBlob(blob);
                    setToolMode('image_studio');
                  }}
                  videoName={metadata.name}
                />
              </>
            )}
          </div>
        )}
      </main>

      <LightboxModal
        frame={lightboxFrame}
        frames={frames}
        onClose={() => setLightboxFrame(null)}
        onSelectFrame={(frame) => setLightboxFrame(frame)}
      />

      {isCompareOpen && (
        <CompareModal
          selectedFrames={selectedFrames.length >= 2 ? selectedFrames : frames}
          onClose={() => setIsCompareOpen(false)}
        />
      )}

      {isGifExportOpen && (
        <GifExportModal
          selectedFrames={selectedFrames.length > 0 ? selectedFrames : frames}
          videoName={metadata ? metadata.name : 'video'}
          onClose={() => setIsGifExportOpen(false)}
        />
      )}

      {isContactSheetOpen && (
        <ContactSheetModal
          frames={frames}
          videoName={metadata ? metadata.name : 'video'}
          onClose={() => setIsContactSheetOpen(false)}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090B10]/95 backdrop-blur-md border-t border-[--border-subtle] px-4 py-2 flex items-center justify-around font-mono text-[11px]">
        <button
          onClick={() => setToolMode('extractor')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
            toolMode === 'extractor'
              ? 'bg-[--accent-blue] text-white font-bold'
              : 'text-[--text-secondary] hover:text-[--text-primary]'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Extractor</span>
        </button>

        <button
          onClick={() => setToolMode('audio_cleaner')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
            toolMode === 'audio_cleaner'
              ? 'bg-[--accent-blue] text-white font-bold'
              : 'text-[--text-secondary] hover:text-[--text-primary]'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Audio</span>
        </button>

        <button
          onClick={() => setToolMode('image_studio')}
          className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
            toolMode === 'image_studio'
              ? 'bg-[--accent-blue] text-white font-bold'
              : 'text-[--text-secondary] hover:text-[--text-primary]'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Studio</span>
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default App;
