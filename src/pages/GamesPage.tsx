import { Gamepad2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const GamesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <Gamepad2 className="w-16 h-16 text-secondary mb-6 animate-float" />
        <h1 className="font-sans font-bold text-5xl md:text-7xl tracking-tight text-foreground mb-4">
          Games
        </h1>
        <p className="text-tertiary text-lg text-center max-w-md mb-10">
          Coming soon — stay tuned for fun activities and challenges!
        </p>
        <Button onClick={() => navigate('/')} variant="outline" size="lg" className="font-sans font-semibold tracking-wide">
          Back to Activities
        </Button>
      </div>

      <footer className="text-center py-6 border-t border-border">
        <p className="text-tertiary text-sm">
          Springfest 2026 - The Great Exhibition
        </p>
        <a href="/admin" className="text-xs text-primary-foreground font-medium mt-2 inline-block px-3 py-1 rounded-md bg-[#cdad60] hover:bg-[#b89a50] transition-colors">
          Manager access
        </a>
      </footer>
    </div>
  );
};

export default GamesPage;
