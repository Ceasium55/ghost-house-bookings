import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '@/components/HeroSection';
import BookingSection from '@/components/BookingSection';
import { Button } from '@/components/ui/button';

const Index = () => {
  const [view, setView] = useState<'hero' | 'booking'>('hero');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {view === 'hero' ? (
        <>
          <HeroSection onBookNow={() => setView('booking')} onBack={() => navigate('/')} />
        </>
      ) : (
        <BookingSection onBack={() => setView('hero')} activity="haunted-house" title="Book Your Haunted House Tour" />
      )}

      <footer className="text-center py-6 border-t border-border">
        <p className="text-tertiary text-sm">
          Springfest 2026 - The Great Exhibition
        </p>
        <a href="/admin" className="text-xs text-primary-foreground font-medium mt-2 inline-block px-3 py-1 rounded-md bg-[#cdad60] hover:bg-[#b89a50] transition-colors">
          Manager access
        </a>
        <div>
          <a href="/credits" className="text-[10.2px] text-primary-foreground font-medium mt-2 inline-block px-[10.2px] py-[3.4px] rounded-md bg-[#cdad60] hover:bg-[#b89a50] transition-colors">
            Credits
          </a>
        </div>
      </footer>
    </div>
  );
};

export default Index;
