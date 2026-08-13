import type { ExtractionOptions, FrameData, ExtractionProgress, VideoMetadata, ExportFormat, MetadataOverlayOptions } from '../types';
import { formatSecondsToTimecode } from './videoMetadata';

export type ProgressCallback = (progress: ExtractionProgress) => void;

/**
 * Parses smart filename template tokens reactively
 */
export function parseSmartFilenamePattern(
  pattern: string,
  videoName: string,
  index: number,
  timestamp: number,
  format: ExportFormat,
  options: Partial<ExtractionOptions>
): string {
  const baseName = videoName.replace(/\.[^/.]+$/, '');
  const ext = format === 'jpeg' ? 'jpg' : format;
  const startNum = options.startNumber !== undefined ? options.startNumber : 1;
  const seqNum = startNum + index;
  const padLength = options.zeroPad || 4;

  const timeStr = formatSecondsToTimecode(timestamp).replace(/:/g, '-').replace(/\./g, '-');
  const secondsStr = `${timestamp.toFixed(2)}s`;
  const dateStr = new Date().toISOString().split('T')[0];
  const sceneStr = '01';

  let result = pattern || '{video}_frame_{####}.png';

  // Replace {####}, {###}, {##}, {#}
  result = result.replace(/\{(#+)\}/g, (_, hashes) => {
    const len = hashes.length;
    return seqNum.toString().padStart(len, '0');
  });

  result = result
    .replace(/\{video\}/g, baseName)
    .replace(/\{frame\}/g, seqNum.toString().padStart(padLength, '0'))
    .replace(/\{index\}/g, seqNum.toString().padStart(padLength, '0'))
    .replace(/\{timecode\}/g, timeStr)
    .replace(/\{time\}/g, secondsStr)
    .replace(/\{scene\}/g, sceneStr)
    .replace(/\{date\}/g, dateStr);

  // Clean double extensions if user typed extension in pattern
  result = result.replace(/\.(png|jpg|jpeg|tiff|bmp)$/i, '');
  return `${result}.${ext}`;
}

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
 * Generates formatted filename according to smart pattern or standard presets
 */
export function generateFilename(
  videoName: string,
  index: number,
  timestamp: number,
  format: ExportFormat,
  options: ExtractionOptions
): string {
  if (options.namingPattern === 'smart_pattern' || options.namingTemplate) {
    return parseSmartFilenamePattern(options.namingTemplate || '{video}_frame_{####}.png', videoName, index, timestamp, format, options);
  }

  const baseName = videoName.replace(/\.[^/.]+$/, '');
  const ext = format === 'jpeg' ? 'jpg' : format;
  const padLength = options.zeroPad || 4;
  const startNum = options.startNumber !== undefined ? options.startNumber : 1;
  const numStr = (index + startNum).toString().padStart(padLength, '0');

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
 * Draws technical metadata overlay onto canvas image if enabled
 */
export function drawMetadataOverlay(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  index: number,
  timestamp: number,
  videoName: string,
  metadata: VideoMetadata,
  overlay: MetadataOverlayOptions
) {
  if (!overlay.enabled) return;

  const lines: string[] = [];
  const fields = overlay.fields;

  if (fields.customLabel && overlay.customLabel.trim()) {
    lines.push(overlay.customLabel.trim());
  }

  const metaParts: string[] = [];
  if (fields.frameNumber) metaParts.push(`Frame #${(index + 1).toString().padStart(4, '0')}`);
  if (fields.timecode) metaParts.push(formatSecondsToTimecode(timestamp));
  if (fields.timestamp) metaParts.push(`${timestamp.toFixed(2)}s`);
  if (metaParts.length > 0) lines.push(metaParts.join(' • '));

  const specParts: string[] = [];
  if (fields.resolution) specParts.push(`${width}×${height}`);
  if (fields.fps) specParts.push(`${metadata.fps} FPS`);
  if (fields.filename) specParts.push(videoName);
  if (specParts.length > 0) lines.push(specParts.join(' • '));

  if (lines.length === 0) return;

  // Font sizing
  const baseSize = width > 1920 ? 24 : width > 1280 ? 18 : 14;
  const scaleMult = overlay.fontSize === 'large' ? 1.4 : overlay.fontSize === 'small' ? 0.8 : 1.0;
  const fontSize = Math.max(10, Math.round(baseSize * scaleMult));

  ctx.save();
  ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;

  // Measure text bounds
  let maxLineWidth = 0;
  lines.forEach((line) => {
    const w = ctx.measureText(line).width;
    if (w > maxLineWidth) maxLineWidth = w;
  });

  const padding = fontSize * 0.8;
  const lineHeight = fontSize * 1.35;
  const boxWidth = maxLineWidth + padding * 2;
  const boxHeight = lines.length * lineHeight + padding * 1.5;

  const margin = Math.max(12, Math.round(width * 0.02));
  let x = margin;
  let y = margin;

  if (overlay.position.includes('center')) {
    x = (width - boxWidth) / 2;
  } else if (overlay.position.includes('right')) {
    x = width - boxWidth - margin;
  }

  if (overlay.position.includes('bottom')) {
    y = height - boxHeight - margin;
  }

  // Draw background box based on style
  const opacity = Math.min(1.0, Math.max(0.1, overlay.opacity || 0.8));
  if (overlay.style === 'dark') {
    ctx.fillStyle = `rgba(12, 15, 22, ${opacity})`;
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 * opacity})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, boxWidth, boxHeight, 6);
    ctx.fill();
    ctx.stroke();
  } else if (overlay.style === 'light') {
    ctx.fillStyle = `rgba(245, 247, 250, ${opacity})`;
    ctx.strokeStyle = `rgba(0, 0, 0, ${0.15 * opacity})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, boxWidth, boxHeight, 6);
    ctx.fill();
    ctx.stroke();
  } else if (overlay.style === 'minimal') {
    // Subtle drop shadow behind minimal text
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
  }

  // Text color
  ctx.fillStyle = overlay.style === 'light' ? '#0f172a' : '#f8fafc';
  ctx.textBaseline = 'top';

  lines.forEach((line, i) => {
    const lineX = overlay.style === 'minimal' ? x : x + padding;
    const lineY = overlay.style === 'minimal' ? y + i * lineHeight : y + padding + i * lineHeight;
    ctx.fillText(line, lineX, lineY);
  });

  ctx.restore();
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
      setTimeout(resolve, 3000);
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

    // Draw raw video frame
    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);

    // Optionally apply Metadata Overlay if enabled
    if (options.metadataOverlay?.enabled) {
      drawMetadataOverlay(
        ctx,
        targetWidth,
        targetHeight,
        i,
        t,
        metadata.name,
        metadata,
        options.metadataOverlay
      );
    }

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
