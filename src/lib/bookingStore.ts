export interface Booking {
  id: string;
  date: string; // '2026-05-07' or '2026-05-08'
  timeSlot: string; // e.g. '10:00'
  name: string;
  email: string;
  phone: string;
  groupSize: number;
  createdAt: string;
}

const STORAGE_KEY = 'sese-ghost-bookings';

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

export function getBookings(): Booking[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch { return []; }
}

export function saveBooking(booking: Omit<Booking, 'id' | 'createdAt'>): Booking {
  const bookings = getBookings();
  const newBooking: Booking = {
    ...booking,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  bookings.push(newBooking);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  return newBooking;
}

export function deleteBooking(id: string) {
  const bookings = getBookings().filter(b => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

export function getSlotAvailability(date: string, timeSlot: string): number {
  const bookings = getBookings().filter(b => b.date === date && b.timeSlot === timeSlot);
  const totalBooked = bookings.reduce((sum, b) => sum + b.groupSize, 0);
  return MAX_GROUP_SIZE - totalBooked;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}
