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

**Windows:**
```bash
start_chat_app.bat
```

**Linux/macOS:**
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
- Open http://192.168.8.108:5173

Then:
1. Enter username
2. Start chatting
