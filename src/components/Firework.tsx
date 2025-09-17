// src/components/Firework.tsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Firework: React.FC<{ side: "left" | "right" }> = ({ side }) => {
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; color: string }[]
  >([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newParticle = {
        id: Date.now() + Math.random(),
        x: side === "left" ? 60 : window.innerWidth - 60,
        y: window.innerHeight - 100,
        color: `hsl(${Math.random() * 360}, 100%, 60%)`,
      };
      setParticles((prev) => [...prev.slice(-20), newParticle]);
    }, 800);
    return () => clearInterval(interval);
  }, [side]);

  return (
    <>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-full"
          style={{ backgroundColor: p.color, left: p.x, top: p.y }}
          initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          animate={{
            opacity: 0,
            x: side === "left" ? [0, 80, 150] : [0, -80, -150],
            y: [0, -150, -300],
            scale: [1, 1.5, 0.5],
          }}
          transition={{ duration: 2.5, ease: "easeOut" }}
        />
      ))}
    </>
  );
};

export default Firework;
