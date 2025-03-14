'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PhotoIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import { useStore } from '@/store/slideshowStore';

export default function Onboarding() {
  const { addImage } = useStore();
  
  // Setup dropzone for image uploads
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        const reader = new FileReader();
        reader.onload = () => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            // Set canvas size to default dimensions
            canvas.width = 633;
            canvas.height = 866;

            // Calculate scaling to maintain aspect ratio
            const scale = Math.min(
              canvas.width / img.width,
              canvas.height / img.height
            );

            // Calculate position to center the image
            const x = (canvas.width - img.width * scale) / 2;
            const y = (canvas.height - img.height * scale) / 2;

            // Draw the image
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);

            // Convert to base64 and add to store
            addImage(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.src = reader.result as string;
        };
        reader.readAsDataURL(file);
      }
    },
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    multiple: true
  });

  // Toggle name manager visibility
  const toggleNameManager = () => {
    // Find the name manager button and click it
    const nameManagerButton = document.querySelector('[title="Manage Names"]') as HTMLButtonElement;
    if (nameManagerButton) {
      nameManagerButton.click();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 flex items-center justify-center bg-black/80 z-10"
    >
      <div className="max-w-md p-8 bg-black/60 backdrop-blur-lg rounded-xl border border-white/10 text-center">
        <h2 className="text-2xl font-bold text-white mb-6">Welcome to ImageFusion</h2>
        
        <div className="space-y-6">
          <div 
            {...getRootProps()}
            className="p-6 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
          >
            <input {...getInputProps()} />
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-blue-500/20 rounded-full">
                <PhotoIcon className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Add Images</h3>
            <p className="text-white/70 text-sm">
              Click here or the image icon in the top right to upload your photos
            </p>
          </div>
          
          <div 
            onClick={toggleNameManager}
            className="p-6 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors"
          >
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-purple-500/20 rounded-full">
                <UserGroupIcon className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Manage Names</h3>
            <p className="text-white/70 text-sm">
              Click here or the people icon in the top right to add and manage names
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-white/50 text-sm space-y-2">
          <div>
            Press <kbd className="px-2 py-1 bg-white/10 rounded">Space</kbd> to play/pause the slideshow
          </div>
          <div>
            Press <kbd className="px-2 py-1 bg-white/10 rounded">F</kbd> for immersive fullscreen mode
          </div>
        </div>
      </div>
    </motion.div>
  );
} 