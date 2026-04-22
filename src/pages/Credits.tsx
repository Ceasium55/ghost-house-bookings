import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Credits = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 px-4 py-12 max-w-3xl mx-auto w-full">
        <h1 className="font-sans font-bold text-5xl md:text-6xl tracking-tight text-foreground mb-10 text-center">
          Credits
        </h1>

        <section className="mb-12">
          <h2 className="font-sans font-semibold text-3xl text-secondary mb-4">
            IT Team
          </h2>
          <div className="rounded-lg border border-border bg-card p-6 min-h-[120px]">
            <p className="text-tertiary italic">To be added.</p>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="font-sans font-semibold text-3xl text-secondary mb-4">
            Special thanks
          </h2>
          <div className="rounded-lg border border-border bg-card p-6 min-h-[120px]">
            <p className="text-tertiary italic">To be added.</p>
          </div>
        </section>

        <div className="text-center">
          <Button onClick={() => navigate('/')} variant="outline" size="lg" className="font-sans font-semibold tracking-wide">
            Back to Activities
          </Button>
        </div>
      </div>

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

export default Credits;
