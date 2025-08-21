"use client";

import { useState, useEffect } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface NoSSRProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function NoSSR({ children, fallback }: NoSSRProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div suppressHydrationWarning>
        {fallback || <LoadingSpinner message="Loading..." />}
      </div>
    );
  }

  return (
    <div suppressHydrationWarning>
      {children}
    </div>
  );
}



