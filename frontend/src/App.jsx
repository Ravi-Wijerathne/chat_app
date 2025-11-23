import { useEffect, useState, useRef } from "react";
import anime from "animejs";
import ChatBox from "./components/ChatBox";
import InputField from "./components/InputField";
import Sidebar from "./components/Sidebar";

function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]); // all messages (system, chat, private)
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [connectionError, setConnectionError] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [users, setUsers] = useState([]); // list of connected users {clientId, username}
  const [clientId, setClientId] = useState(null);
  const [activeChatUser, setActiveChatUser] = useState(null); // null => group chat, else user object
  const usernameBoxRef = useRef(null);
  const chatContainerRef = useRef(null);
  
  // IMPORTANT: Use localhost when testing on same computer
  // Use ws://192.168.X.X:3000 when connecting from other devices on LAN
//   const WEBSOCKET_URL = "ws://localhost:3000";
    const WEBSOCKET_URL = "ws://192.168.8.108:3000"; // Your LAN IP address


  // Animate username box entrance
  useEffect(() => {
    if (!isUsernameSet && usernameBoxRef.current) {
      anime({
        targets: usernameBoxRef.current,
        opacity: [0, 1],
        translateY: [-30, 0],
        scale: [0.9, 1],
        easing: "easeOutElastic(1, .6)",
        duration: 800,
        delay: 200
      });
    }
  }, [isUsernameSet]);

  useEffect(() => {
    if (!isUsernameSet) return;

    setConnectionError("");
    console.log("Connecting to WebSocket server...");
    const ws = new WebSocket(WEBSOCKET_URL);

    ws.onopen = () => {
      console.log("✅ Connected to server");
      setConnectionStatus("connected");
      // Send register packet
      ws.send(JSON.stringify({ type: "register", username }));
    };

    ws.onmessage = (e) => {
      let data;
      try { data = JSON.parse(e.data); } catch { return; }
      switch (data.type) {
        case "register_ack": {
          setClientId(data.clientId);
          break;
        }
        case "userlist": {
          setUsers(data.users);
          // If activeChatUser disconnected, reset to group
          if (activeChatUser && !data.users.find(u => u.clientId === activeChatUser.clientId)) {
            setActiveChatUser(null);
          }
          break;
        }
        case "system":
        case "chat":
        case "private":
        case "error": {
          setMessages(prev => [...prev, data]);
          break;
        }
        default:
          break;
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setConnectionStatus("error");
      setConnectionError("Failed to connect to server. Make sure the backend is running!");
    };

    ws.onclose = () => {
      console.log("❌ Disconnected from server");
      setConnectionStatus("disconnected");
      if (connectionStatus !== "error") setConnectionError("Disconnected from server");
    };

    setSocket(ws);
    return () => { if (ws.readyState === WebSocket.OPEN) ws.close(); };
  }, [isUsernameSet]);

  // Animate new messages
  useEffect(() => {
    if (messages.length > 0) {
      anime({
        targets: ".msg:last-child",
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.9, 1],
        easing: "easeOutElastic(1, .8)",
        duration: 600
      });
    }
  }, [messages]);

  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      // Animate username box fade out
      anime({
        targets: usernameBoxRef.current,
        opacity: [1, 0],
        scale: [1, 0.8],
        easing: "easeInQuad",
        duration: 400,
        complete: () => {
          setIsUsernameSet(true);
          setShowChat(true);
        }
      });
    }
  };

  // Animate chat entrance
  useEffect(() => {
    if (showChat && chatContainerRef.current) {
      anime({
        targets: chatContainerRef.current,
        opacity: [0, 1],
        scale: [0.95, 1],
        easing: "easeOutQuad",
        duration: 500
      });
    }
  }, [showChat]);

  const sendMessage = (text) => {
    if (!socket || socket.readyState !== WebSocket.OPEN || !text.trim()) return;
    if (activeChatUser) {
      // private message
      socket.send(JSON.stringify({ type: "private", toId: activeChatUser.clientId, message: text }));
    } else {
      socket.send(JSON.stringify({ type: "chat", message: text }));
    }
  };

  // Username setup screen
  if (!isUsernameSet) {
    console.log("Rendering username screen");
    return (
      <div className="username-container">
        <div className="username-box" ref={usernameBoxRef}>
          <h1>🌐 Local Chat App</h1>
          <p>Enter your name to join the chat</p>
          <form onSubmit={handleUsernameSubmit}>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your name..."
              maxLength={20}
              autoFocus
            />
            <button type="submit">Join Chat 🚀</button>
          </form>
        </div>
      </div>
    );
  }

  // Main chat interface
  console.log("Rendering chat interface. Connection status:", connectionStatus);
  console.log("Messages:", messages);
  return (
    <div className="chat-layout">
      <Sidebar
        users={users}
        selfId={clientId}
        activeUser={activeChatUser}
        onSelectUser={(u) => setActiveChatUser(u)}
        onSelectGroup={() => setActiveChatUser(null)}
        connectionStatus={connectionStatus}
      />
      <div className="chat-container" ref={chatContainerRef}>
        <div className="chat-header">
          <h2>{activeChatUser ? `🔒 Chat with ${activeChatUser.username}` : "💬 Group Chat"}</h2>
          <div className="status-indicator">
            <span className={`status-dot ${connectionStatus}`}></span>
            <span>{connectionStatus === "connected" ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
        {connectionError && (<div className="error-banner">⚠️ {connectionError}</div>)}
        <ChatBox
          messages={messages}
          currentUsername={username}
          mode={activeChatUser ? 'private' : 'group'}
          peerUser={activeChatUser}
          selfId={clientId}
        />
        <InputField onSend={sendMessage} />
      </div>
    </div>
  );
}

export default App;
