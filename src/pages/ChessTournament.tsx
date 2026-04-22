import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ArrowLeft, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

type Category = { id: 's1-s3'; label: 'S1 - S3' } | { id: 's4-s7'; label: 'S4 - S7' };

const CATEGORIES: Category[] = [
  { id: 's1-s3', label: 'S1 - S3' },
  { id: 's4-s7', label: 'S4 - S7' },
];

const OPPONENT_FORM_URL = 'https://forms.cloud.microsoft/e/3mBz2aNNBN';

const ChessTournament = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Category | null>(null);
  const [tournamentId, setTournamentId] = useState<string>('');

  const handleSelect = (cat: Category) => {
    const id = Math.floor(1000000 + Math.random() * 9000000).toString();
    setTournamentId(id);
    setSelected(cat);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {!selected ? (
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <Crown className="w-16 h-16 text-secondary mb-6 animate-float" />
          <h1 className="font-sans font-bold text-5xl md:text-7xl tracking-tight text-foreground mb-4 text-center">
            Chess Tournament
          </h1>
          <p className="text-tertiary text-lg text-center max-w-xl mb-12">
            Choose your category to receive your Tournament ID.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
            {CATEGORIES.map((cat) => (
              <Card
                key={cat.id}
                className="cursor-pointer transition-all hover:scale-[1.03] hover:border-secondary border-border"
                onClick={() => handleSelect(cat)}
              >
                <CardContent className="py-10 text-center">
                  <p className="font-sans font-bold text-3xl text-foreground mb-2">{cat.label}</p>
                  <p className="text-tertiary text-sm">Capacity: 16 people</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="lg"
            className="mt-12 font-sans font-semibold tracking-wide"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Activities
          </Button>
        </section>
      ) : (
        <section className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="max-w-md w-full border-primary/20">
            <CardContent className="pt-8 text-center">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="font-sans font-bold text-3xl text-foreground mb-2">You're Registered!</h2>
              <p className="text-muted-foreground mb-6">
                Category: <span className="text-foreground font-semibold">{selected.label}</span>
              </p>

              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 mb-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Tournament ID</p>
                <p className="font-mono font-bold text-4xl text-primary tracking-widest">{tournamentId}</p>
              </div>

              <p className="text-sm text-accent font-semibold mb-6">
                ⚠️ Please save this Tournament ID — you'll need it to find your opponent.
              </p>

              <a
                href={OPPONENT_FORM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full rounded-md bg-primary text-primary-foreground py-3 px-4 font-sans font-semibold tracking-wide hover:bg-primary/90 transition-colors mb-3"
              >
                Find Your Opponent <ExternalLink className="w-4 h-4" />
              </a>

              <Button onClick={() => navigate('/')} variant="outline" className="w-full">
                Back to Home
              </Button>
            </CardContent>
          </Card>
        </section>
      )}

      <footer className="text-center py-6 border-t border-border">
        <p className="text-tertiary text-sm">Springfest 2026 - The Great Exhibition</p>
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

export default ChessTournament;
