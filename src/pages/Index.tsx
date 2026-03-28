import { useState } from 'react';
import HeroSection from '@/components/HeroSection';
import BookingSection from '@/components/BookingSection';
import FloatingGhosts from '@/components/FloatingGhosts';

const Index = () => {
  const [view, setView] = useState<'hero' | 'booking'>('hero');

  return (
    <div className="min-h-screen bg-background">
      {view === 'hero' ? (
        <HeroSection onBookNow={() => setView('booking')} />
      ) : (
        <BookingSection onBack={() => setView('hero')} />
      )}

      {/* Admin link in footer */}
      <footer className="text-center py-6 border-t border-border">
        <p className="text-muted-foreground text-sm">
          SESE Ghost House — School Festival Brussels 2026
        </p>
        <a href="/admin" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors mt-1 inline-block">
          Owner Access
        </a>
      </footer>
    </div>
  );
};

export default Index;
