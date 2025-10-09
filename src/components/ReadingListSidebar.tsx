'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiStar, FiCheckCircle, FiBookOpen } from 'react-icons/fi';
import Link from 'next/link';
import { ReadingItem } from '@/constants/research/reading-list';

interface ReadingListSidebarProps {
  items: ReadingItem[];
}

export default function ReadingListSidebar({ items }: ReadingListSidebarProps) {
  const currentlyReading = items.filter((item) => item.category === 'currently-reading');
  const favorites = items.filter((item) => item.category === 'favorites');
  const read = items.filter((item) => item.category === 'read');

  const renderItem = (item: ReadingItem, index: number) => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link href={`/research/reading/${item.id}`}>
        <div className="group relative border border-accent-blue/30 bg-dark-card rounded-xl p-4 hover:border-accent-purple/50 hover:bg-dark-card/80 hover:scale-[1.02] hover:shadow-xl transition-all duration-300 cursor-pointer">
          {/* Title */}
          <h4 className="text-sm font-semibold text-gray-200 mb-2 line-clamp-2 group-hover:text-accent-blue transition-colors">
            {item.title}
          </h4>

          {/* Author & Year */}
          <div className="flex items-end justify-between gap-2">
            <p className="text-xs text-gray-400">
              {item.authors} ({item.year})
            </p>

            {/* Read Date */}
            {item.readDate && (
              <p className="text-[10px] text-gray-500 shrink-0">
                Read: {item.readDate}
              </p>
            )}
          </div>

          {/* Hover Glow Effect */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-accent-blue/0 to-accent-purple/0 group-hover:from-accent-blue/10 group-hover:to-accent-purple/10 transition-all duration-300 pointer-events-none" />
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="sticky top-24 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-accent-blue to-accent-purple bg-clip-text text-transparent">
          Reading List
        </h2>
        <p className="text-sm text-gray-400">External research papers & notes</p>
      </motion.div>

      {/* Currently Reading Section */}
      {currentlyReading.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FiBookOpen className="text-accent-blue" size={18} />
            <h3 className="text-lg font-semibold text-accent-blue">Currently Reading</h3>
          </div>
          <div className="space-y-3">
            {currentlyReading.map((item, index) => renderItem(item, index))}
          </div>
        </div>
      )}

      {/* Favorites Section */}
      {favorites.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FiStar className="text-yellow-400" size={18} />
            <h3 className="text-lg font-semibold text-yellow-400">Favorites</h3>
          </div>
          <div className="space-y-3">
            {favorites.map((item, index) => renderItem(item, index + currentlyReading.length))}
          </div>
        </div>
      )}

      {/* Read Section */}
      {read.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FiCheckCircle className="text-accent-green" size={18} />
            <h3 className="text-lg font-semibold text-accent-green">Read</h3>
          </div>
          <div className="space-y-3">
            {read.map((item, index) => renderItem(item, index + currentlyReading.length + favorites.length))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {items.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center py-8 text-gray-400"
        >
          <p>No papers in reading list yet.</p>
        </motion.div>
      )}
    </div>
  );
}
