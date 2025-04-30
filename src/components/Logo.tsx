import React from "react";

export default function Logo({ className = "h-16" }: { className?: string }) {
  return (
    <div className={`flex items-center ${className}`}>
      <img src="/remi-logo-direct.png" alt="REMI" className={className} />
    </div>
  );
}
