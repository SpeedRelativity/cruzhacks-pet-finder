'use client';

import { useState } from 'react';
import { Navigation } from '../components/Navigation';
import { Dashboard } from '../components/Dashboard';
import { SwipeMatch } from '../components/SwipeMatch';
import { DiscoveryMap } from '../components/DiscoveryMap';
import { Alerts } from '../components/Alerts';
import { Gallery } from '../components/Gallery';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'swipe' | 'map' | 'alerts' | 'gallery'>('dashboard');

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
