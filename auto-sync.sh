#!/bin/bash
# ==============================================================================
# MUSIC HOME - AUTO SYNC DAEMON (Tự động đồng bộ với GitHub như Vercel)
# ==============================================================================

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "================================================="
echo "  🌿 MUSIC HOME AUTO-SYNC DAEMON ĐÃ KÍCH HOẠT"
echo "  ⏱️  Chu kỳ kiểm tra: mỗi 10 phút"
echo "  📦 Thư mục: $DIR"
echo "================================================="

while true; do
  sleep 600
  cd "$DIR"
  
  git fetch origin main -q 2>/dev/null
  LOCAL=$(git rev-parse HEAD 2>/dev/null)
  REMOTE=$(git rev-parse origin/main 2>/dev/null)
  
  if [ -n "$LOCAL" ] && [ -n "$REMOTE" ] && [ "$LOCAL" != "$REMOTE" ]; then
    echo "[$(date '+%H:%M:%S')] 🔄 Phát hiện bản cập nhật mới trên GitHub! Đang đồng bộ..."
    git pull origin main
    
    if git diff --name-only "$LOCAL" "$REMOTE" | grep -q "package.json"; then
      echo "[$(date '+%H:%M:%S')] 📦 Cập nhật dependencies (npm install)..."
      npm install --omit=dev --silent
    fi
    
    pkill -f "node server.js" 2>/dev/null
    sleep 1
    node server.js > server.log 2>&1 &
    echo "[$(date '+%H:%M:%S')] ✅ Đã cập nhật thành công và khởi động lại Server!"
  fi
done
