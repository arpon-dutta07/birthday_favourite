import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaPlay, FaPause, FaVolumeUp } from 'react-icons/fa';
import introMusic from '../assets/intro.mp3';

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.addEventListener('canplaythrough', () => setIsLoaded(true));
      audio.addEventListener('ended', () => setIsPlaying(false));
      
      return () => {
        audio.removeEventListener('canplaythrough', () => setIsLoaded(true));
        audio.removeEventListener('ended', () => setIsPlaying(false));
      };
    }
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={introMusic}
        loop
        preload="metadata"
      />

      {/* Floating Music Player */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="fixed right-6 top-6 z-30"
      >
        <div className="relative">
          {/* Glow Effect */}
          <div className={`absolute inset-0 rounded-full blur-lg ${isPlaying ? 'pink-glow' : 'pink-glow-soft'} opacity-60`}></div>
          
          {/* Main Button */}
          <motion.button
            onClick={togglePlay}
            disabled={!isLoaded}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className={`relative w-16 h-16 rounded-full flex items-center justify-center text-white shadow-xl transition-all duration-300 ${
              isPlaying 
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 hover:shadow-pink-500/30' 
                : 'bg-gradient-to-r from-pink-400 to-rose-400 hover:shadow-pink-400/30'
            } ${!isLoaded ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoaded ? (
              isPlaying ? (
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                >
                  <FaPause className="text-xl" />
                </motion.div>
              ) : (
                <FaPlay className="text-xl ml-1" />
              )
            ) : (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
          </motion.button>

          {/* Music Visualization */}
          {isPlaying && (
            <div className="absolute -right-6 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              {[1, 2, 3, 4].map((bar) => (
                <motion.div
                  key={bar}
                  className="w-1 bg-pink-400"
                  animate={{ 
                    height: [4, 12, 8, 16, 4],
                  }}
                  transition={{ 
                    duration: 1.2,
                    repeat: Infinity,
                    repeatType: "reverse",
                    delay: bar * 0.1,
                    ease: "easeInOut"
                  }}
                ></motion.div>
              ))}
            </div>
          )}

          {/* Music Note Animation */}
          {isPlaying && (
            <motion.div
              animate={{ 
                y: [-10, -20, -10],
                opacity: [0.5, 1, 0.5],
                scale: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-pink-300"
            >
              <FaVolumeUp className="text-sm" />
            </motion.div>
          )}
        </div>

        {/* Tooltip */}
        <div className="absolute -left-20 top-1/2 transform -translate-y-1/2 bg-black/80 text-white px-3 py-1 rounded-lg text-sm opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          {isPlaying ? 'Pause Music' : 'Play Music'}
          <div className="absolute right-0 top-1/2 transform translate-x-1 -translate-y-1/2 w-2 h-2 bg-black/80 rotate-45"></div>
        </div>
      </motion.div>

      <style jsx>{`
        .pink-glow {
          background: radial-gradient(circle, rgba(244, 114, 182, 0.8) 0%, rgba(244, 114, 182, 0.2) 70%);
        }
        .pink-glow-soft {
          background: radial-gradient(circle, rgba(244, 114, 182, 0.5) 0%, rgba(244, 114, 182, 0.1) 70%);
        }
      `}</style>
    </>
  );
};