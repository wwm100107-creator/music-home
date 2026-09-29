#!/data/data/com.termux/files/usr/bin/sh

BOOT_DIR="$HOME/.termux/boot"
CONFIG_FILE="$HOME/.config/music-home-link-relay.env"
TUNNEL_LOG="$BOOT_DIR/cloudflared.log"
PROJECT_URL="http://127.0.0.1:3000"

mkdir -p "$BOOT_DIR"

LINK_RELAY_URL=""
LINK_RELAY_TOKEN=""
if [ -f "$CONFIG_FILE" ]; then
  set -a
  . "$CONFIG_FILE"
  set +a
fi

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

post_origin() {
  [ -n "$LINK_RELAY_URL" ] && [ -n "$LINK_RELAY_TOKEN" ] || return 1
  curl -fsS --max-time 12 \
    -X POST "$LINK_RELAY_URL/_link/update" \
    -H "Authorization: Bearer $LINK_RELAY_TOKEN" \
    -H 'Content-Type: application/json' \
    --data "$1" >/dev/null
}

publish_origin() {
  origin="$1"
  attempt=0
  while [ "$attempt" -lt 12 ]; do
    if post_origin "{\"origin\":\"$origin\"}"; then
      log "Stable public link now points to the active Quick Tunnel."
      return 0
    fi
    attempt=$((attempt + 1))
    log "Could not publish the current tunnel yet; retry $attempt/12."
    sleep 10
  done
  return 1
}

clear_origin() {
  if [ -n "$LINK_RELAY_URL" ] && [ -n "$LINK_RELAY_TOKEN" ]; then
    post_origin '{"origin":null}' || log "Could not clear the old link; it will be retried on the next start."
  fi
}

read_tunnel_url() {
  [ -f "$TUNNEL_LOG" ] || return 0
  grep -oE 'https://[[:alnum:]-]+\.trycloudflare\.com' "$TUNNEL_LOG" 2>/dev/null | head -n 1 | tr -d '\r'
}

find_existing_tunnel_pid() {
  pgrep -f '[c]loudflared.*http://127\.0\.0\.1:3000' 2>/dev/null | head -n 1
}

start_new_tunnel() {
  : > "$TUNNEL_LOG"
  cloudflared tunnel --url "$PROJECT_URL" >> "$TUNNEL_LOG" 2>&1 &
  TUNNEL_PID=$!
  log "Started Cloudflare Quick Tunnel (PID $TUNNEL_PID)."
}

if [ -z "$LINK_RELAY_URL" ] || [ -z "$LINK_RELAY_TOKEN" ]; then
  log "Stable-link credentials are not installed yet; tunnel will run without publishing its URL."
fi

while true; do
  if ! curl -fsS --max-time 3 "$PROJECT_URL/api/health" >/dev/null 2>&1; then
    log "Music Home server is not ready; waiting before starting the tunnel."
    sleep 5
    continue
  fi

  clear_origin
  TUNNEL_PID="$(find_existing_tunnel_pid)"
  if [ -n "$TUNNEL_PID" ]; then
    log "Taking over the existing Cloudflare Tunnel (PID $TUNNEL_PID)."
  else
    start_new_tunnel
  fi

  ATTEMPT=0
  TUNNEL_URL=""
  while kill -0 "$TUNNEL_PID" 2>/dev/null && [ "$ATTEMPT" -lt 90 ]; do
    TUNNEL_URL="$(read_tunnel_url)"
    [ -n "$TUNNEL_URL" ] && break
    ATTEMPT=$((ATTEMPT + 1))
    sleep 2
  done

  if [ -n "$TUNNEL_URL" ]; then
    log "Cloudflare Quick Tunnel is ready."
    publish_origin "$TUNNEL_URL" || true
  else
    log "Tunnel did not publish a trycloudflare.com URL within three minutes."
    kill "$TUNNEL_PID" 2>/dev/null || true
  fi

  while kill -0 "$TUNNEL_PID" 2>/dev/null; do
    sleep 5
  done

  clear_origin
  log "Cloudflare Tunnel stopped; retrying in five seconds."
  sleep 5
done
