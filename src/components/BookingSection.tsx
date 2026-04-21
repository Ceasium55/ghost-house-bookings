import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { TIME_SLOTS, EVENT_DATES, MAX_GROUP_SIZE, getSlotAvailability, saveBooking, formatDate, type Activity } from '@/lib/bookingStore';
import { Ghost, ArrowLeft, CheckCircle, Loader2, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface BookingSectionProps {
  onBack: () => void;
  activity: Activity;
  title?: string;
}

const BookingSection = ({ onBack, activity, title = 'Book Your Tour' }: BookingSectionProps) => {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [groupSize, setGroupSize] = useState<number>(1);
  const [confirmed, setConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slotAvailability, setSlotAvailability] = useState<Record<string, number>>({});
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [bookingRef, setBookingRef] = useState<string>('');

  const loadAvailability = useCallback(async (date: string) => {
    setLoadingSlots(true);
    const availability: Record<string, number> = {};
    await Promise.all(
      TIME_SLOTS.map(async (slot) => {
        availability[slot] = await getSlotAvailability(activity, date, slot);
      })
    );
    setSlotAvailability(availability);
    setLoadingSlots(false);
  }, [activity]);

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
    const reference = Math.floor(10000000 + Math.random() * 90000000).toString();
    const booking = await saveBooking({
      activity,
      date: selectedDate,
      timeSlot: selectedSlot,
      name: `Ref ${reference}`,
      email: `${reference}@hauntedhouse.local`,
      phone: '',
      groupSize,
    });

    if (!booking) {
      toast({ title: 'Booking failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
      setSubmitting(false);
      return;
    }

    setBookingRef(reference);
    setConfirmed(true);
    setSubmitting(false);
  };

  const downloadPdf = () => {
    if (!selectedDate || !selectedSlot) return;
    const doc = new jsPDF({ unit: 'pt', format: 'a5' });
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.setFillColor(26, 26, 46);
    doc.rect(0, 0, pageWidth, 80, 'F');
    doc.setTextColor(205, 173, 96);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Haunted House', pageWidth / 2, 38, { align: 'center' });
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Booking Confirmation', pageWidth / 2, 60, { align: 'center' });

    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text('Your booking has been confirmed.', pageWidth / 2, 120, { align: 'center' });
    doc.text('Please save this reference to manage your booking.', pageWidth / 2, 138, { align: 'center' });

    let y = 190;
    const drawRow = (label: string, value: string) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(110, 110, 110);
      doc.text(label.toUpperCase(), 50, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(13);
      doc.setTextColor(20, 20, 20);
      doc.text(value, 50, y + 18);
      y += 50;
    };

    drawRow('Date', formatDate(selectedDate));
    drawRow('Time Slot', selectedSlot);
    drawRow('Group Size', `${groupSize} person(s)`);

    doc.setDrawColor(205, 173, 96);
    doc.setLineWidth(1);
    doc.line(50, y - 5, pageWidth - 50, y - 5);
    y += 15;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(110, 110, 110);
    doc.text('BOOKING REFERENCE', 50, y);
    doc.setFont('courier', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(205, 173, 96);
    doc.text(bookingRef, 50, y + 28);

    const filename = `haunted-house-booking-${bookingRef}.pdf`;
    const pdfDataUri = doc.output('datauristring');
    const previewWindow = window.open('', '_blank');

    if (!previewWindow) {
      toast({ title: 'Popup blocked', description: 'Please allow popups to open your PDF.', variant: 'destructive' });
      return;
    }

    previewWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${filename}</title>
          <style>
            html, body { margin: 0; height: 100%; background: #111827; }
            iframe { border: 0; width: 100%; height: 100%; }
          </style>
        </head>
        <body>
          <iframe title="${filename}" src="${pdfDataUri}"></iframe>
        </body>
      </html>
    `);
    previewWindow.document.close();
    toast({ title: 'PDF ready', description: 'Your booking confirmation opened in a new tab.' });
  };

  if (confirmed) {
    return (
      <section className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="max-w-md w-full border-primary/20">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h2 className="font-sans font-bold text-3xl text-foreground mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-1">
              {formatDate(selectedDate!)} at {selectedSlot}
            </p>
            <p className="text-muted-foreground mb-6">
              {groupSize} person(s)
            </p>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 mb-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Booking Reference</p>
              <p className="font-mono font-bold text-3xl text-primary tracking-widest">{bookingRef}</p>
            </div>

            <p className="text-sm text-accent font-semibold mb-6">
              ⚠️ Please save this reference — you'll need it to manage your booking.
            </p>

            <div className="flex flex-col gap-2">
              <Button onClick={downloadPdf} size="lg" className="w-full">
                <Download className="w-4 h-4 mr-2" /> Download PDF
              </Button>
              <Button onClick={onBack} variant="outline">Back to Home</Button>
            </div>
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
          <h2 className="font-sans font-bold text-4xl md:text-5xl text-foreground mb-2">{title}</h2>
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
