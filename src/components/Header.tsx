import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Github, Linkedin, Mail } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark-bg/80 backdrop-blur-sm border-b border-dark-border/50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between relative">
          {/* Left side - Profile info */}
          <div className="flex items-center space-x-3">
            <Image 
              src="/pablo_leyva.JPG" 
              alt="Profile" 
              width={44}
              height={44}
              className="w-11 h-11 rounded-full border border-gray-600"
            />
            <div>
              <h1 className="text-base font-semibold text-white leading-tight">Pablo Leyva</h1>
              <p className="text-xs text-gray-400 leading-tight">NYC • SFO</p>
            </div>
          </div>

          {/* Center - Navigation */}
          <nav className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
            <a
              href="#ventures"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Ventures
            </a>
            <Link
              href="/research"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Research
            </Link>
            <a
              href="#contact"
              className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
            >
              Contact
            </a>
          </nav>

          {/* Right side - Social links */}
          <div className="flex items-center space-x-5">
            <a 
              href="https://github.com/pleyva2004" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <Github size={18} />
            </a>
            <a 
              href="https://www.linkedin.com/in/pablo-leyva" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <Linkedin size={18} />
            </a>
            <a 
              href="mailto:pleyva2004@gmail.com" 
              className="text-gray-400 hover:text-white transition-colors duration-200"
            >
              <Mail size={18} />
            </a>
         
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;