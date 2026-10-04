#!/bin/bash
# ToneFinder başlatıcı (macOS / Linux). Çift tıklayarak çalıştırabilirsin.
cd "$(dirname "$0")" || exit 1

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js bulunamadı. https://nodejs.org adresinden LTS sürümünü kurup tekrar dene."
  open "https://nodejs.org" 2>/dev/null || xdg-open "https://nodejs.org" 2>/dev/null
  read -r -p "Kapatmak için Enter'a bas..."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "İlk kurulum yapılıyor, bu birkaç dakika sürebilir..."
  npm install || exit 1
fi

if [ ! -f .env.local ]; then
  echo "Anthropic API anahtarı gerekli. https://console.anthropic.com adresinden alabilirsin."
  read -r -s -p "API anahtarını yapıştırıp Enter'a bas: " KEY
  echo
  printf 'ANTHROPIC_API_KEY=%s\n' "$KEY" > .env.local
fi

echo "ToneFinder başlatılıyor... Tarayıcı birazdan açılacak. Kapatmak için Ctrl+C."
( sleep 6; open "http://localhost:3000" 2>/dev/null || xdg-open "http://localhost:3000" 2>/dev/null ) &
npm run dev
