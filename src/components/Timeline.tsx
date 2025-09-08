import React from 'react';
import TimelineCard from './TimelineCard';
import { timelineData } from '../data/timeline';

const Timeline: React.FC = () => {
  return (
    <section id="ventures" className="py-12 sm:py-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Section Title */}
        <div className="text-center mb-8 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Timeline</h2>
        </div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Vertical Line - Hidden on mobile, visible on desktop */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 w-0.5 bg-gray-600" 
               style={{ height: `${timelineData.length * 24}rem` }}>
          </div>

          {/* Mobile Timeline Line - Left aligned */}
          <div className="md:hidden absolute left-6 top-0 w-0.5 bg-gray-600" 
               style={{ height: `${timelineData.length * 20}rem` }}>
          </div>

          {/* Timeline Items */}
          <div className="space-y-4 md:space-y-0">
            {timelineData.map((item, index) => (
              <TimelineCard key={item.id} item={item} index={index} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Timeline;