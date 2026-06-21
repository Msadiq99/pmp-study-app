#!/bin/bash
set -e

echo "PMP Study App - Setup Script"
echo "============================"

export PATH="$HOME/.local/node/bin:$PATH"

PROJECT_DIR="$HOME/Documents/pmp-study-app"

echo ""
echo "1. Starting Docker services..."
cd "$PROJECT_DIR"
docker compose up -d postgres redis

echo ""
echo "2. Waiting for PostgreSQL to be ready..."
sleep 5

echo ""
echo "3. Installing Python dependencies..."
cd "$PROJECT_DIR/backend"
pip3 install -r requirements.txt

echo ""
echo "4. Starting Ollama (pulling llama3.2 model)..."
docker compose up -d ollama
sleep 5
docker exec pmp-ollama ollama pull llama3.2 2>/dev/null || echo "Note: You may need to pull the model manually: docker exec pmp-ollama ollama pull llama3.2"

echo ""
echo "5. Installing frontend dependencies..."
cd "$PROJECT_DIR/frontend"
npm install

echo ""
echo "6. Starting backend server..."
cd "$PROJECT_DIR/backend"
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
sleep 3

echo ""
echo "7. Seeding PMBOK data..."
cd "$PROJECT_DIR"
python3 scripts/seed_pmbok.py 2>/dev/null || echo "Note: Seed script may need async session update"

echo ""
echo "8. Starting frontend dev server..."
cd "$PROJECT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "============================================"
echo "PMP Study App is starting up!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:8000"
echo "API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo "============================================"

wait $BACKEND_PID $FRONTEND_PID
