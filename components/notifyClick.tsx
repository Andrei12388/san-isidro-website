import React, { useState, useEffect } from "react";

// type for message
type Message = { text: string; x: number; y: number } | null;

// callback type
let showMessageCallback: ((msg: Message) => void) | null = null;

export const FloatingMessage = () => {
  const [message, setMessage] = useState<Message>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    showMessageCallback = (msg) => {
      if (!msg) {
        // fade out
        setVisible(false);
        // remove after fade
        setTimeout(() => setMessage(null), 500);
      } else {
        setMessage(msg);
        // small delay to trigger fade-in
        setTimeout(() => setVisible(true), 10);
      }
    };
    return () => {
      showMessageCallback = null;
    };
  }, []);

  if (!message) return null;

  return (
    <div
      style={{
        position: "absolute",
        top: message.y,
        left: message.x,
        transform: `translate(-50%, -50%)`,
        padding: "8px 12px",
        background: `var(--background)`,
        color: `green`,
        borderRadius: "4px",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        zIndex: 1000,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.5s ease, transform 0.5s ease",
      }}
    >
      {message.text}
    </div>
  );
};

// helper function to trigger message
export const showFloatingMessage = (
  text: string,
  x: number,
  y: number,
  duration = 2000,
) => {
  if (!showMessageCallback) return;
  showMessageCallback({ text, x, y });

  setTimeout(() => {
    if (showMessageCallback) showMessageCallback(null);
  }, duration);
};
