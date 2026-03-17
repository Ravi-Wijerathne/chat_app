import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Sidebar from '../Sidebar';

describe('Sidebar', () => {
  const mockUsers = [
    { clientId: 1, username: 'Alice' },
    { clientId: 2, username: 'Bob' },
    { clientId: 3, username: 'Charlie' },
  ];

  it('should render group chat button', () => {
    render(<Sidebar users={[]} selfId={null} activeUser={null} onSelectUser={() => {}} onSelectGroup={() => {}} connectionStatus="connected" />);
    expect(screen.getByRole('button', { name: /Group Chat/i })).toBeInTheDocument();
  });

  it('should display connection status', () => {
    render(<Sidebar users={[]} selfId={null} activeUser={null} onSelectUser={() => {}} onSelectGroup={() => {}} connectionStatus="connected" />);
    expect(screen.getByText('connected')).toBeInTheDocument();
  });

  it('should display all users except self', () => {
    render(<Sidebar users={mockUsers} selfId={1} activeUser={null} onSelectUser={() => {}} onSelectGroup={() => {}} connectionStatus="connected" />);
    expect(screen.getByRole('button', { name: /Bob/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Charlie/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Alice/i })).not.toBeInTheDocument();
  });

  it('should display empty state when no other users online', () => {
    render(<Sidebar users={[{ clientId: 1, username: 'Alice' }]} selfId={1} activeUser={null} onSelectUser={() => {}} onSelectGroup={() => {}} connectionStatus="connected" />);
    expect(screen.getByText('No other users online')).toBeInTheDocument();
  });

  it('should call onSelectGroup when group chat button is clicked', () => {
    const onSelectGroup = vi.fn();
    render(<Sidebar users={mockUsers} selfId={1} activeUser={null} onSelectUser={() => {}} onSelectGroup={onSelectGroup} connectionStatus="connected" />);
    
    fireEvent.click(screen.getByRole('button', { name: /Group Chat/i }));
    expect(onSelectGroup).toHaveBeenCalledTimes(1);
  });

  it('should call onSelectUser when a user button is clicked', () => {
    const onSelectUser = vi.fn();
    render(<Sidebar users={mockUsers} selfId={1} activeUser={null} onSelectUser={onSelectUser} onSelectGroup={() => {}} connectionStatus="connected" />);
    
    fireEvent.click(screen.getByRole('button', { name: /Bob/i }));
    expect(onSelectUser).toHaveBeenCalledTimes(1);
    expect(onSelectUser).toHaveBeenCalledWith({ clientId: 2, username: 'Bob' });
  });

  it('should highlight active user', () => {
    render(<Sidebar users={mockUsers} selfId={1} activeUser={{ clientId: 2, username: 'Bob' }} onSelectUser={() => {}} onSelectGroup={() => {}} connectionStatus="connected" />);
    
    const bobButton = screen.getByRole('button', { name: /Bob/i });
    expect(bobButton).toHaveClass('active');
  });

  it('should highlight group chat when no active user', () => {
    render(<Sidebar users={mockUsers} selfId={1} activeUser={null} onSelectUser={() => {}} onSelectGroup={() => {}} connectionStatus="connected" />);
    
    const groupButton = screen.getByRole('button', { name: /Group Chat/i });
    expect(groupButton).toHaveClass('active');
  });
});
