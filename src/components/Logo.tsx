import React from "react";

export default function Logo({ className = "h-16" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <span
        style={{
          fontFamily: "Signika, sans-serif",
          color: "#FC335C",
          fontSize: "2rem",
          fontWeight: "bold",
          lineHeight: 1,
        }}
      >
        REMI
      </span>
    </div>
  );
}
