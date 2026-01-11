import { ReactNode } from 'react';
import { BottomNav } from './BottomNav';
import { FloatingActionButton } from './FloatingActionButton';

interface MobileLayoutProps {
  children: ReactNode;
  showFab?: boolean;
}

export function MobileLayout({ children, showFab = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="max-w-md mx-auto">
        {children}
      </main>
      {showFab && <FloatingActionButton />}
      <BottomNav />
    </div>
  );
}
