@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js bulunamadi. https://nodejs.org adresinden LTS surumunu kurup tekrar dene.
  start https://nodejs.org
  pause
  exit /b 1
)
node scripts\create-shortcut.mjs
pause
