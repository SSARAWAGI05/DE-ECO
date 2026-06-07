import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 800); // Wait for exit animation to finish before notifying parent
    }, 2500);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
        >
          {/* Background Ambient Glow */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 0.5, scale: 1.5 }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute w-[500px] h-[500px] rounded-full bg-blue-600/30 blur-[120px]"
          />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ 
              duration: 1, 
              ease: "easeOut",
              delay: 0.2
            }}
            className="relative z-10 flex flex-col items-center"
          >
            {/* The RS Logo */}
            <div className="relative">
              <motion.h1 
                className="text-8xl md:text-9xl font-extrabold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400"
                style={{ 
                  WebkitTextStroke: '2px rgba(255,255,255,0.1)',
                  filter: 'drop-shadow(0px 0px 20px rgba(255,255,255,0.3))'
                }}
              >
                RS
              </motion.h1>

              {/* Animated Underline/Accent */}
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "100%", opacity: 1 }}
                transition={{ duration: 1, delay: 1, ease: "easeInOut" }}
                className="absolute -bottom-4 left-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full"
                style={{ filter: 'blur(1px)', boxShadow: '0 0 10px rgba(56, 189, 248, 0.8)' }}
              />
            </div>
          </motion.div>

          {/* Particles / Sparkles effect (Subtle) */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                opacity: 0, 
                x: (Math.random() - 0.5) * 400, 
                y: (Math.random() - 0.5) * 400,
                scale: 0
              }}
              animate={{ 
                opacity: [0, 1, 0], 
                scale: [0, Math.random() * 2 + 1, 0],
                y: "-=100"
              }}
              transition={{ 
                duration: 2, 
                delay: i * 0.3 + 0.5, 
                ease: "easeOut" 
              }}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{ filter: 'blur(1px)' }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
