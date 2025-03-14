'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserGroupIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useStore } from '@/store/slideshowStore';

export default function NameManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const { names, addName, removeName, settings } = useStore();
  const { theme } = settings;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (firstName.trim() && lastName.trim()) {
      addName(firstName.trim(), lastName.trim());
      setFirstName('');
      setLastName('');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed top-8 right-20 ${
          theme === 'dark' 
            ? 'bg-white/10 hover:bg-white/20 text-white' 
            : 'bg-black/10 hover:bg-black/20 text-gray-800'
        } backdrop-blur-sm p-3 rounded-full transition-all z-20`}
        title="Manage Names"
      >
        <UserGroupIcon className="w-6 h-6" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className={`fixed top-0 left-0 h-full w-80 ${
              theme === 'dark'
                ? 'bg-black/80 text-white'
                : 'bg-white/90 text-gray-800'
            } backdrop-blur-sm p-6 z-10 overflow-y-auto`}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Name Manager</h3>
              <button 
                onClick={() => setIsOpen(false)}
                className={`p-1 rounded-full ${
                  theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-black/10'
                }`}
              >
                <XMarkIcon className={`w-5 h-5 ${theme === 'dark' ? 'text-white/70' : 'text-gray-500'}`} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="mb-6">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={`w-full ${
                    theme === 'dark'
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-black/5 border-gray-200 text-gray-800'
                  } border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className={`w-full ${
                    theme === 'dark'
                      ? 'bg-white/10 border-white/20 text-white'
                      : 'bg-black/5 border-gray-200 text-gray-800'
                  } border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Add Name
                </button>
              </div>
            </form>

            <div className="space-y-2">
              {names.map((name, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center ${
                    theme === 'dark' ? 'bg-white/5' : 'bg-black/5'
                  } rounded-lg p-3`}
                >
                  <span>
                    {name.firstName} {name.lastName}
                  </span>
                  <button
                    onClick={() => removeName(index)}
                    className={theme === 'dark' ? 'text-white/50 hover:text-white/80' : 'text-gray-500 hover:text-gray-700'}
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}