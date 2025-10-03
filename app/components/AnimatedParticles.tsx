import React from "react";

export default function AnimatedParticles() {
  // Generate 20 particles with random positions and delays
  const particles = Array.from({ length: 20 }, (_, i) => ({
    left: Math.random() * 100,
    top: Math.random() * 100,
    delay: Math.random() * 5,
    size: 8 + Math.random() * 12,
    opacity: 0.3 + Math.random() * 0.5,
  }));

  return (
    <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none">
      {particles.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-primary animate-particle"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
