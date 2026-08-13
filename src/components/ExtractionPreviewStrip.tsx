import React, { useState, useEffect } from 'react';
import type { VideoMetadata, ExtractionOptions } from '../types';
import { calculateTimestamps } from '../utils/frameExtractor';
import { formatSecondsToTimecode } from '../utils/videoMetadata';
import { Eye, Film } from 'lucide-react';

interface ExtractionPreviewStripProps {
  metadata: VideoMetadata;
  options: ExtractionOptions;
}

interface PreviewThumbnail {
  timestamp: number;
  timecode: string;
  url: string;
}

export const ExtractionPreviewStrip: React.FC<ExtractionPreviewStripProps> = ({
  metadata,
  options,
}) => {
  const [thumbnails, setThumbnails] = useState<PreviewThumbnail[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const timestamps = calculateTimestamps(metadata, options);

  useEffect(() => {
    let isSubscribed = true;
    const generatePreviewThumbnails = async () => {
      setIsGenerating(true);
      // Pick up to 10 sample timestamps spread evenly from the calculated expected timestamps
      const sampleCount = Math.min(10, timestamps.length);
      const sampleTimestamps: number[] = [];

      if (sampleCount <= 1) {
        if (timestamps.length > 0) sampleTimestamps.push(timestamps[0]);
      } else {
        const step = (timestamps.length - 1) / (sampleCount - 1);
        for (let i = 0; i < sampleCount; i++) {
          sampleTimestamps.push(timestamps[Math.round(i * step)]);
        }
      }

      const video = document.createElement('video');
      video.src = metadata.objectUrl;
      video.muted = true;
      video.playsInline = true;

      await new Promise<void>((resolve) => {
        video.onloadeddata = () => resolve();
        setTimeout(resolve, 1000);
      });

      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 90;
      const ctx = canvas.getContext('2d');

      const generated: PreviewThumbnail[] = [];

      for (const t of sampleTimestamps) {
        if (!isSubscribed) return;
        video.currentTime = t;
        await new Promise<void>((resolve) => {
          const onSeeked = () => {
            video.removeEventListener('seeked', onSeeked);
            resolve();
          };
          video.addEventListener('seeked', onSeeked);
          setTimeout(resolve, 150);
        });

        if (ctx) {
          ctx.drawImage(video, 0, 0, 160, 90);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
          generated.push({
            timestamp: t,
            timecode: formatSecondsToTimecode(t),
            url: dataUrl,
          });
        }
      }

      if (isSubscribed) {
        setThumbnails(generated);
        setIsGenerating(false);
      }
    };

    generatePreviewThumbnails();

    return () => {
      isSubscribed = false;
    };
  }, [metadata.objectUrl, options.mode, options.frameCount, options.intervalSeconds, options.startTime, options.endTime]);

  return (
    <div className="tool-surface p-4 mb-6">
      <div className="flex items-center justify-between border-b border-[--border-subtle] pb-2 mb-3">
        <div className="flex items-center gap-2 font-mono text-xs text-[--text-secondary]">
          <Eye className="w-3.5 h-3.5 text-[--accent-blue]" />
          <span>Extraction Preview — <strong className="text-[--text-primary]">{timestamps.length} frames expected</strong></span>
        </div>
        {isGenerating && (
          <span className="text-[11px] font-mono text-[--accent-blue] animate-pulse">Generating sample strip...</span>
        )}
      </div>

      {/* Horizontal Thumbnail Strip */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {thumbnails.map((thumb, idx) => (
          <div key={idx} className="shrink-0 group">
            <div className="w-28 aspect-video bg-black rounded overflow-hidden border border-[--border-subtle] relative group-hover:border-[--accent-blue] transition-colors">
              <img src={thumb.url} alt={`Preview ${thumb.timecode}`} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/80 px-1 py-0.5 text-[9px] font-mono text-center text-[--text-secondary]">
                {thumb.timecode}
              </div>
            </div>
          </div>
        ))}

        {timestamps.length > 10 && (
          <div className="shrink-0 w-24 aspect-video rounded border border-[--border-subtle] bg-[--bg-surface-2] flex flex-col items-center justify-center text-[10px] font-mono text-[--text-tertiary] text-center p-2">
            <Film className="w-4 h-4 mb-1 text-[--accent-blue]" />
            <span>+{timestamps.length - 10} more</span>
          </div>
        )}
      </div>
    </div>
  );
};
