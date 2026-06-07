import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { getThemeColors } from '../styles/colors';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { isDark, isFocusMode } = useTheme();
  const themeColors = getThemeColors(isDark, isFocusMode);

  useEffect(() => {
    // Show splash screen for 2.2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onFinish, 800); // Wait for exit animation
    }, 2200);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
          style={{ backgroundColor: themeColors.primary.lightGray }}
        >
          {/* Cinematic Reveal Animation for Logo */}
          <motion.img 
            src="/logo/De-Eco-logo.png"
            alt="DE-ECO Logo"
            className="w-48 md:w-64 object-contain"
            initial={{ opacity: 0, scale: 0.85, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              opacity: { duration: 1.2, ease: "easeOut" },
              scale: { duration: 1.8, ease: [0.16, 1, 0.3, 1] }, // Very smooth custom easing
              y: { duration: 1.2, ease: "easeOut" }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
