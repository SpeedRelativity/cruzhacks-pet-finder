'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navigation } from '../components/Navigation';
import { Dashboard } from '../components/Dashboard';
import { SwipeMatch } from '../components/SwipeMatch';
import { DiscoveryMap } from '../components/DiscoveryMap';
import { Alerts } from '../components/Alerts';
import { Gallery } from '../components/Gallery';

function AppContent() {
  const searchParams = useSearchParams();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'swipe' | 'map' | 'alerts' | 'gallery'>('dashboard');

  // Handle URL query parameter for navigation
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (pageParam && ['dashboard', 'swipe', 'map', 'alerts', 'gallery'].includes(pageParam)) {
      setCurrentPage(pageParam as 'dashboard' | 'swipe' | 'map' | 'alerts' | 'gallery');
    }
  }, [searchParams]);

  // Also handle custom events for backward compatibility
  useEffect(() => {
    const handleNavigate = (e: CustomEvent) => {
      if (e.detail === 'matches' || e.detail === 'swipe') {
        setCurrentPage('swipe');
      }
    };
    
    window.addEventListener('navigateToMatches' as any, handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigateToMatches' as any, handleNavigate as EventListener);
    };
  }, []);

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      <Navigation currentPage ={currentPage} onNavigate={setCurrentPage} />
      
      {currentPage === 'dashboard' && <Dashboard />}
      {currentPage === 'swipe' && <SwipeMatch />}
      {currentPage === 'gallery' && <Gallery />}
      {currentPage === 'map' && <DiscoveryMap />}
      {currentPage === 'alerts' && <Alerts />}
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <AppContent />
    </Suspense>
  );
}
