# 🌐 Local Chat Web App

A real-time chat application that works over your local network using WebSockets, built with React, Node.js, and Anime.js for smooth animations.

## 🎯 Features

- ✨ Real-time messaging using WebSockets
- 🎨 Beautiful UI with smooth animations (Anime.js)
- 📱 Responsive design (works on phones, tablets, laptops)
- 🌐 Works on local network (no internet required!)
- 👥 Multiple users can chat simultaneously
- 💬 User nicknames
- ⚡ Fast and lightweight

## 🛠️ Tech Stack

- **Frontend**: React.js + Vite
- **Backend**: Node.js + ws (WebSocket library)
- **Animations**: Anime.js
- **Styling**: CSS3

## 📁 Project Structure

```
chat_app/
├── backend/
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── components/
│       │   ├── ChatBox.jsx
│       │   ├── MessageBubble.jsx
│       │   └── InputField.jsx
│       └── styles/
│           └── chat.css
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Install Backend Dependencies**

```powershell
cd backend
npm install
```

2. **Install Frontend Dependencies**

```powershell
cd ../frontend
npm install
```

### Running the Application

#### Step 1: Start the Backend Server

```powershell
cd backend
npm start
```

You should see output like:
```
✅ WebSocket Server running on ws://localhost:3000
📡 Connect from LAN: ws://192.168.1.100:3000
🚀 Server is ready! Waiting for connections...
```

**Important**: Note down the LAN IP address (e.g., `192.168.1.100`)

#### Step 2: Update Frontend Configuration

Open `frontend/src/App.jsx` and update the WebSocket URL:

```javascript
const WEBSOCKET_URL = "ws://192.168.X.X:3000"; // Replace with YOUR LAN IP
```

#### Step 3: Start the Frontend

```powershell
cd frontend
npm run dev
```

You should see:
```
  VITE v5.3.1  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
```

#### Step 4: Access the Chat

- **On the same computer**: Open `http://localhost:5173`
- **On other devices (phones, tablets)**: Open `http://192.168.1.100:5173`

Make sure all devices are connected to the **same Wi-Fi network**!

## 📱 Using the Chat

1. Enter your name on the welcome screen
2. Start chatting! Messages appear in real-time
3. Open the app on multiple devices to see real-time synchronization

## 🎨 Features in Detail

### Animations
- Message fade-in with elastic bounce effect
- Button press animations
- Smooth entrance effects

### UI Features
- Dark mode theme
- Connection status indicator
- Message timestamps
- Auto-scroll to latest messages
- Different styles for your messages vs others
- System notifications

## 🔧 Customization

### Change Color Theme

Edit `frontend/src/styles/chat.css`:

```css
/* Change gradient colors */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add Sound Effects

Install a sound library and add to `MessageBubble.jsx`:

```javascript
const playSound = () => {
  const audio = new Audio('/notification.mp3');
  audio.play();
};
```

### Add Typing Indicator

Track when users are typing and broadcast to other clients.

## 🐛 Troubleshooting

### Can't connect from other devices?

1. Check firewall settings (allow port 3000 and 5173)
2. Verify all devices are on the same Wi-Fi
3. Make sure you're using the correct LAN IP address

### Windows Firewall

If prompted, allow Node.js through the firewall.

Or manually allow ports:
```powershell
New-NetFirewallRule -DisplayName "Chat App Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Chat App Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### WebSocket connection fails?

1. Check if backend is running
2. Verify the WebSocket URL in `App.jsx` matches your server's IP
3. Check browser console for errors (F12)

## 🌟 Future Enhancements

- [ ] Message history persistence
- [ ] Typing indicators
- [ ] Image/file sharing
- [ ] Emoji picker
- [ ] Multiple chat rooms
- [ ] User avatars
- [ ] Message reactions
- [ ] Sound notifications
- [ ] Dark/light theme toggle

## 📄 License

MIT License - feel free to use this project for learning!

## 🤝 Contributing

This is an educational project. Feel free to fork, modify, and experiment!

---

**Happy Coding!** 🚀💬

If you found this helpful, give it a ⭐!
