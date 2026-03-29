import { Ghost, Calendar, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import hauntedHouse from '@/assets/haunted-house-hero.jpg';

interface HeroSectionProps {
  onBookNow: () => void;
}

const HeroSection = ({ onBookNow }: HeroSectionProps) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={hauntedHouse} alt="" className="w-full h-full object-cover opacity-40" width={1920} height={1080} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <Ghost className="w-16 h-16 text-primary mx-auto mb-6 animate-float" />
        
        <h1 className="font-creepster text-6xl md:text-8xl lg:text-9xl tracking-wider glow-primary mb-4">
          EEB3 Haunted house
        </h1>
        <p className="font-creepster text-2xl md:text-4xl text-accent glow-accent mb-8 animate-flicker">
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
          className="text-lg px-10 py-6 font-creepster tracking-widest glow-box hover:scale-105 transition-transform"
        >
          Book Your Tour
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;
