'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { Home, Heart, Map, Bell, Grid3x3, Plus } from 'lucide-react';

// 1. Define the Prop Types
interface NavigationProps {
  currentPage: 'dashboard' | 'swipe' | 'map' | 'alerts' | 'gallery';
  onNavigate: (page: 'dashboard' | 'swipe' | 'map' | 'alerts' | 'gallery') => void;
}

// 2. Accept props in the function

// ... interface

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { user, isLoading } = useUser();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'swipe', icon: Heart, label: 'Matches' },
    { id: 'gallery', icon: Grid3x3, label: 'Gallery' },
    { id: 'map', icon: Map, label: 'Map' },
    { id: 'alerts', icon: Bell, label: 'Alerts' },
  ] as const;

  console.log("Current user state:", { user, isLoading }); // Debug log

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center justify-between px-4 sm:px-8">
        {/* Logo Area */}
        <div className="flex items-center gap-2 font-bold text-xl text-primary cursor-pointer" onClick={() => onNavigate('dashboard')}>
          <span>🐾 PetFinder</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium hidden sm:inline-block">Hi, {user.name?.split(' ')[0]}</span>
                <Link href="/api/auth/logout" className="px-4 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                  Log Out
                </Link>
                <img
                  src={user.picture || ''}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-border"
                />
              </div>
            ) : (
              <Link href="/auth0-demo" className="px-6 py-2 bg-primary text-primary-foreground rounded-full font-bold text-sm hover:opacity-90 transition-opacity shadow-sm">
                Sign In
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}