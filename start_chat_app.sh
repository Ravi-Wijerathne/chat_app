#!/bin/bash

# =============================================
#  Local Chat App Automated Startup Script
# =============================================

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
FRONTEND_PORT=5173

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=================================================="
echo "  Local Chat App Auto Starter"
echo "=================================================="

# Check Node.js
echo "[1/7] Checking Node.js installation..."
if ! command -v node &> /dev/null; then
  echo -e "  ${RED}ERROR: Node.js not found. Install from https://nodejs.org/${NC}"
  exit 1
fi
NODE_VERSION=$(node -v)
echo -e "  ${GREEN}Found Node.js version $NODE_VERSION${NC}"

# Check npm
echo "[2/7] Checking npm installation..."
if ! command -v npm &> /dev/null; then
  echo -e "  ${RED}ERROR: npm not found.${NC}"
  exit 1
fi
NPM_VERSION=$(npm -v)
echo -e "  ${GREEN}Found npm version $NPM_VERSION${NC}"

# Check backend dependencies
echo "[3/7] Checking backend dependencies..."
if [ ! -d "$BACKEND_DIR/node_modules" ]; then
  echo "  Installing backend dependencies..."
  cd "$BACKEND_DIR"
  npm install
  if [ $? -ne 0 ]; then
    echo -e "  ${RED}ERROR: Backend dependency installation failed.${NC}"
    exit 1
  fi
  cd "$ROOT_DIR"
else
  echo -e "  ${GREEN}Backend dependencies already installed.${NC}"
fi

# Check frontend dependencies
echo "[4/7] Checking frontend dependencies..."
if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "  Installing frontend dependencies..."
  cd "$FRONTEND_DIR"
  npm install
  if [ $? -ne 0 ]; then
    echo -e "  ${RED}ERROR: Frontend dependency installation failed.${NC}"
    exit 1
  fi
  cd "$ROOT_DIR"
else
  echo -e "  ${GREEN}Frontend dependencies already installed.${NC}"
fi

# Start backend
echo "[5/7] Starting backend server (nodemon)..."
cd "$BACKEND_DIR"
gnome-terminal --tab --title="chat-backend" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -T "chat-backend" -e "cd '$BACKEND_DIR' && npm run dev; bash" 2>/dev/null || \
osascript -e "tell application \"Terminal\" to do script \"cd '$BACKEND_DIR' && npm run dev\"" 2>/dev/null || \
(cd "$BACKEND_DIR" && npm run dev &)

# Wait a bit for backend
sleep 3

# Start frontend
echo "[6/7] Starting frontend dev server (Vite)..."
cd "$FRONTEND_DIR"
gnome-terminal --tab --title="chat-frontend" -- bash -c "npm run dev; exec bash" 2>/dev/null || \
xterm -T "chat-frontend" -e "cd '$FRONTEND_DIR' && npm run dev; bash" 2>/dev/null || \
osascript -e "tell application \"Terminal\" to do script \"cd '$FRONTEND_DIR' && npm run dev\"" 2>/dev/null || \
(cd "$FRONTEND_DIR" && npm run dev &)

# Wait for frontend to start
echo "  Waiting for frontend to start..."
sleep 5

# Get LAN IP
echo "[7/7] Determining LAN IP..."
if command -v ip &> /dev/null; then
  LAN_IP=$(ip route get 1 2>/dev/null | awk '{print $7; exit}')
elif command -v ifconfig &> /dev/null; then
  LAN_IP=$(ifconfig | grep -Eo 'inet (addr:)?([0-9]*\.){3}[0-9]*' | grep -Eo '([0-9]*\.){3}[0-9]*' | grep -v '127.0.0.1' | head -n1)
else
  LAN_IP="localhost"
fi

if [ -z "$LAN_IP" ]; then
  LAN_IP="localhost"
fi

LOCAL_URL="http://localhost:$FRONTEND_PORT"
LAN_URL="http://$LAN_IP:$FRONTEND_PORT"

# Open browsers
echo "  Opening browser:"
echo "    Local: $LOCAL_URL"
echo "    LAN:   $LAN_URL"

if command -v xdg-open &> /dev/null; then
  xdg-open "$LOCAL_URL" &> /dev/null &
  xdg-open "$LAN_URL" &> /dev/null &
elif command -v open &> /dev/null; then
  open "$LOCAL_URL" &
  open "$LAN_URL" &
elif command -v sensible-browser &> /dev/null; then
  sensible-browser "$LOCAL_URL" &> /dev/null &
  sensible-browser "$LAN_URL" &> /dev/null &
fi

echo "--------------------------------------------------"
echo "  Startup complete!"
echo "  Press Ctrl+C or close terminal windows to stop servers."
echo "--------------------------------------------------"

cd "$ROOT_DIR"

# Keep script running
read -p "Press Enter to exit..."
