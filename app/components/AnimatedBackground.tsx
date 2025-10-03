import React from "react";

export default function AnimatedBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 w-full h-full overflow-hidden"
      style={{ pointerEvents: "none" }}
    >
      <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/30 via-white/60 to-primary/10 animate-gradient"></div>
      <div className="absolute top-1/4 left-1/3 w-96 h-96 rounded-full bg-primary/20 blur-3xl opacity-40 animate-float" />
      <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-primary/30 blur-2xl opacity-30 animate-float2" />
      <div className="absolute top-0 left-0 w-40 h-40 rounded-full bg-primary/10 blur-2xl opacity-20 animate-float3" />
    </div>
  );
}
