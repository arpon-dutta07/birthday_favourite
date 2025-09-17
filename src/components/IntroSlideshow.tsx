import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { Heart, Sparkles, Play, Pause, Volume2 } from "lucide-react";
import introMusic from '../assets/intro.mp3';

interface ImageItem {
  name: string;
  dataUrl: string;
  id?: string;
}

interface IntroSlideshowProps {
  images: ImageItem[];
  onComplete: () => void;
  name?: string;
}

const IntroSlideshow: React.FC<IntroSlideshowProps> = ({ images, onComplete, name }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [phase, setPhase] = useState<"enter" | "visible" | "out">("enter");
  const [showOverlay, setShowOverlay] = useState(false);
  const [romanticTextIndex, setRomanticTextIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    gravity: number;
    size: number;
    alpha: number;
    fade: number;
    color: string;
    rotation?: number;
    spin?: number;
  }>>([]);
  const rafRef = useRef<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const ENTER_MS = 600;
  const VISIBLE_MS = 2800;
  const OUT_MS = 600;

  // Memoize static data to prevent re-renders
  const romanticTexts = useMemo(() => [
    `Hey ${name || "there"} 💖`,
    "Look how beautiful these memories are...",
    "Every moment with you is magical ✨",
    "You mean the world to me 🌎💫",
    "These photos tell our story 📸💕",
  ], [name]);

  const captionsPool = useMemo(() => [
    "Beautiful moments we shared ❤️",
    "Love you forever 💕",
    "Happy vibes only 🎉",
    "Every moment is magic ✨",
    "Our love story is my favorite 📖",
    "Cheers to us 🥂",
    "Forever yours 💖",
    "Dancing through life with you 🎶",
    "You are my sunshine ☀️",
    "Together, forever, always 💫",
  ], []);

  // Optimized particle system with reduced complexity
  const spawnExplosion = useCallback((screenX: number, screenY: number) => {
    const COUNT = 20; // Reduced particle count
    for (let i = 0; i < COUNT; i++) {
      const angle = (i / COUNT) * Math.PI * 2;
      const speed = 2 + Math.random() * 4;
      const vx = Math.cos(angle) * speed;
      const vy = Math.sin(angle) * speed - 2;
      const size = 6 + Math.random() * 4;
      const colors = ["#FF69B4", "#FFD87A", "#FF9CD1"];
      const color = colors[i % 3];
      
      particlesRef.current.push({
        x: screenX,
        y: screenY,
        vx,
        vy,
        gravity: 0.2,
        size,
        alpha: 1,
        fade: 0.02,
        color,
        rotation: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.3,
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap DPR for performance
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(dpr, dpr);
    };
    
    resize();
    window.addEventListener("resize", resize);

    const animate = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const particles = particlesRef.current;
      
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.vy += p.gravity;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.fade;
        if (p.spin) p.rotation = (p.rotation || 0) + p.spin;
        
        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          const s = p.size;
          ctx.beginPath();
          // Beautiful heart shape
          ctx.moveTo(0, -s * 0.6);
          ctx.bezierCurveTo(-s * 0.55, -s * 1.0, -s * 1.45, -s * 0.2, -s * 0.1, s * 0.7);
          ctx.bezierCurveTo(0, s * 0.9, s * 0.6, s * 0.9, s * 0.1, s * 0.7);
          ctx.bezierCurveTo(s * 1.45, -s * 0.2, s * 0.55, -s * 1.0, 0, -s * 0.6);
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        }
        
        if (p.alpha <= 0 || p.y > window.innerHeight + 100) {
          particles.splice(i, 1);
        }
      }
      
      rafRef.current = requestAnimationFrame(animate);
    };
    
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // --- Audio Setup and Controls ---
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleCanPlayThrough = () => setIsAudioLoaded(true);
      const handleEnded = () => setIsPlaying(false);
      const handleError = () => {
        console.error('Audio loading error');
        setIsAudioLoaded(false);
      };
      
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      
      return () => {
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }
  }, []);

  const toggleMusic = useCallback(async () => {
    const audio = audioRef.current;
    if (audio && isAudioLoaded) {
      try {
        if (isPlaying) {
          audio.pause();
          setIsPlaying(false);
        } else {
          if (audio.ended) {
            audio.currentTime = 0;
          }
          audio.volume = 0.7;
          await audio.play();
          setIsPlaying(true);
        }
      } catch (error) {
        console.error('Audio playback failed:', error);
        audio.load();
        setIsAudioLoaded(false);
      }
    }
  }, [isPlaying, isAudioLoaded]);

  const stopMusic = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
    }
  }, []);

  // --- Preload images robustly ---
  useEffect(() => {
    if (!images || images.length === 0) {
      setImagesLoaded(true);
      return;
    }
    let loaded = 0;
    const total = images.length;
    images.forEach((img) => {
      const i = new Image();
      i.src = img.dataUrl;
      i.onload = () => {
        loaded++;
        if (loaded >= total) {
          setImagesLoaded(true);
        }
      };
      i.onerror = () => {
        loaded++;
        if (loaded >= total) {
          setImagesLoaded(true);
        }
      };
    });
  }, [images]);

  // --- card flow control (enter -> visible -> out -> next) ---
  useEffect(() => {
    if (!imagesLoaded || images.length === 0) return;

    // clear any previous timeouts
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];

    // start playing from current index
    const playFrom = (idx: number) => {
      setCurrentIndex(idx);
      setPhase("enter");

      // advance to visible
      const t1 = window.setTimeout(() => setPhase("visible"), ENTER_MS);
      timeoutsRef.current.push(t1);

      // start exit (spawn particles)
      const t2 = window.setTimeout(() => {
        setPhase("out");
        // compute center of the card container
        const cont = containerRef.current;
        if (cont) {
          const r = cont.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          spawnExplosion(cx, cy);
        } else {
          spawnExplosion(window.innerWidth / 2, window.innerHeight / 2);
        }
      }, ENTER_MS + VISIBLE_MS);
      timeoutsRef.current.push(t2);

      // after out, go to next
      const t3 = window.setTimeout(() => {
        const next = idx + 1;
        if (next >= images.length) {
          // final card finished -> show overlay
          setShowOverlay(true);
          return;
        } else {
          playFrom(next);
        }
      }, ENTER_MS + VISIBLE_MS + OUT_MS);
      timeoutsRef.current.push(t3);
    };

    playFrom(currentIndex);

    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesLoaded]); // start after loaded

  // cycle romantic title texts
  useEffect(() => {
    const id = window.setInterval(() => {
      setRomanticTextIndex((p) => (p + 1) % romanticTexts.length);
    }, 5200);
    return () => clearInterval(id);
  }, [romanticTexts.length]);



  // helper to render caption words with staggered transforms (smooth)
  function renderCaptionWords(text: string) {
    const words = text.split(" ");
    return (
      <div className="caption-words inline-block">
        {words.map((w, i) => (
          <span
            key={i}
            className="caption-word"
            style={{ "--i": i } as React.CSSProperties}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </div>
    );
  }

  // onComplete handler for final overlay - FIXED with better event handling
  const handleOpen = useCallback(() => {
    console.log('Tap to Open clicked!'); // Debug log
    try {
      stopMusic(); // Stop music when transitioning to next page
      onComplete();
    } catch (error) {
      console.error('Error calling onComplete:', error);
    }
  }, [onComplete, stopMusic]);

  return (
    <div className="intro-root min-h-screen bg-gradient-to-br from-[#0b0212] to-[#1a0325] relative overflow-hidden">
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={introMusic}
        loop
        preload="auto"
      />

      {/* Canvas for particles (fixed full-screen) */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />

      {/* Fixed Music Button */}
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleMusic}
          disabled={!isAudioLoaded}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 transform ${
            isPlaying 
              ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-pink-500/30 animate-pulse' 
              : 'bg-gradient-to-r from-pink-400 to-rose-400 hover:shadow-pink-400/30'
          } ${!isAudioLoaded ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
          `}
        >
          {/* Glow Effect */}
          <div className={`absolute inset-0 rounded-full blur-lg ${
            isPlaying ? 'bg-pink-400/60 animate-pulse' : 'bg-pink-400/30'
          }`}></div>
          
          {/* Play/Pause Icon */}
          <div className="relative z-10">
            {!isAudioLoaded ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : isPlaying ? (
              <Pause className="text-xl" />
            ) : (
              <Play className="text-xl ml-1" />
            )}
          </div>

          {/* Music Visualization */}
          {isPlaying && (
            <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {[1, 2, 3, 4].map((bar) => (
                <div
                  key={bar}
                  className="w-1 bg-pink-400 rounded-full music-bar"
                  style={{
                    animationDelay: `${bar * 0.2}s`
                  }}
                ></div>
              ))}
            </div>
          )}

          {/* Music Note Animation */}
          {isPlaying && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-pink-300 animate-bounce">
              <Volume2 className="text-sm" />
            </div>
          )}
        </button>
      </div>



      {/* Reduced background sparkles for better performance */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-twinkle"
            style={{
              left: `${20 + (i * 12)}%`,
              top: `${15 + (i * 10)}%`,
              animationDelay: `${i * 0.8}s`,
              animationDuration: "4s",
              zIndex: 2,
              opacity: 0.6,
            }}
          >
            <Sparkles className="w-3 h-3 text-yellow-200 opacity-60" />
          </div>
        ))}
      </div>

      {/* main */}
      <div className="relative z-30 min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="title text-4xl md:text-5xl font-extrabold mb-6 leading-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.85)]">
            {romanticTexts[romanticTextIndex]}
          </h1>

          <div
            ref={containerRef}
            className="card-stage relative mx-auto"
            style={{ width: 420, height: 540 }}
          >
            {images.map((img, idx) => {
              const active = idx === currentIndex;
              if (!active && Math.abs(idx - currentIndex) > 1) return null; // Only render current and adjacent cards
              
              return (
                <div
                  key={idx}
                  className={`card ${active ? `card-active phase-${phase}` : "card-hidden"}`}
                  aria-hidden={!active ? "true" : "false"}
                >
                  <div className="card-inner">
                    <div className="card-glow" />
                    <div className="card-content">
                      <img src={img.dataUrl} alt={img.name} className="card-image" />
                      <div className="card-caption">
                        {renderCaptionWords(captionsPool[idx % captionsPool.length])}
                      </div>
                    </div>

                    {/* Reduced floating hearts for performance */}
                    {active && (
                      <div className="card-floating">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="floating-heart" style={{
                            left: `${20 + i * 20}%`,
                            top: `${20 + i * 15}%`,
                            animationDelay: `${0.3 * i}s`
                          }}>
                            <Heart className="w-3 h-3 text-pink-300" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="card-ellipse" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* navigation dots only */}
          <div className="mt-8 flex items-center justify-center">
            <div className="dots flex gap-2 items-center">
              {images.map((_, i) => (
                <div key={i} className={`dot ${i === currentIndex ? "dot-active" : ""}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FIXED final overlay with better z-index and event handling */}
      {showOverlay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100]"
          style={{ position: 'fixed', zIndex: 9999 }}
        >
          <div className="overlay-inner text-center p-8 rounded-3xl bg-gradient-to-br from-purple-900/90 to-pink-900/90 backdrop-blur-sm border border-pink-500/20">
            <Heart className="w-20 h-20 mx-auto mb-6 text-pink-400 animate-pulse" />
            <h2 className="text-4xl text-white mb-4 font-bold">Don't get lost in this romantic vibe... 💫</h2>
            <p className="text-gray-200 mb-6 text-lg">You have something special waiting.</p>
            <button 
              className="open-btn bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-pink-500/25"
              onClick={handleOpen}
              style={{ 
                cursor: 'pointer',
                border: 'none',
                outline: 'none',
                userSelect: 'none'
              }}
            >
              Tap to Open ✨
            </button>
          </div>
        </div>
      )}

      {/* styles */}
      <style>{`
        :root {
          --card-w: 420px;
          --card-h: 540px;
        }
        .title { letter-spacing: -0.02em; }

        /* stage and card layout */
        .card-stage { width: var(--card-w); height: var(--card-h); perspective: 1400px; position: relative; }

        .card { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; will-change: transform, opacity; }
        .card-hidden { pointer-events: none; opacity: 0; transform: scale(0.95) translateY(10px); }

        .card-active { pointer-events: auto; }

        .card-inner {
          position: relative;
          width: calc(var(--card-w));
          height: calc(var(--card-h));
          border-radius: 28px;
          overflow: visible;
          transform-style: preserve-3d;
          display: flex;
          align-items: stretch;
          justify-content: center;
        }

        /* the visible card content (image + caption) */
        .card-content {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(250,240,245,0.92) 100%);
          border-radius: 26px;
          margin: 0;
          display:flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          box-shadow: 0 30px 60px rgba(6,6,7,0.45), inset 0 1px 0 rgba(255,255,255,0.3);
          border: 1px solid rgba(255, 255, 255, 0.14);
          overflow: hidden;
          z-index: 5;
          will-change: transform, opacity, filter;
        }

        /* glowing border - layered behind the content but visible */
        .card-glow {
          position: absolute;
          inset: -6px;
          border-radius: 34px;
          z-index: 3;
          background: linear-gradient(90deg, rgba(236,72,153,0.06), rgba(245,158,255,0.05), rgba(168,85,247,0.06));
          filter: blur(18px);
          pointer-events: none;
          transition: opacity 350ms ease;
        }

        /* animated gradient stroke overlay (fast) */
        .card-inner::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 28px;
          padding: 2px;
          background: linear-gradient(90deg, rgba(236,72,153,0.65), rgba(244,114,182,0.6), rgba(168,85,247,0.6));
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0.0;
          transition: opacity 500ms ease;
          z-index: 6;
          pointer-events: none;
          filter: blur(6px) saturate(1.1);
        }

        /* deep elliptical shadow under the card */
        .card-ellipse {
          position: absolute;
          bottom: -18px;
          left: 50%;
          transform: translateX(-50%);
          width: 62%;
          height: 44px;
          background: radial-gradient(closest-side, rgba(244,114,182,0.18), rgba(0,0,0,0));
          filter: blur(18px);
          z-index: 2;
          border-radius: 999px;
        }

        /* image */
        .card-image {
          width: 100%;
          height: 76%;
          object-fit: contain;
          display: block;
          padding: 18px;
          z-index: 8;
        }

        /* caption area */
        .card-caption {
          width: 100%;
          height: 24%;
          display:flex;
          align-items:center;
          justify-content:center;
          padding: 0 18px;
          z-index: 9;
          background: linear-gradient(180deg, rgba(255,255,255,0.01), rgba(255,255,255,0.02));
          backdrop-filter: blur(6px);
        }
        .card-caption p { margin:0; }

        /* floating hearts inside card */
        .card-floating { position: absolute; inset: 0; z-index: 7; pointer-events: none; }
        .floating-heart { position:absolute; transform-origin: center; opacity: 0.9; animation: floatTiny 4.5s ease-in-out infinite; }
        @keyframes floatTiny {
          0% { transform: translateY(0) scale(1); opacity: 0.85; }
          50% { transform: translateY(-18px) scale(1.08); opacity: 1; }
          100% { transform: translateY(0) scale(1); opacity: 0.85; }
        }

        /* Optimized phases with simpler animations */
        .phase-enter .card-inner { animation: cardEnter 600ms ease-out both; }
        .phase-visible .card-inner { transform: none; opacity: 1; }
        .phase-out .card-inner { animation: cardOut 600ms ease-in both; }

        @keyframes cardEnter {
          0% { transform: translateY(30px) scale(0.9); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes cardOut {
          0% { transform: translateY(0) scale(1); opacity: 1; }
          100% { transform: translateY(-30px) scale(0.9); opacity: 0; }
        }

        /* Simplified caption word animation */
        .caption-words { display: inline-block; }
        .caption-word {
          display: inline-block;
          opacity: 0;
          animation: wordIn 400ms ease-out forwards;
          animation-delay: calc(var(--i) * 0.05s);
          margin-right: 6px;
          color: #7a2540;
          font-weight: 700;
        }
        @keyframes wordIn {
          to { opacity: 1; }
        }



        .dots { display:flex; align-items:center; justify-content:center; }
        .dot { width:10px; height:10px; border-radius:99px; background: rgba(255,255,255,0.12); transition: transform 200ms, background 200ms; }
        .dot-active { background: linear-gradient(90deg,#ff6aa1,#ff9cd1); transform: scale(1.4); box-shadow: 0 6px 18px rgba(255,120,170,0.18); }

        /* simple animations used globally */
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        @keyframes twinkle { 0%,100%{ opacity:0.02; transform: scale(.8);} 50% { opacity:0.9; transform: scale(1.15);} }

        /* music visualization bars */
        .music-bar { 
          height: 4px;
          animation: musicBar 1.5s ease-in-out infinite;
        }
        @keyframes musicBar {
          0%, 100% { height: 4px; }
          25% { height: 16px; }
          50% { height: 8px; }
          75% { height: 12px; }
        }

        /* GPU acceleration and performance hints */
        .card-inner, .card-content, .card-image, .card-glow { 
          will-change: transform, opacity;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        .floating-heart {
          will-change: transform;
          transform: translateZ(0);
        }
      `}</style>
    </div>
  );
};

export default IntroSlideshow;
