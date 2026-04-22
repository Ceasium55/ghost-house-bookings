import { useState, useEffect } from 'react';
import { Ghost, KeyRound, Gamepad2, Crown, ArrowLeft, LogOut, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { getAccessibleActivities, type AdminActivity } from '@/lib/adminAuth';

const allActivities = [
  { id: 'haunted-house' as AdminActivity, label: 'Haunted House', icon: Ghost, path: '/admin/haunted-house', description: 'Manage haunted house bookings and availability' },
  { id: 'escape-room' as AdminActivity, label: 'Escape Room', icon: KeyRound, path: '/admin/escape-room', description: 'Manage escape room bookings and availability' },
  { id: 'games' as AdminActivity, label: 'Games', icon: Gamepad2, path: '/admin/games', description: 'Manage games activities' },
  { id: 'chess' as AdminActivity, label: 'Chess Tournament', icon: Crown, path: '/admin/chess', description: 'Manage chess tournament registrations' },
];

const AdminHub = () => {
  const navigate = useNavigate();
  const [accessible, setAccessible] = useState<AdminActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const activities = await getAccessibleActivities(session?.user?.email);
      setAccessible(activities);
      // If only one activity, redirect directly
      if (activities.length === 1) {
        navigate(`/admin/${activities[0]}`, { replace: true });
        return;
      }
      setLoading(false);
    });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const visibleActivities = allActivities.filter(a => accessible.includes(a.id));

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-4xl">
        <div className="flex items-center justify-between mb-12">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to site
          </Link>
          <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut(); navigate('/admin/login'); }}>
            <LogOut className="w-4 h-4" /> Sign out
          </Button>
        </div>

        <div className="text-center mb-12">
          <h1 className="font-sans font-bold text-4xl md:text-5xl tracking-tight text-foreground mb-2">
            Admin Panel
          </h1>
          <p className="text-tertiary text-lg">Choose an activity to manage</p>
        </div>

        <div className={`grid grid-cols-1 ${visibleActivities.length >= 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : visibleActivities.length === 3 ? 'sm:grid-cols-3' : visibleActivities.length === 2 ? 'sm:grid-cols-2' : ''} gap-6 md:gap-8`}>
          {visibleActivities.map(({ label, icon: Icon, path, description }) => (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="group relative flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-8 md:p-10 transition-all hover:scale-[1.04] hover:border-secondary hover:shadow-[0_0_30px_hsl(var(--secondary)/0.15)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon className="w-12 h-12 text-secondary transition-transform group-hover:scale-110" />
              <span className="font-sans font-semibold text-2xl md:text-3xl tracking-tight text-foreground">
                {label}
              </span>
              <p className="text-tertiary text-sm text-center leading-relaxed">
                {description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminHub;
