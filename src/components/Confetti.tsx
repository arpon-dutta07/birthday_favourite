import React, { useEffect, useState } from 'react';

interface ConfettiPiece {
  id: string;
  x: number;
  color: string;
  delay: number;
  size: number;
}

const Confetti: React.FC = () => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  const colors = ['#ff6b9d', '#ffc3e0', '#ffd700', '#87ceeb', '#98fb98', '#dda0dd', '#ff4081', '#ffb3d9', '#ffa500'];

  useEffect(() => {
    const pieces: ConfettiPiece[] = [];
    
    // Create confetti pieces
    for (let i = 0; i < 80; i++) {
      pieces.push({
        id: `confetti-${i}`,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 3,
        size: Math.random() * 12 + 6
      });
    }
    
    setConfetti(pieces);

    // Clean up after animation
    const cleanup = setTimeout(() => {
      setConfetti([]);
    }, 7000);

    return () => clearTimeout(cleanup);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-30">
      {confetti.map(piece => (
        <div
          key={piece.id}
          className="confetti absolute"
          style={{
            left: `${piece.x}%`,
            top: '-10px',
            backgroundColor: piece.color,
            width: `${piece.size}px`,
            height: `${piece.size}px`,
            animationDelay: `${piece.delay}s`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%'
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;