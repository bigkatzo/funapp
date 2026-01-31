'use client';

import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { BottomNav } from '@/components/layout/bottom-nav';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  
  // Hide bottom nav only on login and signup pages
  const hideBottomNav = pathname === '/login' || pathname === '/signup';

  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        {!hideBottomNav && <BottomNav />}
        <Toaster />
      </body>
    </html>
  );
}
