import React, { useState, useEffect } from "react";

// type for message
type Message = { text: string; x: number; y: number } | null;

// callback type
let showMessageCallback: ((msg: Message) => void) | null = null;

export const FloatingMessage = () => {
  const [message, setMessage] = useState<Message>(null);

  useEffect(() => {
    showMessageCallback = setMessage;
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
        transform: "translate(-50%, -50%)",
        padding: "8px 12px",
        background: "rgba(0,0,0,0.8)",
        color: "#fff",
        borderRadius: "4px",
        pointerEvents: "none",
        whiteSpace: "nowrap",
        zIndex: 1000,
        transition: "opacity 0.3s",
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
  duration = 2000
) => {
  if (!showMessageCallback) return;
  showMessageCallback({ text, x, y });

  setTimeout(() => {
    if (showMessageCallback) showMessageCallback(null);
  }, duration);
};
