#!/data/data/com.termux/files/usr/bin/bash
# Termux Brain setup — Adrien D. Thomas / ProCityHub
set -e

pkg update -y
pkg install -y python git termux-api

if [ ! -d "$HOME/AGI" ]; then
  git clone https://github.com/ProCityHub/AGI.git "$HOME/AGI"
else
  cd "$HOME/AGI"
  git pull --ff-only || true
fi

cd "$HOME/AGI"

python3 -m venv .venv
. .venv/bin/activate

echo
echo "Smoke test (guards the canonical formula):"
python3 test_brain_cli.py

echo
echo "Ready. Try:"
echo '  python3 brain_cli.py input "hello lattice"'
echo '  python3 brain_cli.py status'
echo '  python3 brain_cli.py diagnose bridge'
echo '  python3 brain_cli.py sync-github'
echo
echo "Give it a phone voice:"
echo '  termux-tts-speak "$(python3 brain_cli.py status | head -2)"'
