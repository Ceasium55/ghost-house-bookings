import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, ArrowLeft, CheckCircle, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  CHESS_CATEGORIES,
  CHESS_CATEGORY_CAPACITY,
  getChessAvailability,
  registerChess,
  type ChessCategory,
} from '@/lib/chessStore';

const OPPONENT_FORM_URL = 'https://forms.cloud.microsoft/e/3mBz2aNNBN';

const ChessTournament = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [availability, setAvailability] = useState<Record<ChessCategory, { taken: number; available: number; capacity: number }> | null>(null);
  const [pending, setPending] = useState<ChessCategory | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState<{ tournamentId: string; category: ChessCategory } | null>(null);

  const loadAvailability = async () => {
    const data = await getChessAvailability();
    setAvailability(data);
  };

  useEffect(() => { loadAvailability(); }, []);

  const handleConfirm = async () => {
    if (!pending) return;
    setSubmitting(true);
    const result = await registerChess(pending);
    setSubmitting(false);

    if (result.full) {
      toast({ title: 'Category is full', description: 'No spots remaining in this category.', variant: 'destructive' });
      setPending(null);
      await loadAvailability();
      return;
    }
    if (result.error || !result.registration) {
      toast({ title: 'Registration failed', description: 'Please try again.', variant: 'destructive' });
      setPending(null);
      return;
    }

    setConfirmed({ tournamentId: result.registration.tournament_id, category: pending });
    setPending(null);
    await loadAvailability();
  };

  const pendingLabel = pending ? CHESS_CATEGORIES.find(c => c.id === pending)?.label : '';
  const confirmedLabel = confirmed ? CHESS_CATEGORIES.find(c => c.id === confirmed.category)?.label : '';

  return (
    <div className="min-h-screen flex flex-col">
      {!confirmed ? (
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <Crown className="w-16 h-16 text-secondary mb-6 animate-float" />
          <h1 className="font-sans font-bold text-5xl md:text-7xl tracking-tight text-foreground mb-4 text-center">
            Chess Tournament
          </h1>
          <p className="text-tertiary text-lg text-center max-w-xl mb-12">
            Choose your category to receive your Tournament ID.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
            {CHESS_CATEGORIES.map((cat) => {
              const slot = availability?.[cat.id];
              const isFull = slot ? slot.available <= 0 : false;
              return (
                <Card
                  key={cat.id}
                  className={`transition-all border-border ${
                    isFull
                      ? 'opacity-60 cursor-not-allowed'
                      : 'cursor-pointer hover:scale-[1.03] hover:border-secondary'
                  }`}
                  onClick={() => !isFull && setPending(cat.id)}
                >
                  <CardContent className="py-10 text-center">
                    <p className="font-sans font-bold text-3xl text-foreground mb-3">{cat.label}</p>
                    {availability ? (
                      <Badge variant={isFull ? 'destructive' : 'secondary'}>
                        {isFull ? 'Full' : `${slot!.available}/${slot!.capacity} spots left`}
                      </Badge>
                    ) : (
                      <p className="text-tertiary text-sm">Capacity: {CHESS_CATEGORY_CAPACITY} people</p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
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
                Category: <span className="text-foreground font-semibold">{confirmedLabel}</span>
              </p>

              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 mb-6">
                <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Tournament ID</p>
                <p className="font-mono font-bold text-4xl text-primary tracking-widest">{confirmed.tournamentId}</p>
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

      <AlertDialog open={!!pending} onOpenChange={(open) => !open && !submitting && setPending(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm your category</AlertDialogTitle>
            <AlertDialogDescription>
              You're about to register for the <span className="text-foreground font-semibold">{pendingLabel}</span> category.
              This will reserve one of the {CHESS_CATEGORY_CAPACITY} available spots and generate your Tournament ID.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleConfirm(); }} disabled={submitting}>
              {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Registering...</> : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <footer className="text-center py-6 border-t border-border">
        <p className="text-tertiary text-sm">Springfest 2026 - The Great Exhibition</p>
        <a
          href="/admin"
          className="text-xs text-primary-foreground font-medium mt-2 inline-block px-3 py-1 rounded-md bg-[#cdad60] hover:bg-[#b89a50] transition-colors"
        >
          Manager access
        </a>
        <div>
          <a
            href="/credits"
            className="text-[10.2px] text-primary-foreground font-medium mt-2 inline-block px-[10.2px] py-[3.4px] rounded-md bg-[#cdad60] hover:bg-[#b89a50] transition-colors"
          >
            Credits
          </a>
        </div>
      </footer>
    </div>
  );
};

export default ChessTournament;
