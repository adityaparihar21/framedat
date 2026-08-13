import type { FrameData } from '../types';

/**
 * Analyzes frame images to calculate scene change scores & tag duplicates
 */
export async function analyzeSceneChanges(frames: FrameData[]): Promise<FrameData[]> {
  if (frames.length < 2) return frames;

  const canvas = document.createElement('canvas');
  // Downsample to 64x64 for fast pixel histogram comparison
  const sampleWidth = 64;
  const sampleHeight = 64;
  canvas.width = sampleWidth;
  canvas.height = sampleHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });

  if (!ctx) return frames;

  const frameHistograms: Uint8ClampedArray[] = [];

  for (const frame of frames) {
    const img = await loadImageFromUrl(frame.url);
    ctx.drawImage(img, 0, 0, sampleWidth, sampleHeight);
    const imgData = ctx.getImageData(0, 0, sampleWidth, sampleHeight);
    frameHistograms.push(imgData.data);
  }

  const updatedFrames = [...frames];

  for (let i = 0; i < updatedFrames.length; i++) {
    if (i === 0) {
      updatedFrames[i] = {
        ...updatedFrames[i],
        sceneChangeScore: 1.0, // First frame is always a scene entry
        isKeyframeCandidate: true,
        isDuplicate: false,
      };
      continue;
    }

    const prevData = frameHistograms[i - 1];
    const currData = frameHistograms[i];

    let diffSum = 0;
    const totalPixels = sampleWidth * sampleHeight * 4;

    for (let p = 0; p < totalPixels; p += 4) {
      // Compare RGB delta (ignore Alpha)
      const rDiff = Math.abs(prevData[p] - currData[p]);
      const gDiff = Math.abs(prevData[p + 1] - currData[p + 1]);
      const bDiff = Math.abs(prevData[p + 2] - currData[p + 2]);
      diffSum += (rDiff + gDiff + bDiff) / (3 * 255);
    }

    const score = Math.round((diffSum / (sampleWidth * sampleHeight)) * 1000) / 1000;
    const isSceneCut = score > 0.35;
    const isDuplicate = score < 0.015;

    updatedFrames[i] = {
      ...updatedFrames[i],
      sceneChangeScore: score,
      isKeyframeCandidate: isSceneCut,
      isDuplicate,
    };
  }

  return updatedFrames;
}

function loadImageFromUrl(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load frame image for scene detection'));
    img.src = url;
  });
}
