import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skull, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/bookingStore';

const CancelBooking = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const bookingId = searchParams.get('id');

  const [status, setStatus] = useState<'loading' | 'found' | 'cancelled' | 'not-found' | 'error'>('loading');
  const [booking, setBooking] = useState<{ name: string; date: string; time_slot: string; group_size: number } | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!bookingId) {
      setStatus('not-found');
      return;
    }
    supabase
      .from('bookings')
      .select('name, date, time_slot, group_size')
      .eq('id', bookingId)
      .single()
      .then(({ data, error }) => {
        if (error || !data) {
          setStatus('not-found');
        } else {
          setBooking(data);
          setStatus('found');
        }
      });
  }, [bookingId]);

  const handleCancel = async () => {
    if (!bookingId) return;
    setCancelling(true);
    const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
    if (error) {
      setStatus('error');
    } else {
      setStatus('cancelled');
    }
    setCancelling(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <Card className="max-w-md w-full border-primary/20">
        <CardContent className="pt-8 text-center">
          {status === 'loading' && <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />}

          {status === 'not-found' && (
            <>
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="font-creepster text-2xl mb-2">Booking Not Found</h2>
              <p className="text-muted-foreground mb-6">This booking may have already been cancelled.</p>
              <Button onClick={() => navigate('/')} variant="outline">Back to Home</Button>
            </>
          )}

          {status === 'found' && booking && (
            <>
              <Skull className="w-16 h-16 text-primary mx-auto mb-4 animate-float" />
              <h2 className="font-creepster text-2xl glow-primary mb-2">Cancel Booking?</h2>
              <p className="text-muted-foreground mb-1">
                <strong>{booking.name}</strong> — {booking.group_size} person(s)
              </p>
              <p className="text-muted-foreground mb-1">{formatDate(booking.date)} at {booking.time_slot}</p>
              <p className="text-sm text-muted-foreground mb-2">Ref: <span className="font-mono">{bookingId!.substring(0, 8).toUpperCase()}</span></p>
              <p className="text-sm text-destructive mb-6">This action cannot be undone.</p>
              <div className="flex gap-3 justify-center">
                <Button onClick={() => navigate('/')} variant="outline">Keep Booking</Button>
                <Button onClick={handleCancel} variant="destructive" disabled={cancelling}>
                  {cancelling ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Cancelling...</> : 'Cancel Booking'}
                </Button>
              </div>
            </>
          )}

          {status === 'cancelled' && (
            <>
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
              <h2 className="font-creepster text-2xl glow-primary mb-2">Booking Cancelled</h2>
              <p className="text-muted-foreground mb-6">Your booking has been cancelled successfully.</p>
              <Button onClick={() => navigate('/')} variant="outline">Back to Home</Button>
            </>
          )}

          {status === 'error' && (
            <>
              <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
              <h2 className="font-creepster text-2xl mb-2">Something Went Wrong</h2>
              <p className="text-muted-foreground mb-6">Please try again or contact us.</p>
              <Button onClick={() => navigate('/')} variant="outline">Back to Home</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CancelBooking;
