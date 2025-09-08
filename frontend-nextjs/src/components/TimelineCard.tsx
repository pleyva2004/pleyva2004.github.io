"use client";

import React, { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { TimelineItem } from '../data/timeline';

interface TimelineCardProps {
  item: TimelineItem;
  index: number;
}

const TimelineCard: React.FC<TimelineCardProps> = ({ item, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const desktopCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.3 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }
    
    if (desktopCardRef.current) {
      observer.observe(desktopCardRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden mb-8 opacity-0 transform translate-y-8 transition-all duration-700 ease-out"
           ref={cardRef}
           style={{ animationDelay: `${index * 200}ms` }}>
        
        {/* Mobile Timeline Dot */}
        <div className="flex items-start">
          <div className="flex-shrink-0 w-12 flex justify-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-dark-bg z-10 animate-pulse-dot mt-2"></div>
          </div>
          
          {/* Mobile Card */}
          <div className="flex-1 ml-4">
            <div className="bg-dark-card border border-dark-border rounded-lg p-4 hover:border-blue-500/50 hover:transform hover:scale-[1.02] transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
              {/* Date - Mobile */}
              <div className="mb-2">
                <span className="text-gray-400 text-xs font-medium">
                  {item.period}
                </span>
              </div>

              {/* Role Badge - Mobile */}
              <div className="mb-3">
                <span className="inline-block bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium border border-blue-500/30 animate-pulse-subtle">
                  {item.role}
                </span>
              </div>

              {/* Company - Mobile */}
              <div className="mb-3 flex items-center">
                <h3 className="text-white font-semibold text-base">
                  {item.companyUrl ? (
                    <a 
                      href={item.companyUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                    >
                      {item.company}
                      <ExternalLink size={14} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </a>
                  ) : (
                    item.company
                  )}
                </h3>
              </div>

              {/* Description - Mobile */}
              <p className="text-gray-300 leading-relaxed text-sm">
                {item.description}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Hidden on mobile */}
      <div className={`hidden md:flex items-center mb-16 opacity-0 transform translate-y-8 transition-all duration-700 ease-out ${
        item.position === 'right' ? 'flex-row-reverse' : ''
      }`}
           ref={desktopCardRef}
           style={{ animationDelay: `${index * 200}ms` }}>
        
        {/* Desktop Card */}
        <div className={`w-5/12 ${item.position === 'right' ? 'ml-8' : 'mr-8'}`}>
          <div className="bg-dark-card border border-dark-border rounded-lg p-6 hover:border-blue-500/50 hover:transform hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10">
            {/* Role Badge */}
            <div className="mb-3">
              <span className="inline-block bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full text-sm font-medium border border-blue-500/30 animate-pulse-subtle">
                {item.role}
              </span>
            </div>

            {/* Company */}
            <div className="mb-3 flex items-center">
              <h3 className="text-white font-semibold text-lg">
                {item.companyUrl ? (
                  <a 
                    href={item.companyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="hover:text-blue-400 transition-colors inline-flex items-center gap-1 group"
                  >
                    {item.company}
                    <ExternalLink size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </a>
                ) : (
                  item.company
                )}
              </h3>
            </div>

            {/* Description */}
            <p className="text-gray-300 leading-relaxed">
              {item.description}
            </p>
          </div>
        </div>

        {/* Desktop Timeline dot */}
        <div className="relative flex items-center justify-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-dark-bg z-10 animate-pulse-dot"></div>
        </div>

        {/* Desktop Date */}
        <div className={`w-5/12 ${item.position === 'right' ? 'mr-12 text-right' : 'ml-12'}`}>
          <span className="text-gray-400 text-sm font-medium">
            {item.period}
          </span>
        </div>
      </div>
    </>
  );
};

export default TimelineCard;