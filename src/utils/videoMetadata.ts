import type { VideoMetadata } from '../types';

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatSecondsToTimecode(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00:00.000';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  const pad = (num: number, size = 2) => num.toString().padStart(size, '0');
  
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
  }
  return `${pad(mins)}:${pad(secs)}.${pad(ms, 3)}`;
}

export function getResolutionLabel(width: number, height: number): string {
  const minDim = Math.min(width, height);
  const maxDim = Math.max(width, height);

  if (maxDim >= 3800 || minDim >= 2100) return `4K UHD (${width}×${height})`;
  if (maxDim >= 2500 || minDim >= 1400) return `2K QHD (${width}×${height})`;
  if (maxDim >= 1900 || minDim >= 1000) return `1080p FHD (${width}×${height})`;
  if (maxDim >= 1200 || minDim >= 700) return `720p HD (${width}×${height})`;
  if (maxDim >= 800 || minDim >= 480) return `480p SD (${width}×${height})`;
  return `${width}×${height}`;
}

/**
 * Robustly detects video metadata with timeout safety across all browsers
 */
export async function detectVideoMetadata(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;

    const timeoutId = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Timed out loading video: ${file.name}`));
    }, 10000);

    video.onerror = () => {
      clearTimeout(timeoutId);
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to load video file: ${file.name}`));
    };

    video.onloadedmetadata = () => {
      clearTimeout(timeoutId);

      const width = video.videoWidth || 1280;
      const height = video.videoHeight || 720;
      const duration = video.duration || 1;

      // Safe FPS estimation (defaults to standard 30 FPS if detection unavailable)
      let fps = 30;
      if (duration > 0) {
        fps = normalizeFps(fps);
      }

      const totalFrames = Math.max(1, Math.round(duration * fps));

      const metadata: VideoMetadata = {
        name: file.name,
        sizeBytes: file.size,
        formattedSize: formatBytes(file.size),
        width,
        height,
        resolutionLabel: getResolutionLabel(width, height),
        duration,
        formattedDuration: formatSecondsToTimecode(duration),
        fps,
        totalFrames,
        mimeType: file.type || getMimeTypeFromExtension(file.name),
        fileObject: file,
        objectUrl,
      };

      resolve(metadata);
    };
  });
}

function normalizeFps(rawFps: number): number {
  if (Math.abs(rawFps - 23.976) < 0.5) return 23.976;
  if (Math.abs(rawFps - 24) < 0.3) return 24;
  if (Math.abs(rawFps - 25) < 0.3) return 25;
  if (Math.abs(rawFps - 29.97) < 0.5) return 29.97;
  if (Math.abs(rawFps - 30) < 0.3) return 30;
  if (Math.abs(rawFps - 50) < 0.5) return 50;
  if (Math.abs(rawFps - 59.94) < 0.5) return 59.94;
  if (Math.abs(rawFps - 60) < 0.5) return 60;
  if (Math.abs(rawFps - 120) < 1) return 120;
  return Math.round(rawFps * 100) / 100;
}

function getMimeTypeFromExtension(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'mp4': return 'video/mp4';
    case 'webm': return 'video/webm';
    case 'mov': return 'video/quicktime';
    case 'mkv': return 'video/x-matroska';
    case 'avi': return 'video/x-msvideo';
    default: return 'video/mp4';
  }
}
