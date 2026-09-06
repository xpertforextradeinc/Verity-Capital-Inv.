import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, DollarSign } from 'lucide-react';

const TESTIMONIALS = [
  "Someone from UK just withdrew $500,000 profit",
  "Someone from Rhode Island invested $20,000",
  "Someone from Texas just bought 2.5 BTC",
  "Someone from Germany just withdrew $125,000 profit",
  "Someone from New York invested $50,000",
  "Someone from Australia just withdrew $80,000 profit"
];

export function TestimonialPopup() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the first one after 5 seconds for demonstration
    const initialTimer = setTimeout(() => {
      setIsVisible(true);
      setTimeout(() => setIsVisible(false), 5000);
    }, 5000);

    // Then trigger every 5 minutes (300,000 ms)
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
      setIsVisible(true);
      
      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5000);
    }, 5 * 60 * 1000); // 5 minutes

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: -20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-[#0a0e17] px-4 py-3 shadow-2xl rounded-xl border border-zinc-800/80 max-w-sm"
        >
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400">
            {TESTIMONIALS[currentIndex].includes('invested') || TESTIMONIALS[currentIndex].includes('bought') ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <DollarSign className="w-5 h-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-100">Live Activity</p>
            <p className="text-xs text-zinc-400">{TESTIMONIALS[currentIndex]}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
