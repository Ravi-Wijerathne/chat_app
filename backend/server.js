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

// Store connected clients with metadata: { ws, username }
const clients = new Map();

function broadcastUserList() {
  const users = [];
  for (const [id, clientObj] of clients.entries()) {
    if (clientObj.username) {
      users.push({ clientId: id, username: clientObj.username });
    }
  }
  const payload = JSON.stringify({ type: "userlist", users });
  for (const { ws } of clients.values()) {
    if (ws.readyState === ws.OPEN) ws.send(payload);
  }
}

function safeSend(ws, obj) {
  try {
    ws.send(JSON.stringify(obj));
  } catch (e) {
    console.error("Failed to send message", e);
  }
}

wss.on("connection", (ws) => {
  const clientId = Date.now() + Math.floor(Math.random() * 1000); // reduce collision chance
  clients.set(clientId, { ws, username: null });

  console.log(`✨ New client connected (ID: ${clientId})`);
  console.log(`👥 Total clients: ${clients.size}`);

  // Wait for client registration
  safeSend(ws, { type: "register_pending", message: "Please send register packet." });

  ws.on("message", (raw) => {
    let data;
    try {
      data = JSON.parse(raw.toString());
    } catch (err) {
      console.error("❌ Invalid JSON received", raw.toString());
      return safeSend(ws, { type: "error", message: "Invalid JSON format" });
    }

    const clientObj = clients.get(clientId);

    switch (data.type) {
      case "register": {
        if (!data.username || typeof data.username !== "string") {
          return safeSend(ws, { type: "error", message: "Username required" });
        }
        clientObj.username = data.username.trim().slice(0, 50);
        console.log(`✅ Client ${clientId} registered as '${clientObj.username}'`);
        safeSend(ws, { type: "register_ack", clientId, username: clientObj.username });
        broadcastUserList();
        break;
      }
      case "chat": {
        if (!clientObj.username) return safeSend(ws, { type: "error", message: "Register first" });
        if (!data.message) return; // ignore empty
        const msg = {
          type: "chat",
          username: clientObj.username,
          clientId,
          message: String(data.message).slice(0, 1000),
          timestamp: new Date().toISOString(),
        };
        console.log(`💬 Group message from ${clientObj.username}:`, msg.message);
        for (const { ws: cws } of clients.values()) {
          if (cws.readyState === ws.OPEN) safeSend(cws, msg);
        }
        break;
      }
      case "private": {
        if (!clientObj.username) return safeSend(ws, { type: "error", message: "Register first" });
        const toId = data.toId;
        if (!toId || !clients.has(toId)) return safeSend(ws, { type: "error", message: "Recipient not found" });
        if (!data.message) return;
        const target = clients.get(toId);
        const msg = {
          type: "private",
            fromId: clientId,
            fromUsername: clientObj.username,
            toId,
            toUsername: target.username,
            message: String(data.message).slice(0, 1000),
            timestamp: new Date().toISOString(),
        };
        console.log(`📩 Private ${clientObj.username} -> ${target.username}:`, msg.message);
        // send to sender & recipient only
        [ws, target.ws].forEach(c => {
          if (c.readyState === ws.OPEN) safeSend(c, msg);
        });
        break;
      }
      default: {
        safeSend(ws, { type: "error", message: "Unknown message type" });
      }
    }
  });

  ws.on("close", () => {
    clients.delete(clientId);
    console.log(`👋 Client disconnected (ID: ${clientId})`);
    console.log(`👥 Remaining clients: ${clients.size}`);
    broadcastUserList();
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

console.log("\n🚀 Server is ready! Waiting for connections...\n");
