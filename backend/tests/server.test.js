import { WebSocketServer, WebSocket } from 'ws';

const PORT = 3001;

let wss;
const clients = new Map();

function broadcastUserList() {
  const users = [];
  for (const [id, clientObj] of clients.entries()) {
    if (clientObj.username) {
      users.push({ clientId: id, username: clientObj.username });
    }
  }
  const payload = JSON.stringify({ type: 'userlist', users });
  for (const { ws } of clients.values()) {
    if (ws.readyState === 1) ws.send(payload);
  }
}

function safeSend(ws, obj) {
  try {
    ws.send(JSON.stringify(obj));
  } catch (e) {}
}

function handleMessage(ws, raw, clientId) {
  let data;
  try {
    data = JSON.parse(raw.toString());
  } catch (err) {
    return safeSend(ws, { type: 'error', message: 'Invalid JSON format' });
  }

  const clientObj = clients.get(clientId);
  if (!clientObj) return;

  switch (data.type) {
    case 'register': {
      if (!data.username || typeof data.username !== 'string') {
        return safeSend(ws, { type: 'error', message: 'Username required' });
      }
      clientObj.username = data.username.trim().slice(0, 50);
      safeSend(ws, { type: 'register_ack', clientId, username: clientObj.username });
      broadcastUserList();
      break;
    }
    case 'chat': {
      if (!clientObj.username) return safeSend(ws, { type: 'error', message: 'Register first' });
      if (!data.message) return;
      const msg = {
        type: 'chat',
        username: clientObj.username,
        clientId,
        message: String(data.message).slice(0, 1000),
        timestamp: new Date().toISOString(),
      };
      for (const { ws: cws } of clients.values()) {
        if (cws.readyState === 1) safeSend(cws, msg);
      }
      break;
    }
    case 'private': {
      if (!clientObj.username) return safeSend(ws, { type: 'error', message: 'Register first' });
      const toId = data.toId;
      if (!toId || !clients.has(toId)) return safeSend(ws, { type: 'error', message: 'Recipient not found' });
      if (!data.message) return;
      const target = clients.get(toId);
      const msg = {
        type: 'private',
        fromId: clientId,
        fromUsername: clientObj.username,
        toId,
        toUsername: target.username,
        message: String(data.message).slice(0, 1000),
        timestamp: new Date().toISOString(),
      };
      [ws, target.ws].forEach(c => {
        if (c.readyState === 1) safeSend(c, msg);
      });
      break;
    }
    default: {
      safeSend(ws, { type: 'error', message: 'Unknown message type' });
    }
  }
}

function createMockClient() {
  return new Promise((resolve) => {
    const ws = new WebSocket(`ws://localhost:${PORT}`);
    let clientId;
    
    ws.on('open', () => {
      clientId = Date.now() + Math.floor(Math.random() * 1000);
      clients.set(clientId, { ws, username: null });
      resolve({ ws, clientId, clients });
    });
    
    ws.on('message', (data) => {
      const parsed = JSON.parse(data.toString());
      if (!ws._messages) ws._messages = [];
      ws._messages.push(parsed);
    });
  });
}

beforeAll((done) => {
  wss = new WebSocketServer({ port: PORT });
  
  wss.on('connection', (ws) => {
    const clientId = Date.now() + Math.floor(Math.random() * 1000);
    clients.set(clientId, { ws, username: null });
    
    safeSend(ws, { type: 'register_pending', message: 'Please send register packet.' });
    
    ws.on('message', (raw) => {
      handleMessage(ws, raw, clientId);
    });
    
    ws.on('close', () => {
      clients.delete(clientId);
      broadcastUserList();
    });
  });
  
  wss.on('listening', done);
});

afterAll((done) => {
  clients.clear();
  wss.close(done);
});

beforeEach(() => {
  clients.clear();
});

describe('Client Registration', () => {
  test('valid username should return register_ack', async () => {
    const { ws } = await createMockClient();
    
    await new Promise((resolve) => {
      ws.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'register_ack') {
          expect(parsed.username).toBe('TestUser');
          resolve();
        }
      });
      
      ws.send(JSON.stringify({ type: 'register', username: 'TestUser' }));
    });
    
    ws.close();
  });
  
  test('empty username should return error', async () => {
    const { ws } = await createMockClient();
    
    await new Promise((resolve) => {
      ws.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'error') {
          expect(parsed.message).toBe('Username required');
          resolve();
        }
      });
      
      ws.send(JSON.stringify({ type: 'register', username: '' }));
    });
    
    ws.close();
  });
  
  test('non-string username should return error', async () => {
    const { ws } = await createMockClient();
    
    await new Promise((resolve) => {
      ws.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'error') {
          expect(parsed.message).toBe('Username required');
          resolve();
        }
      });
      
      ws.send(JSON.stringify({ type: 'register', username: 123 }));
    });
    
    ws.close();
  });
  
  test('username > 50 chars should be truncated', async () => {
    const longUsername = 'A'.repeat(100);
    const { ws } = await createMockClient();
    
    await new Promise((resolve) => {
      ws.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'register_ack') {
          expect(parsed.username.length).toBe(50);
          resolve();
        }
      });
      
      ws.send(JSON.stringify({ type: 'register', username: longUsername }));
    });
    
    ws.close();
  });
});

describe('Group Messaging', () => {
  test('empty message should be ignored', async () => {
    const { ws } = await createMockClient();
    let messageSent = false;
    
    await new Promise((resolve) => {
      ws.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'chat') {
          messageSent = true;
        }
      });
      
      ws.send(JSON.stringify({ type: 'register', username: 'TestUser' }));
      setTimeout(() => {
        ws.send(JSON.stringify({ type: 'chat', message: '' }));
        setTimeout(() => {
          expect(messageSent).toBe(false);
          resolve();
        }, 100);
      }, 100);
    });
    
    ws.close();
  });
  
  test('message > 1000 chars should be truncated', async () => {
    const { ws } = await createMockClient();
    const longMessage = 'B'.repeat(2000);
    
    await new Promise((resolve) => {
      ws.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'chat') {
          expect(parsed.message.length).toBe(1000);
          resolve();
        }
      });
      
      ws.send(JSON.stringify({ type: 'register', username: 'TestUser' }));
      setTimeout(() => {
        ws.send(JSON.stringify({ type: 'chat', message: longMessage }));
      }, 100);
    });
    
    ws.close();
  });
  
  test('unregistered user should get error when sending chat', async () => {
    const { ws } = await createMockClient();
    
    await new Promise((resolve) => {
      ws.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'error' && parsed.message === 'Register first') {
          resolve();
        }
      });
      
      ws.send(JSON.stringify({ type: 'chat', message: 'Hello' }));
    });
    
    ws.close();
  });
});

describe('Private Messaging', () => {
  test('invalid recipient should return error', async () => {
    const { ws } = await createMockClient();
    
    await new Promise((resolve) => {
      ws.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'error' && parsed.message === 'Recipient not found') {
          resolve();
        }
      });
      
      ws.send(JSON.stringify({ type: 'register', username: 'TestUser' }));
      setTimeout(() => {
        ws.send(JSON.stringify({ type: 'private', toId: 99999, message: 'Hello' }));
      }, 100);
    });
    
    ws.close();
  });
  
  test('unregistered user should get error when sending private message', async () => {
    const { ws } = await createMockClient();
    
    await new Promise((resolve) => {
      ws.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'error' && parsed.message === 'Register first') {
          resolve();
        }
      });
      
      ws.send(JSON.stringify({ type: 'private', toId: 123, message: 'Hello' }));
    });
    
    ws.close();
  });
});

describe('User List Management', () => {
  test('on registration should broadcast updated user list', async () => {
    const { ws } = await createMockClient();
    let userlistReceived = false;
    
    await new Promise((resolve) => {
      ws.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'userlist') {
          expect(parsed.users.length).toBe(1);
          expect(parsed.users[0].username).toBe('NewUser');
          userlistReceived = true;
          resolve();
        }
        if (parsed.type === 'register_ack') {
          ws.send(JSON.stringify({ type: 'register', username: 'NewUser' }));
        }
      });
      
      ws.send(JSON.stringify({ type: 'register', username: 'NewUser' }));
    });
    
    expect(userlistReceived).toBe(true);
    ws.close();
  });
});

describe('Error Handling', () => {
  test('invalid JSON should return error', async () => {
    const { ws } = await createMockClient();
    
    await new Promise((resolve) => {
      ws.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'error' && parsed.message === 'Invalid JSON format') {
          resolve();
        }
      });
      
      ws.send('not valid json');
    });
    
    ws.close();
  });
  
  test('unknown message type should return error', async () => {
    const { ws } = await createMockClient();
    
    await new Promise((resolve) => {
      ws.on('message', (data) => {
        const parsed = JSON.parse(data.toString());
        if (parsed.type === 'error' && parsed.message === 'Unknown message type') {
          resolve();
        }
      });
      
      ws.send(JSON.stringify({ type: 'unknown_type', data: 'test' }));
    });
    
    ws.close();
  });
});
