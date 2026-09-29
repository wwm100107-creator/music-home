#!/data/data/com.termux/files/usr/bin/sh

BOOT_DIR="$HOME/.termux/boot"
PROJECT_DIR="$HOME/music-home"
mkdir -p "$BOOT_DIR"
exec >>"$BOOT_DIR/startup.log" 2>&1

echo "--- Music Home boot startup: $(date) ---"
termux-wake-lock || true

if ! pgrep -f '[s]shd -p 8022' >/dev/null 2>&1; then
  sshd -p 8022 -o PubkeyAuthentication=yes -o PasswordAuthentication=no -o KbdInteractiveAuthentication=no -o AuthenticationMethods=publickey
fi

if ! pgrep -f '[a]uto-sync.sh' >/dev/null 2>&1; then
  nohup bash "$PROJECT_DIR/auto-sync.sh" >> "$BOOT_DIR/auto-sync.log" 2>&1 < /dev/null &
fi

# Give auto-sync up to one minute to bring the Node.js server online.
ATTEMPT=0
while [ "$ATTEMPT" -lt 30 ]; do
  if curl -fsS --max-time 2 http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
    break
  fi
  ATTEMPT=$((ATTEMPT + 1))
  sleep 2
done

if curl -fsS --max-time 2 http://127.0.0.1:3000/api/health >/dev/null 2>&1; then
  if ! pgrep -f '[q]uick-tunnel-supervisor.sh' >/dev/null 2>&1; then
    nohup sh "$BOOT_DIR/quick-tunnel-supervisor.sh" >> "$BOOT_DIR/quick-tunnel-supervisor.log" 2>&1 < /dev/null &
    echo "Started the Cloudflare Quick Tunnel supervisor."
  else
    echo "Cloudflare Quick Tunnel supervisor is already running."
  fi
else
  echo "Node.js did not become ready within 60 seconds; the tunnel was not started."
fi
