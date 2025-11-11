function MessageBubble({ message, isOwnMessage }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // System messages (welcome, notifications, etc.)
  if (message.type === "system") {
    return (
      <div className="msg system-msg">
        <span className="system-text">{message.message}</span>
      </div>
    );
  }

  // Regular chat messages
  return (
    <div className={`msg ${isOwnMessage ? "own-msg" : "other-msg"}`}>
      <div className="msg-header">
        <span className="username">{message.username}</span>
        <span className="timestamp">{formatTime(message.timestamp)}</span>
      </div>
      <div className="msg-content">
        {message.message}
      </div>
    </div>
  );
}

export default MessageBubble;
