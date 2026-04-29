'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, ReactNode } from 'react';

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Setiap route berubah, reset ke invisible lalu fade in
    setIsVisible(false);
    const timer = setTimeout(() => setIsVisible(true), 30);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
      }}
    >
      {children}
    </div>
  );
}
