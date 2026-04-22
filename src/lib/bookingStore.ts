import { supabase } from '@/integrations/supabase/client';

export type Activity = 'haunted-house' | 'escape-room' | 'games';

export interface Booking {
  id: string;
  date: string;
  time_slot: string;
  name: string;
  email: string;
  phone: string;
  group_size: number;
  activity: Activity;
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

// Per-slot capacity by activity (haunted-house & games: 1 room of 6; escape-room: 3 rooms of 6)
export const SLOT_CAPACITY: Record<Activity, number> = {
  'haunted-house': 6,
  'escape-room': 18,
  'games': 6,
};

export async function getBookings(activity?: Activity): Promise<Booking[]> {
  let query = supabase
    .from('bookings')
    .select('*')
    .order('date', { ascending: true })
    .order('time_slot', { ascending: true });
  if (activity) query = query.eq('activity', activity);
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
  return (data || []) as Booking[];
}

export async function saveBooking(booking: { activity: Activity; date: string; timeSlot: string; name: string; email: string; phone: string; groupSize: number }): Promise<Booking | null> {
  try {
    const { data, error } = await supabase.functions.invoke('create-booking', {
      body: {
        activity: booking.activity,
        date: booking.date,
        timeSlot: booking.timeSlot,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        groupSize: booking.groupSize,
      },
    });
    if (error) {
      console.error('Error saving booking:', error);
      return null;
    }
    return data?.booking || null;
  } catch (err) {
    console.error('Failed to save booking:', err);
    return null;
  }
}

export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase.functions.invoke('admin-delete-booking', {
    body: { bookingId: id },
  });
  if (error) console.error('Error deleting booking:', error);
}

export async function getSlotAvailability(activity: Activity, date: string, timeSlot: string): Promise<number> {
  try {
    const { data, error } = await supabase.functions.invoke('check-availability', {
      body: { activity, date, timeSlot },
    });
    if (error) {
      console.error('Error checking availability:', error);
      return MAX_GROUP_SIZE;
    }
    return data?.available ?? MAX_GROUP_SIZE;
  } catch (err) {
    console.error('Failed to check availability:', err);
    return MAX_GROUP_SIZE;
  }
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
