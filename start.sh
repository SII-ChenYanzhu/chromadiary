#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "🌸 启动个人日记系统..."

# ── 后端 ──────────────────────────────────────────
cd "$SCRIPT_DIR/backend"

if [ ! -d ".venv" ]; then
  echo "📦 创建 Python 虚拟环境..."
  python3 -m venv .venv
fi

source .venv/bin/activate
pip install -r requirements.txt -q

echo "🚀 启动后端 (http://localhost:8000)..."
uvicorn main:app --port 8000 &
BACKEND_PID=$!

# ── 前端 ──────────────────────────────────────────
cd "$SCRIPT_DIR/frontend"

if [ ! -d "node_modules" ]; then
  echo "📦 安装前端依赖（首次运行需要一点时间）..."
  npm install
fi

echo "🎨 启动前端 (http://localhost:5173)..."
npm run dev &
FRONTEND_PID=$!

echo ""
echo "✅ 启动成功！"
echo "   打开浏览器访问: http://localhost:5173"
echo "   后端 API 文档:  http://localhost:8000/docs"
echo ""
echo "   按 Ctrl+C 停止所有服务"
echo ""

# 等待退出信号
trap "echo ''; echo '正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo '已停止。再见！'; exit 0" INT TERM
wait
