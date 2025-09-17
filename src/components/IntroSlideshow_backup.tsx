import React, { useEffect, useRef, useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { MusicPlayer } from "./MusicPlayer"; // keep your existing MusicPlayer

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

/**
 * ParticleCanvas: internal fast canvas for explosion particles.
 * Exposes .explode(x, y, opts) to spawn particles at screen coordinates.
 */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const particlesRef = useRef<any[]>([]);
  const dprRef = useRef<number>(1);

  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const resize = () => {
      dprRef.current = window.devicePixelRatio || 1;
      canvas.width = Math.round(window.innerWidth * dprRef.current);
      canvas.height = Math.round(window.innerHeight * dprRef.current);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dprRef.current, 0, 0, dprRef.current, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // animation loop
    const step = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const now = performance.now();
      const arr = particlesRef.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.vy *= p.air;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.fade;
        p.rotation += p.spin;
        // draw heart-shaped particle
        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          const s = p.size;
          ctx.beginPath();
          // simple heart via two circles + triangle-ish path for performance
          ctx.moveTo(0, -s * 0.6);
          ctx.bezierCurveTo(-s * 0.6, -s * 1.1, -s * 1.6, -s * 0.15, -s * 0.1, s * 0.7);
          ctx.bezierCurveTo(0, s * 0.9, s * 0.6, s * 0.9, s * 0.1, s * 0.7);
          ctx.bezierCurveTo(s * 1.6, -s * 0.15, s * 0.6, -s * 1.1, 0, -s * 0.6);
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        }
        if (p.alpha <= 0.01 || p.y > window.innerHeight + 200) {
          arr.splice(i, 1);
        }
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // API: explode at screen coords (x,y) in px
  useEffect(() => {
    // provide a global function via ref to call externally — we return it via dataset on canvas
    // but we'll mount function onto element for parent to call. see wrapper below.
  }, []);

  // attach helper to DOM element for parent access
  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 60 }} />;
}

/**
 * Utility function to spawn particles on the canvas element instance.
 * We'll implement canvas management in the parent component and call spawnParticles(canvas, x, y)
 * because ParticleCanvas above is just the canvas. To keep everything self-contained in a single file,
 * below we combine canvas and spawn logic in the main component via refs.
 */

const IntroSlideshow: React.FC<IntroSlideshowProps> = ({ images, onComplete, name }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [phase, setPhase] = useState<"enter" | "visible" | "out">("enter");
  const [showOverlay, setShowOverlay] = useState(false);
  const [romanticTextIndex, setRomanticTextIndex] = useState(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<any[]>([]);
  const rafRef = useRef<number | null>(null);
  const timeoutsRef = useRef<number[]>([]);
  const activeCardRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isManualRef = useRef(false);

  const ENTER_MS = 900;
  const VISIBLE_MS = 3600; // visible time
  const OUT_MS = 900;
  const TOTAL_MS = ENTER_MS + VISIBLE_MS + OUT_MS;

  // messages
  const romanticTexts = [
    `Hey ${name ? name : "there"} 💖`,
    "Look how beautiful these memories are...",
    "Every moment with you is magical ✨",
    "You mean the world to me 🌎💫",
    "These photos tell our story 📸💕",
  ];

  const captionsPool = [
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
  ];

  // --- Canvas particle system (fast & contained) ---
  useEffect(() => {
    const canvas = canvasRef.current!;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const step = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const arr = particlesRef.current;
      for (let i = arr.length - 1; i >= 0; i--) {
        const p = arr[i];
        p.vy += p.gravity;
        p.vx *= p.friction;
        p.vy *= p.air;
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.fade;
        p.rotation += p.spin;
        if (p.alpha > 0) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation);
          const s = p.size;
          ctx.beginPath();
          ctx.moveTo(0, -s * 0.6);
          ctx.bezierCurveTo(-s * 0.55, -s * 1.0, -s * 1.45, -s * 0.2, -s * 0.1, s * 0.7);
          ctx.bezierCurveTo(0, s * 0.9, s * 0.6, s * 0.9, s * 0.1, s * 0.7);
          ctx.bezierCurveTo(s * 1.45, -s * 0.2, s * 0.55, -s * 1.0, 0, -s * 0.6);
          ctx.closePath();
          ctx.fillStyle = p.color;
          ctx.fill();
          ctx.restore();
        }
        if (p.alpha <= 0.01 || p.y > window.innerHeight + 200) arr.splice(i, 1);
      }
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  function spawnExplosion(screenX: number, screenY: number, colorBase = "#FF69B4") {
    // spawn n particles around the (screenX, screenY)
    const COUNT = 36;
    for (let i = 0; i < COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 6;
      const vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 1.8;
      const vy = Math.sin(angle) * speed - (Math.random() * 2 + 1.6);
      const size = 4 + Math.random() * 10;
      const hue = 320 + Math.random() * 60; // pink/fuchsia range
      const color = i % 3 === 0 ? `hsl(${hue},80%,65%)` : i % 2 === 0 ? "#FFD87A" : colorBase;
      particlesRef.current.push({
        x: screenX,
        y: screenY,
        vx,
        vy,
        gravity: 0.18 + Math.random() * 0.06,
        friction: 0.995,
        air: 0.995,
        size,
        spin: (Math.random() - 0.5) * 0.4,
        rotation: Math.random() * Math.PI,
        alpha: 0.95,
        fade: 0.015 + Math.random() * 0.008,
        color,
      });
    }
  }

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
  }, []);

  // manual controls (Prev/Next)
  function clearSeqAndJump(toIndex: number) {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
    isManualRef.current = true;
    // play an immediate exit animation for current card
    setPhase("out");
    // spawn particles at center quickly
    const cont = containerRef.current;
    if (cont) {
      const r = cont.getBoundingClientRect();
      spawnExplosion(r.left + r.width / 2, r.top + r.height / 2);
    } else spawnExplosion(window.innerWidth / 2, window.innerHeight / 2);

    // after short delay go to the desired card and restart play sequence
    const after = window.setTimeout(() => {
      setShowOverlay(false);
      setCurrentIndex(toIndex);
      setPhase("enter");
      // resume auto sequence from the selected index
      const resume = window.setTimeout(() => {
        // start the deck from 'toIndex' using same scheduling logic as before
        // use existing scheduling: call an inner function similar to the one above
        // to avoid duplication, simply start a new play loop by setting imagesLoaded state trigger:
        // simplest approach: mimic playFrom:
        setPhase("enter");
        const t1 = window.setTimeout(() => setPhase("visible"), ENTER_MS);
        timeoutsRef.current.push(t1);
        const t2 = window.setTimeout(() => {
          setPhase("out");
          const c = containerRef.current;
          if (c) {
            const r2 = c.getBoundingClientRect();
            spawnExplosion(r2.left + r2.width / 2, r2.top + r2.height / 2);
          }
        }, ENTER_MS + VISIBLE_MS);
        timeoutsRef.current.push(t2);
        const t3 = window.setTimeout(() => {
          const next = toIndex + 1;
          if (next >= images.length) setShowOverlay(true);
          else {
            // schedule next chain recursively by programmatically invoking the main useEffect logic:
            // easiest: manual recursion here:
            // But to keep simple, we set currentIndex to next and let the main effect sequence pick up if still imagesLoaded
            setCurrentIndex(next);
          }
        }, ENTER_MS + VISIBLE_MS + OUT_MS);
        timeoutsRef.current.push(t3);
      }, 220);
      timeoutsRef.current.push(resume);
      isManualRef.current = false;
    }, 600);
    timeoutsRef.current.push(after);
  }

  const goNext = () => {
    const next = Math.min(images.length - 1, currentIndex + 1);
    if (next === currentIndex) return;
    clearSeqAndJump(next);
  };

  const goPrev = () => {
    const prev = Math.max(0, currentIndex - 1);
    if (prev === currentIndex) return;
    clearSeqAndJump(prev);
  };

  // helper to render caption words with staggered transforms (smooth)
  function renderCaptionWords(text: string) {
    const words = text.split(" ");
    return (
      <div className="caption-words inline-block">
        {words.map((w, i) => (
          <span
            key={i}
            className="caption-word"
            style={{ ["--i" as any]: i }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </span>
        ))}
      </div>
    );
  }

  // onComplete handler for final overlay
  function handleOpen() {
    onComplete();
  }

  return (
    <div className="intro-root min-h-screen bg-gradient-to-br from-[#0b0212] to-[#1a0325] relative overflow-hidden">
      {/* Canvas for particles (fixed full-screen) */}
      <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 60, pointerEvents: "none" }} />

      {/* Music */}
      <MusicPlayer />

      {/* background sparkles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
              zIndex: 2,
              opacity: 0.9,
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-200 opacity-80" />
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
              return (
                <div
                  key={idx}
                  ref={active ? activeCardRef : null}
                  className={`card ${active ? `card-active phase-${phase}` : "card-hidden"}`}
                  aria-hidden={!active}
                >
                  <div className="card-inner">
                    {/* inner glow overlay (for border) */}
                    <div className="card-glow" />
                    <div className="card-content">
                      <img src={img.dataUrl} alt={img.name} className="card-image" />
                      <div className="card-caption">
                        {renderCaptionWords(captionsPool[(idx + currentIndex) % captionsPool.length])}
                      </div>
                    </div>

                    {/* subtle internal floating hearts */}
                    <div className="card-floating">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="floating-heart" style={{
                          left: `${10 + i * 12 + (i % 2) * 6}%`,
                          top: `${18 + ((i * 7) % 40)}%`,
                          animationDelay: `${0.2 * i}s`
                        }}>
                          <Heart className="w-4 h-4 text-pink-300" />
                        </div>
                      ))}
                    </div>

                    {/* deep shadow ellipse */}
                    <div className="card-ellipse" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* navigation */}
          <div className="mt-8 flex items-center justify-center gap-6">
            <button onClick={goPrev} className="nav-btn" aria-label="Previous">
              ◀
            </button>
            <div className="dots flex gap-2 items-center">
              {images.map((_, i) => (
                <div key={i} className={`dot ${i === currentIndex ? "dot-active" : ""}`} />
              ))}
            </div>
            <button onClick={goNext} className="nav-btn" aria-label="Next">
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* final overlay */}
      {showOverlay && (
        <div className="overlay fixed inset-0 z-70 flex items-center justify-center">
          <div className="overlay-inner text-center p-8 rounded-3xl">
            <Heart className="w-20 h-20 mx-auto mb-6 text-pink-400" />
            <h2 className="text-4xl text-white mb-4">Don't get lost in this romantic vibe... 💫</h2>
            <p className="text-gray-200 mb-6">You have something special waiting.</p>
            <button className="open-btn" onClick={handleOpen}>Tap to Open ✨</button>
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

        /* phases: enter, visible, out */
        .phase-enter .card-inner { animation: cardEnter 900ms cubic-bezier(.22,1,.36,1) both; }
        .phase-visible .card-inner { transform: none; transition: transform 600ms ease; }
        .phase-out .card-inner { animation: cardOut 900ms cubic-bezier(.22,1,.36,1) both; opacity: 0; }

        /* small hover effect when user clicks (only for manual) */
        .card-inner:active { transform: translateY(4px) scale(0.995); }

        @keyframes cardEnter {
          0% { transform: perspective(1200px) translateY(40px) rotateX(12deg) rotateY(30deg) scale(.84); opacity: 0; filter: blur(8px); }
          60% { transform: perspective(1200px) translateY(-10px) rotateX(6deg) rotateY(6deg) scale(1.06); opacity: 1; filter: blur(0px); }
          100% { transform: perspective(1200px) translateY(0) rotateX(0deg) rotateY(0deg) scale(1); opacity: 1; filter: blur(0px); }
        }
        @keyframes cardOut {
          0% { transform: perspective(1200px) translateY(0) rotateX(0deg) rotateY(0deg) scale(1); opacity: 1; filter: blur(0); }
          60% { transform: perspective(1200px) translateY(-10px) rotateX(-8deg) rotateY(-20deg) scale(.88); opacity: .8; filter: blur(1px); }
          100% { transform: perspective(1200px) translateY(-140px) rotateX(-18deg) rotateY(-60deg) scale(.6); opacity: 0; filter: blur(3px); }
        }

        /* caption word animation: staggered words using CSS variable --i */
        .caption-words { display:inline-block; }
        .caption-word {
          display:inline-block;
          opacity: 0;
          transform: translateY(14px) scale(0.98);
          animation: wordIn 450ms cubic-bezier(.22,1,.36,1) forwards;
          animation-delay: calc(var(--i) * 0.08s);
          margin-right: 6px;
          color: #7a2540;
          font-weight: 700;
        }
        @keyframes wordIn {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* nav buttons */
        .nav-btn {
          width:48px; height:48px; border-radius:12px; background: rgba(255,255,255,0.06); color: #fff; border: 1px solid rgba(255,255,255,0.06);
          display:flex; align-items:center; justify-content:center; font-size:18px; cursor:pointer; transition: transform 200ms ease, background 200ms ease;
          box-shadow: 0 8px 18px rgba(0,0,0,0.5);
        }
        .nav-btn:hover { transform: translateY(-4px) scale(1.02); background: rgba(255,255,255,0.09); }

        .dots { display:flex; align-items:center; justify-content:center; }
        .dot { width:10px; height:10px; border-radius:99px; background: rgba(255,255,255,0.12); transition: transform 200ms, background 200ms; }
        .dot-active { background: linear-gradient(90deg,#ff6aa1,#ff9cd1); transform: scale(1.4); box-shadow: 0 6px 18px rgba(255,120,170,0.18); }

        /* overlay & button */
        .overlay { background: rgba(0,0,0,0.82); }
        .overlay-inner { background: linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01)); backdrop-filter: blur(8px); border-radius: 18px; box-shadow: 0 24px 80px rgba(0,0,0,0.7); }
        .open-btn {
          background: linear-gradient(90deg,#ff6aa1,#ff2fa6);
          color: white;
          padding: 14px 28px;
          border-radius: 999px;
          font-weight:600;
          box-shadow: 0 18px 50px rgba(255,80,150,0.28);
          border: none;
          cursor: pointer;
          transform-origin: center;
          transition: transform 300ms cubic-bezier(.22,1,.36,1), box-shadow 300ms;
        }
        .open-btn:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 26px 72px rgba(255,80,150,0.36); }

        /* simple animations used globally */
        .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
        @keyframes twinkle { 0%,100%{ opacity:0.02; transform: scale(.8);} 50% { opacity:0.9; transform: scale(1.15);} }

        /* performance hint */
        .card-inner, .card-content, .card-image, .card-glow { will-change: transform, opacity, filter; }
      `}</style>
    </div>
  );
};

export default IntroSlideshow;
