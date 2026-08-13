export type ExtractionMode = 'all' | 'count' | 'interval';

export type ExportFormat = 'png' | 'tiff' | 'bmp' | 'jpeg';

export type NamingPattern = 
  | 'frame_number'    // video_frame_0001.png
  | 'timestamp'       // video_00-01-23-450.png
  | 'seconds'         // video_75.45s.png
  | 'custom_prefix';  // custom_0001.png

export interface VideoMetadata {
  name: string;
  sizeBytes: number;
  formattedSize: string;
  width: number;
  height: number;
  resolutionLabel: string; // e.g. "4K (3840x2160)" or "1080p (1920x1080)"
  duration: number; // in seconds
  formattedDuration: string; // MM:SS.ms
  fps: number;
  totalFrames: number;
  codec?: string;
  mimeType: string;
  fileObject: File;
  objectUrl: string;
}

export interface FrameData {
  id: string;
  index: number; // 0-based or 1-based frame index
  timestamp: number; // time in seconds
  timeString: string; // HH:MM:SS.mmm
  blob: Blob;
  url: string; // Blob URL for thumbnail preview
  width: number;
  height: number;
  sizeBytes: number;
  selected: boolean;
  format: ExportFormat;
  filename: string;
  sceneChangeScore?: number; // 0 to 1, higher means scene cut
  isKeyframeCandidate?: boolean;
  isDuplicate?: boolean;
}

export interface ExtractionOptions {
  mode: ExtractionMode;
  frameCount: number; // For 'count' mode
  intervalSeconds: number; // For 'interval' mode
  startTime: number; // range start (0 default)
  endTime: number; // range end (duration default)
  format: ExportFormat;
  jpegQuality: number; // 0.01 to 1.0 (for JPEG mode)
  namingPattern: NamingPattern;
  customPrefix: string;
  scaleRatio: number; // 1.0 = native source resolution (default), 0.75, 0.5
  engine: 'browser' | 'ffmpeg';
  zeroPad: number; // padding for sequence numbers, default 4
}

export interface ExtractionProgress {
  status: 'idle' | 'analyzing' | 'extracting' | 'completed' | 'canceled' | 'error';
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  fpsSpeed: number; // frames per second processing rate
  elapsedTimeMs: number;
  estimatedTimeRemainingMs: number;
  errorMessage?: string;
}

export interface ComparePair {
  frameA: FrameData;
  frameB: FrameData;
}
