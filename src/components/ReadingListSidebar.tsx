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
        <div className="group relative border border-white/5 bg-dark-card rounded-xl p-4 hover:border-white/20 hover:bg-white/5 transition-all duration-300 cursor-pointer backdrop-blur-md">
          {/* Title */}
          <h4 className="text-sm font-semibold text-gray-200 mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors font-display tracking-tight">
            {item.title}
          </h4>

          {/* Author & Year */}
          <div className="flex items-end justify-between gap-2">
            <p className="text-xs text-gray-500 font-mono">
              {item.authors} ({item.year})
            </p>

            {/* Read Date */}
            {item.readDate && (
              <p className="text-[10px] text-gray-600 shrink-0 font-mono">
                {item.readDate}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="sticky top-28 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="pb-4 border-b border-white/5"
      >
        <h2 className="text-xl font-bold mb-1 text-white font-display">
          Reading List
        </h2>
        <p className="text-sm text-gray-500 font-light">External research papers & notes</p>
      </motion.div>

      {/* Currently Reading Section */}
      {currentlyReading.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FiBookOpen className="text-blue-500" size={16} />
            <h3 className="text-sm font-bold text-blue-500 uppercase tracking-wider font-display">Currently Reading</h3>
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
            <FiStar className="text-purple-500" size={16} />
            <h3 className="text-sm font-bold text-purple-500 uppercase tracking-wider font-display">Favorites</h3>
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
            <FiCheckCircle className="text-emerald-500" size={16} />
            <h3 className="text-sm font-bold text-emerald-500 uppercase tracking-wider font-display">Read</h3>
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
          className="text-center py-8 text-gray-600"
        >
          <p>No papers in reading list yet.</p>
        </motion.div>
      )}
    </div>
  );
}
