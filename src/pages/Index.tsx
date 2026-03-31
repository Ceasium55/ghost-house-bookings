import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';
import BookingSection from '@/components/BookingSection';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [view, setView] = useState<'hero' | 'booking'>('hero');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {view === 'hero' ? (
        <>
          <HeroSection onBookNow={() => setView('booking')} onBack={() => navigate('/')} />
        </>
      ) : (
        <BookingSection onBack={() => setView('hero')} />
      )}

      <footer className="text-center py-6 border-t border-border">
        <p className="text-tertiary text-sm">
          SESE Ghost House — School Festival Brussels 2026
        </p>
        <a href="/admin" className="text-xs text-tertiary/50 hover:text-tertiary transition-colors mt-1 inline-block">
          Owner Access
        </a>
      </footer>
    </div>
  );
};

export default Index;
