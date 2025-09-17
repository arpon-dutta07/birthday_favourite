import React, { useState, useEffect } from 'react';
import { Heart, Sparkles } from 'lucide-react';
import { MusicPlayer } from './MusicPlayer';

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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOverlay, setShowOverlay] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [textIndex, setTextIndex] = useState(0);

  // Natural image sizes for precise, responsive sizing per image
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number }[]>([]);

  // Viewport-based max bounds for the card (updates on resize)
  const [viewportMax, setViewportMax] = useState<{ w: number; h: number }>({ w: 420, h: 560 });

  const romanticTexts = [
    `Hey ${name ? name : 'there'} 💖`,
    'Look how beautiful these memories are...',
    'Every moment with you is magical ✨',
    'You mean the world to me 🌎💫',
    'These photos tell our story 📸💕',
  ];

  // Preload all images and capture their natural sizes
  useEffect(() => {
    if (images.length === 0) {
      setImagesLoaded(true);
      setImageMeta([]);
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;
    const dims: { width: number; height: number }[] = new Array(totalImages);

    images.forEach((image, idx) => {
      const img = new Image();
      img.onload = () => {
        loadedCount++;
        dims[idx] = { width: img.naturalWidth || 0, height: img.naturalHeight || 0 };
        if (loadedCount === totalImages) {
          setImageMeta(dims);
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        // Fall back to a square if size cannot be read
        dims[idx] = { width: 800, height: 800 };
        if (loadedCount === totalImages) {
          setImageMeta(dims);
          setImagesLoaded(true);
        }
      };
      img.src = image.dataUrl;
    });
  }, [images]);

  // Update responsive max bounds on resize for smoother fit
  useEffect(() => {
    const computeBounds = () => {
      const vw = typeof window !== 'undefined' ? window.innerWidth : 1280;
      const vh = typeof window !== 'undefined' ? window.innerHeight : 720;
      const maxW = Math.min(vw * 0.86, 900); // generous but bounded
      const maxH = Math.min(vh * 0.78, 820);
      setViewportMax({ w: Math.max(320, Math.round(maxW)), h: Math.max(320, Math.round(maxH)) });
    };
    computeBounds();
    window.addEventListener('resize', computeBounds);
    return () => window.removeEventListener('resize', computeBounds);
  }, []);

  // Start slideshow after images are loaded
  useEffect(() => {
    if (!imagesLoaded || images.length === 0) return;

    const imageInterval = setInterval(() => {
      setCurrentImageIndex((prev) => {
        if (prev >= images.length - 1) {
          clearInterval(imageInterval);
          setTimeout(() => setShowOverlay(true), 2000);
          return prev;
        }
        return prev + 1;
      });
    }, 4000);

    const textInterval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % romanticTexts.length);
    }, 4500);

    // Show overlay after slideshow duration (fallback)
    const overlayTimer = setTimeout(() => {
      setShowOverlay(true);
    }, images.length * 4000 + 6000);

    return () => {
      clearInterval(imageInterval);
      clearInterval(textInterval);
      clearTimeout(overlayTimer);
    };
  }, [imagesLoaded, images.length, romanticTexts.length]);

  const handleContinue = () => {
    onComplete();
  };

  // Compute container size based on the current image's natural size and viewport bounds
  const currentMeta = imageMeta[currentImageIndex];
  const maxW = viewportMax.w;
  const maxH = viewportMax.h;
  let containerW = Math.min(420, maxW);
  let containerH = Math.min(560, maxH);
  if (currentMeta && currentMeta.width && currentMeta.height) {
    const scale = Math.min(maxW / currentMeta.width, maxH / currentMeta.height, 1);
    containerW = Math.max(280, Math.round(currentMeta.width * scale));
    containerH = Math.max(320, Math.round(currentMeta.height * scale));
  }

  if (!imagesLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0b0212] via-[#12021a] to-[#1a0325] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-pink-400 border-t-transparent mx-auto mb-6"></div>
          <p className="text-white/90 text-xl font-light">Preparing your romantic surprise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0212] via-[#12021a] to-[#1a0325] relative overflow-hidden">
      {/* Music Player */}
      <MusicPlayer />
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Rose Petals */}
        {[...Array(25)].map((_, i) => (
          <div
            key={`petal-${i}`}
            className="absolute animate-float-romantic opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${12 + Math.random() * 8}s`,
            }}
          >
            <div className="w-3 h-3 bg-pink-300 rounded-full transform rotate-45 opacity-60"></div>
          </div>
        ))}

        {/* Floating Hearts */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`heart-${i}`}
            className="absolute animate-float-hearts opacity-50"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 12}s`,
              animationDuration: `${10 + Math.random() * 6}s`,
            }}
          >
            <Heart className="w-5 h-5 text-pink-300 fill-current" />
          </div>
        ))}

        {/* Sparkles */}
        {[...Array(30)].map((_, i) => (
          <div
            key={`sparkle-${i}`}
            className="absolute animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          >
            <Sparkles className="w-4 h-4 text-yellow-300 opacity-70" />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-4xl mx-auto">
          {/* Romantic text */}
          <div className="mb-16">
            <h1
              className={`text-5xl md:text-7xl font-semibold mb-6 leading-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-300 via-rose-200 to-pink-400 drop-shadow-[0_0_25px_rgba(244,114,182,0.55)] ${
                romanticTexts[textIndex] === 'Every moment with you is magical ✨'
                  ? 'animate-strong-glow neon-glow'
                  : 'animate-text-glow'
              }`}
            >
              {romanticTexts[textIndex]}
            </h1>
            <div className="w-40 h-[3px] bg-gradient-to-r from-transparent via-pink-400 to-transparent mx-auto animate-pulse"></div>
          </div>

          {/* Image slideshow (now responsive to natural image sizes) */}
          {images.length > 0 && (
            <div
              className="relative mx-auto perspective-1000 will-change-transform"
              style={{
                width: containerW,
                height: containerH,
                transition: 'width 500ms cubic-bezier(0.22,1,0.36,1), height 500ms cubic-bezier(0.22,1,0.36,1)',
              }}
            >
              {images.map((image, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-all duration-[1400ms] ease-[cubic-bezier(0.22,1,0.36,1)] transform-gpu ${
                    index === currentImageIndex
                      ? 'opacity-100 scale-100 rotate-0 z-20'
                      : index < currentImageIndex
                      ? 'opacity-40 scale-[0.96] -rotate-3 translate-x-6 translate-y-4 z-10'
                      : 'opacity-0 scale-95 rotate-3 -translate-x-6 translate-y-4 z-0'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    backfaceVisibility: 'hidden',
                    perspective: '1200px',
                  }}
                >
                  {/* Card with glow and subtle parallax */}
                  <div className="group bg-white/90 p-4 md:p-6 rounded-3xl shadow-[0_30px_60px_-10px_rgba(244,114,182,0.35)] backdrop-blur-sm ring-1 ring-white/40 border border-white/40 relative overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:shadow-[0_40px_80px_-10px_rgba(244,114,182,0.55)] hover:-rotate-[0.5deg]">
                    {/* Soft gradient glow */}
                    <div className="pointer-events-none absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-pink-300/20 via-rose-300/25 to-fuchsia-300/20 blur-2xl opacity-60 group-hover:opacity-90 transition-opacity duration-700"></div>

                    <img
                      src={image.dataUrl}
                      alt={`Memory ${index + 1}`}
                      className="relative z-10 w-full h-full object-contain rounded-2xl"
                      style={{ transform: 'translateZ(30px)' }}
                    />

                    <div className="relative z-10 mt-4 text-gray-700 text-sm italic font-semibold">
                      Beautiful memories ✨
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {images.length === 0 && (
            <div className="text-center">
              <Heart className="w-40 h-40 text-pink-300 mx-auto mb-8 animate-pulse-soft fill-current opacity-80" />
              <p className="text-white text-2xl font-light">A special surprise awaits you...</p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-fade-in">
          <div className="text-center p-8 max-w-2xl mx-4">
            <div className="mb-12">
              <Heart className="w-20 h-20 text-pink-400 mx-auto mb-6 animate-pulse-soft fill-current" />
              <h2 className="text-4xl md:text-5xl font-light text-white mb-8 leading-tight animate-slide-up">
                Don't get lost in this romantic vibe... 💫
              </h2>
              <p className="text-2xl text-gray-300 mb-12 font-light animate-slide-up-delay">
                You have something special waiting.
              </p>
            </div>

            <button
              onClick={handleContinue}
              className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white px-12 py-5 rounded-full text-xl font-light hover:from-pink-600 hover:via-rose-600 hover:to-pink-700 transition-all duration-500 transform hover:scale-110 animate-pulse-button shadow-2xl hover:shadow-pink-500/30"
            >
              Tap to Open ✨
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes float-romantic {
          0%, 100% { transform: translateY(0) translateX(0) rotate(0deg) scale(1); }
          25% { transform: translateY(-36px) translateX(8px) rotate(4deg) scale(1.08); }
          50% { transform: translateY(-18px) translateX(-8px) rotate(-2deg) scale(0.97); }
          75% { transform: translateY(-54px) translateX(4px) rotate(1.5deg) scale(1.04); }
        }
        
        @keyframes float-hearts {
          0%, 100% { transform: translateY(0) scale(1) rotate(0deg); opacity: 0.5; }
          25% { transform: translateY(-28px) scale(1.15) rotate(8deg); opacity: 0.8; }
          50% { transform: translateY(-14px) scale(0.93) rotate(-4deg); opacity: 0.6; }
          75% { transform: translateY(-42px) scale(1.06) rotate(6deg); opacity: 0.9; }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0; transform: scale(0.5) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.2) rotate(180deg); }
        }
        
        @keyframes text-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(244, 114, 182, 0.45), 0 0 10px rgba(255, 255, 255, 0.2); }
          50% { text-shadow: 0 0 35px rgba(244, 114, 182, 0.85), 0 0 60px rgba(244, 114, 182, 0.35); }
        }

        @keyframes strong-glow {
          0%, 100% { text-shadow: 0 0 30px rgba(244, 114, 182, 0.75), 0 0 70px rgba(236, 72, 153, 0.5); }
          50% { text-shadow: 0 0 50px rgba(244, 114, 182, 1), 0 0 110px rgba(236, 72, 153, 0.7), 0 0 150px rgba(244, 114, 182, 0.5); }
        }

        .neon-glow { text-shadow: 0 0 18px rgba(244, 114, 182, 0.75), 0 0 40px rgba(236, 72, 153, 0.5); }
        .animate-strong-glow { animation: strong-glow 2.4s ease-in-out infinite; }
        
        @keyframes pulse-soft {
          0%, 100% { transform: scale(1); opacity: 0.86; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up-delay {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-button {
          0%, 100% { transform: scale(1); box-shadow: 0 0 22px rgba(244, 114, 182, 0.42); }
          50% { transform: scale(1.02); box-shadow: 0 0 34px rgba(244, 114, 182, 0.66); }
        }
        
        .animate-float-romantic { animation: float-romantic linear infinite; }
        .animate-float-hearts { animation: float-hearts linear infinite; }
        .animate-twinkle { animation: twinkle ease-in-out infinite; }
        .animate-text-glow { animation: text-glow 3.2s ease-in-out infinite; }
        .animate-pulse-soft { animation: pulse-soft 2.2s ease-in-out infinite; }
        .animate-fade-in { animation: fade-in 1s ease-out; }
        .animate-slide-up { animation: slide-up 1s ease-out 0.5s both; }
        .animate-slide-up-delay { animation: slide-up-delay 1s ease-out 1s both; }
        .animate-pulse-button { animation: pulse-button 2s ease-in-out infinite; }
        .perspective-1000 { perspective: 1000px; }
      `}</style>
    </div>
  );
};

export default IntroSlideshow;