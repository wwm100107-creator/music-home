#!/bin/bash
# ==============================================================================
# MUSIC HOME - AUTO SYNC DAEMON
# Checks GitHub every two minutes, installs locked dependencies, and restarts Node.
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR" || exit 1

CHECK_INTERVAL=120
# Match both `node server.js` and `node /absolute/path/server.js` on Termux.
NODE_SERVER_PATTERN='node .*server\.js'
PENDING_RESTART=0
PENDING_DEPENDENCIES=0

log() {
  echo "[$(date '+%H:%M:%S')] $*"
}

server_pids() {
  for pid in $(pgrep -f "$NODE_SERVER_PATTERN" 2>/dev/null); do
    process_dir=$(readlink "/proc/$pid/cwd" 2>/dev/null) || continue
    if [ "$process_dir" = "$DIR" ]; then
      echo "$pid"
    fi
  done
}

server_running() {
  [ -n "$(server_pids)" ]
}

stop_server() {
  pids=$(server_pids)
  if [ -z "$pids" ]; then
    return 0
  fi

  # Only stop a Node process whose working directory is this project.
  kill $pids 2>/dev/null || true

  # Give Node time to release port 3000 before starting its replacement.
  for _ in 1 2 3 4 5 6 7 8 9 10; do
    if ! server_running; then
      return 0
    fi
    sleep 0.5
  done

  log "⚠️ Node.js server did not stop; skipping restart to avoid EADDRINUSE."
  return 1
}

start_server() {
  nohup node server.js >> server.log 2>&1 &
  SERVER_PID=$!
  sleep 2

  if kill -0 "$SERVER_PID" 2>/dev/null; then
    log "✅ Node.js server started (PID $SERVER_PID)."
    return 0
  fi

  log "❌ Node.js server failed to start. Recent log output:"
  tail -n 20 server.log 2>/dev/null || true
  return 1
}

echo "================================================="
echo "  🌿 MUSIC HOME AUTO-SYNC DAEMON ĐÃ KÍCH HOẠT"
echo "  ⏱️  Chu kỳ kiểm tra: mỗi 2 phút"
echo "  📦 Thư mục: $DIR"
echo "================================================="

while true; do
  cd "$DIR" || exit 1

  if ! git fetch origin main -q 2>/dev/null; then
    log "⚠️ Không lấy được trạng thái GitHub; sẽ thử lại sau $CHECK_INTERVAL giây."
  else
    LOCAL=$(git rev-parse HEAD 2>/dev/null)
    REMOTE=$(git rev-parse origin/main 2>/dev/null)

    if [ -n "$LOCAL" ] && [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
      log "🔄 Có bản cập nhật mới trên GitHub ($LOCAL -> $REMOTE)."

      if git pull --ff-only origin main; then
        PENDING_RESTART=1

        if git diff --name-only "$LOCAL" "$REMOTE" -- package.json package-lock.json | grep -q .; then
          PENDING_DEPENDENCIES=1
        fi
      else
        log "❌ Cập nhật bị dừng. Hãy kiểm tra thay đổi cục bộ trong thư mục dự án."
      fi
    fi
  fi

  # npm ci follows package-lock.json exactly and does not rewrite it, avoiding
  # the local package-lock changes that previously blocked `git pull` on Android.
  if [ "$PENDING_DEPENDENCIES" -eq 1 ]; then
    log "📦 Đang cài dependencies theo package-lock.json..."
    if npm ci --omit=dev --silent; then
      PENDING_DEPENDENCIES=0
    else
      log "❌ Cài dependencies thất bại; sẽ thử lại ở chu kỳ kế tiếp."
      sleep "$CHECK_INTERVAL"
      continue
    fi
  fi

  if [ "$PENDING_RESTART" -eq 1 ]; then
    log "🔄 Đang khởi động lại Node.js server..."
    if stop_server && start_server; then
      PENDING_RESTART=0
    else
      log "⚠️ Chưa khởi động lại được; sẽ thử lại ở chu kỳ kế tiếp."
    fi
  elif ! server_running; then
    # Self-healing watchdog for an unexpectedly stopped server.
    log "⚠️ Không thấy Node.js server; đang khởi động lại..."
    start_server || true
  fi

  sleep "$CHECK_INTERVAL"
done
