@echo off
chcp 65001 >nul
title ToneFinder
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js bulunamadi. Lutfen https://nodejs.org adresinden LTS surumunu kurup tekrar deneyin.
  start https://nodejs.org
  pause
  exit /b 1
)

if not exist node_modules (
  echo Ilk kurulum yapiliyor, bu birkac dakika surebilir...
  call npm install || (pause & exit /b 1)
)

if not exist .env.local (
  echo.
  echo Anthropic API anahtari gerekli. https://console.anthropic.com adresinden alabilirsiniz.
  set /p KEY=API anahtarinizi yapistirin ve Enter'a basin: 
  call echo ANTHROPIC_API_KEY=%%KEY%%> .env.local
)

echo ToneFinder baslatiliyor... Tarayici birazdan acilacak. Kapatmak icin bu pencereyi kapatin.
start "" cmd /c "timeout /t 6 >nul & start http://localhost:3000"
call npm run dev
