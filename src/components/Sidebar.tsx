import React from 'react';
import { Home, Share2, MessageCircle, FileText } from 'lucide-react';
import Link from 'next/link';

interface SidebarProps {
  onNetworkToggle: () => void;
  onChatToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onNetworkToggle, onChatToggle }) => {
  return (
    <>
      {/* Desktop Sidebar - Fixed left position */}
      <div className="hidden md:block fixed left-6 top-1/2 transform -translate-y-1/2 z-40">
        <div className="bg-black/80 backdrop-blur-sm rounded-full p-3 space-y-4 border border-gray-800">
          {/* Home Button */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-black hover:bg-gray-100 transition-colors"
          >
            <Home size={20} />
          </button>

          {/* Chat Button */}
          <button
            onClick={onChatToggle}
            className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <MessageCircle size={20} />
          </button>

          {/* Network Button */}
          <button
            onClick={onNetworkToggle}
            className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <Share2 size={20} />
          </button>

          {/* Research Button */}
          <Link
            href="/research"
            className="w-12 h-12 rounded-full bg-transparent flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <FileText size={20} />
          </Link>
          
        </div>
      </div>

      {/* Mobile Sidebar - Below header, top right */}
      <div className="md:hidden fixed top-20 right-4 z-50">
        <div className="bg-black/80 backdrop-blur-sm rounded-full p-2 flex space-x-2 border border-gray-800">
          {/* Home Button */}
          <button 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-black hover:bg-gray-100 transition-colors"
          >
            <Home size={18} />
          </button>
          
          {/* Share/Network Button */}
          <button
            onClick={onNetworkToggle}
            className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <Share2 size={18} />
          </button>

          {/* Chat Button */}
          <button
            onClick={onChatToggle}
            className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <MessageCircle size={18} />
          </button>

          {/* Research Button */}
          <Link
            href="/research"
            className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-white hover:bg-white/10 transition-colors"
          >
            <FileText size={18} />
          </Link>
        </div>
      </div>
    </>
  );
};

export default Sidebar;