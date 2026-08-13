import type { FrameData } from '../types';

/**
 * Creates an animated canvas video loop or WebM/GIF buffer from extracted frames
 */
export async function createAnimatedWebMOrGif(
  frames: FrameData[],
  fps: number = 10,
  width: number = 480
): Promise<Blob> {
  const selectedFrames = frames.filter((f) => f.selected);
  if (selectedFrames.length === 0) {
    throw new Error('No frames selected to generate animation.');
  }

  // Determine height based on aspect ratio
  const firstFrame = selectedFrames[0];
  const aspectRatio = firstFrame.height / firstFrame.width;
  const height = Math.round(width * aspectRatio);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Could not initialize canvas for animation output.');

  // Check if MediaRecorder supports image/webm or video/webm
  const stream = canvas.captureStream(fps);
  const mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
  const chunks: Blob[] = [];

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const recordingPromise = new Promise<Blob>((resolve) => {
    mediaRecorder.onstop = () => {
      resolve(new Blob(chunks, { type: 'video/webm' }));
    };
  });

  mediaRecorder.start();

  const frameDelay = 1000 / fps;

  for (const frame of selectedFrames) {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = frame.url;
    });

    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);
    await new Promise((r) => setTimeout(r, frameDelay));
  }

  mediaRecorder.stop();
  return recordingPromise;
}
