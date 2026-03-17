import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ChatBox from '../ChatBox';

describe('ChatBox', () => {
  const mockMessages = [
    { type: 'system', message: 'Welcome to the chat' },
    { type: 'chat', username: 'Alice', message: 'Hello everyone', timestamp: '2024-01-01T10:00:00.000Z' },
    { type: 'chat', username: 'Bob', message: 'Hi Alice', timestamp: '2024-01-01T10:01:00.000Z' },
  ];

  const mockPrivateMessages = [
    { type: 'private', fromId: 1, toId: 2, fromUsername: 'Alice', toUsername: 'Bob', message: 'Secret message', timestamp: '2024-01-01T10:00:00.000Z' },
  ];

  it('should render empty state when no messages', () => {
    render(<ChatBox messages={[]} currentUsername="TestUser" mode="group" />);
    expect(screen.getByText(/No messages yet/i)).toBeInTheDocument();
  });

  it('should render empty state for private chat when no messages', () => {
    render(<ChatBox messages={[]} currentUsername="TestUser" mode="private" peerUser={{ clientId: 2, username: 'Bob' }} selfId={1} />);
    expect(screen.getByText(/No messages in this private chat/i)).toBeInTheDocument();
  });

  it('should filter and display group messages in group mode', () => {
    render(<ChatBox messages={mockMessages} currentUsername="TestUser" mode="group" />);
    expect(screen.getByText('Hello everyone')).toBeInTheDocument();
    expect(screen.getByText('Hi Alice')).toBeInTheDocument();
  });

  it('should not display private messages in group mode', () => {
    const messagesWithPrivate = [
      ...mockMessages,
      { type: 'private', fromId: 1, toId: 2, message: 'Secret', timestamp: '2024-01-01T10:02:00.000Z' },
    ];
    render(<ChatBox messages={messagesWithPrivate} currentUsername="TestUser" mode="group" />);
    expect(screen.queryByText('Secret')).not.toBeInTheDocument();
  });

  it('should filter and display private messages in private mode', () => {
    render(<ChatBox messages={mockPrivateMessages} currentUsername="TestUser" mode="private" peerUser={{ clientId: 2, username: 'Bob' }} selfId={1} />);
    expect(screen.getByText('Secret message')).toBeInTheDocument();
  });

  it('should not display group messages in private mode', () => {
    const messagesWithGroup = [
      ...mockPrivateMessages,
      { type: 'chat', username: 'Alice', message: 'Group message', timestamp: '2024-01-01T10:02:00.000Z' },
    ];
    render(<ChatBox messages={messagesWithGroup} currentUsername="TestUser" mode="private" peerUser={{ clientId: 2, username: 'Bob' }} selfId={1} />);
    expect(screen.queryByText('Group message')).not.toBeInTheDocument();
  });

  it('should correctly identify own messages in group mode', () => {
    const messages = [
      { type: 'chat', username: 'TestUser', message: 'My message', timestamp: '2024-01-01T10:00:00.000Z' },
      { type: 'chat', username: 'Alice', message: 'Her message', timestamp: '2024-01-01T10:01:00.000Z' },
    ];
    render(<ChatBox messages={messages} currentUsername="TestUser" mode="group" />);
    const ownMessage = screen.getByText('My message').closest('.msg');
    expect(ownMessage).toHaveClass('own-msg');
  });

  it('should correctly identify own messages in private mode', () => {
    const messages = [
      { type: 'private', fromId: 1, toId: 2, message: 'My private message', timestamp: '2024-01-01T10:00:00.000Z' },
    ];
    render(<ChatBox messages={messages} currentUsername="TestUser" mode="private" peerUser={{ clientId: 2, username: 'Bob' }} selfId={1} />);
    const ownMessage = screen.getByText('My private message').closest('.msg');
    expect(ownMessage).toHaveClass('own-msg');
  });
});
