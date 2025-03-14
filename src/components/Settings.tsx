'use client';

import React from 'react';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Settings() {
  return (
    <Link
      href="/settings"
      className="fixed bottom-8 right-8 bg-white/10 hover:bg-white/20 backdrop-blur-sm p-3 rounded-full transition-all z-20"
      title="Settings"
    >
      <Cog6ToothIcon className="w-6 h-6 text-white" />
    </Link>
  );
} 