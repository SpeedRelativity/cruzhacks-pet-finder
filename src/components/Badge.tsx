import { ReactNode } from 'react';

interface BadgeProps {
  variant?: 'missing' | 'found' | 'stray';
  children: ReactNode;
  className?: string;
}

export function Badge({ variant = 'missing', children, className = '' }: BadgeProps) {
  const variantStyles = {
    missing: 'bg-secondary text-white',
    found: 'bg-primary text-white',
    stray: 'bg-accent text-white',
  };
  
  return (
    <span 
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
