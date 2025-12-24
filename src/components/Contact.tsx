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
    <footer id="contact" className="py-12 px-6 bg-dark-card border-t border-white/10 relative">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Left - Social Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="space-y-3">
              <a
                href="https://github.com/pleyva2004"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-white transition-colors group"
              >
                <Github size={16} className="mr-2" />
                <span>GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/pablo-leyva"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-white transition-colors group"
              >
                <Linkedin size={16} className="mr-2" />
                <span>LinkedIn</span>
              </a>
              <a
                href="mailto:pleyva2004@gmail.com"
                className="flex items-center text-gray-400 hover:text-white transition-colors group"
              >
                <Mail size={16} className="mr-2" />
                <span>Email</span>
              </a>
            </div>
          </div>

          {/* Middle-Right - Ventures */}
          <div>
            <h3 className="text-white font-semibold mb-4">Ventures</h3>
            <div className="space-y-3">
              <a
                href="https://levroklabs.dev"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-400 hover:text-white transition-colors"
              >
                Levrok Labs
              </a>
              <a
                href="https://levroklabs.dev/insights"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-400 hover:text-white transition-colors"
              >
                Insights
              </a>
            </div>
          </div>

          {/* Right - Research */}
          <div>
            <h3 className="text-white font-semibold mb-4">Deep Dive</h3>
            <div className="space-y-3">
              <Link
                href="/research"
                className="block text-gray-400 hover:text-white transition-colors"
              >
                Research
              </Link>
            </div>
          </div>

          {/* Far Right - About Me */}
          <div>
            <h3 className="text-white font-semibold mb-4">Beyond the Resume</h3>
            <div className="space-y-3">
              <a
                href="https://drive.google.com/file/d/1zAga2AMGiT4DQ2FaZ2P4oiwJUAaTAMR5/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-gray-400 hover:text-white transition-colors group"
              >
                <FileText size={16} className="mr-2" />
                <span>Resume</span>
              </a>
              <a
                href="#"
                className="block text-gray-400 hover:text-white transition-colors cursor-not-allowed"
                onClick={(e) => e.preventDefault()}
              >
                About Me
              </a>
            </div>
          </div>
        </div>

        {/* Copyright and Location */}
        <div className="pt-8 border-t border-white/10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center text-gray-500 text-sm">
              <MapPin size={14} className="mr-1" />
              <span>NYC • SF</span>
            </div>
            <p className="text-gray-500 text-sm">
              © {currentYear} Pablo Leyva
            </p>
            {showBackToTop && (
              <button
                onClick={scrollToTop}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-colors"
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
