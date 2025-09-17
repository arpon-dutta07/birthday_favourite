import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Volume2, VolumeX } from 'lucide-react';
import Particles from './Particles';
import Confetti from './Confetti';

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

  // ✅ new states for PNG sequence
  const [showDecorImages, setShowDecorImages] = useState(false);
  const [currentDecorIndex, setCurrentDecorIndex] = useState(0);

  // ✅ flash state
  const [showFlash, setShowFlash] = useState(false);

  // ✅ detect mobile
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const audioRef = useRef<HTMLAudioElement>(null);

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

  const handleBulbClick = () => {
    if (state === 'bulb') {
      setState('room');
    }
  };

  const handleDecorate = () => {
    setIsDecorated(true);
    setShowConfetti(true);
    setShowDecorImages(true);
    setCurrentDecorIndex(0); // Sequence PNGs
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
      audioRef.current
        .play()
        .then(() => setAudioEnabled(true))
        .catch(() => {});
    }
    setTimeout(() => {
      setShowGift(true);
      setState('gift');
    }, 2000);
  };

  const handleGiftClick = () => {
    // open the gift, but show a white flash before revealing credits
    setGiftOpened(true);
    setShowConfetti(true);

    // show a flash overlay
    setShowFlash(true);
    const FLASH_DURATION = 300;

    // after flash, go to credits
    setTimeout(() => {
      setShowFlash(false);
      setShowDecorImages(false);
      setState('credits');
      onComplete();
    }, FLASH_DURATION);
  };

  const toggleAudio = () => {
    if (audioRef.current) {
      if (audioEnabled) {
        audioRef.current.pause();
        setAudioEnabled(false);
      } else {
        audioRef.current.play();
        setAudioEnabled(true);
      }
    }
  };

  useEffect(() => {
    if (state === 'gift') {
      setShowDecorImages(false);
    }
  }, [state]);

  // ✅ Desktop vs Mobile PNGs
  const desktopImages = [
    '/src/assets/ballons.png',
    '/src/assets/popup.png',
    '/src/assets/happy.png',
  ];
  const mobileImages = [
    '/src/assets/mobile (1).png',
    '/src/assets/mobile (3).png',
    '/src/assets/mobile (2).png',
  ];
  const imagesToShow = isMobile ? mobileImages : desktopImages;

  const roomImage = '/src/assets/room.jpg';

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Audio */}
      {audio && (
        <audio ref={audioRef} loop>
          <source src={audio.dataUrl} type="audio/mpeg" />
        </audio>
      )}

      {/* Audio Toggle */}
      {audio && audioEnabled && (
        <button
          onClick={toggleAudio}
          className="absolute top-4 right-4 z-30 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
        >
          {audioEnabled ? (
            <Volume2 className="w-5 h-5" />
          ) : (
            <VolumeX className="w-5 h-5" />
          )}
        </button>
      )}

      {/* Replay Button */}
      {isCompleted && (
        <button
          onClick={onReplay}
          className="absolute top-4 left-4 z-30 bg-white/20 backdrop-blur-sm text-white p-3 rounded-full hover:bg-white/30 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      )}

      {/* Background Room */}
      <AnimatePresence>
        {(state === 'room' ||
          state === 'decorate' ||
          state === 'cake' ||
          state === 'blow' ||
          state === 'gift' ||
          state === 'credits') && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
          >
            <img
              src={roomImage}
              alt="Room"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Particles */}
      {(isDecorated || giftOpened) && <Particles />}

      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* ✅ Decor Images Sequence */}
      <AnimatePresence>
        {showDecorImages && (
          <>
            {imagesToShow.map(
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
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                  />
                ),
            )}
          </>
        )}
      </AnimatePresence>

      {/* Flash overlay when opening gift */}
      <AnimatePresence>
        {showFlash && (
          <motion.div
            key="flash"
            className="absolute inset-0 z-50 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, times: [0, 0.2, 1] }}
            style={{ backgroundColor: '#ffffff' }}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="relative z-20 flex items-center justify-center min-h-screen p-6">
        <AnimatePresence mode="wait">
          {/* Greeting */}
          {state === 'greeting' && (
            <motion.div
              key="greeting"
              className="text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1 }}
            >
              <h1 className="text-4xl md:text-6xl font-playfair font-bold">
                Hey... {name} ✨
              </h1>
            </motion.div>
          )}

          {/* Dark */}
          {state === 'dark' && (
            <motion.div
              key="dark"
              className="text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1 }}
            >
              <h2 className="text-3xl md:text-5xl font-playfair font-bold">
                Why is it so dark here? 🤔
              </h2>
            </motion.div>
          )}

          {/* Bulb */}
          {state === 'bulb' && (
            <motion.div
              key="bulb"
              className="text-center text-white cursor-pointer"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.8 }}
              onClick={handleBulbClick}
            >
              <motion.div
                className="text-9xl mb-6 bulb-glow"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  filter: [
                    'drop-shadow(0 0 20px #ffd700)',
                    'drop-shadow(0 0 40px #ffd700)',
                    'drop-shadow(0 0 20px #ffd700)',
                  ],
                }}
                transition={{
                  filter: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                💡
              </motion.div>
              <p className="text-2xl md:text-3xl font-playfair">
                Tap the bulb to light up
              </p>
            </motion.div>
          )}

          {/* Room - Decorate Button */}
          {state === 'room' && (
            <motion.div
              key="decorate"
              className="text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <button
                onClick={handleDecorate}
                className="btn-romantic text-white font-semibold py-4 px-8 rounded-full text-xl flex items-center space-x-2 mx-auto transform hover:scale-105 transition-transform"
              >
                <span>Let's Decorate</span>
                <span>🎉</span>
              </button>
            </motion.div>
          )}

          {/* Bring Cake */}
          {state === 'cake' && !showCake && (
            <motion.div
              key="bring-cake"
              className="text-center text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, delay: 1.5 }}
            >
              <button
                onClick={handleBringCake}
                className="btn-romantic text-white font-semibold py-4 px-8 rounded-full text-xl flex items-center space-x-2 mx-auto transform hover:scale-105 transition-transform"
              >
                <span>Bring the Cake</span>
                <span>🎂</span>
              </button>
            </motion.div>
          )}

          {/* Cake + Candles */}
          {showCake && state === 'blow' && (
            <motion.div
              key="cake"
              className="text-center text-white"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 1 }}
            >
              <div className="mb-6">
                <motion.div
                  className="text-[12rem] mb-4"
                  animate={{ rotate: candlesBlown ? 0 : [0, -1, 1, 0] }}
                  transition={{
                    duration: 3,
                    repeat: candlesBlown ? 0 : Infinity,
                  }}
                >
                  🎂
                </motion.div>
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
              </div>
              {!candlesBlown && (
                <button
                  onClick={handleBlowCandles}
                  className="btn-romantic text-white font-semibold py-4 px-8 rounded-full text-xl transform hover:scale-105 transition-transform"
                >
                  Blow the candles (tap here) 💨
                </button>
              )}
            </motion.div>
          )}

          {/* Gift */}
          {showGift && state === 'gift' && !giftOpened && (
            <motion.div
              key="gift"
              className="text-center text-white cursor-pointer"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 1 }}
              onClick={handleGiftClick}
            >
              <motion.div
                className="text-[8rem] mb-6"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                animate={{ y: [0, -10, 0], rotateY: [0, 5, -5, 0] }}
                transition={{
                  y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                  rotateY: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                🎁
              </motion.div>
              <p className="text-2xl md:text-3xl font-playfair mb-4">
                A special gift for you!
              </p>
              <p className="text-xl font-playfair">Tap to open ✨</p>
            </motion.div>
          )}

          {/* Credits with automatic upward scroll */}
          {state === 'credits' && (
            <motion.div
              key="credits"
              className="absolute inset-0 flex items-center justify-center z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              {/* backdrop card */}
              <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-8 w-full max-w-3xl max-h-[80vh] overflow-hidden">
                <div className="relative w-full h-[60vh] overflow-hidden">
                  <motion.div
                    className="absolute left-0 w-full"
                    initial={{ y: '100%' }}
                    animate={{ y: '-120%' }}
                    transition={{ duration: 12, ease: 'linear' }}
                  >
                    <div className="text-white text-center px-6">
                      <h2 className="text-3xl md:text-4xl font-playfair font-bold mb-6 text-pink-300">
                        Happy Birthday, {name}! 🎉
                      </h2>
                      {age && (
                        <p className="text-xl md:text-2xl mb-6 text-yellow-300">
                          Welcome to {age}! ✨
                        </p>
                      )}

                      <div className="text-lg md:text-xl leading-relaxed whitespace-pre-line mb-8">
                        {message ||
                          'Wishing you all the happiness in the world on your special day! 💖'}
                      </div>

                      <div className="text-6xl mb-6">🎂💖✨🎉💫</div>
                      <div className="text-2xl mb-24">💕 With Love 💕</div>

                      <div className="text-lg md:text-xl leading-relaxed whitespace-pre-line mb-8">
                        From all of us — We hope your day is filled with love,
                        laughs, and cake.
                      </div>
                      <div className="text-6xl mb-6">🌟🌟🌟</div>
                      <div className="text-2xl">— Made with ❤️</div>

                      <div style={{ height: 120 }} />
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BirthdaySequence;
