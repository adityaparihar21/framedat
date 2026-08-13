/**
 * Generates a colorful synthetic 3-second 24FPS demo video file locally in browser memory
 */
export async function createDemoVideoFile(): Promise<File> {
  const width = 1280;
  const height = 720;
  const fps = 24;
  const durationSeconds = 3;
  const totalFrames = fps * durationSeconds;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Failed to create canvas context for demo video generation.');

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

  // Render colorful motion frames
  for (let f = 0; f < totalFrames; f++) {
    const t = f / fps;
    const progress = f / totalFrames;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, `hsl(${(f * 8) % 360}, 80%, 15%)`);
    gradient.addColorStop(1, `hsl(${(f * 8 + 120) % 360}, 80%, 25%)`);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Bouncing orbital shapes
    const centerX = width / 2 + Math.sin(t * 4) * 300;
    const centerY = height / 2 + Math.cos(t * 4) * 180;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${(f * 12) % 360}, 90%, 60%)`;
    ctx.shadowColor = `hsl(${(f * 12) % 360}, 90%, 60%)`;
    ctx.shadowBlur = 40;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Frame counter text overlay
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px monospace';
    ctx.fillText(`DEMO VIDEO SAMPLE — FRAME #${(f + 1).toString().padStart(4, '0')}`, 60, 80);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = '24px monospace';
    ctx.fillText(`Timestamp: 00:00:${t.toFixed(3)} | 1280x720 24FPS Lossless Test`, 60, 120);

    // Progress bar line
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(60, height - 60, (width - 120) * progress, 8);

    await new Promise((r) => setTimeout(r, 1000 / fps));
  }

  mediaRecorder.stop();
  const videoBlob = await recordingPromise;

  return new File([videoBlob], 'demo_sample_1280x720_24fps.webm', { type: 'video/webm' });
}
