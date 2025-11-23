# 🌐 Local Chat Web App

A real-time chat application that works over your local network using WebSockets, built with React, Node.js, and Anime.js for smooth animations.

## 🎯 Features

- ✨ Real-time messaging using WebSockets
- 🎨 Beautiful UI with smooth animations (Anime.js)
- 📱 Fully responsive design (works on phones, tablets, laptops)
- 🌐 Works on local network (no internet required!)
- 👥 Multiple users can chat simultaneously
- 💬 User registration with unique nicknames
- 🔒 Private messaging (1-on-1 chats)
- 💬 Group chat functionality
- 📋 Live user list showing online members
- 🎯 User selection for private conversations
- ⚡ Fast and lightweight
- 🚀 Automated startup script (Windows)

## 🛠️ Tech Stack

- **Frontend**: React.js + Vite
- **Backend**: Node.js + ws (WebSocket library) + nodemon
- **Animations**: Anime.js
- **Styling**: CSS3 with responsive media queries

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
│       │   ├── Sidebar.jsx          # User list & chat selection
│       │   ├── ChatBox.jsx
│       │   ├── MessageBubble.jsx
│       │   └── InputField.jsx
│       └── styles/
│           └── chat.css
├── start_chat_app.bat              # Automated startup script
├── .gitignore
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Windows OS (for automated startup script)

### Quick Start (Automated - Windows Only)

Simply run the automated startup script:

```powershell
.\start_chat_app.bat
```

This script will:
1. ✅ Check for Node.js and npm installation
2. 📦 Install dependencies (if needed)
3. 🚀 Start backend server with nodemon
4. 🎨 Start frontend dev server with Vite
5. 🌐 Detect your LAN IP automatically
6. 🌍 Open browsers for both localhost and LAN access

### Manual Installation

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

### Running the Application Manually

#### Step 1: Start the Backend Server

```powershell
cd backend
npm run dev
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

1. **Enter Your Username**: On the welcome screen, enter your unique username
2. **Select Chat Mode**:
   - Click **"Group Chat"** to participate in the main group conversation
   - Click on any **user name** from the sidebar to start a private 1-on-1 chat
3. **Send Messages**: Type your message and click "Send" or press Enter
4. **Switch Between Chats**: Click different users or "Group Chat" to switch conversations
5. **Real-time Updates**: See live user list updates as people join/leave
6. **Mobile Support**: Works seamlessly on phones in both portrait and landscape modes

## 🎨 Features in Detail

### Group Chat
- Broadcast messages to all connected users
- See system notifications when users join/leave
- Real-time message synchronization across all devices

### Private Messaging
- Secure 1-on-1 conversations between users
- Messages only visible to sender and recipient
- Clear indication of who you're chatting with
- Labeled as "You → Username" or "Username → You"

### User Management
- Automatic user registration on connection
- Live user list showing all online members
- Your own name is filtered out from the user list
- Auto-disconnect detection when users leave

### Responsive Design
- **Desktop**: Sidebar on left, chat area on right
- **Mobile Portrait**: Horizontal scrollable user list at top
- **Mobile Landscape**: Vertical sidebar on left
- **Adaptive layouts** for phones, tablets, and laptops
- Touch-friendly scrolling and interactions

### Animations
- Message fade-in with elastic bounce effect
- Button press animations
- Smooth entrance effects
- Status indicator pulse animation

### UI Features
- Dark mode theme
- Connection status indicator (Connected/Disconnected/Error)
- Message timestamps
- Auto-scroll to latest messages
- Different styles for your messages vs others
- System notifications
- Active chat highlighting in sidebar

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

### Automated Script Issues (Windows)

**Script won't run:**
- Right-click the file → Properties → Unblock
- Run PowerShell as Administrator if needed

**Node.js not found:**
- Install Node.js from https://nodejs.org/
- Restart your terminal after installation

### Can't connect from other devices?

1. Check firewall settings (allow port 3000 and 5173)
2. Verify all devices are on the same Wi-Fi
3. Make sure you're using the correct LAN IP address
4. Ensure backend server is running (check terminal for WebSocket server message)

### Windows Firewall

If prompted, allow Node.js through the firewall.

Or manually allow ports:
```powershell
New-NetFirewallRule -DisplayName "Chat App Backend" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
New-NetFirewallRule -DisplayName "Chat App Frontend" -Direction Inbound -LocalPort 5173 -Protocol TCP -Action Allow
```

### WebSocket connection fails?

1. Check if backend is running (should show ✅ WebSocket Server running)
2. Verify the WebSocket URL in `App.jsx` matches your server's IP
3. Check browser console for errors (F12)
4. Try using localhost first to isolate network issues

### Messages not showing?

1. Check browser console for errors
2. Verify WebSocket connection status (green dot = connected)
3. Refresh the page
4. Check if username was registered successfully

### Private messages not working?

1. Ensure both users are registered and online
2. Click on the specific user's name in the sidebar
3. Check that you're not in Group Chat mode
4. Verify in console that clientId matching is working

### Mobile display issues?

1. Clear browser cache
2. Ensure viewport meta tag is present in index.html
3. Try both portrait and landscape orientations
4. Check browser developer tools for CSS errors

## 🌟 Future Enhancements

- [ ] Message history persistence (database integration)
- [ ] Typing indicators ("User is typing...")
- [ ] Image/file sharing capability
- [ ] Emoji picker
- [ ] Multiple chat rooms/channels
- [ ] User avatars with upload feature
- [ ] Message reactions (👍, ❤️, etc.)
- [ ] Sound notifications
- [ ] Dark/light theme toggle
- [ ] Read receipts
- [ ] Message search functionality
- [ ] User profiles
- [ ] Authentication system
- [ ] Message encryption
- [ ] Desktop notifications
- [ ] PWA support (installable app)

## 📄 License

MIT License - feel free to use this project for learning!

## 🤝 Contributing

This is an educational project. Feel free to fork, modify, and experiment!

---

**Happy Coding!** 🚀💬

If you found this helpful, give it a ⭐!
