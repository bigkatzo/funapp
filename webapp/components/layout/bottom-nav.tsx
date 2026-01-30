'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Play, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const links = [
    { href: '/', label: 'Feed', icon: Play },
    { href: '/browse', label: 'Browse', icon: Search },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  // Auto-hide on scroll (only on feed page)
  useEffect(() => {
    if (pathname !== '/') {
      setIsVisible(true);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY) {
        // Scrolling down - hide nav
        setIsVisible(false);
      } else {
        // Scrolling up - show nav
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
      
      // Auto-hide after 3 seconds of no interaction
      clearTimeout(timeoutId);
      setIsVisible(true);
      timeoutId = setTimeout(() => {
        if (pathname === '/') setIsVisible(false);
      }, 3000);
    };

    const handleMouseMove = () => {
      setIsVisible(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (pathname === '/') setIsVisible(false);
      }, 3000);
    };

    const handleTouchStart = () => {
      setIsVisible(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        if (pathname === '/') setIsVisible(false);
      }, 3000);
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchstart', handleTouchStart);

    // Initial auto-hide on feed
    if (pathname === '/') {
      timeoutId = setTimeout(() => setIsVisible(false), 3000);
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchstart', handleTouchStart);
      clearTimeout(timeoutId);
    };
  }, [pathname, lastScrollY]);

  return (
    <nav 
      className={cn(
        'fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-50 transition-transform duration-300',
        isVisible ? 'translate-y-0' : 'translate-y-full'
      )}
      style={{ 
        // Ensure it doesn't interfere with video interactions
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href || 
                          (link.href !== '/' && pathname.startsWith(link.href));
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive
                  ? 'text-purple-600'
                  : 'text-gray-600 hover:text-purple-600'
              )}
            >
              <Icon className={cn('h-6 w-6', isActive && 'fill-purple-600')} />
              <span className="text-xs mt-1 font-medium">{link.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
