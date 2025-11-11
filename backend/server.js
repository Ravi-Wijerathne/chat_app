import { WebSocketServer } from "ws";
import os from "os";

const PORT = 3000;
const wss = new WebSocketServer({ port: PORT });

console.log(`✅ WebSocket Server running on ws://localhost:${PORT}`);

// Get LAN IP for local connections
const interfaces = os.networkInterfaces();
for (const name in interfaces) {
  for (const iface of interfaces[name]) {
    if (iface.family === "IPv4" && !iface.internal) {
      console.log(`📡 Connect from LAN: ws://${iface.address}:${PORT}`);
    }
  }
}

// Store connected clients with metadata
const clients = new Map();

wss.on("connection", (ws) => {
  const clientId = Date.now();
  clients.set(clientId, ws);
  
  console.log(`✨ New client connected (ID: ${clientId})`);
  console.log(`👥 Total clients: ${clients.size}`);

  // Send welcome message
  ws.send(JSON.stringify({
    type: "system",
    message: "Welcome to Local Chat! 🎉",
    timestamp: new Date().toISOString()
  }));

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(`📨 Received from ${data.username || "Anonymous"}:`, data.message);

      // Broadcast to all clients
      const broadcastMessage = JSON.stringify({
        type: "chat",
        username: data.username || "Anonymous",
        message: data.message,
        timestamp: new Date().toISOString(),
        clientId: clientId
      });

      wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN) {
          client.send(broadcastMessage);
        }
      });
    } catch (error) {
      console.error("Error parsing message:", error);
    }
  });

  ws.on("close", () => {
    clients.delete(clientId);
    console.log(`👋 Client disconnected (ID: ${clientId})`);
    console.log(`👥 Remaining clients: ${clients.size}`);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

console.log("\n🚀 Server is ready! Waiting for connections...\n");
