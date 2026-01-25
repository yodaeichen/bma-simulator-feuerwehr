#!/bin/bash
set -e

echo "🚒 BMA Simulator Feuerwehr – Installation (Node.js 22)"

# Root prüfen
if [ "$EUID" -ne 0 ]; then
  echo "❌ Bitte als root ausführen (sudo)"
  exit 1
fi

echo "📦 System aktualisieren"
apt update
apt install -y curl git ca-certificates

echo "🟢 Installiere Node.js 22 (NodeSource)"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

echo "🔎 Versionen prüfen"
echo "Node: $(node -v)"
echo "NPM : $(npm -v)"

echo "📁 Installation nach /opt"
cd /opt || exit 1

if [ ! -d "bma-simulator-feuerwehr" ]; then
  echo "📥 Repository klonen"
  git clone https://github.com/yodaeichen/bma-simulator-feuerwehr.git
else
  echo "🔄 Repository existiert bereits"
fi

cd bma-simulator-feuerwehr || exit 1

echo "📦 npm install"
npm install

echo "✅ Installation abgeschlossen"
echo
echo "▶ Start:"
echo "   cd /opt/bma-simulator-feuerwehr"
echo "   npm start"
