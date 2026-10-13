@echo off
chcp 65001 >nul
title ToneFinder - Uzaktan Kontrol
cd /d "%~dp0"

where claude >/dev/null 2>nul
if errorlevel 1 (
  echo Claude Code bulunamadi. PowerShellde su komutla kur:
  echo   irm https://claude.ai/install.ps1 ^| iex
  pause
  exit /b 1
)

echo Bu pencere acik kaldikca ToneFinder klasoru telefondan ve claude.aidan yonetilebilir.
echo Kapatmak icin pencereyi kapat.
claude remote-control
if errorlevel 1 pause
