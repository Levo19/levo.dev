#!/usr/bin/env bash
# Levo.dev backend — deploy con clasp (mantiene la misma URL)
# Uso desde gas/: bash deploy.sh
set -e
cd "$(dirname "$0")"
echo "📤 Subiendo Code.gs..."
clasp push --force
echo "🚀 Actualizando deployment..."
clasp deploy -i AKfycbwUrROfitdW0diXmCos-81ZK9shn872nFYxPHBIGBC_BkszURaUPsvuxyKGrvhZxPH2 -d "Levo.dev — $(date +'%Y-%m-%d %H:%M')"
echo "✅ Listo. URL: https://script.google.com/macros/s/AKfycbwUrROfitdW0diXmCos-81ZK9shn872nFYxPHBIGBC_BkszURaUPsvuxyKGrvhZxPH2/exec"
