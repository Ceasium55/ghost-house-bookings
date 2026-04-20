import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TIME_SLOTS, EVENT_DATES, MAX_GROUP_SIZE, getSlotAvailability, saveBooking, sendConfirmationEmail, formatDate } from '@/lib/bookingStore';
import { Ghost, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

interface BookingSectionProps {
  onBack: () => void;
}

const BookingSection = ({ onBack }: BookingSectionProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [groupSize, setGroupSize] = useState<number>(1);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState<Record<string, number>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);

  const loadAvailability = useCallback(async (date: string) => {
    setLoadingSlots(true);
    const availability: Record<string, number> = {};
    await Promise.all(
      TIME_SLOTS.map(async (slot) => {
        availability[slot] = await getSlotAvailability(date, slot);
      })
    );
    setSlotAvailability(availability);
    setLoadingSlots(false);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      loadAvailability(selectedDate);
    }
  }, [selectedDate, loadAvailability]);

  const maxAvailable = selectedSlot ? Math.min(MAX_GROUP_SIZE, slotAvailability[selectedSlot] ?? MAX_GROUP_SIZE) : MAX_GROUP_SIZE;

  // Clamp groupSize when availability shrinks
  useEffect(() => {
    if (groupSize > maxAvailable) {
      setGroupSize(Math.max(1, maxAvailable));
    }
  }, [maxAvailable, groupSize]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;

    if (groupSize < 1 || groupSize > maxAvailable) {
      toast({ title: 'Invalid number', description: `Only ${maxAvailable} spot(s) available.`, variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    const booking = await saveBooking({
      date: selectedDate,
      timeSlot: selectedSlot,
      name: 'Guest',
      email: 'guest@hauntedhouse.local',
      phone: '',
      groupSize,
    });

    if (!booking) {
      toast({ title: 'Booking failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    setConfirmed(true);
    setSubmitting(false);
  };

  if (confirmed) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full border-primary/20">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="font-sans font-bold text-3xl text-foreground mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-2">
              {formatDate(selectedDate!)} at {selectedSlot}
            </p>
            <p className="text-muted-foreground mb-6">
              {groupSize} person(s)
            </p>
            <Button onClick={onBack} variant="outline">Back to Home</Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  const TOTAL = MAX_GROUP_SIZE;
  const fillPct = ((groupSize - 1) / (TOTAL - 1)) * 100;
  const disabledPct = ((TOTAL - maxAvailable) / (TOTAL - 1)) * 100;

  return (
    <section className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center mb-10">
          <Ghost className="w-10 h-10 text-primary mx-auto mb-3 animate-float" />
          <h2 className="font-sans font-bold text-4xl md:text-5xl text-foreground mb-2">Book Your Tour</h2>
          <p className="text-muted-foreground">Choose your date and time — each tour lasts 15 minutes</p>
        </div>

        {/* Step 1: Date */}
        <div className="mb-8">
          <h3 className="font-sans font-bold text-xl text-accent mb-4">1. Choose a Date</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EVENT_DATES.map(date => (
              <Card
                key={date}
                className={`cursor-pointer transition-all hover:scale-[1.02] ${selectedDate === date ? 'border-primary' : 'border-border hover:border-muted-foreground'}`}
                onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
              >
                <CardContent className="py-4 text-center">
                  <p className="font-semibold text-lg">{formatDate(date)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Step 2: Time Slot */}
        {selectedDate && (
          <div className="mb-8">
            <h3 className="font-sans font-bold text-xl text-accent mb-4">2. Choose a Time Slot</h3>
            {loadingSlots ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                {TIME_SLOTS.map(slot => {
                  const available = slotAvailability[slot] ?? MAX_GROUP_SIZE;
                  const isFull = available <= 0;
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      disabled={isFull}
                      onClick={() => setSelectedSlot(slot)}
                      className={`relative rounded-lg p-3 text-center transition-all border ${
                        isFull
                          ? 'border-border opacity-40 cursor-not-allowed'
                          : isSelected
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-muted-foreground'
                      }`}
                    >
                      <span className="font-mono font-semibold">{slot}</span>
                      <Badge variant={isFull ? 'destructive' : 'secondary'} className="block mt-1 text-xs">
                        {isFull ? 'Full' : `${available} left`}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Group Size */}
        {selectedSlot && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-sans font-bold text-xl text-accent">3. Group Size</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="text-center">
                  <p className="text-muted-foreground text-sm mb-2">How many people in your group?</p>
                  <p className="font-sans font-bold text-5xl text-primary">{groupSize}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Max available for this slot: {maxAvailable}
                  </p>
                </div>

                {/* Custom slider */}
                <div className="px-2 pt-4 pb-2">
                  <div className="relative h-3 w-full">
                    {/* Base track */}
                    <div className="absolute inset-0 rounded-full bg-secondary" />
                    {/* Disabled (greyed) portion on the right */}
                    {disabledPct > 0 && (
                      <div
                        className="absolute top-0 right-0 h-full rounded-r-full bg-muted-foreground/30"
                        style={{ width: `${disabledPct}%` }}
                      />
                    )}
                    {/* Filled portion */}
                    <div
                      className="absolute top-0 left-0 h-full rounded-l-full bg-primary transition-all"
                      style={{ width: `${fillPct}%` }}
                    />
                    {/* Native range input on top */}
                    <input
                      type="range"
                      min={1}
                      max={TOTAL}
                      step={1}
                      value={groupSize}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10);
                        if (val <= maxAvailable) setGroupSize(val);
                        else setGroupSize(maxAvailable);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                      aria-label="Group size"
                    />
                    {/* Thumb indicator */}
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full border-2 border-primary bg-background pointer-events-none transition-all"
                      style={{ left: `${fillPct}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-3 text-xs font-mono text-muted-foreground">
                    {Array.from({ length: TOTAL }, (_, i) => i + 1).map(n => (
                      <span
                        key={n}
                        className={n > maxAvailable ? 'opacity-40' : n === groupSize ? 'text-primary font-bold' : ''}
                      >
                        {n}
                      </span>
                    ))}
                  </div>
                </div>

                <Button type="submit" size="lg" className="w-full font-sans font-semibold tracking-wide text-lg" disabled={submitting || maxAvailable < 1}>
                  {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Booking...</> : 'Confirm Booking'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

export default BookingSection;
