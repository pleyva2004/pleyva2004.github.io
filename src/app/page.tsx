'use client';

import React from 'react';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Timeline from '../components/Timeline';
import Contact from '../components/Contact';
import Sidebar from '../components/Sidebar';
import WorkInProgress from '../components/WorkInProgress';
import ChatInterface from '../components/ChatInterface';

export default function Home() {
  const [isNetworkVisible, setIsNetworkVisible] = useState(false);
  const [isChatVisible, setIsChatVisible] = useState(false);

  return (
    <div className="min-h-screen bg-dark-bg">
      <Sidebar 
        onNetworkToggle={() => setIsNetworkVisible(true)}
        onChatToggle={() => setIsChatVisible(true)}
      />
      <Header />
      <main>
        <Hero />
        <Timeline />
        <Contact />
      </main>
      <WorkInProgress 
        isVisible={isNetworkVisible}
        onClose={() => setIsNetworkVisible(false)}
      />
      <AnimatePresence>
        {isChatVisible && (
          <ChatInterface 
            onClose={() => setIsChatVisible(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
