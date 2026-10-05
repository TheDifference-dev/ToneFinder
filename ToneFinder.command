#!/bin/bash
# ToneFinder başlatıcı (macOS / Linux). Çift tıklayarak çalıştır.
cd "$(dirname "$0")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js bulunamadı. https://nodejs.org adresinden LTS sürümünü kurup tekrar dene."
  open "https://nodejs.org" 2>/dev/null || xdg-open "https://nodejs.org" 2>/dev/null
  read -r -p "Kapatmak için Enter'a bas..."
  exit 1
fi
node scripts/launcher.mjs || read -r -p "Hata oluştu. Kapatmak için Enter'a bas..."
