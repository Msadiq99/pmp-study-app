#!/bin/bash
set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_DIR="$( dirname "$SCRIPT_DIR" )"

echo "============================================"
echo "  PMP Study App - Startup Script"
echo "============================================"
echo ""

# Load .env
if [ -f "$PROJECT_DIR/backend/.env" ]; then
    export $(grep -v '^#' "$PROJECT_DIR/backend/.env" | xargs)
fi

LLM_PROVIDER=${LLM_PROVIDER:-ollama_local}

echo "LLM Provider: $LLM_PROVIDER"
echo ""

# 1. Start Docker services (always need postgres + redis)
echo "[1/6] Starting PostgreSQL and Redis..."
cd "$PROJECT_DIR"
docker compose up -d postgres redis
sleep 3

# 2. Start Ollama if using local
if [ "$LLM_PROVIDER" = "ollama_local" ]; then
    echo "[2/6] Starting Ollama (local)..."
    docker compose --profile ollama up -d ollama
    sleep 5
    echo "Pulling model: ${OLLAMA_MODEL:-llama3.2}..."
    docker exec pmp-ollama ollama pull "${OLLAMA_MODEL:-llama3.2}" 2>/dev/null || echo "  (model pull skipped - pull manually with: docker exec pmp-ollama ollama pull ${OLLAMA_MODEL:-llama3.2})"
else
    echo "[2/6] Skipping Ollama (using $LLM_PROVIDER)"
fi

# 3. Install Python dependencies
echo "[3/6] Installing Python dependencies..."
cd "$PROJECT_DIR/backend"
pip3 install -r requirements.txt -q

# 4. Install frontend dependencies
echo "[4/6] Installing frontend dependencies..."
cd "$PROJECT_DIR/frontend"
npm install --silent 2>/dev/null

# 5. Start backend
echo "[5/6] Starting backend server..."
cd "$PROJECT_DIR/backend"
python3 "$PROJECT_DIR/scripts/seed_pmbok.py"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
sleep 3

# 6. Start frontend
echo "[6/6] Starting frontend dev server..."
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "  PMP Study App is running!"
echo ""
echo "  Frontend:    http://localhost:3000"
echo "  Backend API: http://localhost:8000"
echo "  API Docs:    http://localhost:8000/docs"
echo ""
echo "  LLM Provider: $LLM_PROVIDER"
if [ "$LLM_PROVIDER" = "ollama_local" ]; then
    echo "  Ollama:       http://localhost:11434"
elif [ "$LLM_PROVIDER" = "claude" ]; then
    echo "  Claude Model: ${CLAUDE_MODEL:-claude-sonnet-4-20250514}"
fi
echo ""
echo "  Press Ctrl+C to stop all services"
echo "============================================"

wait $BACKEND_PID $FRONTEND_PID
