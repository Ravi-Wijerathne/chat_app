import { useState, useRef, useEffect } from "react";
import anime from "animejs";

function InputField({ onSend }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  const buttonRef = useRef(null);

  const handleSend = () => {
    if (text.trim()) {
      onSend(text);
      setText("");
      
      // Button click animation - more dynamic
      anime({
        targets: buttonRef.current,
        scale: [1, 0.85, 1.1, 1],
        rotate: [0, -5, 5, 0],
        duration: 500,
        easing: "easeOutElastic(1, .6)"
      });

      // Input bounce animation
      anime({
        targets: inputRef.current,
        scale: [1, 0.98, 1],
        duration: 300,
        easing: "easeOutQuad"
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Focus input on mount with animation
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      
      // Animate input field entrance
      anime({
        targets: inputRef.current,
        opacity: [0, 1],
        translateY: [20, 0],
        easing: "easeOutQuad",
        duration: 500,
        delay: 300
      });
    }
  }, []);

  return (
    <div className="input-area">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder="Type a message..."
        maxLength={500}
      />
      <button 
        ref={buttonRef}
        onClick={handleSend}
        disabled={!text.trim()}
      >
        Send 📤
      </button>
    </div>
  );
}

export default InputField;
