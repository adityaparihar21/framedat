/**
 * Client-Side Canvas Engine for Bitmap Dithering, ASCII Text Art,
 * Minecraft Voxel Blockify, Black & White Halftone Dot Matrix, and Retro Pixelation for framedat
 */

export type CreativeEffectType =
  | 'bitmap_dither'
  | 'ascii_art'
  | 'minecraft_blocks'
  | 'halftone_dots'
  | 'pixelate'
  | 'line_sketch';

export interface BitmapAsciiOptions {
  effect: CreativeEffectType;
  resolutionScale: number; // 0.1 to 1.0
  threshold: number; // 0 to 250
  dotSize: number; // 2 to 32 px (block size)
  contrast: number; // -50 to 50
  protectSubject: boolean; // Preserve main subject while blockifying background
  subjectSensitivity: number; // 0 to 100
  asciiCharset: string;
}

export const DEFAULT_ASCII_CHARSET = '@#S%?*+;:,. ';

// Classic Minecraft Block Color Palette
const MINECRAFT_PALETTE = [
  { r: 89, g: 140, b: 48, name: 'grass' },
  { r: 134, g: 96, b: 67, name: 'dirt' },
  { r: 125, g: 125, b: 125, name: 'stone' },
  { r: 54, g: 54, b: 54, name: 'deepslate' },
  { r: 162, g: 130, b: 78, name: 'oak_wood' },
  { r: 198, g: 162, b: 106, name: 'planks' },
  { r: 219, g: 207, b: 161, name: 'sand' },
  { r: 63, g: 118, b: 228, name: 'water' },
  { r: 120, g: 168, b: 240, name: 'sky' },
  { r: 228, g: 70, b: 20, name: 'lava' },
  { r: 45, g: 110, b: 35, name: 'leaves' },
  { r: 240, g: 240, b: 240, name: 'snow' },
  { r: 35, g: 30, b: 45, name: 'obsidian' },
];

/**
 * Converts Image Source to ASCII Text String
 */
export async function generateAsciiText(
  imageSource: Blob | string,
  options: BitmapAsciiOptions
): Promise<string> {
  const img = await loadImage(imageSource);
  const scale = options.resolutionScale || 0.2;
  const cols = Math.floor((img.naturalWidth || img.width) * scale);
  const rows = Math.floor((img.naturalHeight || img.height) * scale * 0.5);

  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return '';

  ctx.drawImage(img, 0, 0, cols, rows);
  const imgData = ctx.getImageData(0, 0, cols, rows);
  const data = imgData.data;

  const charset = options.asciiCharset || DEFAULT_ASCII_CHARSET;
  const charLen = charset.length;
  let asciiText = '';

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const idx = (y * cols + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      const charIdx = Math.floor(((255 - luma) / 255) * (charLen - 1));
      asciiText += charset[Math.max(0, Math.min(charLen - 1, charIdx))];
    }
    asciiText += '\n';
  }

  return asciiText;
}

/**
 * Processes Image Source with Creative Art Effect and Returns PNG Canvas Blob
 */
export async function processCreativeEffect(
  imageSource: Blob | string,
  options: BitmapAsciiOptions
): Promise<Blob> {
  const img = await loadImage(imageSource);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context not available.');

  ctx.drawImage(img, 0, 0, width, height);
  const imgData = ctx.getImageData(0, 0, width, height);

  switch (options.effect) {
    case 'minecraft_blocks':
      applyMinecraftVoxelBlocks(ctx, img, width, height, options);
      break;

    case 'bitmap_dither':
      applyFloydSteinbergDither(ctx, imgData, options.threshold);
      break;

    case 'halftone_dots':
      applyHalftoneDotMatrix(ctx, img, width, height, options.dotSize);
      break;

    case 'pixelate':
      applyPixelate(ctx, img, width, height, Math.max(4, options.dotSize));
      break;

    case 'line_sketch':
      applyLineSketch(ctx, imgData, options.threshold);
      break;

    case 'ascii_art':
    default:
      const asciiText = await generateAsciiText(imageSource, options);
      drawAsciiOntoCanvas(ctx, asciiText, width, height);
      break;
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to render creative effect PNG.'));
    }, 'image/png');
  });
}

/**
 * Minecraft Voxel Blockify Filter
 * Converts background pixels into 3D Minecraft Voxel blocks while optionally protecting the main subject!
 */
function applyMinecraftVoxelBlocks(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  w: number,
  h: number,
  options: BitmapAsciiOptions
) {
  const blockSize = Math.max(6, options.dotSize);

  // Sample original image data
  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = w;
  sampleCanvas.height = h;
  const sampleCtx = sampleCanvas.getContext('2d');
  if (!sampleCtx) return;
  sampleCtx.drawImage(img, 0, 0, w, h);
  const imgData = sampleCtx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Center coordinates for subject protection thresholding
  const centerX = w / 2;
  const centerY = h / 2;
  const maxRadius = Math.min(w, h) * (options.subjectSensitivity / 100);

  // Draw base original image first if subject protection enabled
  ctx.drawImage(img, 0, 0, w, h);

  for (let y = 0; y < h; y += blockSize) {
    for (let x = 0; x < w; x += blockSize) {
      // Calculate distance to center for subject protection
      const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      const isSubjectRegion = options.protectSubject && distFromCenter < maxRadius;

      // If in protected subject zone, keep original image details crisp!
      if (isSubjectRegion) {
        continue;
      }

      // Sample average color of block
      let avgR = 0, avgG = 0, avgB = 0, count = 0;

      for (let by = 0; by < blockSize && y + by < h; by += 2) {
        for (let bx = 0; bx < blockSize && x + bx < w; bx += 2) {
          const idx = ((y + by) * w + (x + bx)) * 4;
          avgR += data[idx];
          avgG += data[idx + 1];
          avgB += data[idx + 2];
          count++;
        }
      }

      if (count > 0) {
        avgR = Math.round(avgR / count);
        avgG = Math.round(avgG / count);
        avgB = Math.round(avgB / count);
      }

      // Find closest Minecraft block color palette match
      const nearestBlock = getNearestMinecraftColor(avgR, avgG, avgB);

      // Draw Minecraft Voxel 3D Block with bevel highlight & shadow
      ctx.fillStyle = `rgb(${nearestBlock.r}, ${nearestBlock.g}, ${nearestBlock.b})`;
      ctx.fillRect(x, y, blockSize, blockSize);

      // Top-Left Highlight Edge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.fillRect(x, y, blockSize, Math.max(1, blockSize * 0.15));
      ctx.fillRect(x, y, Math.max(1, blockSize * 0.15), blockSize);

      // Bottom-Right Shadow Edge
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(x, y + blockSize - Math.max(1, blockSize * 0.15), blockSize, Math.max(1, blockSize * 0.15));
      ctx.fillRect(x + blockSize - Math.max(1, blockSize * 0.15), y, Math.max(1, blockSize * 0.15), blockSize);

      // Block Grid Border Line
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, blockSize, blockSize);
    }
  }
}

/**
 * Finds closest color match in classic Minecraft color palette
 */
function getNearestMinecraftColor(r: number, g: number, b: number) {
  let minDistance = Infinity;
  let closest = MINECRAFT_PALETTE[0];

  for (const block of MINECRAFT_PALETTE) {
    const dist = Math.sqrt(
      Math.pow(r - block.r, 2) +
      Math.pow(g - block.g, 2) +
      Math.pow(b - block.b, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closest = block;
    }
  }

  return closest;
}

/**
 * Floyd-Steinberg 1-Bit Monochromatic Dithering Algorithm
 */
function applyFloydSteinbergDither(ctx: CanvasRenderingContext2D, imgData: ImageData, threshold: number) {
  const data = imgData.data;
  const w = imgData.width;
  const h = imgData.height;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const oldPixel = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const newPixel = oldPixel < threshold ? 0 : 255;
      const quantError = oldPixel - newPixel;

      data[i] = newPixel;
      data[i + 1] = newPixel;
      data[i + 2] = newPixel;

      if (x + 1 < w) distributeError(data, i + 4, quantError * 7 / 16);
      if (x - 1 >= 0 && y + 1 < h) distributeError(data, i + (w - 1) * 4, quantError * 3 / 16);
      if (y + 1 < h) distributeError(data, i + w * 4, quantError * 5 / 16);
      if (x + 1 < w && y + 1 < h) distributeError(data, i + (w + 1) * 4, quantError * 1 / 16);
    }
  }

  ctx.putImageData(imgData, 0, 0);
}

function distributeError(data: Uint8ClampedArray, idx: number, err: number) {
  data[idx] = Math.max(0, Math.min(255, data[idx] + err));
  data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + err));
  data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + err));
}

/**
 * Newspaper B&W Halftone Dot Matrix Pattern
 */
function applyHalftoneDotMatrix(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, dotSize: number) {
  ctx.fillStyle = '#08090C';
  ctx.fillRect(0, 0, w, h);

  const sampleCanvas = document.createElement('canvas');
  sampleCanvas.width = w;
  sampleCanvas.height = h;
  const sampleCtx = sampleCanvas.getContext('2d');
  if (!sampleCtx) return;
  sampleCtx.drawImage(img, 0, 0, w, h);
  const data = sampleCtx.getImageData(0, 0, w, h).data;

  ctx.fillStyle = '#F0F2F6';

  for (let y = 0; y < h; y += dotSize) {
    for (let x = 0; x < w; x += dotSize) {
      const idx = (Math.floor(y) * w + Math.floor(x)) * 4;
      const luma = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      const radius = (1 - luma / 255) * (dotSize / 2);

      if (radius > 0.5) {
        ctx.beginPath();
        ctx.arc(x + dotSize / 2, y + dotSize / 2, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

/**
 * 8-Bit Pixelate Filter
 */
function applyPixelate(ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, pixelSize: number) {
  ctx.imageSmoothingEnabled = false;
  const smallW = Math.max(1, Math.floor(w / pixelSize));
  const smallH = Math.max(1, Math.floor(h / pixelSize));

  const offscreen = document.createElement('canvas');
  offscreen.width = smallW;
  offscreen.height = smallH;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return;

  offCtx.drawImage(img, 0, 0, smallW, smallH);
  ctx.drawImage(offscreen, 0, 0, smallW, smallH, 0, 0, w, h);
}

/**
 * Contour Line Sketch
 */
function applyLineSketch(ctx: CanvasRenderingContext2D, imgData: ImageData, threshold: number) {
  const data = imgData.data;
  const w = imgData.width;
  const h = imgData.height;

  ctx.fillStyle = '#08090C';
  ctx.fillRect(0, 0, w, h);

  const outputData = ctx.getImageData(0, 0, w, h);
  const out = outputData.data;

  for (let y = 0; y < h - 1; y++) {
    for (let x = 0; x < w - 1; x++) {
      const i = (y * w + x) * 4;
      const iRight = (y * w + (x + 1)) * 4;
      const iDown = ((y + 1) * w + x) * 4;

      const luma = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const lumaRight = 0.299 * data[iRight] + 0.587 * data[iRight + 1] + 0.114 * data[iRight + 2];
      const lumaDown = 0.299 * data[iDown] + 0.587 * data[iDown + 1] + 0.114 * data[iDown + 2];

      const diff = Math.abs(luma - lumaRight) + Math.abs(luma - lumaDown);

      if (diff > (threshold * 0.4)) {
        out[i] = 240;
        out[i + 1] = 242;
        out[i + 2] = 246;
        out[i + 3] = 255;
      }
    }
  }

  ctx.putImageData(outputData, 0, 0);
}

function drawAsciiOntoCanvas(ctx: CanvasRenderingContext2D, asciiText: string, w: number, h: number) {
  ctx.fillStyle = '#08090C';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#5B8DEF';
  ctx.font = '10px "JetBrains Mono", monospace';

  const lines = asciiText.split('\n');
  const lineHeight = 10;
  let y = lineHeight;

  for (let i = 0; i < lines.length && y < h; i++) {
    ctx.fillText(lines[i], 10, y);
    y += lineHeight;
  }
}

function loadImage(src: Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    const url = typeof src === 'string' ? src : URL.createObjectURL(src);

    img.onload = () => {
      if (typeof src !== 'string') URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => reject(new Error('Failed to load image.'));
    img.src = url;
  });
}
