import { Skull, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeroSectionProps {
  onBookNow: () => void;
}

const HeroSection = ({ onBookNow }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <Skull className="w-16 h-16 text-primary mx-auto mb-6 animate-float" />
        
        <h1 className="font-sans font-bold text-5xl md:text-7xl lg:text-8xl tracking-tight text-foreground mb-4">
          SF26 Haunted House
        </h1>
        <p className="font-sans font-semibold text-xl md:text-3xl text-accent mb-8">
          Ghost House Experience
        </p>
        
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          Dare to enter the most haunted house in Brussels. A spine-chilling 15-minute tour 
          awaits you at the school festival. If you're brave enough...
        </p>

        <div className="flex flex-wrap justify-center gap-6 mb-12 text-sm md:text-base">
          <div className="flex items-center gap-2 text-tertiary">
            <Calendar className="w-5 h-5 text-primary" />
            <span>May 7–8, 2026</span>
          </div>
          <div className="flex items-center gap-2 text-tertiary">
            <Clock className="w-5 h-5 text-primary" />
            <span>10:00 AM – 3:00 PM</span>
          </div>
          <div className="flex items-center gap-2 text-tertiary">
            <Users className="w-5 h-5 text-primary" />
            <span>Max 6 per tour</span>
          </div>
        </div>

        <Button 
          onClick={onBookNow}
          size="lg"
          className="text-lg px-10 py-6 font-sans font-semibold tracking-wide hover:scale-105 transition-transform"
        >
          Book Your Tour
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
