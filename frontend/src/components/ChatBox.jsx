import { useEffect, useRef } from "react";
import anime from "animejs";
import MessageBubble from "./MessageBubble";

function ChatBox({ messages, currentUsername }) {
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

  return (
    <div className="chat-box" ref={chatBoxRef}>
      {messages.length === 0 && (
        <div className="empty-state" ref={emptyStateRef}>
          <p>👋 No messages yet. Start the conversation!</p>
        </div>
      )}
      
      {messages.map((msg, index) => (
        <MessageBubble
          key={index}
          message={msg}
          isOwnMessage={msg.username === currentUsername}
        />
      ))}
    </div>
  );
}

export default ChatBox;
