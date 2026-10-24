# Infinite Wiki Native

<img width="885" height="734" alt="image" src="https://github.com/user-attachments/assets/549c684c-686f-4091-98c0-23c7b825a0ba" />\
[![Download Infinite Wiki PC](https://a.fsdn.com/con/app/sf-download-button)](https://sourceforge.net/projects/infinite-wiki/files/latest/download)

Infinite Wiki Native is a Native port of **Infinite Wiki** for Windows and Android devices with multiple added features, ported with **Tauri** by **[@Mahir29Flame](https://github.com/Mahir29Flame)**.

The original **Infinite Wiki** was a **Google AI Studio demo** created by **Dev Valladares** ([@dev_valladares](https://x.com/dev_valladares)).  
This repository adapts that concept into a desktop app workflow with a React + TypeScript frontend and a Tauri (Rust) shell.

## What's New (v2.3.3):

- Fixed API Key Submission issue
- Added Android support
- Changed Default Text Model from gemini-2.5-flash-lite to gemini-3.5-flash-lite (25x more quota)
- Changed Default Art Model from gemini-2.0-flash-lite to gemini-3.5-flash-lite (25x more quota)
- Added Setting modal for changing models and api key data
- Added Quota fallback system
- **F11 Fullscreen shortcut** (supports native Tauri window fullscreen + browser fallback)
- **Text / DPI Resizing shortcuts**:
  - `Ctrl` + `+` or `Ctrl` + `=` : Increase text scale
  - `Ctrl` + `-` : Decrease text scale
  - `Ctrl` + `0` : Reset text scale (persisted in localStorage)

## What it does

- Generates a concise encyclopedia-style definition for any topic using Gemini 3.5 Flash Lite.
- Streams text output progressively in the UI.
- Makes words in generated content clickable to continue exploring related topics.
- Generates ASCII art for the current topic.
- Includes a random-topic exploration flow.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite
- **AI SDK:** `@google/genai`
- **Desktop runtime:** Tauri 2.x (Rust backend + web frontend)


## Setup

1. Install Windows exe [Install](https://sourceforge.net/projects/infinite-wiki/)

2. Get API key from [Google AI Studio Gemini API](https://aistudio.google.com/app/apikey)
   ```

## Run
- Run the exe file
- Insert the API Key in required section

### Desktop bundle [for devs]

```bash
npm run tauri-build
```

## Project structure

```text
.
├─ App.tsx                  # Main app state and generation flow
├─ components/              # UI components (search, content, loading, ASCII display)
├─ services/geminiService.ts# Gemini streaming + ASCII art generation
├─ src-tauri/               # Tauri Rust backend/config
├─ index.html / index.tsx   # App entry and base styles
└─ vite.config.ts           # Vite config + env injection
```

## Attribution

- **Original concept/demo:** Infinite Wiki in Google AI Studio by Dev Valladares (@dev_valladares)
- **This repository:** Windows PC port by Mahir29Flame using Tauri
