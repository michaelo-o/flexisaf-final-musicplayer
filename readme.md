# Browser Music Player 🎵 by Michael Okwuosah

A responsive web-based music player that lets you play audio files directly from your device. Supports metadata reading, album art display, and real-time progress tracking.

## Features

- 🎧 File input song upload
- 📝 Displays metadata: track title and artist
- 🖼️ Automatically extracts and displays cover art (with fallback image)
- ⏯️ Basic controls: Play, Pause, Skip
- 🎚️ Seekable progress bar that updates in real time
- 🗑️ “Clear Songs” button that fully resets player state
- 📱 Responsive layout (desktop and mobile ready)
- ⚙️ No backend required — everything runs in the browser

## Tech Stack

- **HTML5**
- **CSS3**
- **JavaScript (ES6+)**
- [jsmediatags](https://github.com/aadsm/jsmediatags) — for reading song metadata

## Folder Structure

music-player/
├── assets/
│   └── img/
│       └── default-cover.png
├── index.html
├── style.css
├── script.js
└── README.md

## Notes

 - Only local files are supported (no streaming).
 - Supported formats depend on the browser (MP3, M4A, OGG, etc.).
 - Cover art must be embedded in the file for it to display.

## Built for FLexiSAF Internship Program Final Hands-on Project
