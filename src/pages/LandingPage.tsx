import { useNavigate } from 'react-router-dom';
import { Ghost, KeyRound, Gamepad2 } from 'lucide-react';

const activities = [
  {
    label: 'Haunted House',
    icon: Ghost,
    path: '/haunted-house',
    description: 'A spine-chilling 15-minute tour through the darkness',
    split: 'left' as const,
  },
  {
    label: 'Escape Room',
    icon: KeyRound,
    path: '/escape-room',
    description: 'Solve puzzles and escape before time runs out',
    split: 'left' as const,
  },
  {
    label: 'Games',
    icon: Gamepad2,
    path: '/games',
    description: 'Fun activities and challenges for everyone',
    split: 'right' as const,
  },
];

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      <h1 className="split-right font-sans font-bold text-5xl md:text-7xl lg:text-8xl text-center tracking-tight text-foreground mb-4">
        Springfest 2026 - Activities
      </h1>
      <p className="split-left text-tertiary text-lg md:text-xl text-center max-w-xl mb-16">
        May 7–8, 2026 — Brussels. Choose your adventure.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 w-full max-w-4xl overflow-visible">
        {activities.map(({ label, icon: Icon, path, description, split }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`split-${split} group relative flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 md:p-10 transition-all hover:scale-[1.04] hover:border-secondary hover:shadow-[0_0_30px_hsl(var(--secondary)/0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring`}
          >
            <Icon className="w-12 h-12 text-secondary transition-transform group-hover:scale-110" />
            <span className="font-sans font-semibold text-2xl md:text-3xl tracking-tight text-foreground">
              {label}
            </span>
            <p className="text-tertiary text-sm text-center leading-relaxed">
              {description}
            </p>
          </button>
        ))}
      </div>

      <footer className="split-right mt-20 text-center">
        <p className="text-tertiary text-sm">
          Sringfest 2026 - The Great Exhibition
        </p>
        <a
          href="/admin"
          className="text-xs text-primary-foreground font-medium mt-2 inline-block px-3 py-1 rounded-md bg-[#cdad60] hover:bg-[#b89a50] transition-colors"
        >
          Manager access
        </a>
      </footer>
    </div>
  );
};

export default LandingPage;
