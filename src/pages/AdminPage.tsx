import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getBookings, deleteBooking, formatDate, EVENT_DATES, TIME_SLOTS, getSlotAvailability, MAX_GROUP_SIZE, type Booking } from '@/lib/bookingStore';
import { Ghost, Trash2, ArrowLeft, Users, Calendar, Loader2, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DeleteBookingDialog from '@/components/DeleteBookingDialog';

const AdminPage = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState<Record<string, Record<string, number>>>({});
  const [deleteTarget, setDeleteTarget] = useState<Booking | null>(null);
  const loadData = async () => {
    setLoading(true);
    const data = await getBookings();
    setBookings(data);

    const avail: Record<string, Record<string, number>> = {};
    await Promise.all(
      EVENT_DATES.map(async (date) => {
        avail[date] = {};
        await Promise.all(
          TIME_SLOTS.map(async (slot) => {
            avail[date][slot] = await getSlotAvailability(date, slot);
          })
        );
      })
    );
    setAvailability(avail);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (id: string) => {
    await deleteBooking(id);
    await loadData();
    toast({ title: 'Booking deleted' });
  };

  const totalBookings = bookings.length;
  const totalGuests = bookings.reduce((sum, b) => sum + b.group_size, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Admin
          </Link>
          <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate('/admin/login'); }}>
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>

        <div className="text-center mb-10">
          <Ghost className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="font-sans font-bold text-4xl md:text-5xl tracking-tight text-foreground mb-2">Haunted House Admin</h1>
          <p className="text-muted-foreground">Manage all haunted house reservations</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card className="border-border">
            <CardContent className="pt-4 text-center">
              <Calendar className="w-6 h-6 text-primary mx-auto mb-1" />
              <p className="text-2xl font-bold">{totalBookings}</p>
              <p className="text-xs text-muted-foreground">Bookings</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="pt-4 text-center">
              <Users className="w-6 h-6 text-accent mx-auto mb-1" />
              <p className="text-2xl font-bold">{totalGuests}</p>
              <p className="text-xs text-muted-foreground">Total Guests</p>
            </CardContent>
          </Card>
          {EVENT_DATES.map(date => {
            const dateBookings = bookings.filter(b => b.date === date);
            const dateGuests = dateBookings.reduce((s, b) => s + b.group_size, 0);
            return (
              <Card key={date} className="border-border">
                <CardContent className="pt-4 text-center">
                  <p className="text-2xl font-bold">{dateGuests}</p>
                  <p className="text-xs text-muted-foreground">{new Date(date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Availability grid */}
        <Card className="border-border mb-10">
          <CardHeader>
            <CardTitle className="font-sans font-semibold text-xl text-accent">Slot Availability</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left p-2 text-muted-foreground">Time</th>
                    {EVENT_DATES.map(d => (
                      <th key={d} className="text-center p-2 text-muted-foreground">
                        {new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map(slot => (
                    <tr key={slot} className="border-t border-border">
                      <td className="p-2 font-mono">{slot}</td>
                      {EVENT_DATES.map(date => {
                        const avail = availability[date]?.[slot] ?? MAX_GROUP_SIZE;
                        return (
                          <td key={date} className="text-center p-2">
                            <Badge variant={avail === 0 ? 'destructive' : avail <= 2 ? 'secondary' : 'default'}>
                              {avail}/{MAX_GROUP_SIZE}
                            </Badge>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Bookings table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-sans font-semibold text-xl text-accent">All Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No bookings yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings
                      .sort((a, b) => `${a.date}${a.time_slot}`.localeCompare(`${b.date}${b.time_slot}`))
                      .map(booking => (
                        <TableRow key={booking.id}>
                          <TableCell>{formatDate(booking.date)}</TableCell>
                          <TableCell className="font-mono">{booking.time_slot}</TableCell>
                          <TableCell>{booking.name}</TableCell>
                          <TableCell>{booking.email}</TableCell>
                          <TableCell>{booking.phone || '—'}</TableCell>
                          <TableCell>{booking.group_size}</TableCell>
                          <TableCell>
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(booking.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminPage;
