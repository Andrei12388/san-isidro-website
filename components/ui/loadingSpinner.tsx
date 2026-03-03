import React from "react";

type SpinnerProps = {
  size?: number; // px
  className?: string;
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 20,
  className = "",
}) => {
  return (
    <div
      className={`
        animate-spin
        rounded-full
        border-2
        border-muted-foreground/30
        border-t-foreground
        ${className}
      `}
      style={{
        width: size,
        height: size,
      }}
    />
  );
};
