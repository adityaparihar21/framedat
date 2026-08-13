/**
 * High-Precision Local Background Removal Engine for framedat.
 * Includes Skin & Subject Tone Protection Shield to prevent erasing human faces, hands, and bodies
 * even when background hues are similar to foreground tones.
 */

export interface BackgroundRemovalOptions {
  keyColor: { r: number; g: number; b: number };
  threshold: number; // 0 to 100
  feather: number; // 0 to 20
  protectSkinTones: boolean; // Protect human skin tones from removal
  skinProtectionStrength: number; // 0 to 100
  invertMask: boolean;
  smoothing: boolean;
}

/**
 * Checks if a pixel RGB value falls within human skin tone color spectrum
 * (YCrCb / RGB skin tone bounding envelope)
 */
export function isHumanSkinTone(r: number, g: number, b: number): boolean {
  // Standard RGB skin tone heuristics
  const rGDiff = r - g;
  const isBasicSkin = r > 60 && g > 40 && b > 20 && (Math.max(r, g, b) - Math.min(r, g, b) > 15) && Math.abs(rGDiff) > 15 && r > g && r > b;
  
  // YCbCr color space transformation check
  const y = 0.299 * r + 0.587 * g + 0.114 * b;
  const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

  const isYCbCrSkin = cr >= 133 && cr <= 173 && cb >= 77 && cb <= 127 && y > 40;

  return isBasicSkin || isYCbCrSkin;
}

/**
 * Removes background from an image Blob or URL with Skin & Subject Protection Shielding
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

  const { keyColor, threshold, feather, protectSkinTones, skinProtectionStrength, invertMask } = options;

  // Max color distance threshold (0 - 441 in 3D RGB space)
  const maxDistance = (threshold / 100) * 441;
  const featherRange = feather * 4;
  const skinShieldFactor = (skinProtectionStrength / 100);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Calculate Euclidean color distance to target background key color
    const distance = Math.sqrt(
      Math.pow(r - keyColor.r, 2) +
      Math.pow(g - keyColor.g, 2) +
      Math.pow(b - keyColor.b, 2)
    );

    let alpha = 255;

    // Check if background match
    if (distance < maxDistance) {
      if (featherRange > 0 && maxDistance - distance < featherRange) {
        alpha = Math.round(((maxDistance - distance) / featherRange) * 255);
      } else {
        alpha = 0;
      }

      // SKIN & SUBJECT PROTECTION SHIELD: Protect human skin tones from accidental deletion
      if (protectSkinTones && alpha < 255) {
        if (isHumanSkinTone(r, g, b)) {
          // Restore alpha to preserve subject skin/face/hands
          const restoreAmount = Math.round(255 * skinShieldFactor);
          alpha = Math.max(alpha, restoreAmount);
        }
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
