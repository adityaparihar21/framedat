import express from 'express';
import multer from 'multer';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 4000;

const uploadDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'outputs');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const upload = multer({ dest: uploadDir });

app.use(express.json());

// API Endpoint: Extract frames server-side using native system FFmpeg binary
app.post('/api/extract-server', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  const inputPath = req.file.path;
  const mode = req.body.mode || 'all';
  const format = req.body.format || 'png';
  const jobId = `job_${Date.now()}`;
  const jobOutputDir = path.join(outputDir, jobId);

  fs.mkdirSync(jobOutputDir, { recursive: true });

  let ffmpegCmd = '';
  const outputPattern = path.join(jobOutputDir, `frame_%04d.${format}`);

  if (mode === 'all') {
    // Extract every frame with lossless VFR preservation
    ffmpegCmd = `ffmpeg -i "${inputPath}" -vsync 0 "${outputPattern}"`;
  } else if (mode === 'count') {
    const N = parseInt(req.body.frameCount) || 24;
    ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "select=not(mod(n\\,FLOOR))" -vsync vfr "${outputPattern}"`;
  } else {
    const interval = parseFloat(req.body.interval) || 1.0;
    ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "fps=1/${interval}" "${outputPattern}"`;
  }

  console.log(`[FFmpeg Server] Executing: ${ffmpegCmd}`);

  exec(ffmpegCmd, (error, stdout, stderr) => {
    // Clean up original uploaded file
    fs.unlink(inputPath, () => {});

    if (error) {
      console.error('[FFmpeg Server Error]:', stderr);
      return res.status(500).json({ error: 'FFmpeg extraction failed', details: stderr });
    }

    const files = fs.readdirSync(jobOutputDir).filter((f) => f.endsWith(`.${format}`));
    console.log(`[FFmpeg Server] Successfully extracted ${files.length} frames.`);

    // Zip and serve
    const zipPath = path.join(outputDir, `${jobId}.zip`);
    const zipOutput = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 6 } });

    zipOutput.on('close', () => {
      res.json({
        success: true,
        totalFrames: files.length,
        downloadUrl: `/api/download-zip/${jobId}`,
      });
    });

    archive.pipe(zipOutput);
    archive.directory(jobOutputDir, false);
    archive.finalize();
  });
});

app.get('/api/download-zip/:jobId', (req, res) => {
  const jobId = req.params.jobId;
  const zipPath = path.join(outputDir, `${jobId}.zip`);
  if (fs.existsSync(zipPath)) {
    res.download(zipPath, `extracted_frames_${jobId}.zip`, () => {
      // Clean up temp output zip after download
      fs.unlink(zipPath, () => {});
      const jobOutputDir = path.join(outputDir, jobId);
      fs.rm(jobOutputDir, { recursive: true, force: true }, () => {});
    });
  } else {
    res.status(404).json({ error: 'Zip file expired or not found' });
  }
});

app.listen(PORT, () => {
  console.log(`Native FFmpeg Extraction Server running on http://localhost:${PORT}`);
});
