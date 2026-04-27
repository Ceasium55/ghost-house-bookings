import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { isAnyAdmin } from '@/lib/adminAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookKey, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const USERNAME_DOMAIN = '@admin.local';
const usernameToEmail = (u: string) => `${u.trim().toLowerCase()}${USERNAME_DOMAIN}`;

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const email = usernameToEmail(username);

    try {
      if (isSignUp) {
        const allowed = await isAnyAdmin(email);
        if (!allowed) {
          toast({ title: 'Access denied', description: 'This username is not authorized for admin access.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast({ title: 'Account created', description: 'You can now sign in.' });
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        const allowed = await isAnyAdmin(email);
        if (!allowed) {
          await supabase.auth.signOut();
          toast({ title: 'Access denied', description: 'This username is not authorized for admin access.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        navigate('/admin');
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to site
        </Link>

        <Card className="border-border">
          <CardHeader className="text-center">
            <BookKey className="w-10 h-10 text-primary mx-auto mb-2" />
            <CardTitle className="font-sans font-bold text-3xl">Admin Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoCapitalize="none"
                autoCorrect="off"
                required
              />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign In
              </Button>
              <p className="text-center text-sm text-muted-foreground mt-2">
                Note: only pre-authorised usernames may access. Contact IT Team in case of issue.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
