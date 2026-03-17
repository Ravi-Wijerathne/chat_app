import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';

global.WebSocket = vi.fn(() => ({
  send: vi.fn(),
  close: vi.fn(),
  readyState: 1,
  onopen: null,
  onmessage: null,
  onerror: null,
  onclose: null,
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render username screen initially', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Local Chat App/i })).toBeInTheDocument();
    });
    expect(screen.getByPlaceholderText('Your name...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Join Chat/i })).toBeInTheDocument();
  });

  it('should show username input with maxLength of 20', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Your name...')).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText('Your name...');
    expect(input.maxLength).toBe(20);
  });

  it('should update username state when typing', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Your name...')).toBeInTheDocument();
    });
    const input = screen.getByPlaceholderText('Your name...');
    fireEvent.change(input, { target: { value: 'TestUser' } });
    expect(input.value).toBe('TestUser');
  });

  it('should not submit empty username', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log');
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Join Chat/i })).toBeInTheDocument();
    });
    
    const form = screen.getByRole('button', { name: /Join Chat/i }).closest('form');
    fireEvent.submit(form, { preventDefault: () => {} });
    
    expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.any(String), 'Rendering username screen');
  });

  it('should not submit whitespace-only username', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log');
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Your name...')).toBeInTheDocument();
    });
    
    const input = screen.getByPlaceholderText('Your name...');
    fireEvent.change(input, { target: { value: '   ' } });
    
    const form = screen.getByRole('button', { name: /Join Chat/i }).closest('form');
    fireEvent.submit(form, { preventDefault: () => {} });
    
    expect(consoleLogSpy).not.toHaveBeenCalledWith(expect.any(String), 'Rendering username screen');
  });

  it('should display username entry screen heading', async () => {
    render(<App />);
    await waitFor(() => {
      expect(screen.getByText('Enter your name to join the chat')).toBeInTheDocument();
    });
  });
});
