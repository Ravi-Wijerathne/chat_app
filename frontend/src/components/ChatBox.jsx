import { useEffect, useRef } from "react";
import anime from "animejs";
import MessageBubble from "./MessageBubble";

function ChatBox({ messages, currentUsername, mode = 'group', peerUser = null, selfId = null }) {
  const chatBoxRef = useRef(null);
  const emptyStateRef = useRef(null);

  // Animate empty state
  useEffect(() => {
    if (messages.length === 0 && emptyStateRef.current) {
      anime({
        targets: emptyStateRef.current,
        opacity: [0, 1],
        scale: [0.9, 1],
        easing: "easeOutElastic(1, .6)",
        duration: 800
      });
    }
  }, [messages.length]);

  // Auto-scroll to bottom when new messages arrive with smooth animation
  useEffect(() => {
    if (chatBoxRef.current) {
      anime({
        targets: chatBoxRef.current,
        scrollTop: chatBoxRef.current.scrollHeight,
        duration: 400,
        easing: "easeOutQuad"
      });
    }
  }, [messages]);

  // Filter messages based on mode
  let visibleMessages = messages.filter(m => {
    if (mode === 'group') {
      return m.type === 'system' || m.type === 'chat';
    }
    if (mode === 'private' && peerUser && selfId) {
      return m.type === 'private' && (
        (m.fromId === selfId && m.toId === peerUser.clientId) ||
        (m.fromId === peerUser.clientId && m.toId === selfId)
      );
    }
    return false;
  });

  return (
    <div className="chat-box" ref={chatBoxRef}>
      {visibleMessages.length === 0 && (
        <div className="empty-state" ref={emptyStateRef}>
          <p>{mode === 'group' ? '👋 No messages yet. Start the conversation!' : '🔒 No messages in this private chat yet.'}</p>
        </div>
      )}
      {visibleMessages.map((msg, index) => (
        <MessageBubble
          key={index}
          message={msg}
          isOwnMessage={mode === 'group' ? (msg.username === currentUsername) : (msg.type === 'private' && msg.fromId === selfId)}
        />
      ))}
    </div>
  );
}

export default ChatBox;
