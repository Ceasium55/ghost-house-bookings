import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TIME_SLOTS, EVENT_DATES, MAX_GROUP_SIZE, getSlotAvailability, saveBooking, sendConfirmationEmail, formatDate } from '@/lib/bookingStore';
import { Skull, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';

interface ParticipantInfo {
  surnameName: string;
  yearClass: string;
  studentId: string;
}

interface BookingSectionProps {
  onBack: () => void;
}

const BookingSection = ({ onBack }: BookingSectionProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [participants, setParticipants] = useState<ParticipantInfo[]>([{ surnameName: '', yearClass: '', studentId: '' }]);
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

  // Sync participants array with group size
  const parsedGroupSize = parseInt(groupSize, 10);
  const validGroupSize = !isNaN(parsedGroupSize) && parsedGroupSize > 0 ? parsedGroupSize : 0;

  useEffect(() => {
    if (validGroupSize < 1) {
      setParticipants([]);
      return;
    }
    setParticipants(prev => {
      if (validGroupSize > prev.length) {
        return [...prev, ...Array.from({ length: validGroupSize - prev.length }, () => ({ surnameName: '', yearClass: '', studentId: '' }))];
      }
      return prev.slice(0, validGroupSize);
    });
  }, [validGroupSize]);

  const updateParticipant = (index: number, field: keyof ParticipantInfo, value: string) => {
    setParticipants(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot) return;

    const size = parseInt(groupSize, 10);
    if (!groupSize.trim() || isNaN(size) || size < 1 || !Number.isInteger(size)) {
      toast({ title: 'Invalid number', description: 'Group size must be a positive integer.', variant: 'destructive' });
      return;
    }

    const available = slotAvailability[selectedSlot] ?? 0;
    if (size > available) {
      toast({ title: 'Invalid number', description: `Only ${available} spot(s) available for this time slot.`, variant: 'destructive' });
      return;
    }
    if (!name.trim() || !email.trim()) {
      toast({ title: 'Missing info', description: 'Please fill in your name and email.', variant: 'destructive' });
      return;
    }

    // Validate all participants
    for (let i = 0; i < participants.length; i++) {
      const p = participants[i];
      if (!p.surnameName.trim() || !p.yearClass.trim() || !p.studentId.trim()) {
        toast({ title: 'Missing participant info', description: `Please fill in all fields for Participant ${i + 1}.`, variant: 'destructive' });
        return;
      }
      if (!/^\d+$/.test(p.studentId.trim()) || parseInt(p.studentId.trim(), 10) <= 0) {
        toast({ title: 'Invalid ID', description: `Participant ${i + 1}'s ID must be a positive integer.`, variant: 'destructive' });
        return;
      }
    }

    setSubmitting(true);
    const booking = await saveBooking({ date: selectedDate, timeSlot: selectedSlot, name: name.trim(), email: email.trim(), phone: phone.trim(), groupSize: size });

    if (!booking) {
      toast({ title: 'Booking failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    // Send confirmation email (non-blocking)
    sendConfirmationEmail({ name: name.trim(), email: email.trim(), date: selectedDate, timeSlot: selectedSlot, groupSize: size, bookingId: booking.id })
      .then((sent) => {
        if (sent) {
          toast({ title: '📧 Confirmation email sent!', description: `Check ${email.trim()} for your booking details.` });
        }
      });

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
            <p className="text-muted-foreground mb-2">
              {groupSize} person(s)
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              📧 A confirmation email has been sent to {email}
            </p>
            <Button onClick={onBack} variant="outline">Back to Home</Button>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="text-center mb-10">
          <Skull className="w-10 h-10 text-primary mx-auto mb-3 animate-float" />
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

        {/* Step 3: Details */}
        {selectedSlot && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="font-sans font-bold text-xl text-accent">3. Your Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required maxLength={100} />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" required maxLength={255} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+32 ..." maxLength={20} />
                </div>
                <div>
                  <Label htmlFor="groupSize">Group Size</Label>
                  <Input
                    id="groupSize"
                    type="number"
                    min={1}
                    value={groupSize}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      setGroupSize(isNaN(val) ? 1 : Math.max(1, val));
                    }}
                  />
                </div>

                {/* Step 4: Participant Details */}
                <div className="space-y-4 pt-4 border-t border-border">
                  <h4 className="font-sans font-bold text-lg text-accent">4. Participant Details</h4>
                  {participants.map((p, i) => (
                    <Card key={i} className="border-border">
                      <CardContent className="pt-4 space-y-3">
                        <p className="font-semibold text-sm text-muted-foreground">Participant {i + 1}</p>
                        <div>
                          <Label htmlFor={`surname-name-${i}`}>Surname & Name *</Label>
                          <Input
                            id={`surname-name-${i}`}
                            value={p.surnameName}
                            onChange={e => updateParticipant(i, 'surnameName', e.target.value)}
                            placeholder="Doe John"
                            required
                            maxLength={100}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`year-class-${i}`}>Year & Class *</Label>
                          <Input
                            id={`year-class-${i}`}
                            value={p.yearClass}
                            onChange={e => updateParticipant(i, 'yearClass', e.target.value)}
                            placeholder="S5 ENA"
                            required
                            maxLength={20}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`student-id-${i}`}>ID *</Label>
                          <Input
                            id={`student-id-${i}`}
                            type="number"
                            min={1}
                            value={p.studentId}
                            onChange={e => {
                              const val = e.target.value;
                              if (val === '' || /^\d+$/.test(val)) {
                                updateParticipant(i, 'studentId', val);
                              }
                            }}
                            placeholder="12345"
                            required
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Button type="submit" size="lg" className="w-full font-sans font-semibold tracking-wide text-lg" disabled={submitting}>
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
