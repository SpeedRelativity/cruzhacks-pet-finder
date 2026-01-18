'use client';

import { useUser } from '@auth0/nextjs-auth0';
import { Home, Heart, Map, Bell, Grid3x3, Plus } from 'lucide-react';
// ... other imports

// 1. Define the Prop Types
interface NavigationProps {
  currentPage: 'dashboard' | 'swipe' | 'map' | 'alerts' | 'gallery';
  onNavigate: (page: 'dashboard' | 'swipe' | 'map' | 'alerts' | 'gallery') => void;
}

// 2. Accept props in the function
export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { user } = useUser();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'swipe', icon: Heart, label: 'Matches' },
    { id: 'gallery', icon: Grid3x3, label: 'Gallery' },
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'alerts', icon: Bell, label: 'Alerts' },
  ] as const; // 'as const' ensures IDs match your literal types

  return (
    <header className="...">
      {/* ... Logo Section ... */}

      <nav className="hidden md:flex items-center gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          // 3. Check active state via PROP instead of URL
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              // 4. Use onNavigate instead of <Link>
              onClick={() => onNavigate(item.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                isActive
                  ? 'bg-primary-light text-secondary'
                  : 'text-muted hover:bg-primary-light/50 hover:text-foreground'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      {/* Repeat similar changes for Mobile Navigation buttons */}
    </header>
  );
}