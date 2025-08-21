"use client";

import dynamic from 'next/dynamic';
import { LoadingSpinner } from "../components/LoadingSpinner";

// Dynamically import the main component with NO SSR
const HomePageContent = dynamic(() => import('../components/HomePageContent'), {
  ssr: false,
  loading: () => <LoadingSpinner message="Loading application..." />
});

export default function HomePage() {
  return (
    <div suppressHydrationWarning>
      <HomePageContent />
    </div>
  );
}
