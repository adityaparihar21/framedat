/**
 * Local High-Precision Background Removal Engine for framedat
 * Performs instant client-side background removal & transparent PNG extraction.
 */

export interface BackgroundRemovalOptions {
  keyColor: { r: number; g: number; b: number };
  threshold: number; // 0 to 100
  feather: number; // 0 to 20
  invertMask: boolean;
  smoothing: boolean;
}

/**
 * Removes background from image Blob or URL and returns a Transparent PNG Blob
 */
export async function removeBackground(
  imageSource: Blob | string,
  options: BackgroundRemovalOptions
): Promise<Blob> {
  const img = await loadImage(imageSource);
  const width = img.naturalWidth || img.width;
  const height = img.naturalHeight || img.height;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) {
    throw new Error('Failed to create canvas context for background removal.');
  }

  // Draw source image
  ctx.drawImage(img, 0, 0, width, height);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const { keyColor, threshold, feather, invertMask } = options;

  // Convert 0-100 threshold to color distance (0 - 441)
  const maxDistance = (threshold / 100) * 441;
  const featherRange = feather * 4;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Euclidean color distance in RGB space
    const distance = Math.sqrt(
      Math.pow(r - keyColor.r, 2) +
      Math.pow(g - keyColor.g, 2) +
      Math.pow(b - keyColor.b, 2)
    );

    let alpha = 255;

    if (distance < maxDistance) {
      if (featherRange > 0 && maxDistance - distance < featherRange) {
        alpha = Math.round(((maxDistance - distance) / featherRange) * 255);
      } else {
        alpha = 0;
      }
    }

    if (invertMask) {
      alpha = 255 - alpha;
    }

    data[i + 3] = alpha;
  }

  ctx.putImageData(imgData, 0, 0);

  // Return PNG Blob with alpha channel transparency
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode transparent PNG blob.'));
    }, 'image/png');
  });
}

/**
 * Samples key color from top-left corner of image for automatic background detection
 */
export async function autoDetectKeyColor(imageSource: Blob | string): Promise<{ r: number; g: number; b: number }> {
  const img = await loadImage(imageSource);
  const canvas = document.createElement('canvas');
  canvas.width = 10;
  canvas.height = 10;
  const ctx = canvas.getContext('2d');

  if (!ctx) return { r: 9, g: 11, b: 16 };

  ctx.drawImage(img, 0, 0, 10, 10);
  const data = ctx.getImageData(0, 0, 1, 1).data;
  return { r: data[0], g: data[1], b: data[2] };
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
