/**
 * YoinkTube Backend — server.js
 * 
 * Requirements:
 *   node >= 18
 *   npm install express cors yt-dlp-wrap uuid
 *   yt-dlp binary installed (https://github.com/yt-dlp/yt-dlp)
 *   ffmpeg installed (for MP3 conversion)
 * 
 * Run:
 *   node server.js
 */

const express  = require('express');
const cors     = require('cors');
const path     = require('path');
const fs       = require('fs');
const { exec } = require('child_process');
const { v4: uuidv4 } = require('uuid');

const app  = express();
const PORT = 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// Serve the frontend
app.use(express.static(path.join(__dirname)));

// Serve completed downloads
const DOWNLOADS_DIR = path.join(__dirname, 'downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) fs.mkdirSync(DOWNLOADS_DIR);
app.use('/downloads', express.static(DOWNLOADS_DIR));

// ── Helpers ───────────────────────────────────────────────────────────────────
function sanitizeFilename(name) {
  return name.replace(/[^\w\s\-\.]/g, '').replace(/\s+/g, '_').slice(0, 80);
}

function getVideoInfo(url) {
  return new Promise((resolve, reject) => {
    exec(
      `yt-dlp --dump-json --no-playlist "${url}"`,
      { timeout: 30000 },
      (err, stdout, stderr) => {
        if (err) return reject(new Error('Could not fetch video info. Is the URL valid?'));
        try {
          resolve(JSON.parse(stdout));
        } catch {
          reject(new Error('Failed to parse video info.'));
        }
      }
    );
  });
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatSize(bytes) {
  if (!bytes) return '';
  const mb = bytes / 1024 / 1024;
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${(bytes / 1024).toFixed(0)} KB`;
}

// ── API: /api/download ────────────────────────────────────────────────────────
app.get('/api/download', async (req, res) => {
  const { url, format, quality } = req.query;

  if (!url) return res.status(400).json({ error: 'Missing url parameter.' });
  if (!['mp3', 'mp4'].includes(format)) return res.status(400).json({ error: 'Format must be mp3 or mp4.' });

  // Block non-YouTube
  if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
    return res.status(400).json({ error: 'Only YouTube URLs are supported.' });
  }

  try {
    // 1. Get video metadata
    const info = await getVideoInfo(url);
    const safeTitle = sanitizeFilename(info.title || 'video');
    const fileId    = uuidv4();

    // 2. Build yt-dlp command
    let outputFile, ytdlpCmd;

    if (format === 'mp3') {
      outputFile = path.join(DOWNLOADS_DIR, `${fileId}_${safeTitle}.mp3`);
      ytdlpCmd = [
        'yt-dlp',
        '-x',                               // extract audio
        '--audio-format mp3',
        '--audio-quality 0',                // best quality
        '--no-playlist',
        `-o "${outputFile}"`,
        `"${url}"`
      ].join(' ');

    } else {
      // MP4 — max 720p (no 1080p as requested)
      const fmt = quality || 'best[height<=720]';
      outputFile = path.join(DOWNLOADS_DIR, `${fileId}_${safeTitle}.mp4`);
      ytdlpCmd = [
        'yt-dlp',
        `-f "${fmt}[ext=mp4]/bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720]"`,
        '--merge-output-format mp4',
        '--no-playlist',
        `-o "${outputFile}"`,
        `"${url}"`
      ].join(' ');
    }

    // 3. Run download
    await new Promise((resolve, reject) => {
      exec(ytdlpCmd, { timeout: 300000 }, (err, stdout, stderr) => {
        if (err) {
          console.error('yt-dlp error:', stderr);
          return reject(new Error('Download failed. Check yt-dlp is installed.'));
        }
        resolve();
      });
    });

    // 4. Get file size
    const stat = fs.existsSync(outputFile) ? fs.statSync(outputFile) : null;

    // 5. Schedule deletion after 10 minutes
    setTimeout(() => {
      if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);
    }, 10 * 60 * 1000);

    // 6. Respond
    res.json({
      title:       info.title,
      thumbnail:   info.thumbnail,
      duration:    formatDuration(info.duration),
      size:        stat ? formatSize(stat.size) : '',
      downloadUrl: `/downloads/${path.basename(outputFile)}`
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || 'Server error.' });
  }
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎬 YoinkTube server running at http://localhost:${PORT}\n`);
});
