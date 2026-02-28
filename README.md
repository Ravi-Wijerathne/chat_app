# Local Chat App

Real-time chat application for local networks using WebSockets.

## Features

- Real-time messaging with WebSockets
- Group chat and private messaging
- Emoji picker with macOS-style UI
- Responsive design
- Animated UI

## Tech Stack

- Frontend: React + Vite + Anime.js
- Backend: Node.js + ws

## Quick Start

**Cross-platform (Python 3 — recommended):**
```bash
python start_chat_app.py
```
`start_chat_app.py` is a cross-platform automated startup script that checks every prerequisite, offers to install missing ones, and launches both the backend and frontend automatically. It works on Windows, Linux, and macOS.

**Windows (batch):**
```bash
start_chat_app.bat
```

**Linux/macOS (shell):**
```bash
./start_chat_app.sh
```

## Manual Setup

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## Usage

**Host device:**
- Open http://localhost:5173

**Other devices on network:**
- Open http://192.X.X.X:5173 (Replace with your IP Address)

Then:
1. Enter username
2. Start chatting
