import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MessageBubble from '../MessageBubble';

describe('MessageBubble', () => {
  it('should render system messages correctly', () => {
    render(<MessageBubble message={{ type: 'system', message: 'System notification' }} isOwnMessage={false} />);
    expect(screen.getByText('System notification')).toBeInTheDocument();
    expect(screen.getByText('System notification').closest('.msg')).toHaveClass('system-msg');
  });

  it('should render error messages correctly', () => {
    render(<MessageBubble message={{ type: 'error', message: 'Error occurred' }} isOwnMessage={false} />);
    expect(screen.getByText('⚠️ Error occurred')).toBeInTheDocument();
    expect(screen.getByText('⚠️ Error occurred').closest('.msg')).toHaveClass('system-msg');
  });

  it('should render group chat messages with username', () => {
    render(
      <MessageBubble
        message={{ type: 'chat', username: 'Alice', message: 'Hello', timestamp: '2024-01-01T10:00:00.000Z' }}
        isOwnMessage={false}
      />
    );
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should apply own-msg class for own messages in group chat', () => {
    render(
      <MessageBubble
        message={{ type: 'chat', username: 'TestUser', message: 'My message', timestamp: '2024-01-01T10:00:00.000Z' }}
        isOwnMessage={true}
      />
    );
    expect(screen.getByText('My message').closest('.msg')).toHaveClass('own-msg');
  });

  it('should apply other-msg class for other users messages in group chat', () => {
    render(
      <MessageBubble
        message={{ type: 'chat', username: 'Alice', message: 'Her message', timestamp: '2024-01-01T10:00:00.000Z' }}
        isOwnMessage={false}
      />
    );
    expect(screen.getByText('Her message').closest('.msg')).toHaveClass('other-msg');
  });

  it('should render private message with "You →" prefix for own messages', () => {
    render(
      <MessageBubble
        message={{ type: 'private', fromId: 1, toId: 2, fromUsername: 'TestUser', toUsername: 'Bob', message: 'Secret', timestamp: '2024-01-01T10:00:00.000Z' }}
        isOwnMessage={true}
      />
    );
    expect(screen.getByText(/You → Bob/)).toBeInTheDocument();
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });

  it('should render private message with "→ You" prefix for received messages', () => {
    render(
      <MessageBubble
        message={{ type: 'private', fromId: 2, toId: 1, fromUsername: 'Alice', toUsername: 'TestUser', message: 'Secret', timestamp: '2024-01-01T10:00:00.000Z' }}
        isOwnMessage={false}
      />
    );
    expect(screen.getByText(/Alice → You/)).toBeInTheDocument();
    expect(screen.getByText('Secret')).toBeInTheDocument();
  });

  it('should format timestamp correctly', () => {
    render(
      <MessageBubble
        message={{ type: 'chat', username: 'Alice', message: 'Hello', timestamp: '2024-01-01T14:30:00.000Z' }}
        isOwnMessage={false}
      />
    );
    const timestamp = screen.getByText(/\d{1,2}:\d{2}/);
    expect(timestamp).toBeInTheDocument();
  });
});
