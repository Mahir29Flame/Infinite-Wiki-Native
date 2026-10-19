# Infinite Wiki PC

<img width="792" height="744" alt="Screenshot 2026-10-19 175145" src="https://github.com/user-attachments/assets/47ac896d-01d7-4a83-8be9-be6ece13799c" />

Infinite Wiki PC is a desktop port of **Infinite Wiki** for Windows, ported with **Tauri** by **[@Mahir29Flame](https://github.com/Mahir29Flame)**.

The original **Infinite Wiki** was a **Google AI Studio demo** created by **Dev Valladares** ([@dev_valladares](https://x.com/dev_valladares)).  
This repository adapts that concept into a desktop app workflow with a React + TypeScript frontend and a Tauri (Rust) shell.

## What it does

- Generates a concise encyclopedia-style definition for any topic using Gemini flash 2.5.
- Streams text output progressively in the UI.
- Makes words in generated content clickable to continue exploring related topics.
- Generates ASCII art for the current topic.
- Includes a random-topic exploration flow.

## Tech stack

- **Frontend:** React 19, TypeScript, Vite
- **AI SDK:** `@google/genai`
- **Desktop runtime:** Tauri 1.x (Rust backend + web frontend)

## Prerequisites

- Node.js and npm
- Rust toolchain
- Tauri system prerequisites (for desktop builds):  
  https://v1.tauri.app/v1/guides/getting-started/prerequisites
- A Gemini API key

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Provide your Gemini API key (used by the app via Vite env loading):

   ```bash
   # .env.local
   GEMINI_API_KEY=your_api_key_here
   ```

## Run

### Web development

```bash
npm run dev
```

Starts Vite on `http://localhost:3000`.

### Desktop development (Tauri)

```bash
npm run tauri-dev
```

## Build

### Frontend build

```bash
npm run build
```

### Desktop bundle

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
