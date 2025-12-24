import React, { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';
import { TimelineItem } from '../data/timeline';
import TiltCard from './TiltCard';

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

  // Shared content for the card to ensure consistency
  const CardContent = () => (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6 h-full backdrop-blur-md shadow-2xl shadow-blue-900/5 group-hover:border-blue-500/30 transition-all duration-300">
      {/* Role Badge */}
      <div className="mb-3">
        <span className="inline-block bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-500/20">
          {item.role}
        </span>
      </div>

      {/* Company */}
      <div className="mb-3 flex items-center">
        <h3 className="text-white font-bold text-lg font-display tracking-tight">
          {item.companyUrl ? (
            <a
              href={item.companyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-colors inline-flex items-center gap-2 group"
            >
              {item.company}
              <ExternalLink size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 opacity-70 group-hover:opacity-100" />
            </a>
          ) : (
            item.company
          )}
        </h3>
      </div>

      {/* Description */}
      <p className="text-gray-400 leading-relaxed text-sm font-sans">
        {item.description}
      </p>

      {/* Date - Mobile Only display inside card usually, but we keep structure */}
      <div className="md:hidden mt-4 pt-4 border-t border-white/5">
        <span className="text-gray-500 text-xs font-mono">
          {item.period}
        </span>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden mb-12 opacity-0 transform translate-y-8 transition-all duration-700 ease-out"
        ref={cardRef}
        style={{ animationDelay: `${index * 200}ms` }}>

        <div className="relative pl-8 border-l-2 border-blue-900/30 ml-3">
          {/* Dot */}
          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-black border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>

          <TiltCard className="w-full">
            <CardContent />
          </TiltCard>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className={`hidden md:flex items-center mb-24 opacity-0 transform translate-y-8 transition-all duration-700 ease-out w-full ${item.position === 'right' ? 'flex-row-reverse' : ''
        }`}
        ref={desktopCardRef}
        style={{ animationDelay: `${index * 200}ms` }}>

        {/* Desktop Card */}
        <div className={`w-[45%] ${item.position === 'right' ? 'ml-auto pl-12' : 'mr-auto pr-12'}`}>
          <TiltCard>
            <CardContent />
          </TiltCard>
        </div>

        {/* Center Point - processed in parent timeline usually, but we keep generic dot here if needed,
            though Timeline.tsx handles the main line. We just need the connection point. */}
        <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center justify-center">
          {/* The glowing dot on the line */}
          <div className="w-4 h-4 rounded-full bg-black border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] z-10"></div>
        </div>

        {/* Desktop Date */}
        <div className={`w-[45%] ${item.position === 'right' ? 'mr-auto pr-12 text-right' : 'ml-auto pl-12 text-left'}`}>
          <span className="text-gray-500 text-sm font-mono tracking-widest uppercase">
            {item.period}
          </span>
        </div>
      </div>
    </>
  );
};

export default TimelineCard;
