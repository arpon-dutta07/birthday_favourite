import React, { useEffect, useState } from 'react';

interface Particle {
  id: string;
  type: 'heart' | 'sparkle';
  x: number;
  y: number;
  delay: number;
}

const Particles: React.FC = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const createParticle = (): Particle => ({
      id: Date.now() + Math.random().toString(),
      type: Math.random() > 0.6 ? 'heart' : 'sparkle',
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4
    });

    // Create initial particles
    const initialParticles = Array.from({ length: 20 }, createParticle);
    setParticles(initialParticles);

    // Create new particles periodically
    const interval = setInterval(() => {
      setParticles(prev => {
        // Remove old particles and add new ones  
        const newParticles = prev.slice(-15); // Keep last 15 particles
        return [...newParticles, createParticle(), createParticle(), createParticle()];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(particle => (
        <div
          key={particle.id}
          className={`particle ${
            particle.type === 'heart' ? 'heart-particle' : 'sparkle-particle'
          }`}
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`
          }}
        >
          {particle.type === 'heart' ? (Math.random() > 0.5 ? '💕' : '💖') : (Math.random() > 0.5 ? '✨' : '⭐')}
        </div>
      ))}
    </div>
  );
};

export default Particles;