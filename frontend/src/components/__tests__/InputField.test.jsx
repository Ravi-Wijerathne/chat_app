import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import InputField from '../InputField';

describe('InputField', () => {
  it('should render input field', () => {
    render(<InputField onSend={() => {}} />);
    expect(screen.getByPlaceholderText(/Type a message/i)).toBeInTheDocument();
  });

  it('should render send button', () => {
    render(<InputField onSend={() => {}} />);
    expect(screen.getByText('Send 📤')).toBeInTheDocument();
  });

  it('should render emoji toggle button', () => {
    render(<InputField onSend={() => {}} />);
    expect(screen.getByText('😊')).toBeInTheDocument();
  });

  it('should call onSend when send button is clicked with text', () => {
    const onSend = vi.fn();
    render(<InputField onSend={onSend} />);
    
    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'Hello World' } });
    
    const sendButton = screen.getByText('Send 📤');
    fireEvent.click(sendButton);
    
    expect(onSend).toHaveBeenCalledWith('Hello World');
  });

  it('should clear input after sending', () => {
    const onSend = vi.fn();
    render(<InputField onSend={onSend} />);
    
    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'Hello World' } });
    
    fireEvent.click(screen.getByText('Send 📤'));
    
    expect(input.value).toBe('');
  });

  it('should not call onSend when send button is clicked without text', () => {
    const onSend = vi.fn();
    render(<InputField onSend={onSend} />);
    
    fireEvent.click(screen.getByText('Send 📤'));
    
    expect(onSend).not.toHaveBeenCalled();
  });

  it('should disable send button when input is empty', () => {
    const onSend = vi.fn();
    render(<InputField onSend={onSend} />);
    
    const sendButton = screen.getByText('Send 📤');
    expect(sendButton).toBeDisabled();
  });

  it('should enable send button when input has text', () => {
    const onSend = vi.fn();
    render(<InputField onSend={onSend} />);
    
    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: 'Hello' } });
    
    const sendButton = screen.getByText('Send 📤');
    expect(sendButton).not.toBeDisabled();
  });

  it('should not send whitespace-only message', () => {
    const onSend = vi.fn();
    render(<InputField onSend={onSend} />);
    
    const input = screen.getByPlaceholderText(/Type a message/i);
    fireEvent.change(input, { target: { value: '   ' } });
    
    fireEvent.click(screen.getByText('Send 📤'));
    
    expect(onSend).not.toHaveBeenCalled();
  });
});
