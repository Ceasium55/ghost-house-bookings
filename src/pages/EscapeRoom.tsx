import { useState } from 'react';
import { KeyRound, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BookingSection from '@/components/BookingSection';
import { useNavigate } from 'react-router-dom';

const EscapeRoom = () => {
  const [view, setView] = useState<'hero' | 'booking'>('hero');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {view === 'hero' ? (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-card to-background" />

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <KeyRound className="w-16 h-16 text-secondary mx-auto mb-6 animate-float" />

            <h1 className="font-creepster text-6xl md:text-8xl lg:text-9xl tracking-wider text-foreground mb-4">
              EEB3 Escape Room
            </h1>
            <p className="font-creepster text-2xl md:text-4xl text-accent mb-8 animate-flicker">
              Can You Escape?
            </p>

            <p className="text-tertiary text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
              Locked in a room full of puzzles, riddles, and hidden clues. You have 15 minutes
              to find the way out. Work together — or stay trapped forever.
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm md:text-base">
              <div className="flex items-center gap-2 text-foreground">
                <Calendar className="w-5 h-5 text-secondary" />
                <span>May 7–8, 2026</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Clock className="w-5 h-5 text-secondary" />
                <span>10:00 AM – 3:00 PM</span>
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Users className="w-5 h-5 text-secondary" />
                <span>Max 6 per session</span>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <Button
                onClick={() => setView('booking')}
                size="lg"
                className="text-lg px-10 py-6 font-creepster tracking-widest hover:scale-105 transition-transform"
              >
                Book Your Session
              </Button>
              <Button
                onClick={() => navigate('/')}
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 font-creepster tracking-widest"
              >
                Back
              </Button>
            </div>
          </div>
        </section>
      ) : (
        <BookingSection onBack={() => setView('hero')} />
      )}
    </div>
  );
};

export default EscapeRoom;
