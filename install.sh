#!/bin/bash
set -e

echo "🚒 BMA Simulator Feuerwehr – Installation"

if [ "$EUID" -ne 0 ]; then
  echo "❌ Bitte als root ausführen (sudo)"
  exit 1
fi

apt update
apt install -y nodejs npm git

cd /opt || exit 1

if [ ! -d "bma-simulator-feuerwehr" ]; then
  git clone https://github.com/yodaeichen/bma-simulator-feuerwehr.git
fi

cd bma-simulator-feuerwehr || exit 1

npm install

echo "✅ Installation abgeschlossen"
echo "👉 Start mit: npm start"
