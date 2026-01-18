'use client';

import { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Gallery } from '@/components/Gallery';

export default function GalleryPage() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'swipe' | 'alerts' | 'gallery'>('gallery');

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-background">
      <Navigation currentPage={currentPage} onNavigate={setCurrentPage} />
      <Gallery />
    </div>
  );
}
