#!/bin/bash
# ============================================
# Start Script
# Launches both backend and frontend servers
# ============================================

set -e

echo "🔒 Starting SecureVault Application..."
echo ""

# Colors
GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Save root directory
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Start backend
echo -e "${CYAN}🚀 Starting backend server...${NC}"
cd "$ROOT_DIR/server"
npm run dev &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
sleep 2

# Start frontend
echo -e "${CYAN}🚀 Starting frontend dev server...${NC}"
cd "$ROOT_DIR/client"
npm run dev -- --force &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}🎉 Application is running!${NC}"
echo -e "   Frontend: ${CYAN}http://localhost:5173${NC}"
echo -e "   Backend:  ${CYAN}http://localhost:5000${NC}"
echo -e "   Health:   ${CYAN}http://localhost:5000/api/health${NC}"
echo ""
echo "Press Ctrl+C to stop both servers."

# Cleanup on exit
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo 'Servers stopped.'; exit 0" SIGINT SIGTERM

# Wait for any process to exit
wait
