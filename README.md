# YoinkTube — Setup Guide

## What you get
- `index.html` — The frontend website (dark, stylish UI)
- `server.js`  — The Node.js backend that does the actual downloading
- `README.md`  — This file

---

## Requirements

| Tool | Install |
|------|---------|
| Node.js 18+ | https://nodejs.org |
| yt-dlp | https://github.com/yt-dlp/yt-dlp#installation |
| ffmpeg | https://ffmpeg.org/download.html |

---

## Setup (takes ~5 minutes)

### 1. Install yt-dlp

**Linux/Mac:**
```bash
pip install yt-dlp
# or
brew install yt-dlp
```

**Windows:**
Download `yt-dlp.exe` from https://github.com/yt-dlp/yt-dlp/releases and add it to your PATH.

### 2. Install ffmpeg

**Linux:**
```bash
sudo apt install ffmpeg
```
**Mac:**
```bash
brew install ffmpeg
```
**Windows:** Download from https://ffmpeg.org/download.html and add to PATH.

### 3. Install Node dependencies

```bash
npm init -y
npm install express cors uuid
```

### 4. Run the server

```bash
node server.js
```

You'll see:
```
🎬 YoinkTube server running at http://localhost:3001
```

### 5. Open the site

Open `index.html` in your browser (double-click it), or serve it:
```bash
npx serve .
```

---

## How to use

1. Paste a YouTube URL
2. Pick **MP3** (audio only) or **MP4** (video, max 720p)
3. For MP4, choose quality: 720p / 480p / 360p
4. Click **Download**
5. When ready, click **Save** to download to your computer

Files are automatically deleted from the server after **10 minutes**.

---

## Deploy to a real server (VPS)

1. Copy all files to your VPS (e.g. via `scp` or Git)
2. Install dependencies as above
3. Use **PM2** to keep it running:
   ```bash
   npm install -g pm2
   pm2 start server.js --name yoinktube
   pm2 save
   ```
4. Point a domain at your server with **nginx** as a reverse proxy
5. In `index.html`, change `API_BASE` to your domain:
   ```js
   const API_BASE = 'https://yourdomain.com';
   ```

---

## Notes

- **1080p is intentionally disabled** as requested. Max quality is 720p.
- For personal use only. Respect YouTube's Terms of Service.
- Downloaded files live in the `downloads/` folder and auto-delete after 10 min.
