'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrashIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useStore } from '@/store/slideshowStore';

export default function NameManager() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { names, addName, removeName } = useStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) {
      addName(firstName.trim(), lastName.trim());
      setFirstName('');
      setLastName('');
    }
  };

  return (
    <div className="fixed top-8 left-0 flex items-start">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="bg-black/50 backdrop-blur-sm p-2 rounded-r-lg text-white z-10"
      >
        {isCollapsed ? (
          <ChevronRightIcon className="w-6 h-6" />
        ) : (
          <ChevronLeftIcon className="w-6 h-6" />
        )}
      </button>

      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-black/50 backdrop-blur-sm p-4 rounded-r-lg w-80"
          >
            <form onSubmit={handleSubmit} className="mb-4 space-y-2">
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 transition-colors"
              >
                Add Name
              </button>
            </form>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              <AnimatePresence>
                {names.map((name, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="flex items-center justify-between bg-white/10 rounded-lg px-4 py-2"
                  >
                    <span className="text-white">{`${name.firstName} ${name.lastName}`}</span>
                    <button
                      onClick={() => removeName(index)}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      <TrashIcon className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
} 