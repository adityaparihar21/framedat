export type ExtractionMode = 'all' | 'count' | 'interval';

export type ExportFormat = 'png' | 'tiff' | 'bmp' | 'jpeg';

export type NamingPattern = 
  | 'frame_number'    // video_frame_0001.png
  | 'timestamp'       // video_00-01-23-450.png
  | 'seconds'         // video_75.45s.png
  | 'custom_prefix'   // custom_0001.png
  | 'smart_pattern';  // {video}_frame_{####}.png

export type OverlayPosition = 
  | 'bottom-left' 
  | 'bottom-center' 
  | 'bottom-right' 
  | 'top-left' 
  | 'top-center' 
  | 'top-right';

export type OverlayStyle = 'minimal' | 'dark' | 'light';

export type OverlayFontSize = 'small' | 'medium' | 'large';

export interface OverlayFields {
  frameNumber: boolean;
  timecode: boolean;
  timestamp: boolean;
  filename: boolean;
  resolution: boolean;
  fps: boolean;
  sceneNumber: boolean;
  mode: boolean;
  customLabel: boolean;
}

export interface MetadataOverlayOptions {
  enabled: boolean;
  position: OverlayPosition;
  style: OverlayStyle;
  opacity: number; // 0.1 to 1.0 (default 0.8)
  fontSize: OverlayFontSize;
  customLabel: string;
  fields: OverlayFields;
}

export interface VideoMetadata {
  name: string;
  sizeBytes: number;
  formattedSize: string;
  width: number;
  height: number;
  resolutionLabel: string;
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
  index: number;
  timestamp: number;
  timeString: string;
  blob: Blob;
  url: string;
  width: number;
  height: number;
  sizeBytes: number;
  selected: boolean;
  format: ExportFormat;
  filename: string;
  sceneChangeScore?: number;
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
  namingTemplate: string; // e.g. "{video}_frame_{####}.png"
  customPrefix: string;
  startNumber: number; // default 1
  zeroPad: number; // padding for sequence numbers, default 4
  scaleRatio: number; // 1.0 = native source resolution (default), 0.75, 0.5
  engine: 'browser' | 'ffmpeg';
  metadataOverlay: MetadataOverlayOptions;
}

export interface ExtractionProgress {
  status: 'idle' | 'analyzing' | 'extracting' | 'completed' | 'canceled' | 'error';
  currentFrame: number;
  totalFrames: number;
  percentage: number;
  fpsSpeed: number;
  elapsedTimeMs: number;
  estimatedTimeRemainingMs: number;
  errorMessage?: string;
}

export interface ComparePair {
  frameA: FrameData;
  frameB: FrameData;
}

export interface ContactSheetOptions {
  columns: number; // 3, 4, 5, 6 (default 4)
  format: 'png' | 'jpeg';
  scaleRatio: number; // 1.0 = Native, 2.0 = 2x
  showFrameNumber: boolean;
  showTimecode: boolean;
  showFilename: boolean;
  namingTemplate: string; // e.g. "{video}_contact_sheet.png"
}
