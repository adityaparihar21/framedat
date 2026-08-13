import type { ExtractionOptions, FrameData, ExtractionProgress, VideoMetadata, ExportFormat } from '../types';
import { formatSecondsToTimecode } from './videoMetadata';

export type ProgressCallback = (progress: ExtractionProgress) => void;

/**
 * Calculates timestamps to extract based on user selected mode & options
 */
export function calculateTimestamps(metadata: VideoMetadata, options: ExtractionOptions): number[] {
  const start = Math.max(0, options.startTime);
  const end = Math.min(metadata.duration, options.endTime > 0 ? options.endTime : metadata.duration);
  const duration = end - start;

  if (duration <= 0) return [start];

  const timestamps: number[] = [];

  switch (options.mode) {
    case 'all': {
      const frameDuration = 1 / metadata.fps;
      const totalFramesInRange = Math.max(1, Math.floor(duration / frameDuration));
      for (let i = 0; i < totalFramesInRange; i++) {
        const t = start + (i * frameDuration);
        if (t <= end) {
          timestamps.push(t);
        }
      }
      break;
    }
    case 'count': {
      const count = Math.max(1, options.frameCount);
      if (count === 1) {
        timestamps.push(start + (duration / 2));
      } else {
        const step = duration / (count > 1 ? count - 1 : 1);
        for (let i = 0; i < count; i++) {
          const t = Math.min(end, start + (i * step));
          timestamps.push(t);
        }
      }
      break;
    }
    case 'interval': {
      const interval = Math.max(0.01, options.intervalSeconds);
      let t = start;
      while (t <= end + 0.001) {
        timestamps.push(t);
        t += interval;
      }
      break;
    }
  }

  return timestamps;
}

/**
 * Generates formatted filename according to user pattern
 */
export function generateFilename(
  videoName: string,
  index: number,
  timestamp: number,
  format: ExportFormat,
  options: ExtractionOptions
): string {
  const baseName = videoName.replace(/\.[^/.]+$/, '');
  const ext = format === 'jpeg' ? 'jpg' : format;
  const padLength = options.zeroPad || 4;
  const numStr = (index + 1).toString().padStart(padLength, '0');

  const timeStr = formatSecondsToTimecode(timestamp).replace(/:/g, '-').replace(/\./g, '-');
  const secondsStr = `${timestamp.toFixed(2)}s`;

  switch (options.namingPattern) {
    case 'timestamp':
      return `${baseName}_${timeStr}.${ext}`;
    case 'seconds':
      return `${baseName}_${secondsStr}.${ext}`;
    case 'custom_prefix': {
      const prefix = options.customPrefix.trim() || 'frame';
      return `${prefix}_${numStr}.${ext}`;
    }
    case 'frame_number':
    default:
      return `${baseName}_frame_${numStr}.${ext}`;
  }
}

/**
 * Losslessly extracts frames from video file directly into Blobs
 */
export async function extractFrames(
  metadata: VideoMetadata,
  options: ExtractionOptions,
  onProgress?: ProgressCallback,
  abortSignal?: AbortSignal
): Promise<FrameData[]> {
  const timestamps = calculateTimestamps(metadata, options);
  const totalFrames = timestamps.length;

  if (totalFrames === 0) {
    return [];
  }

  const targetWidth = Math.round(metadata.width * options.scaleRatio);
  const targetHeight = Math.round(metadata.height * options.scaleRatio);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true, alpha: false });

  if (!ctx) {
    throw new Error('Failed to create 2D canvas rendering context.');
  }

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  const video = document.createElement('video');
  video.src = metadata.objectUrl;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';

  await new Promise<void>((resolve, reject) => {
    const onLoaded = () => resolve();
    if (video.readyState >= 2) {
      resolve();
    } else {
      video.onloadeddata = onLoaded;
      video.onloadedmetadata = onLoaded;
      video.onerror = () => reject(new Error('Failed to load video file.'));
      setTimeout(resolve, 3000); // Failsafe fallback
    }
  });

  const frames: FrameData[] = [];
  const startTimeMs = performance.now();

  for (let i = 0; i < totalFrames; i++) {
    if (abortSignal?.aborted) {
      throw new Error('Frame extraction canceled by user.');
    }

    const t = timestamps[i];

    // Seek precisely to target timestamp
    await seekToTimestamp(video, t);

    // Draw video frame losslessly at full target resolution
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

    // Convert canvas content to target format Blob
    const mimeType = getMimeTypeForFormat(options.format);
    const quality = options.format === 'jpeg' ? options.jpegQuality : 1.0;
    const blob = await canvasToBlob(canvas, mimeType, quality);
    const url = URL.createObjectURL(blob);
    const filename = generateFilename(metadata.name, i, t, options.format, options);

    const frame: FrameData = {
      id: `frame_${i}_${Date.now()}`,
      index: i + 1,
      timestamp: t,
      timeString: formatSecondsToTimecode(t),
      blob,
      url,
      width: targetWidth,
      height: targetHeight,
      sizeBytes: blob.size,
      selected: true,
      format: options.format,
      filename,
    };

    frames.push(frame);

    // Progress update metrics
    const nowMs = performance.now();
    const elapsedTimeMs = nowMs - startTimeMs;
    const framesDone = i + 1;
    const percentage = Math.round((framesDone / totalFrames) * 100);
    const fpsSpeed = Math.round((framesDone / (elapsedTimeMs / 1000)) * 10) / 10;
    const estimatedTimeRemainingMs = fpsSpeed > 0 ? ((totalFrames - framesDone) / fpsSpeed) * 1000 : 0;

    if (onProgress) {
      onProgress({
        status: framesDone === totalFrames ? 'completed' : 'extracting',
        currentFrame: framesDone,
        totalFrames,
        percentage,
        fpsSpeed,
        elapsedTimeMs,
        estimatedTimeRemainingMs,
      });
    }
  }

  return frames;
}

function seekToTimestamp(video: HTMLVideoElement, targetTime: number): Promise<void> {
  return new Promise((resolve) => {
    if (Math.abs(video.currentTime - targetTime) < 0.001) {
      resolve();
      return;
    }

    let isDone = false;
    const finish = () => {
      if (!isDone) {
        isDone = true;
        video.removeEventListener('seeked', onSeeked);
        resolve();
      }
    };

    const onSeeked = () => {
      setTimeout(finish, 15);
    };

    video.addEventListener('seeked', onSeeked);
    video.currentTime = targetTime;

    // Failsafe timeout in case seeked event is delayed
    setTimeout(finish, 300);
  });
}

function getMimeTypeForFormat(format: ExportFormat): string {
  switch (format) {
    case 'jpeg':
      return 'image/jpeg';
    case 'tiff':
      return 'image/tiff';
    case 'bmp':
      return 'image/bmp';
    case 'png':
    default:
      return 'image/png';
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            // Safari fallback: if requested format (tiff/bmp) returns null, fallback to image/png
            canvas.toBlob((fallbackBlob) => {
              if (fallbackBlob) resolve(fallbackBlob);
              else reject(new Error('Canvas blob conversion failed'));
            }, 'image/png');
          }
        },
        mimeType,
        quality
      );
    } catch {
      canvas.toBlob((fallbackBlob) => {
        if (fallbackBlob) resolve(fallbackBlob);
        else reject(new Error('Canvas blob conversion failed'));
      }, 'image/png');
    }
  });
}
