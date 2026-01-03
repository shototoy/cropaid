@echo off
REM Railway configuration script for CropAid

echo Setting up Railway services...

REM Navigate to project directory
cd /d "C:\Users\USER\OneDrive\Desktop\cropaid\cropaid"

echo.
echo === Setting variables for cropaid-api (Backend) ===
railway variables --service cropaid-api --set "JWT_SECRET=cropaid-secret-key-2024" --set "PORT=3000" --set "NODE_ENV=production"

echo.
echo === Generating domain for cropaid-api ===
railway domain --service cropaid-api --port 3000

echo.
echo === Setting variables for cropaid-web (Frontend) ===
REM Note: VITE_API_URL will need to be set after getting the API domain

echo.
echo Done! Check the output above for your domains.
pause
