#!/bin/bash
# ==============================================================================
# MUSIC HOME - AUTO SYNC DAEMON (Tự động đồng bộ với GitHub như Vercel)
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "================================================="
echo "  🌿 MUSIC HOME AUTO-SYNC DAEMON ĐÃ KÍCH HOẠT"
echo "  ⏱️  Chu kỳ kiểm tra: mỗi 2 phút"
echo "  📦 Thư mục: $DIR"
echo "================================================="

while true; do
  cd "$DIR"
  
  git fetch origin main -q 2>/dev/null
  LOCAL=$(git rev-parse HEAD 2>/dev/null)
  REMOTE=$(git rev-parse origin/main 2>/dev/null)
  
  if [ -n "$LOCAL" ] && [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
    echo "[$(date '+%H:%M:%S')] 🔄 Phát hiện bản cập nhật mới trên GitHub! ($LOCAL -> $REMOTE)"
    echo "[$(date '+%H:%M:%S')] 📥 Đang kéo mã nguồn mới nhất (git pull origin main)..."
    git pull origin main
    
    if git diff --name-only "$LOCAL" "$REMOTE" 2>/dev/null | grep -q "package.json"; then
      echo "[$(date '+%H:%M:%S')] 📦 Phát hiện thay đổi dependencies, đang chạy npm install..."
      npm install --omit=dev --silent
    fi
    
    echo "[$(date '+%H:%M:%S')] 🔄 Đang khởi động lại Node.js Server..."
    pkill -f "node server.js" 2>/dev/null
    sleep 1
    nohup node server.js > server.log 2>&1 &
    echo "[$(date '+%H:%M:%S')] ✅ Đã cập nhật thành công và khởi động lại Server!"
  else
    # Cơ chế tự phục hồi (Self-Healing Watchdog): Đảm bảo server.js luôn hoạt động
    if ! pgrep -f "node server.js" > /dev/null 2>&1 && ! ps aux 2>/dev/null | grep -v grep | grep -q "node server.js"; then
      echo "[$(date '+%H:%M:%S')] ⚠️ Phát hiện server.js chưa chạy! Đang tự động hồi sinh..."
      nohup node server.js > server.log 2>&1 &
      echo "[$(date '+%H:%M:%S')] ✅ Đã khởi động lại server.js thành công!"
    fi
  fi

  sleep 120
done
