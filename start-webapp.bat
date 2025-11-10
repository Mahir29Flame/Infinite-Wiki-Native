@echo off  
echo Starting the Infinite Wiki webapp...  
  
REM Navigate to the project directory  
cd /d "C:\Users\Asus\Documents\DevProject-Templates\infinite-wiki"  
  
REM Start the development server in a minimized window  
echo Starting development server...  
start "Vite Server" /min cmd /c "npm run dev"  
  
REM Wait a few seconds for the server to start  
timeout /t 5 /nobreak >nul  
  
REM Open the default browser with the localhost URL  
echo Opening browser at http://localhost:3000...  
start http://localhost:3000  
  
echo The webapp should now be running at http://localhost:3000  
echo To stop the server, close the minimized terminal window or use Task Manager...  
pause >nul 
