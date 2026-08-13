import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { FrameData } from '../types';

export type ZipProgressCallback = (percent: number) => void;

/**
 * Downloads a single frame blob directly
 */
export function downloadSingleFrame(frame: FrameData): void {
  saveAs(frame.blob, frame.filename);
}

/**
 * Packs array of selected frames into a ZIP file and triggers download
 */
export async function downloadFramesAsZip(
  frames: FrameData[],
  zipFilename: string = 'extracted_frames.zip',
  onProgress?: ZipProgressCallback
): Promise<void> {
  const selectedFrames = frames.filter((f) => f.selected);
  if (selectedFrames.length === 0) {
    throw new Error('No frames selected for download.');
  }

  const zip = new JSZip();
  const folder = zip.folder('frames') || zip;

  // Track unique filenames to avoid collision inside zip
  const nameCounts: Record<string, number> = {};

  selectedFrames.forEach((frame) => {
    let filename = frame.filename;
    if (nameCounts[filename]) {
      nameCounts[filename]++;
      const parts = filename.split('.');
      const ext = parts.pop();
      filename = `${parts.join('.')}_(${nameCounts[filename]}).${ext}`;
    } else {
      nameCounts[filename] = 1;
    }

    folder.file(filename, frame.blob);
  });

  const content = await zip.generateAsync(
    { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (metadata) => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent));
      }
    }
  );

  const cleanZipName = zipFilename.endsWith('.zip') ? zipFilename : `${zipFilename}.zip`;
  saveAs(content, cleanZipName);
}
