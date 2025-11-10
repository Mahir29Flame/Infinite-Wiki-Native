# Infinite Wiki PC

This is a desktop version of the Infinite Wiki application built with Tauri and React. The project is configured to run as a standalone desktop application that provides the same functionality as the web version but as a native application.

## Prerequisites

Before running this application, ensure you have the following installed:

1. **Node.js** (v18 or higher)
2. **Rust** (stable toolchain)
3. **Visual Studio Build Tools** with C++ build tools (for Windows)

For Windows, install Visual Studio Build Tools from: https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022

## Configuration

1. Copy your `.env.local` file from the original project to this directory with your Gemini API key configured.

2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure you have Rust installed with the appropriate target:
   ```bash
   rustup target add x86_64-pc-windows-msvc
   ```

## Development

To run the application in development mode:

```bash
npm run tauri dev
```

This will start both the frontend development server and the Tauri application.

## Building

To build the application for production:

```bash
npm run tauri build
```

This will create a distributable executable in the `src-tauri/target/release` directory.

## Project Structure

- `src/` - React source files
- `src-tauri/` - Rust backend code for Tauri
- `tauri.conf.json` - Tauri configuration
- `vite.config.ts` - Vite build configuration
- `index.html` - Main HTML entry point

## Features

- Desktop version of the Infinite Wiki
- All links are functional within the app
- Real-time content generation via the Gemini API
- ASCII art generation for topics
- Responsive design optimized for desktop use

## Troubleshooting

1. If you encounter build errors, ensure that Visual Studio Build Tools are properly installed with C++ build tools.

2. Make sure your API key is set in `.env.local` file.

3. On Windows, if you get linker errors, ensure you have the Windows SDK installed as part of your Visual Studio Build Tools.

## Next Steps

After installing the required dependencies and build tools, you can run the application with:
```bash
npm run tauri dev
```

The application will open as a native desktop window with all the functionality of the web-based Infinite Wiki.