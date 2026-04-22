import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Crown, Trash2, ArrowLeft, Users, Loader2, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  CHESS_CATEGORIES,
  CHESS_CATEGORY_CAPACITY,
  getChessRegistrations,
  deleteChessRegistration,
  type ChessRegistration,
  type ChessCategory,
} from '@/lib/chessStore';

const AdminChess = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState<ChessRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<ChessRegistration | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await getChessRegistrations();
    setRegistrations(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    const ok = await deleteChessRegistration(deleteTarget.id);
    setDeleting(false);
    if (ok) {
      toast({ title: 'Registration removed' });
      setDeleteTarget(null);
      await load();
    } else {
      toast({ title: 'Failed to remove', variant: 'destructive' });
    }
  };

  const countByCategory = (cat: ChessCategory) =>
    registrations.filter(r => r.category === cat).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Admin
          </Link>
          <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate('/admin/login'); }}>
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>

        <div className="text-center mb-10">
          <Crown className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="font-sans font-bold text-4xl md:text-5xl tracking-tight text-foreground mb-2">Chess Tournament Admin</h1>
          <p className="text-muted-foreground">Manage tournament registrations</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
          {CHESS_CATEGORIES.map(cat => {
            const taken = countByCategory(cat.id);
            const available = Math.max(0, CHESS_CATEGORY_CAPACITY - taken);
            return (
              <Card key={cat.id} className="border-border">
                <CardContent className="pt-4 text-center">
                  <Users className="w-6 h-6 text-accent mx-auto mb-1" />
                  <p className="text-2xl font-bold">{taken}/{CHESS_CATEGORY_CAPACITY}</p>
                  <p className="text-xs text-muted-foreground">{cat.label} — {available} spots left</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="font-sans font-semibold text-xl text-accent">All Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            {registrations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No registrations yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tournament ID</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.map(reg => {
                      const cat = CHESS_CATEGORIES.find(c => c.id === reg.category);
                      return (
                        <TableRow key={reg.id}>
                          <TableCell className="font-mono font-semibold">{reg.tournament_id}</TableCell>
                          <TableCell><Badge variant="secondary">{cat?.label ?? reg.category}</Badge></TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(reg.created_at).toLocaleString('en-GB')}
                          </TableCell>
                          <TableCell>
                            <Button variant="destructive" size="sm" onClick={() => setDeleteTarget(reg)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && !deleting && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this registration?</AlertDialogTitle>
            <AlertDialogDescription>
              Tournament ID <span className="font-mono font-semibold">{deleteTarget?.tournament_id}</span> will be permanently removed and the spot freed up.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={(e) => { e.preventDefault(); handleDelete(); }} disabled={deleting}>
              {deleting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Removing...</> : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminChess;
