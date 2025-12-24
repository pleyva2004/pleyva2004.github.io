import React, { useState, useEffect } from 'react';
import { Github, Linkedin, Mail, ChevronUp, MapPin, FileText } from 'lucide-react';
import Link from 'next/link';

const Contact: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="py-16 px-6 bg-dark-card/50 border-t border-white/5 relative backdrop-blur-xl">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
          {/* Left - Social Links */}
          <div className="space-y-4">
            <h3 className="text-white font-bold mb-4 font-display text-lg tracking-tight">Connect</h3>
            <div className="space-y-3">
              <a
                href="https://github.com/pleyva2004"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-white transition-colors group w-fit"
              >
                <div className="p-2 mr-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors border border-white/5 group-hover:border-white/10">
                  <Github size={18} />
                </div>
                <span className="font-medium">GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/pablo-leyva"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-blue-400 transition-colors group w-fit"
              >
                <div className="p-2 mr-3 rounded-lg bg-white/5 group-hover:bg-blue-500/20 transition-colors border border-white/5 group-hover:border-blue-500/30">
                  <Linkedin size={18} />
                </div>
                <span className="font-medium">LinkedIn</span>
              </a>
              <a
                href="mailto:pleyva2004@gmail.com"
                className="flex items-center text-gray-400 hover:text-purple-400 transition-colors group w-fit"
              >
                <div className="p-2 mr-3 rounded-lg bg-white/5 group-hover:bg-purple-500/20 transition-colors border border-white/5 group-hover:border-purple-500/30">
                  <Mail size={18} />
                </div>
                <span className="font-medium">Email</span>
              </a>
            </div>
          </div>

          {/* Middle-Right - Ventures */}
          <div className="space-y-4">
            <h3 className="text-white font-bold mb-4 font-display text-lg tracking-tight">Ventures</h3>
            <div className="space-y-3">
              <a
                href="https://levroklabs.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-400 hover:text-white transition-colors font-medium hover:translate-x-1 duration-200"
              >
                Levrok Labs
              </a>
              <a
                href="https://levroklabs.dev/insights"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-400 hover:text-white transition-colors font-medium hover:translate-x-1 duration-200"
              >
                Insights
              </a>
            </div>
          </div>

          {/* Right - Research */}
          <div className="space-y-4">
            <h3 className="text-white font-bold mb-4 font-display text-lg tracking-tight">Deep Dive</h3>
            <div className="space-y-3">
              <Link
                href="/research"
                className="block text-gray-400 hover:text-emerald-400 transition-colors font-medium hover:translate-x-1 duration-200"
              >
                Research Dashboard
              </Link>
            </div>
          </div>

          {/* Far Right - About Me */}
          <div className="space-y-4">
            <h3 className="text-white font-bold mb-4 font-display text-lg tracking-tight">Beyond the Resume</h3>
            <div className="space-y-3">
              <a
                href="https://drive.google.com/file/d/1zAga2AMGiT4DQ2FaZ2P4oiwJUAaTAMR5/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-white transition-colors group w-fit font-medium"
              >
                <FileText size={16} className="mr-2 group-hover:text-blue-400 transition-colors" />
                <span>Resume</span>
              </a>
            </div>
          </div>
        </div>

        {/* Copyright and Location */}
        <div className="pt-8 border-t border-white/5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center text-gray-500 text-sm font-mono">
              <MapPin size={14} className="mr-2 text-gray-400" />
              <span>NYC • SF</span>
            </div>

            <p className="text-gray-600 text-sm font-light">
              © {currentYear} Pablo Leyva. All rights reserved.
            </p>

            {showBackToTop && (
              <button
                onClick={scrollToTop}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all duration-300 border border-white/5 hover:border-white/20 hover:scale-110"
                aria-label="Back to top"
              >
                <ChevronUp size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Contact;
