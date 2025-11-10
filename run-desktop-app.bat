@echo off
echo Installing dependencies...
npm install

echo.
echo To run the desktop application in development mode:
echo npm run tauri-dev
echo.
echo To build the desktop application:
echo npm run tauri-build
echo.
echo Please ensure you have:
echo 1. Visual Studio Build Tools with C++ support installed
echo 2. A valid GEMINI_API_KEY in your .env.local file
echo.
echo Press any key to exit...
pause >nul