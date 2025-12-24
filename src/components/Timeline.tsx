import React, { useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import TimelineCard from './TimelineCard';
import { timelineData } from '../data/timeline';

const Timeline: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <section id="ventures" className="py-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background glow for the section */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-[800px] bg-blue-900/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto relative z-10" ref={containerRef}>
        {/* Section Title */}
        <motion.div
          className="text-center mb-24"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4 font-display tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
            Timeline
          </h2>
          <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full opacity-50"></div>
        </motion.div>

        {/* Timeline Container */}
        <div className="relative">
          {/* Main Connector Line (Desktop) */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-[2px] bg-white/5">
            <motion.div
              style={{ scaleY, transformOrigin: "top" }}
              className="absolute top-0 left-0 right-0 w-full h-full bg-gradient-to-b from-blue-500 via-purple-500 to-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.6)]"
            />
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
