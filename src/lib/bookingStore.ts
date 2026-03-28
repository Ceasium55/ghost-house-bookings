import { supabase } from '@/integrations/supabase/client';

export interface Booking {
  id: string;
  date: string;
  time_slot: string;
  name: string;
  email: string;
  phone: string;
  group_size: number;
  created_at: string;
}

// Time slots: every 20 min from 10:00 to 14:40
export const TIME_SLOTS = [
  '10:00', '10:20', '10:40',
  '11:00', '11:20', '11:40',
  '12:00', '12:20', '12:40',
  '13:00', '13:20', '13:40',
  '14:00', '14:20', '14:40',
];

export const EVENT_DATES = ['2026-05-07', '2026-05-08'];
export const MAX_GROUP_SIZE = 6;

export async function getBookings(): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('date', { ascending: true })
    .order('time_slot', { ascending: true });
  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
  return data || [];
}

export async function saveBooking(booking: { date: string; timeSlot: string; name: string; email: string; phone: string; groupSize: number }): Promise<Booking | null> {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      date: booking.date,
      time_slot: booking.timeSlot,
      name: booking.name,
      email: booking.email,
      phone: booking.phone,
      group_size: booking.groupSize,
    })
    .select()
    .single();
  if (error) {
    console.error('Error saving booking:', error);
    return null;
  }
  return data;
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase.from('bookings').delete().eq('id', id);
  if (error) console.error('Error deleting booking:', error);
}

export async function getSlotAvailability(date: string, timeSlot: string): Promise<number> {
  const { data, error } = await supabase
    .from('bookings')
    .select('group_size')
    .eq('date', date)
    .eq('time_slot', timeSlot);
  if (error) {
    console.error('Error checking availability:', error);
    return MAX_GROUP_SIZE;
  }
  const totalBooked = (data || []).reduce((sum, b) => sum + b.group_size, 0);
  return MAX_GROUP_SIZE - totalBooked;
}

export async function sendConfirmationEmail(booking: { name: string; email: string; date: string; timeSlot: string; groupSize: number; bookingId: string }): Promise<boolean> {
  try {
    const { error } = await supabase.functions.invoke('send-booking-confirmation', {
      body: {
        name: booking.name,
        email: booking.email,
        date: booking.date,
        timeSlot: booking.timeSlot,
        groupSize: booking.groupSize,
        bookingId: booking.bookingId,
      },
    });
    if (error) {
      console.error('Error sending confirmation email:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Failed to send email:', err);
    return false;
  }
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
