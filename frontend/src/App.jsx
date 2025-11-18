import { useEffect, useState, useRef } from "react";
import anime from "animejs";
import ChatBox from "./components/ChatBox";
import InputField from "./components/InputField";

function App() {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState("");
  const [isUsernameSet, setIsUsernameSet] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("disconnected");
  const [connectionError, setConnectionError] = useState("");
  const [showChat, setShowChat] = useState(false);
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
    
    setConnectionError(""); // Clear any previous errors

    console.log("Connecting to WebSocket server...");
    const ws = new WebSocket(WEBSOCKET_URL);
    
    ws.onopen = () => {
      console.log("✅ Connected to server");
      setConnectionStatus("connected");
    };

    ws.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setMessages(prev => [...prev, data]);
      } catch (error) {
        console.error("Error parsing message:", error);
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
      if (connectionStatus !== "error") {
        setConnectionError("Disconnected from server");
      }
    };

    setSocket(ws);

    return () => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
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
    if (socket && socket.readyState === WebSocket.OPEN && text.trim()) {
      const message = {
        username: username,
        message: text
      };
      socket.send(JSON.stringify(message));
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
    <div className="chat-container" ref={chatContainerRef}>
      <div className="chat-header">
        <h2>💬 Local Chat</h2>
        <div className="status-indicator">
          <span className={`status-dot ${connectionStatus}`}></span>
          <span>{connectionStatus === "connected" ? "Connected" : "Disconnected"}</span>
        </div>
      </div>

      {connectionError && (
        <div className="error-banner">
          ⚠️ {connectionError}
        </div>
      )}

      <ChatBox messages={messages} currentUsername={username} />
      <InputField onSend={sendMessage} />
    </div>
  );
}

export default App;
