import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { getBookings, deleteBooking, formatDate, EVENT_DATES, TIME_SLOTS, getSlotAvailability, MAX_GROUP_SIZE } from '@/lib/bookingStore';
import { Ghost, Trash2, ArrowLeft, Users, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminPage = () => {
  const { toast } = useToast();
  const [refresh, setRefresh] = useState(0);
  const bookings = getBookings();

  const handleDelete = (id: string) => {
    deleteBooking(id);
    setRefresh(r => r + 1);
    toast({ title: 'Booking deleted' });
  };

  const totalBookings = bookings.length;
  const totalGuests = bookings.reduce((sum, b) => sum + b.groupSize, 0);

  // Force re-render
  void refresh;

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>

        <div className="text-center mb-10">
          <Ghost className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="font-creepster text-4xl md:text-5xl glow-primary mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage all ghost house reservations</p>
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
            const dateGuests = dateBookings.reduce((s, b) => s + b.groupSize, 0);
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
            <CardTitle className="font-creepster text-xl text-accent">Slot Availability</CardTitle>
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
                        const avail = getSlotAvailability(date, slot);
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
            <CardTitle className="font-creepster text-xl text-accent">All Reservations</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No bookings yet. The ghosts are waiting... 👻</p>
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
                      .sort((a, b) => `${a.date}${a.timeSlot}`.localeCompare(`${b.date}${b.timeSlot}`))
                      .map(booking => (
                        <TableRow key={booking.id}>
                          <TableCell>{formatDate(booking.date)}</TableCell>
                          <TableCell className="font-mono">{booking.timeSlot}</TableCell>
                          <TableCell>{booking.name}</TableCell>
                          <TableCell>{booking.email}</TableCell>
                          <TableCell>{booking.phone || '—'}</TableCell>
                          <TableCell>{booking.groupSize}</TableCell>
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
