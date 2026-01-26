#!/bin/bash
set -e

echo "🚒 BMA Simulator Feuerwehr – Installation (Node.js 22 + systemd)"

# Root prüfen
if [ "$EUID" -ne 0 ]; then
  echo "❌ Bitte als root ausführen (sudo)"
  exit 1
fi

echo "📦 System vorbereiten"
apt update
apt install -y curl git ca-certificates

echo "🟢 Installiere Node.js 22 (NodeSource)"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs

echo "🔎 Versionen:"
node -v
npm -v

echo "📁 Installation nach /opt"
cd /opt

if [ ! -d "bma-simulator-feuerwehr" ]; then
  git clone https://github.com/DEIN_GITHUB_USER/bma-simulator-feuerwehr.git
else
  echo "ℹ Repository existiert bereits"
fi

cd bma-simulator-feuerwehr

echo "📦 npm install"
npm install

echo "⚙️ systemd Service erstellen"

cat << 'EOF' > /etc/systemd/system/bma-simulator.service
[Unit]
Description=BMA Simulator Feuerwehr
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/bma-simulator-feuerwehr
ExecStart=/usr/bin/npm start
Restart=always
RestartSec=5
User=root
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

echo "🔄 systemd neu laden"
systemctl daemon-reexec
systemctl daemon-reload

echo "🚀 Autostart aktivieren & Dienst starten"
systemctl enable bma-simulator.service
systemctl restart bma-simulator.service

echo
echo "✅ Installation abgeschlossen"
echo "🚒 BMA Simulator läuft jetzt als systemd-Dienst"
echo
echo "🔎 Status:"
systemctl status bma-simulator.service --no-pager
echo
echo "🌐 Aufruf:"
echo "   http://<PI-IP>:3000/bmz"
