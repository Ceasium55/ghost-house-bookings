-- Add activity column to bookings to separate slots per activity
ALTER TABLE public.bookings
ADD COLUMN IF NOT EXISTS activity text NOT NULL DEFAULT 'haunted-house';

ALTER TABLE public.bookings
ADD CONSTRAINT bookings_activity_check
CHECK (activity IN ('haunted-house', 'escape-room', 'games'));

CREATE INDEX IF NOT EXISTS idx_bookings_activity_date_slot
ON public.bookings (activity, date, time_slot);