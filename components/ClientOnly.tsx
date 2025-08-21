"use client";

import { useEffect, useState } from 'react';
import { useSuppressHydrationWarning } from '../lib/useHydration';

interface ClientOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function ClientOnly({ children, fallback = null }: ClientOnlyProps) {
  const [hasMounted, setHasMounted] = useState(false);
  
  // Suppress hydration warnings from browser extensions
  useSuppressHydrationWarning();

  useEffect(() => {
    // Add a small delay to ensure browser extensions have finished modifying the DOM
    const timer = setTimeout(() => {
      setHasMounted(true);
    }, 10);

    return () => clearTimeout(timer);
  }, []);

  if (!hasMounted) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
