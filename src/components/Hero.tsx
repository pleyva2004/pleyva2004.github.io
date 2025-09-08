import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const Hero: React.FC = () => {
  // Simple typewriter effect
  const [text, setText] = useState('');
  const fullText = "AI is the great equalizer. Build what you wish existed.";
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 50);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20">
      <div className="text-center max-w-2xl mx-auto">
        {/* Profile Photo - Responsive sizing */}
        <div className="mb-4 sm:mb-6">
          <Image 
            src="/pablo_leyva_casual.JPG"
            alt="Profile" 
            width={320}
            height={320}
            className="w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full mx-auto border-4 border-white/10 shadow-2xl"
          />
        </div>

        {/* Quote Card - Responsive padding and text size */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl">
          <blockquote className="text-gray-800 text-sm sm:text-base italic leading-relaxed">
            {text}
            {text.length < fullText.length && <span className="animate-pulse ml-1">|</span>}
          </blockquote>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="mt-8 sm:mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full mx-auto flex justify-center animate-bounce">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;