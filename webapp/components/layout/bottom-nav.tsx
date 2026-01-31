'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Discover', icon: Home },
    { href: '/browse', label: 'Browse', icon: Search },
    { href: '/profile', label: 'You', icon: User },
  ];

  return (
    <nav 
      className={cn(
        'fixed bottom-0 left-0 right-0',
        'bg-black/90 backdrop-blur-md',
        'border-t border-white/10',
        'z-50',
        // iOS safe area support
        'pb-safe'
      )}
      style={{
        // Ensure nav is always on top and clickable
        pointerEvents: 'auto',
      }}
    >
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto px-safe">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || 
                          (link.href !== '/' && pathname.startsWith(link.href));
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full',
                'transition-all duration-200',
                'min-w-[64px]', // Minimum touch target
                isActive
                  ? 'text-purple-400'
                  : 'text-gray-400 hover:text-white active:scale-95'
              )}
            >
              <Icon 
                className={cn(
                  'h-6 w-6 transition-all',
                  isActive && 'fill-purple-400 scale-110'
                )} 
              />
              <span className={cn(
                'text-xs mt-1 font-medium transition-all',
                isActive && 'font-semibold'
              )}>
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
