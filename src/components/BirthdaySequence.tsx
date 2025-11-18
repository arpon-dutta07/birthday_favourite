import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import Particles from './Particles';
import Confetti from './Confetti';
import outroMusic from '../assets/outro.mp3';

interface Props {
  name: string;
  age: string;
  message: string;
  images: Array<{ name: string; dataUrl: string }>;
  audio: { name: string; dataUrl: string } | null;
  onComplete: () => void;
  onReplay: () => void;
  isCompleted: boolean;
}

type SequenceState =
  | 'greeting'
  | 'dark'
  | 'bulb'
  | 'room'
  | 'decorate'
  | 'cake'
  | 'blow'
  | 'gift'
  | 'credits';

const BirthdaySequence: React.FC<Props> = ({
  name,
  age,
  message,
  images,
  audio,
  onComplete,
  onReplay,
  isCompleted,
}) => {
  const [state, setState] = useState<SequenceState>('greeting');
  const [isDecorated, setIsDecorated] = useState(false);
  const [showCake, setShowCake] = useState(false);
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [showGift, setShowGift] = useState(false);
  const [giftOpened, setGiftOpened] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // new states for PNG sequence
  const [showDecorImages, setShowDecorImages] = useState(false);
  const [currentDecorIndex, setCurrentDecorIndex] = useState(0);

  // flash state
  const [showFlash, setShowFlash] = useState(false);

  // detect mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Outro music states
  const [showOutroMusic, setShowOutroMusic] = useState(false);
  const [isOutroPlaying, setIsOutroPlaying] = useState(false);
  const [isOutroLoaded, setIsOutroLoaded] = useState(false);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const audioRef = useRef<HTMLAudioElement>(null);
  const outroAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (state === 'greeting') {
      const timer = setTimeout(() => setState('dark'), 3000);
      return () => clearTimeout(timer);
    }
    if (state === 'dark') {
      const timer = setTimeout(() => setState('bulb'), 2000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  // Outro audio setup
  useEffect(() => {
    const audio = outroAudioRef.current;
    if (audio) {
      const handleCanPlayThrough = () => setIsOutroLoaded(true);
      const handleEnded = () => setIsOutroPlaying(false);
      const handleError = () => {
        console.error('Outro audio loading error');
        setIsOutroLoaded(false);
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

  const handleBulbClick = () => {
    if (state === 'bulb') setState('room');
  };

  const handleDecorate = () => {
    if (isDecorated) return; // Prevent multiple clicks
    
    setIsDecorated(true);
    setShowConfetti(true);
    setShowDecorImages(true);
    setCurrentDecorIndex(0);
    
    // Immediately change state to prevent button from showing again
    setState('decorate');
    
    setTimeout(() => setCurrentDecorIndex(1), 2000);
    setTimeout(() => setCurrentDecorIndex(2), 4000);
    setTimeout(() => setState('cake'), 6000);
    setTimeout(() => setShowConfetti(false), 4000);
  };

  const handleBringCake = () => {
    setShowCake(true);
    setState('blow');
  };

  const handleBlowCandles = () => {
    setCandlesBlown(true);
    if (audio && audioRef.current && !audioEnabled) {
      audioRef.current.play().then(() => setAudioEnabled(true)).catch(() => {});
    }
    setTimeout(() => {
      setShowGift(true);
      setState('gift');
    }, 2000);
  };

  const handleGiftClick = () => {
    setGiftOpened(true);
    setShowConfetti(true);
    setShowFlash(true);
    setShowOutroMusic(true); // Show outro music button after gift is clicked
    setTimeout(() => {
      setShowFlash(false);
      setShowDecorImages(false);
      setState('credits');
      onComplete();
    }, 300);
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioEnabled) {
      audioRef.current.pause();
      setAudioEnabled(false);
    } else {
      audioRef.current.play();
      setAudioEnabled(true);
    }
  };

  const toggleOutroMusic = async () => {
    const audio = outroAudioRef.current;
    if (audio && isOutroLoaded) {
      try {
        if (isOutroPlaying) {
          audio.pause();
          setIsOutroPlaying(false);
        } else {
          if (audio.ended) {
            audio.currentTime = 0;
          }
          audio.volume = 0.7;
          await audio.play();
          setIsOutroPlaying(true);
        }
      } catch (error) {
        console.error('Outro audio playback failed:', error);
        audio.load();
        setIsOutroLoaded(false);
      }
    }
  };

  const desktopImages = [
    '/assets/ballons.png',
    '/assets/popup.png',
    '/assets/happy.png',
  ];
  const mobileImages = [
    '/assets/mobile (1).png',
    '/assets/mobile (3).png',
    '/assets/mobile (2).png',
  ];
  const imagesToShow = isMobile ? mobileImages : desktopImages;
  const roomImage = '/assets/room.jpg';

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {audio && (
        <audio ref={audioRef} loop>
          <source src={audio.dataUrl} type="audio/mpeg" />
        </audio>
      )}
      
      {/* Outro Music Audio Element */}
      <audio
        ref={outroAudioRef}
        src={outroMusic}
        loop
        preload="auto"
      />

      {audio && (
        <button
          onClick={toggleAudio}
          className="absolute top-4 right-4 z-30 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors"
        >
          {audioEnabled ? <Volume2 /> : <VolumeX />}
        </button>
      )}

      {/* Outro Music Button - appears after gift is clicked */}
      {showOutroMusic && (
        <div className="fixed top-6 right-20 z-50">
          <button
            onClick={toggleOutroMusic}
            disabled={!isOutroLoaded}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 transform ${
              isOutroPlaying 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-pink-500/30 animate-pulse' 
                : 'bg-gradient-to-r from-pink-400 to-rose-400 hover:shadow-pink-400/30'
            } ${!isOutroLoaded ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
            `}
          >
            {/* Glow Effect */}
            <div className={`absolute inset-0 rounded-full blur-lg ${
              isOutroPlaying ? 'bg-pink-400/60 animate-pulse' : 'bg-pink-400/30'
            }`}></div>
            
            {/* Play/Pause Icon */}
            <div className="relative z-10">
              {!isOutroLoaded ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isOutroPlaying ? (
                <Pause className="text-xl" />
              ) : (
                <Play className="text-xl ml-1" />
              )}
            </div>

            {/* Music Visualization */}
            {isOutroPlaying && (
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
            {isOutroPlaying && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-pink-300 animate-bounce">
                <Volume2 className="text-sm" />
              </div>
            )}
          </button>
        </div>
      )}

      {isCompleted && (
        <button
          onClick={onReplay}
          className="absolute top-4 left-4 z-30 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-colors"
        >
          <RotateCcw />
        </button>
      )}

      {/* Background Room */}
      <AnimatePresence>
        {['room', 'decorate', 'cake', 'blow', 'gift', 'credits'].includes(state) && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            <img src={roomImage} alt="Room" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {(isDecorated || giftOpened) && <Particles />}
      {showConfetti && <Confetti />}

      {/* PNG Decorations */}
      <AnimatePresence>
        {showDecorImages &&
          imagesToShow.map(
            (src, index) =>
              index <= currentDecorIndex && (
                <motion.img
                  key={index}
                  src={src}
                  alt={`decor-${index}`}
                  className={`absolute top-0 left-0 w-full z-20 ${
                    isMobile ? 'h-screen object-cover' : 'object-contain'
                  }`}
                  initial={{ y: '100%', opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 1, ease: 'easeInOut' }}
                />
              )
          )}
      </AnimatePresence>

      {showFlash && (
        <motion.div
          className="absolute inset-0 z-50 bg-white"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen p-6">
        <AnimatePresence mode="wait">
          {state === 'greeting' && (
            <motion.h1
              key="greet"
              className="text-4xl md:text-6xl font-playfair font-bold text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1 }}
            >
              Hey... {name} ✨
            </motion.h1>
          )}

          {state === 'dark' && (
            <motion.h2
              key="dark"
              className="text-3xl md:text-5xl font-playfair font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              Why is it so dark here? 🤔
            </motion.h2>
          )}

          {state === 'bulb' && (
            <motion.div
              key="bulb"
              className="text-center text-white cursor-pointer"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              onClick={handleBulbClick}
            >
              <motion.div
                className="text-9xl mb-6"
                animate={{
                  filter: [
                    'drop-shadow(0 0 20px #ffd700)',
                    'drop-shadow(0 0 40px #ffd700)',
                    'drop-shadow(0 0 20px #ffd700)',
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                💡
              </motion.div>
              <p className="text-2xl">Tap the bulb to light up</p>
            </motion.div>
          )}

          {state === 'room' && (
            <motion.button
              key="decorate"
              onClick={handleDecorate}
              className="btn-romantic text-white py-4 px-8 rounded-full text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              Let’s Decorate 🎉
            </motion.button>
          )}

          {state === 'cake' && !showCake && (
            <motion.button
              key="cake-btn"
              onClick={handleBringCake}
              className="btn-romantic text-white py-4 px-8 rounded-full text-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              Bring the Cake 🎂
            </motion.button>
          )}

          {showCake && state === 'blow' && (
            <motion.div
              key="cake"
              className="text-center text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="text-[10rem]">🎂</div>
              {!candlesBlown && (
                <div className="flex justify-center space-x-3 mb-6">
                  {age
                    ? [...Array(Math.min(parseInt(age), 10))].map((_, i) => (
                        <motion.div
                          key={i}
                          className="text-4xl flame"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          🕯️
                        </motion.div>
                      ))
                    : [...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="text-4xl flame"
                          style={{ animationDelay: `${i * 0.1}s` }}
                        >
                          🕯️
                        </motion.div>
                      ))}
                </div>
              )}
              {!candlesBlown && (
                <motion.button
                  onClick={handleBlowCandles}
                  className="btn-romantic text-white py-4 px-8 rounded-full text-xl mt-4"
                  whileHover={{ scale: 1.1 }}
                >
                  Blow the candles 💨
                </motion.button>
              )}
            </motion.div>
          )}

          {showGift && state === 'gift' && !giftOpened && (
            <motion.div
              key="gift"
              className="text-center text-white cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              onClick={handleGiftClick}
            >
              <motion.div
                className="text-[8rem]"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🎁
              </motion.div>
              <p className="mt-4 text-2xl">Tap to open ✨</p>
            </motion.div>
          )}

          {state === 'credits' && (
            <motion.div
              key="credits"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1 }}
            >
              {/* Side Images for Desktop */}
              {!isMobile && (
                <>
                  {/* Left Side Image */}
                   <motion.div
                     className="absolute left-4 transform -translate-y-1/2 z-10"
                     initial={{ y: '100vh', opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                   >
                     <img 
                     src="/assets/mobile (1).png" 
                     alt="Decoration Left"
                     className="w-240 h-240"
                     />
                   </motion.div>
                   
                   {/* Right Side Image */}
                   <motion.div
                     className="absolute right-4  transform -translate-y-1/2 z-10 "
                     initial={{ y: '100vh', opacity: 0 }}
                     animate={{ y: 0, opacity: 1 }}
                     transition={{ duration: 1.5, ease: 'easeOut', delay: 0.7 }}
                   >
                     <img 
                     src="/assets/mobile (1).png" 
                     alt="Decoration Right"
                     className="w-240 h-240"
                     />
                   </motion.div>
                </>
              )}
              
              <div className="bg-black/70 rounded-2xl p-8 w-full max-w-3xl max-h-[80vh] overflow-hidden relative z-20">
                <div className="relative w-full h-[60vh] overflow-hidden">
                  <motion.div
                    className="absolute left-0 w-full"
                    initial={{ y: '100%' }}
                    animate={{ y: '-150%' }}
                    transition={{ 
                      duration: 35, 
                      ease: 'linear',
                      repeat: 5,
                      repeatType: 'loop'
                    }}
                  >
                    <div className="text-white text-center space-y-6">
                      <h2 className="text-3xl font-bold text-pink-300">
                        Happy Birthday, {name}! 🎉
                      </h2>
                      {age && <p className="text-xl text-yellow-300">Welcome to {age}! ✨</p>}
                      <p className="text-lg whitespace-pre-line">{message}</p>
                      <p className="text-5xl">🎂💖✨🎉💫</p>
                      <p className="text-xl">💕 With Love 💕</p>
                      <p className="text-lg">Made with ❤️ just for you ✨</p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* CSS for music visualization and flame animation */}
      <style>{`
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
        .flame {
          animation: flicker 0.8s ease-in-out infinite alternate;
        }
        @keyframes flicker {
          0% { transform: rotate(-2deg) scale(1); }
          50% { transform: rotate(2deg) scale(1.1); }
          100% { transform: rotate(-1deg) scale(0.95); }
        }
      `}</style>
    </div>
  );
};

export default BirthdaySequence;
