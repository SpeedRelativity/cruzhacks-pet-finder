'use client';

import { useUser } from '@auth0/nextjs-auth0/client';
import Link from 'next/link';
import { Home, Heart, Bell, Grid3x3, Plus } from 'lucide-react';

// 1. Define the Prop Types
interface NavigationProps {
  currentPage: 'dashboard' | 'swipe' | 'alerts' | 'gallery';
  onNavigate: (page: 'dashboard' | 'swipe' | 'alerts' | 'gallery') => void;
}

// 2. Accept props in the function

// ... interface

export function Navigation({ currentPage, onNavigate }: NavigationProps) {
  const { user, isLoading } = useUser();

  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'swipe', icon: Heart, label: 'Matches' },
    { id: 'gallery', icon: Grid3x3, label: 'Gallery' },
    { id: 'alerts', icon: Bell, label: 'Alerts' },
  ] as const;

  console.log("Current user state:", { user, isLoading }); // Debug log

  return (
    <header className="sticky top-0 z-70 w-full border-b border-amber-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/90 shadow-sm">
      <div className="w-full max-w-7xl mx-auto flex h-20 items-center justify-between px-4 sm:px-6 lg:px-8">        {/* Logo Area */}
        <div className="flex items-center gap-3 font-bold text-lg text-amber-600 cursor-pointer hover:text-amber-700 transition-colors flex-shrink-0" onClick={() => onNavigate('dashboard')}>
          <span className="text-4xl">🐾</span>
          <span>Pawnder</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-6 sm:px-8 lg:px-10rounded-lg font-medium transition-all text-sm ${isActive
                  ? 'bg-amber-50 text-amber-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {!isLoading && (
            user ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">Hi, {user.name?.split(' ')[0]}</span>
                <Link href="/api/auth/logout" className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                  Log Out
                </Link>
                <img
                  src={user.picture || ''}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2 border-amber-200"
                />
              </div>
            ) : (
              <Link href="/auth0-demo" className="px-5 py-2 bg-amber-500 text-white rounded-lg font-semibold text-sm hover:bg-amber-600 transition-colors shadow-md hover:shadow-lg">
                Sign In
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}