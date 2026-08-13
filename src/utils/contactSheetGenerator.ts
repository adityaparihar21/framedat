import type { FrameData, ContactSheetOptions } from '../types';
import { parseSmartFilenamePattern } from './frameExtractor';

/**
 * Generates a professional grid contact sheet from selected extracted frames
 */
export async function generateContactSheet(
  frames: FrameData[],
  videoName: string,
  options: ContactSheetOptions
): Promise<{ blob: Blob; filename: string }> {
  if (frames.length === 0) {
    throw new Error('No frames available to generate contact sheet.');
  }

  const columns = Math.max(1, Math.min(8, options.columns || 4));
  const rows = Math.ceil(frames.length / columns);

  // Load first frame image to determine native aspect ratio
  const firstImg = await loadImage(frames[0].url);
  const nativeW = firstImg.naturalWidth || 640;
  const nativeH = firstImg.naturalHeight || 360;

  // Tile dimensions
  const scale = options.scaleRatio || 1.0;
  const tileWidth = Math.round((nativeW > 1920 ? 480 : 360) * scale);
  const tileHeight = Math.round((tileWidth / nativeW) * nativeH);

  // Label area height under each thumbnail
  const labelHeight = Math.round(28 * scale);
  const cellWidth = tileWidth + Math.round(16 * scale);
  const cellHeight = tileHeight + labelHeight + Math.round(16 * scale);

  // Title bar at top of contact sheet
  const titleHeight = Math.round(60 * scale);
  const padding = Math.round(20 * scale);

  const canvasWidth = padding * 2 + columns * cellWidth;
  const canvasHeight = padding * 2 + titleHeight + rows * cellHeight;

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Failed to create canvas context for contact sheet.');
  }

  // Background
  ctx.fillStyle = '#090B10';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Title Bar Header
  ctx.fillStyle = '#EDEFF5';
  ctx.font = `700 ${Math.round(18 * scale)}px "Plus Jakarta Sans", sans-serif`;
  ctx.fillText(`framedat — Contact Sheet: ${videoName}`, padding, padding + Math.round(24 * scale));

  ctx.fillStyle = '#8B90A0';
  ctx.font = `500 ${Math.round(12 * scale)}px "JetBrains Mono", monospace`;
  ctx.fillText(
    `${frames.length} frames  •  ${columns} columns  •  ${nativeW}×${nativeH} native resolution`,
    padding,
    padding + Math.round(44 * scale)
  );

  // Divider Line
  ctx.strokeStyle = '#1F2430';
  ctx.lineWidth = Math.max(1, Math.round(1 * scale));
  ctx.beginPath();
  ctx.moveTo(padding, padding + titleHeight - Math.round(8 * scale));
  ctx.lineTo(canvasWidth - padding, padding + titleHeight - Math.round(8 * scale));
  ctx.stroke();

  // Draw Tiles
  for (let i = 0; i < frames.length; i++) {
    const frame = frames[i];
    const col = i % columns;
    const row = Math.floor(i / columns);

    const cellX = padding + col * cellWidth;
    const cellY = padding + titleHeight + row * cellHeight;

    const img = await loadImage(frame.url);

    // Draw Thumbnail Tile Box
    ctx.fillStyle = '#12151E';
    ctx.strokeStyle = '#1F2430';
    ctx.beginPath();
    ctx.roundRect(cellX, cellY, tileWidth, tileHeight, Math.round(6 * scale));
    ctx.fill();
    ctx.stroke();

    // Draw Image
    ctx.drawImage(img, cellX, cellY, tileWidth, tileHeight);

    // Draw Label underneath thumbnail
    const labelY = cellY + tileHeight + Math.round(12 * scale);
    ctx.font = `600 ${Math.round(11 * scale)}px "JetBrains Mono", monospace`;
    ctx.fillStyle = '#EDEFF5';

    const parts: string[] = [];
    if (options.showFrameNumber) parts.push(`#${(i + 1).toString().padStart(4, '0')}`);
    if (options.showTimecode) parts.push(frame.timeString);
    if (options.showFilename) parts.push(frame.filename);

    const labelText = parts.join('  •  ');
    ctx.fillText(labelText, cellX + Math.round(4 * scale), labelY);
  }

  // Generate output blob
  const mimeType = options.format === 'jpeg' ? 'image/jpeg' : 'image/png';
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => {
      if (b) resolve(b);
      else reject(new Error('Failed to encode contact sheet blob.'));
    }, mimeType, 0.95);
  });

  const filename = parseSmartFilenamePattern(
    options.namingTemplate || '{video}_contact_sheet.png',
    videoName,
    0,
    0,
    options.format === 'jpeg' ? 'jpeg' : 'png',
    {}
  );

  return { blob, filename };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image.'));
    img.src = src;
  });
}
