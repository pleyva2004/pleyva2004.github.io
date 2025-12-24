import React from 'react';

const Background: React.FC = () => {
  return (
    <div className="fixed inset-0 -z-30 overflow-hidden pointer-events-none">
      {/* Deep Void Base */}
      <div className="absolute inset-0 bg-[#050505]" />

      {/* Animated Gradients */}
      <div
        className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px] animate-blob"
        style={{ animationDelay: '0s' }}
      />

      <div
        className="absolute top-[40%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px] animate-blob"
        style={{ animationDelay: '2s' }}
      />

      <div
        className="absolute bottom-[-10%] left-[20%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] animate-blob"
        style={{ animationDelay: '4s' }}
      />

      {/* Noise Overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
      }} />
    </div>
  );
};

export default Background;
