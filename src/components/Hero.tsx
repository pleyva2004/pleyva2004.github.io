import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import ChatInterface from './ChatInterface';
import { MessageCircle } from 'lucide-react';

const Hero: React.FC = () => {
  // Simple typewriter effect
  const [text, setText] = useState('');
  const fullText = "AI is the great equalizer. Build what you wish existed.";
  
  // Chat expansion state
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  
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
    <section className="min-h-screen flex items-center justify-center px-4 sm:px-6 pt-20 relative">
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
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-xl mt-8 sm:mt-12">
          <blockquote className="text-gray-700 text-sm sm:text-base italic leading-relaxed">
            {text}
            {text.length < fullText.length && <span className="animate-pulse ml-1">|</span>}
          </blockquote>
        </div>

        {/* Chat Input Box */}
        <motion.div 
          className="mt-8 sm:mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8}}
        >
          {!isChatExpanded && (
              <motion.div
                layoutId="chat-container"
                className="bg-white/5 backdrop-blur-xl rounded-xl px-6 py-4 shadow-xl cursor-pointer hover:bg-white/10 transition-all duration-200 group border border-white/10"
                style={{ borderRadius: "12px" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
                onClick={() => setIsChatExpanded(true)}
              >
              <div className="flex items-center justify-between space-x-4">
                {/* Left side - Plus icon and text */}
                <div className="flex items-center space-x-3">

                  <span className="text-white/90 text-sm sm:text-base group-hover:text-white transition-colors">
                    Ask me about Pablo
                  </span>
                </div>

                {/* Right side - Tools and microphone */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors">
                    <svg className="w-4 h-4 text-white/90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
      
      {/* Scroll indicator - positioned near bottom of screen */}
      <motion.div 
        className="absolute bottom-16 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.0 }}
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full mx-auto flex justify-center animate-bounce">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2"></div>
        </div>
      </motion.div>
      
      {/* Chat Interface */}
      <AnimatePresence>
        {isChatExpanded && (
          <ChatInterface 
            onClose={() => setIsChatExpanded(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Hero;